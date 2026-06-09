import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import fs from 'fs';
import path from 'path';

const FALLBACK_DIR = path.join(process.cwd(), 'src', 'data');
const FALLBACK_FILE = path.join(FALLBACK_DIR, 'company_settings.json');

const DEFAULT_COMPANY_INFO = {
  company_name: 'SVI Infra Solutions Pvt. Ltd.',
  company_address: 'A-61 Sector 65 Noida Uttar Pradesh 201309',
  company_email: 'info@sviinfrasolutions.com',
  company_phone: '+91 9216014579',
  company_gst: '09AAECS1234F1Z5',
  company_rera: 'UPRERAPRJ123456',
  company_website: 'www.sviinfrasolutions.com',
  bank_account_name: 'Svi Infra Solutions Pvt. Ltd',
  bank_account_no: '0894102000013837',
  bank_name: 'IDBI BANK',
  bank_ifsc: 'IBKL0000894',
};

function writeFallback(data: any) {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local settings fallback:', err);
  }
}

function readFallback() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const content = fs.readFileSync(FALLBACK_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to read local settings fallback:', err);
  }
  return DEFAULT_COMPANY_INFO;
}

// GET /api/admin/settings
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const { data, error } = await supabaseAdmin
        .from('portal_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          if (key === 'company_info') {
            return NextResponse.json({ key, value: readFallback() });
          }
          return NextResponse.json({ key, value: {} });
        }
        throw error;
      }
      return NextResponse.json({ key: data.key, value: data.value });
    } else {
      const { data, error } = await supabaseAdmin.from('portal_settings').select('*');

      if (error) {
        if (error.message?.includes('does not exist')) {
          return NextResponse.json({
            settings: [{ key: 'company_info', value: readFallback() }],
          });
        }
        throw error;
      }

      if (!data || data.length === 0) {
        return NextResponse.json({
          settings: [{ key: 'company_info', value: DEFAULT_COMPANY_INFO }],
        });
      }

      return NextResponse.json({ settings: data });
    }
  } catch (err: any) {
    console.error('GET settings error:', err);
    return NextResponse.json({ settings: [{ key: 'company_info', value: readFallback() }] });
  }
}

// POST /api/admin/settings
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { key, value } = body;
    if (!key || value === undefined) {
      throw AppError.badRequest('Key and value are required');
    }

    // 1. Save to Database
    const { error } = await supabaseAdmin.from('portal_settings').upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });

    let dbSaved = true;
    if (error) {
      console.warn('DB upsert error, falling back to local file:', error.message);
      dbSaved = false;
      if (key === 'company_info') writeFallback(value);
    } else {
      if (key === 'company_info') writeFallback(value);
    }

    // 2. Activity log + notification (non-blocking)
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', admin.id)
        .single();
      const adminName = profile?.full_name || admin.email || 'Admin';

      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: 'settings_updated',
        description: `${adminName} updated ${key.replace('_', ' ')} settings.`,
        metadata: { event: 'settings_updated', settingName: key, dbSaved },
      });

      await NotificationHelper.settingsUpdated(key.replace('_', ' '), adminName);
    } catch (logErr) {
      console.error('Failed to log settings update:', logErr);
    }

    return NextResponse.json({ success: true, key, value, dbSaved });
  } catch (err) {
    return handleApiError(err);
  }
}
