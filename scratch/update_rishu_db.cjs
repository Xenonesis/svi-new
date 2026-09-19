const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updateRishuDB() {
  console.log('====================================================');
  console.log('UPDATING RISHU MISHRA (SVI002051, Plot 36) AS PER SVI EXCEL');
  console.log('====================================================\n');

  const TICKET_ID = 'SVI002051';
  const CLIENT_NAME = 'Rishu mishra';
  const PHONE = '9958894058';
  const ADDRESS = 'A-1004, 10th Floor, Green Valley Society, Kaspate Wasti Road, WakadPune-411057Maharashtra';
  const ADVISOR = 'Luv kumar';
  const PLOT_NO = '36';
  const AREA = 100;
  const BSP = 5500;
  const TOTAL_COST = 550000;
  const DRAW_DATE = '2026-03-22';
  const PROPERTY_ID = 'e154bd4e-eecb-4dc0-ac44-b017cb61a6f0'; // Shyam Aangan Phase 1

  // 1. Clean up orphaned 'SVI2051' unassigned allotment & test doc
  console.log('--- 1. Cleaning up orphaned SVI2051 test records ---');
  await supabase.from('payment_schedules').delete().eq('allotment_id', '335351d2-f1be-4aef-9041-529692cd78b3');
  await supabase.from('allotments').delete().eq('id', '335351d2-f1be-4aef-9041-529692cd78b3');
  await supabase.from('documents').delete().eq('id', '2af9f074-f520-4960-b20f-951b6c978985');
  console.log('Deleted orphaned SVI2051 test allotment & test receipt');

  // 2. Update Profile
  console.log('\n--- 2. Updating Profile ---');
  const { data: profile } = await supabase.from('profiles').select('*').eq('email', 'client.svi002051@sviinfra.com').maybeSingle();
  let userId = profile?.id;
  if (userId) {
    await supabase.from('profiles').update({
      full_name: 'Rishu mishra',
      phone: PHONE,
      notes: `Approved client for Ticket/Ref: ${TICKET_ID} | Address: ${ADDRESS}`
    }).eq('id', userId);
    console.log('Updated profile for user ID:', userId);
  } else {
    const { data: newProf } = await supabase.from('profiles').insert({
      email: 'client.svi002051@sviinfra.com',
      full_name: 'Rishu mishra',
      phone: PHONE,
      role: 'client',
      notes: `Approved client for Ticket/Ref: ${TICKET_ID} | Address: ${ADDRESS}`,
      is_active: true
    }).select().single();
    userId = newProf.id;
    console.log('Created new profile for user ID:', userId);
  }

  // 3. Update / Upsert Allotment
  console.log('\n--- 3. Updating Allotment Record ---');
  const { data: existingAllot } = await supabase.from('allotments').select('*').eq('unit_no', '36').maybeSingle();
  const allotMetadata = {
    area: AREA,
    bsp: BSP,
    rate_per_sq_yd: BSP,
    total_cost: TOTAL_COST,
    client_name: CLIENT_NAME,
    client_phone: PHONE,
    client_email: 'client.svi002051@sviinfra.com',
    client_address: ADDRESS,
    advisor_name: ADVISOR,
    plot_no: PLOT_NO,
    ticket_id: TICKET_ID,
    ticketId: TICKET_ID,
    draw_date: DRAW_DATE,
    project_name: 'Shyam Aangan Phase 1',
    source: 'payment_receipt, allotment_letter',
    approved_at: '2026-09-12T17:36:56.039Z',
    approved_by: 'sviiinfrasolutions@gmail.com'
  };

  let allotmentId = existingAllot?.id;
  if (existingAllot) {
    await supabase.from('allotments').update({
      user_id: userId,
      property_id: PROPERTY_ID,
      unit_no: PLOT_NO,
      status: 'Allotted',
      allotted_date: DRAW_DATE,
      notes: `Approved client allotment from Ticket ID ${TICKET_ID}`,
      metadata: allotMetadata
    }).eq('id', existingAllot.id);
    console.log('Updated existing allotment ID:', allotmentId);
  } else {
    const { data: newAllot } = await supabase.from('allotments').insert({
      user_id: userId,
      property_id: PROPERTY_ID,
      unit_no: PLOT_NO,
      status: 'Allotted',
      allotted_date: DRAW_DATE,
      notes: `Approved client allotment from Ticket ID ${TICKET_ID}`,
      metadata: allotMetadata
    }).select().single();
    allotmentId = newAllot.id;
    console.log('Inserted new allotment ID:', allotmentId);
  }

  // 4. Update the 5 Payment Receipts in documents
  console.log('\n--- 4. Updating the 5 Payment Receipts ---');
  const receiptsConfig = [
    {
      id: '979dfe8e-868e-41bb-bf11-75861221ebc5',
      installmentType: '10% Payment',
      amount: '55000',
      date: '2026-03-22',
      receiptNo: 'SVI-SVI002051-1',
      notes: '10% Payment as per SVI Payment Details',
      amountWords: 'Fifty Five Thousand Rupees Only'
    },
    {
      id: '87b9a18c-2034-4a31-931e-3c9bcc84b812',
      installmentType: '20% Payment',
      amount: '50000',
      date: '2026-04-01',
      receiptNo: 'SVI-SVI002051-2',
      notes: '20% Payment as per SVI Payment Details',
      amountWords: 'Fifty Thousand Rupees Only'
    },
    {
      id: '197311ab-2194-4125-90df-6ffa5d4daede',
      installmentType: 'EMI 1',
      amount: '16042',
      date: '2026-06-02',
      receiptNo: 'SVI-SVI002051-3',
      notes: 'EMI 1 as per SVI Payment Details',
      amountWords: 'Sixteen Thousand Forty Two Rupees Only'
    },
    {
      id: 'ecc0a0da-15a8-480c-b817-7ae07957ef41',
      installmentType: 'EMI 2',
      amount: '16042',
      date: '2026-07-09',
      receiptNo: 'SVI-SVI002051-4',
      notes: 'EMI 2 as per SVI Payment Details',
      amountWords: 'Sixteen Thousand Forty Two Rupees Only'
    },
    {
      id: 'bf8ceb33-ea39-47ce-b4d4-a36ec7105d24',
      installmentType: 'EMI 3',
      amount: '16042',
      date: '2026-09-04',
      receiptNo: 'SVI-SVI002051-5',
      notes: 'EMI 3 as per SVI Payment Details',
      amountWords: 'Sixteen Thousand Forty Two Rupees Only'
    }
  ];

  for (const rc of receiptsConfig) {
    const { data: doc } = await supabase.from('documents').select('*').eq('id', rc.id).single();
    if (doc) {
      const updatedFormData = {
        ...(doc.form_data || {}),
        name: CLIENT_NAME,
        phone: PHONE,
        refId: TICKET_ID,
        plotNo: PLOT_NO,
        plotSize: String(AREA),
        advisorName: ADVISOR,
        installmentType: rc.installmentType,
        amount: rc.amount,
        amountWords: rc.amountWords,
        date: rc.date,
        receiptNo: rc.receiptNo,
        notes: rc.notes,
        status: 'approved'
      };
      await supabase.from('documents').update({
        form_data: updatedFormData,
        status: 'completed'
      }).eq('id', rc.id);
      console.log(`Updated receipt ${rc.installmentType} (${rc.id}) -> ₹${rc.amount} on ${rc.date}`);
    }
  }

  // 5. Upsert Allotment Letter in documents
  console.log('\n--- 5. Upserting Allotment Letter Document ---');
  const { data: existingLetter } = await supabase.from('documents').select('id').eq('document_type', 'allotment_letter').eq('form_data->>ticketId', TICKET_ID).maybeSingle();
  const letterFd = {
    ticketId: TICKET_ID,
    clientName: CLIENT_NAME,
    phone: PHONE,
    email: 'client.svi002051@sviinfra.com',
    address: ADDRESS,
    unitNumber: PLOT_NO,
    plotNo: PLOT_NO,
    area: String(AREA),
    bsp: String(BSP),
    ratePerSqYd: String(BSP),
    totalCost: String(TOTAL_COST),
    projectName: 'Shyam Aangan Phase 1',
    advisorName: ADVISOR,
    bookingDate: DRAW_DATE,
    paymentPlan: '12',
    status: 'approved'
  };

  if (existingLetter) {
    await supabase.from('documents').update({
      form_data: letterFd,
      status: 'completed'
    }).eq('id', existingLetter.id);
    console.log('Updated existing allotment letter for', TICKET_ID);
  } else {
    await supabase.from('documents').insert({
      document_type: 'allotment_letter',
      status: 'completed',
      form_data: letterFd,
      created_at: new Date().toISOString()
    });
    console.log('Inserted new allotment letter for', TICKET_ID);
  }

  // 6. Sync Payment Schedules
  console.log('\n--- 6. Syncing Payment Schedules ---');
  await supabase.from('payment_schedules').delete().eq('allotment_id', allotmentId);
  const schedulesToInsert = receiptsConfig.map((rc, idx) => ({
    allotment_id: allotmentId,
    user_id: userId,
    title: rc.installmentType,
    amount: parseFloat(rc.amount),
    due_date: rc.date,
    status: 'paid',
    paid_date: rc.date,
    notes: rc.notes
  }));
  await supabase.from('payment_schedules').insert(schedulesToInsert);
  console.log('Inserted', schedulesToInsert.length, 'payment schedules');

  // 7. Update Portal Settings Deal Values
  console.log('\n--- 7. Updating Portal Settings Deal Value ---');
  const { data: setting } = await supabase.from('portal_settings').select('value').eq('key', 'receipt_deal_values').maybeSingle();
  const dealMap = setting?.value || {};
  dealMap['svi002051'] = TOTAL_COST;
  await supabase.from('portal_settings').update({ value: dealMap }).eq('key', 'receipt_deal_values');
  console.log('Updated receipt_deal_values for svi002051 =', TOTAL_COST);

  console.log('\n====================================================');
  console.log('SUCCESS: RISHU MISHRA (SVI002051) FULLY UPDATED IN DB!');
  console.log('====================================================');
}

updateRishuDB().catch(console.error);
