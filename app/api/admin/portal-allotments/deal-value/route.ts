import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { normalizeRefId } from '@/src/lib/receipt/receiptLedger';

// POST /api/admin/portal-allotments/deal-value
// Persists agreed deal value (total amount) and rate per sq. yard directly to the database
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = await request.json().catch(() => null);
    if (!body || !body.refId) {
      throw AppError.badRequest('refId is required');
    }

    const { refId, dealValue, area, ratePerSqYd } = body;
    const numericDealValue = typeof dealValue === 'number' ? dealValue : parseFloat(dealValue) || 0;
    const numericArea = area ? parseFloat(String(area)) || null : null;
    const numericRate = ratePerSqYd ? parseFloat(String(ratePerSqYd)) || null : null;
    const norm = normalizeRefId(refId);

    // 1. Find and update matching allotment(s) in `allotments` table
    const { data: allAllotments, error: allotError } = await supabaseAdmin
      .from('allotments')
      .select('id, metadata, unit_no');

    if (allotError) {
      console.error('Error fetching allotments for deal value update:', allotError);
    }

    let updatedAllotmentsCount = 0;
    if (allAllotments && allAllotments.length > 0) {
      const matchingAllotments = allAllotments.filter((a) => {
        const meta = (a.metadata as Record<string, unknown>) || {};
        const tId = meta.ticket_id || meta.ticketId || meta.refId || meta.ref_id || a.id;
        return normalizeRefId(String(tId)) === norm;
      });

      for (const allot of matchingAllotments) {
        const existingMeta = (allot.metadata as Record<string, unknown>) || {};
        const updatedMeta = {
          ...existingMeta,
          total_cost: numericDealValue,
          ...(numericArea !== null ? { area: String(numericArea) } : {}),
          ...(numericRate !== null ? { rate_per_sq_yd: numericRate } : {}),
        };

        const { error: updateErr } = await supabaseAdmin
          .from('allotments')
          .update({
            metadata: updatedMeta,
            updated_at: new Date().toISOString(),
          })
          .eq('id', allot.id);

        if (!updateErr) {
          updatedAllotmentsCount++;
        } else {
          console.error(`Failed to update allotment ${allot.id}:`, updateErr);
        }
      }
    }

    // 2. Update portal_settings (receipt_deal_values) so all receipt calculators reflect it globally
    const { data: existingSetting } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', 'receipt_deal_values')
      .maybeSingle();

    const currentMap = (existingSetting?.value as Record<string, unknown>) || {};
    const updatedMap = {
      ...currentMap,
      [refId]: numericDealValue,
      [norm]: numericDealValue,
    };

    const { error: settingError } = await supabaseAdmin.from('portal_settings').upsert({
      key: 'receipt_deal_values',
      value: updatedMap,
      updated_at: new Date().toISOString(),
    });

    if (settingError) {
      console.warn('Failed to upsert portal_settings receipt_deal_values:', settingError);
    }

    // 3. Log activity in activity_logs (non-blocking)
    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: 'deal_value_updated',
        description: `Updated deal value for ${refId} to ₹${numericDealValue.toLocaleString('en-IN')}${numericRate ? ` (₹${numericRate}/sq.yd.)` : ''}`,
        metadata: {
          refId,
          norm,
          dealValue: numericDealValue,
          area: numericArea,
          ratePerSqYd: numericRate,
          updatedAllotmentsCount,
        },
      });
    } catch (logErr) {
      console.warn('Failed to log deal value activity:', logErr);
    }

    return NextResponse.json({
      success: true,
      refId,
      normalizedRefId: norm,
      dealValue: numericDealValue,
      area: numericArea,
      ratePerSqYd: numericRate,
      updatedAllotmentsCount,
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

// GET /api/admin/portal-allotments/deal-value?refId=...
// Retrieves persisted deal value, rate per sq. yd., area, and assigned advisor for a refId
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const refId = searchParams.get('refId');
    if (!refId) throw AppError.badRequest('refId is required');

    const norm = normalizeRefId(refId);

    // 1. Fetch from allotments table
    const { data: allAllotments } = await supabaseAdmin
      .from('allotments')
      .select('id, user_id, metadata, unit_no');

    let matchedMeta: Record<string, unknown> | null = null;
    let unitNo: string | null = null;
    let matchedUserId: string | null = null;

    if (allAllotments && allAllotments.length > 0) {
      const match = allAllotments.find((a) => {
        const meta = (a.metadata as Record<string, unknown>) || {};
        const tId = meta.ticket_id || meta.ticketId || meta.refId || meta.ref_id || a.id;
        return normalizeRefId(String(tId)) === norm;
      });
      if (match) {
        matchedMeta = (match.metadata as Record<string, unknown>) || {};
        unitNo = match.unit_no || null;
        matchedUserId = match.user_id || null;
      }
    }

    // 2. Fetch advisor from registrations table as fallback if not in allotment
    let advisorName =
      (matchedMeta?.advisor_name as string) || (matchedMeta?.advisor as string) || '';
    if (!advisorName) {
      const { data: reg } = await supabaseAdmin
        .from('registrations')
        .select('advisor_name')
        .or(`submission_id.eq.${refId},submission_id.eq.${norm}`)
        .maybeSingle();
      if (reg?.advisor_name) {
        advisorName = reg.advisor_name;
      }
    }

    // 3. Extract Client Phone, Email, and Address
    let clientPhone = (matchedMeta?.client_phone as string) || '';
    let clientEmail = (matchedMeta?.client_email as string) || '';
    let clientAddress =
      (matchedMeta?.client_address as string) || (matchedMeta?.address as string) || '';

    if ((!clientPhone || !clientEmail || !clientAddress) && matchedUserId) {
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('phone, real_email, email, notes')
        .eq('id', matchedUserId)
        .maybeSingle();
      if (prof) {
        if (!clientPhone && prof.phone) clientPhone = prof.phone;
        if (!clientEmail && (prof.real_email || prof.email))
          clientEmail = prof.real_email || prof.email;
        if (!clientAddress && prof.notes) {
          const matchAddr = prof.notes.match(/Address:\s*(.+)$/i);
          if (matchAddr) clientAddress = matchAddr[1].trim();
        }
      }
    }

    // Static authoritative directory fallback from SVI Payment Details.xlsx
    const CONTACT_FALLBACK: Record<string, { phone?: string; email?: string; address?: string }> = {
      pl2075: {
        phone: '9716154616',
        email: 'kundanjha2010@gmail.com',
        address:
          'House No. Plot 531/A, No.-7717, Ramesh Nagar, Bawana, District: North West Delhi, 110039',
      },
      pl2077: {
        phone: '7838045231',
        email: 'Shantanujoshi9999@gmail.com',
        address:
          'A-803, Garden Estates Apartments, Plot No-5B, Sector-22, Dwarka, Raj Nagar-II, Delhi-110077',
      },
      pl2076: {
        phone: '7838221323',
        email: 'truemoon.india@gmail.com',
        address: '7 /50, 3rd Floor, Subhash Nagar, West Delhi-110027.',
      },
      pl2050: {
        phone: '9811686535',
        email: 'agarwalgoyalmanish@yahoo.com',
        address: 'A-32, pushpanjali enclave Pitampura',
      },
      pl2066: {
        phone: '9318444582',
        email: 'varun.arora1515@gmail.com',
        address: 'Rohtak',
      },
      pl2065: {
        phone: '9318444582',
        email: 'varun.arora1515@gmail.com',
        address: 'Rohtak',
      },
      pl2080: {
        phone: '7042046477',
        email: 'Rohitca871@gmail.com',
        address: 'KH NO 791 STREET NO 2 ASHOK COLONY KUSHAK NO 2 KADIPUR 110036',
      },
      svi002023: {
        phone: '9810065290',
        email: 'rkjindal@ksprecision.com',
        address: '4/20, sector 2 rajendra nagar ghaziabad',
      },
      svi2023: {
        phone: '9810065290',
        email: 'rkjindal@ksprecision.com',
        address: '4/20, sector 2 rajendra nagar ghaziabad',
      },
      pl2081: {
        phone: '8882559449',
        email: 'kapiltanwar18@gmail.com',
        address: '',
      },
      pl2078: {
        phone: '',
        email: '',
        address: 'i -599 Govindpuram Ghaziabad Uttar Pradesh 201013',
      },
      pl2006: {
        phone: '',
        email: '',
        address: 'Faridpur Simbhavali Hapur Uttar Pradesh - 245207',
      },
      pl2126: {
        phone: '9506394111',
        email: '',
        address: 'Sector- 10A / 10 Chiranjeev vihar Ghaziabad Uttar Pradesh -201002',
      },
      pl2221: {
        phone: '9953630825',
        email: 'SMSHARMA1987@GMAIL.COM',
        address: 'House no. D-110/3, Street no. 12, Gamri extension north east delhi-110053',
      },
      svi002025: {
        phone: '9911300308',
        email: 'kohli.gaurav141@gmail.com',
        address: 'H/N 141-142, nehru vihar west delhi-110054',
      },
      svi2025: {
        phone: '9911300308',
        email: 'kohli.gaurav141@gmail.com',
        address: 'H/N 141-142, nehru vihar west delhi-110054',
      },
      svi002106: {
        phone: '7206075395',
        email: 'bhagwanshiv1982@gmail.com',
        address: 'Ahrod(29)Rewari',
      },
      svi2106: {
        phone: '7206075395',
        email: 'bhagwanshiv1982@gmail.com',
        address: 'Ahrod(29)Rewari',
      },
      pl2181: {
        phone: '9953630825',
        email: 'SMSHARMA1987@GMAIL.COM',
        address: 'House no. D-110/3, Street no. 12, Gamri extension north east delhi-110053',
      },
      svi002050: {
        phone: '9958894058',
        email: '',
        address:
          'A-1004, 10th Floor, Green Valley Society, Kaspate Wasti Road, Wakad, Pune-411057Maharashtra',
      },
      svi2050: {
        phone: '9958894058',
        email: '',
        address:
          'A-1004, 10th Floor, Green Valley Society, Kaspate Wasti Road, Wakad, Pune-411057Maharashtra',
      },
      svi002051: {
        phone: '9958894058',
        email: 'client.svi002051@sviinfra.com',
        address:
          'A-1004, 10th Floor, Green Valley Society, Kaspate Wasti Road, WakadPune-411057Maharashtra',
      },
      svi2051: {
        phone: '9958894058',
        email: 'client.svi002051@sviinfra.com',
        address:
          'A-1004, 10th Floor, Green Valley Society, Kaspate Wasti Road, WakadPune-411057Maharashtra',
      },
      svi002134: {
        phone: '9031439111',
        email: 'abhilashasahayvarma@gmail.com',
        address: 'Arya Kumar Road Rajendra Nagar, Patna, Bihar, 800016',
      },
      svi2134: {
        phone: '9031439111',
        email: 'abhilashasahayvarma@gmail.com',
        address: 'Arya Kumar Road Rajendra Nagar, Patna, Bihar, 800016',
      },
    };

    const fallback = CONTACT_FALLBACK[norm];
    if (fallback) {
      if (!clientPhone && fallback.phone) clientPhone = fallback.phone;
      if (!clientEmail && fallback.email) clientEmail = fallback.email;
      if (!clientAddress && fallback.address) clientAddress = fallback.address;
    }

    const dealValue = matchedMeta?.total_cost ? Number(matchedMeta.total_cost) : null;
    const area = matchedMeta?.area ? Number(matchedMeta.area) : null;
    const ratePerSqYd = matchedMeta?.rate_per_sq_yd ? Number(matchedMeta.rate_per_sq_yd) : null;

    return NextResponse.json({
      refId,
      normalizedRefId: norm,
      dealValue,
      area,
      ratePerSqYd,
      advisorName: advisorName || null,
      unitNo,
      clientPhone: clientPhone || null,
      clientEmail: clientEmail || null,
      clientAddress: clientAddress || null,
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
