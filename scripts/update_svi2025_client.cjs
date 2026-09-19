const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const sb = createClient(supabaseUrl, serviceKey);

async function updateSVI2025Client() {
  console.log('--- Starting SVI2025 / SVI002025 Client Synchronization ---');

  const userId = 'd613e509-1653-402c-b28e-2806d5da1a4a'; // Gaurav Kohli
  const orphanedAllotmentId = 'e06f9e03-101b-4689-bec7-d1ebd5ad00f8'; // Unassigned dummy allotment
  const activeAllotmentId = '3c32b94a-8e46-4ec2-a395-134eb66c62b4'; // Unit 30 active allotment

  // 1. Delete dummy payment schedules on orphaned allotment
  console.log('1. Deleting dummy payment schedules on orphaned allotment...');
  const { error: schedDelErr } = await sb
    .from('payment_schedules')
    .delete()
    .eq('allotment_id', orphanedAllotmentId);
  if (schedDelErr) {
    console.error('Error deleting dummy schedules:', schedDelErr);
  } else {
    console.log('✓ Deleted dummy schedules on orphaned allotment');
  }

  // 2. Delete orphaned dummy allotment (Unit: Unassigned, total_cost: 45)
  console.log('2. Deleting orphaned test allotment...');
  const { error: allotDelErr } = await sb
    .from('allotments')
    .delete()
    .eq('id', orphanedAllotmentId);
  if (allotDelErr) {
    console.error('Error deleting orphaned allotment:', allotDelErr);
  } else {
    console.log('✓ Deleted orphaned allotment:', orphanedAllotmentId);
  }

  // 3. Delete obsolete typo receipts from June 2026 (#2067: 14538, #2068: 45)
  console.log('3. Deleting obsolete typo receipts from June 2026...');
  const typoReceiptIds = [
    '4d8f3e4a-c440-4ac5-aadf-c541adb4ca67', // Receipt 2067 (14538)
    'dd452c11-80df-4503-acea-c384f6b78664', // Receipt 2068 (45)
  ];
  const { error: recDelErr } = await sb
    .from('documents')
    .delete()
    .in('id', typoReceiptIds);
  if (recDelErr) {
    console.error('Error deleting typo receipts:', recDelErr);
  } else {
    console.log('✓ Deleted obsolete typo receipts (2067 & 2068)');
  }

  // 4. Update the 3 official payment receipts to link to Gaurav Kohli
  console.log('4. Linking official payment receipts to Gaurav Kohli...');
  const officialReceipts = [
    {
      id: 'cfaf6a19-5bb5-4bc2-83b3-fabfee2f5a7b',
      amount: 50000,
      date: '2026-01-27',
      receiptNo: 'SVI-SVI002025-1',
      title: '10% Payment',
      notes: '10% Payment (11000 + 39000) as per SVI Payment Details',
    },
    {
      id: '4e05643d-06e7-4c77-86f0-bc9011c7f59f',
      amount: 100000,
      date: '2026-04-19',
      receiptNo: 'SVI-SVI002025-2',
      title: '20% Payment',
      notes: '20% Payment as per SVI Payment Details',
    },
    {
      id: '03d24ff7-5a63-4064-93da-3819fa82ac64',
      amount: 14583,
      date: '2026-06-15',
      receiptNo: 'SVI-SVI002025-3',
      title: 'EMI 1',
      notes: 'EMI 1 as per SVI Payment Details',
    },
  ];

  for (const r of officialReceipts) {
    const { data: cur } = await sb.from('documents').select('form_data, metadata').eq('id', r.id).single();
    const fd = cur?.form_data || {};
    const meta = cur?.metadata || {};

    const updatedFd = {
      ...fd,
      receiptNo: r.receiptNo,
      date: r.date,
      name: 'Gaurav Kohli',
      refId: 'SVI002025',
      ticketId: 'SVI002025',
      plotNo: '30',
      plotSize: '100',
      amount: String(r.amount),
      phone: '9911300308',
      advisorName: 'Alok gupta',
      notes: r.notes,
      installmentType: r.title,
      paymentMethod: 'Bank Transfer',
    };

    const updatedMeta = {
      ...meta,
      ticket_id: 'SVI002025',
      refId: 'SVI002025',
      client_name: 'Gaurav Kohli',
      installment_type: r.title,
    };

    const { error: upErr } = await sb
      .from('documents')
      .update({
        user_id: userId,
        amount: r.amount,
        form_data: updatedFd,
        metadata: updatedMeta,
        updated_at: new Date().toISOString(),
      })
      .eq('id', r.id);

    if (upErr) {
      console.error(`Error updating receipt ${r.id}:`, upErr);
    } else {
      console.log(`✓ Updated and linked receipt ${r.receiptNo} (₹${r.amount})`);
    }
  }

  // 5. Update active allotment (Unit: 30)
  console.log('5. Updating active allotment (Plot 30)...');
  const { data: curAllot } = await sb.from('allotments').select('metadata').eq('id', activeAllotmentId).single();
  const existingMeta = curAllot?.metadata || {};

  const updatedAllotMeta = {
    ...existingMeta,
    ticket_id: 'SVI002025',
    ticketId: 'SVI002025',
    refId: 'SVI002025',
    area: '100',
    rate_per_sq_yd: 5000,
    total_cost: 500000,
    draw_date: 'Direct sell',
    advisor_name: 'Alok gupta',
    client_name: 'Gaurav Kohli',
    client_phone: '9911300308',
    client_email: 'kohli.gaurav141@gmail.com',
    client_address: 'H/N 141-142, nehru vihar west delhi-110054',
    address: 'H/N 141-142, nehru vihar west delhi-110054',
  };

  const { error: allotUpErr } = await sb
    .from('allotments')
    .update({
      user_id: userId,
      unit_no: '30',
      metadata: updatedAllotMeta,
      notes: 'Approved client allotment for Gaurav Kohli (Plot 30) - Ref: SVI002025 / SVI2025',
      updated_at: new Date().toISOString(),
    })
    .eq('id', activeAllotmentId);

  if (allotUpErr) {
    console.error('Error updating active allotment:', allotUpErr);
  } else {
    console.log('✓ Updated active allotment (Unit 30, Deal: ₹5,00,000)');
  }

  // 6. Delete any existing schedules on active allotment to prevent duplicates
  await sb.from('payment_schedules').delete().eq('allotment_id', activeAllotmentId);

  // 7. Insert the 3 official payment schedules on active allotment
  console.log('6. Inserting 3 official payment schedules on active allotment...');
  const newSchedules = [
    {
      allotment_id: activeAllotmentId,
      user_id: userId,
      title: '10% Booking Payment (11000 + 39000)',
      amount: 50000,
      due_date: '2026-01-27',
      paid_date: '2026-01-27',
      status: 'paid',
      notes: 'Receipt #SVI-SVI002025-1 (10% milestone)',
    },
    {
      allotment_id: activeAllotmentId,
      user_id: userId,
      title: '20% Milestone Payment',
      amount: 100000,
      due_date: '2026-04-19',
      paid_date: '2026-04-19',
      status: 'paid',
      notes: 'Receipt #SVI-SVI002025-2 (20% milestone)',
    },
    {
      allotment_id: activeAllotmentId,
      user_id: userId,
      title: '1st EMI Payment',
      amount: 14583,
      due_date: '2026-06-15',
      paid_date: '2026-06-15',
      status: 'paid',
      notes: 'Receipt #SVI-SVI002025-3 (1st EMI)',
    },
  ];

  const { data: insertedSchedules, error: schedInsErr } = await sb
    .from('payment_schedules')
    .insert(newSchedules)
    .select('id, title, amount, status');

  if (schedInsErr) {
    console.error('Error inserting schedules:', schedInsErr);
  } else {
    console.log(`✓ Inserted ${insertedSchedules?.length} payment schedules:`, insertedSchedules);
  }

  // 8. Create official Allotment Letter document in documents table
  console.log('7. Creating official Allotment Letter document...');
  const { data: existingAllotDoc } = await sb
    .from('documents')
    .select('id')
    .eq('user_id', userId)
    .eq('document_type', 'allotment_letter')
    .maybeSingle();

  const allotDocFormData = {
    bsp: '5000',
    plc: 'NA',
    area: '100',
    address: 'H/N 141-142, nehru vihar west delhi-110054',
    ticketId: 'SVI002025',
    clientName: 'Gaurav Kohli',
    salutation: 'Mr.',
    unitNumber: '30',
    advisorName: 'Alok gupta',
    bookingDate: '2026-01-27',
    drawDate: 'Direct sell',
    projectName: 'Shyam Aangan',
    totalCost: '500000',
    clientPhone: '9911300308',
    clientEmail: 'kohli.gaurav141@gmail.com',
  };

  if (existingAllotDoc) {
    await sb
      .from('documents')
      .update({
        form_data: allotDocFormData,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingAllotDoc.id);
    console.log('✓ Updated existing allotment letter document:', existingAllotDoc.id);
  } else {
    const { data: newDoc, error: docErr } = await sb
      .from('documents')
      .insert({
        user_id: userId,
        document_type: 'allotment_letter',
        status: 'completed',
        form_data: allotDocFormData,
        metadata: {
          ticket_id: 'SVI002025',
          unit_no: '30',
          client_name: 'Gaurav Kohli',
        },
      })
      .select('id')
      .single();

    if (docErr) {
      console.error('Error inserting allotment letter:', docErr);
    } else {
      console.log('✓ Created new allotment letter document:', newDoc?.id);
    }
  }

  // 9. Update portal_settings (receipt_deal_values)
  console.log('8. Updating portal_settings receipt_deal_values...');
  const { data: settingData } = await sb
    .from('portal_settings')
    .select('value')
    .eq('key', 'receipt_deal_values')
    .maybeSingle();

  const currentMap = settingData?.value || {};
  const updatedMap = {
    ...currentMap,
    SVI002025: 500000,
    svi002025: 500000,
    SVI2025: 500000,
    svi2025: 500000,
  };

  const { error: setErr } = await sb
    .from('portal_settings')
    .upsert({
      key: 'receipt_deal_values',
      value: updatedMap,
      updated_at: new Date().toISOString(),
    });

  if (setErr) {
    console.error('Error updating portal_settings:', setErr);
  } else {
    console.log('✓ Updated portal_settings for SVI2025 and SVI002025 -> 500,000');
  }

  console.log('\n================ SYNCHRONIZATION COMPLETE ================');
}

updateSVI2025Client().catch(console.error);
