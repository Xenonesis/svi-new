import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

// GET /api/admin/properties - Fetch all properties
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin properties:', error.message);
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }

    return NextResponse.json({ properties: properties || [] });
  } catch (err: any) {
    console.error('GET admin properties error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/properties - Create or update a property
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { id, name, slug, active } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
  }

  try {
    // Get admin profile for logging
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();
    const adminName = profile?.full_name || admin.email || 'Admin';

    let result;
    let actionType = 'property_created';
    let logDescription = '';

    if (id) {
      // Update existing property
      actionType = 'property_updated';
      logDescription = `${adminName} updated property: ${name}.`;
      const { data, error } = await supabaseAdmin
        .from('properties')
        .update({
          name,
          slug,
          active: active !== undefined ? active : true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new property
      logDescription = `${adminName} created a new property: ${name}.`;
      const { data, error } = await supabaseAdmin
        .from('properties')
        .insert({
          name,
          slug,
          active: active !== undefined ? active : true,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Insert Activity Log
    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: actionType,
        description: logDescription,
        metadata: { event: actionType, propertyName: name, propertyId: result.id },
      });
    } catch (logErr) {
      console.error('Failed to log property activity:', logErr);
    }

    return NextResponse.json({ success: true, property: result });
  } catch (err: any) {
    console.error('POST admin properties error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/properties - Delete a property
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  try {
    // Get admin profile for logging
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();
    const adminName = profile?.full_name || admin.email || 'Admin';

    // Get property details before deletion for logging
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('name')
      .eq('id', id)
      .single();

    const propertyName = property?.name || 'Unknown Property';

    const { error } = await supabaseAdmin.from('properties').delete().eq('id', id);

    if (error) throw error;

    // Insert Activity Log
    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: 'property_deleted',
        description: `${adminName} deleted property: ${propertyName}.`,
        metadata: { event: 'property_deleted', propertyName, propertyId: id },
      });
    } catch (logErr) {
      console.error('Failed to log property deletion activity:', logErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE admin properties error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
