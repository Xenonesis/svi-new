import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', 'announcement_bar')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, value: null });
    }

    return NextResponse.json(
      { success: true, value: data?.value ?? null },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch {
    return NextResponse.json({ success: false, value: null });
  }
}
