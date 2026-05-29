import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select('id, name, slug, active')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching active properties:', error.message);
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }

    return NextResponse.json({ properties: properties || [] });
  } catch (err: any) {
    console.error('GET properties public error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
