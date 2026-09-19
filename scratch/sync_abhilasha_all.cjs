const ExcelJS = require('exceljs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function syncAbhilasha() {
  console.log('--- 1. Updating DELHI OFFICE STATEMENT (1).xlsx ---');
  const wbDelhi = new ExcelJS.Workbook();
  await wbDelhi.xlsx.readFile('DELHI OFFICE STATEMENT (1).xlsx');
  
  // Find Sheet 16 (currently named 'P.NO. 36')
  let wsAbhi = wbDelhi.getWorksheet('P.NO. 36') || wbDelhi.getWorksheet('P.NO. 1') || wbDelhi.worksheets[15];
  console.log('Found sheet:', wsAbhi.name);
  wsAbhi.name = 'P.NO. 1'; // Rename to Plot 1 so it matches reality

  // Ensure Row 7 has the ₹2,100 registration token receipt
  wsAbhi.getRow(7).getCell(6).value = '24.5.26 (Token)';
  wsAbhi.getRow(7).getCell(7).value = 2100;
  wsAbhi.getRow(7).getCell(8).value = 'Muskan Varshney\n';
  wsAbhi.getRow(11).getCell(7).value = { formula: 'SUM(G2:G10)', result: 710967 };
  wsAbhi.getRow(3).getCell(5).value = { formula: 'G11', result: 710967 };
  wsAbhi.getRow(4).getCell(5).value = { formula: 'E2-E3', result: 355483 };

  try {
    await wbDelhi.xlsx.writeFile('DELHI OFFICE STATEMENT (1).xlsx');
    console.log('Saved DELHI OFFICE STATEMENT (1).xlsx with tab P.NO. 1 and full 7,10,967 receipts');
  } catch (err) {
    console.warn('Warning: DELHI OFFICE STATEMENT (1).xlsx is currently open in Excel (' + err.code + '). Writing to DELHI OFFICE STATEMENT (1)_UPDATED.xlsx');
    await wbDelhi.xlsx.writeFile('DELHI OFFICE STATEMENT (1)_UPDATED.xlsx');
    console.log('Saved to DELHI OFFICE STATEMENT (1)_UPDATED.xlsx successfully!');
  }

  console.log('\n--- 2. Updating SVI Payment Details.xlsx ---');
  const wbSvi = new ExcelJS.Workbook();
  await wbSvi.xlsx.readFile('SVI Payment Details.xlsx');
  const wsSvi = wbSvi.worksheets[0];
  
  // Check if Abhilasha already in SVI Excel
  let abhiRowIndex = -1;
  for (let r = 2; r <= wsSvi.rowCount; r++) {
    const val = wsSvi.getRow(r).getCell(7).value;
    if (val && String(val).toLowerCase().includes('abhilasha')) {
      abhiRowIndex = r;
      break;
    }
  }

  const targetRow = abhiRowIndex > 0 ? abhiRowIndex : 20;
  const row = wsSvi.getRow(targetRow);
  
  row.getCell(1).value = 'Shyam Aangan';
  row.getCell(2).value = 193.9;
  row.getCell(3).value = 1;
  row.getCell(4).value = 'SVI002134';
  row.getCell(5).value = 5500;
  row.getCell(6).value = 'NA';
  row.getCell(7).value = 'Abhilasha Varma';
  row.getCell(8).value = 'client.svi002134@sviinfra.com';
  row.getCell(9).value = 9031439111;
  row.getCell(10).value = 'Plot 1, Shyam Aangan Phase 1';
  row.getCell(11).value = '2026-05-24T00:00:00.000Z';
  row.getCell(12).value = 'Muskan Varshney';
  row.getCell(13).value = '2026-06-05T00:00:00.000Z';
  row.getCell(14).value = '50000+50000+1000+2100=103100';
  row.getCell(15).value = '2026-06-08T00:00:00.000Z';
  row.getCell(16).value = 430125;
  row.getCell(18).value = '2026-08-03T00:00:00.000Z';
  row.getCell(19).value = 177742;
  row.commit();

  await wbSvi.xlsx.writeFile('SVI Payment Details.xlsx');
  console.log('Saved SVI Payment Details.xlsx with Abhilasha Varma in Row ' + targetRow);

  console.log('\n--- 3. Updating Supabase DB ---');
  // 3a. Update Profile
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', 'client.svi002134@sviinfra.com').maybeSingle();
  let userId = profile?.id;
  if (userId) {
    await supabase.from('profiles').update({
      phone: '9031439111',
      notes: 'Approved client for Ticket/Ref: SVI002134'
    }).eq('id', userId);
    console.log('Updated profile for Abhilasha Varma (id:', userId, ')');
  }

  // 3b. Upsert Allotment
  const { data: existingAllot } = await supabase.from('allotments').select('id').eq('unit_no', '1').maybeSingle();
  const allotPayload = {
    user_id: userId,
    property_id: 'e154bd4e-eecb-4dc0-ac44-b017cb61a6f0',
    unit_no: '1',
    status: 'Allotted',
    allotted_date: '2026-05-24',
    notes: 'Approved client allotment from Ticket ID SVI002134',
    metadata: {
      ticket_id: 'SVI002134',
      ticketId: 'SVI002134',
      client_name: 'ABHILASHA VARMA',
      client_phone: '9031439111',
      client_email: 'client.svi002134@sviinfra.com',
      advisor_name: 'Muskan Varshney',
      area: 193.9,
      rate_per_sq_yd: 5500,
      bsp: 5500,
      total_cost: 1066450,
      draw_date: '2026-05-24',
      source: 'payment_receipt, allotment_letter',
      approved_at: new Date().toISOString(),
      approved_by: 'sviiinfrasolutions@gmail.com',
      plot_no: '1',
      project_name: 'Shyam Aangan Phase 1'
    }
  };

  if (existingAllot) {
    await supabase.from('allotments').update(allotPayload).eq('id', existingAllot.id);
    console.log('Updated existing allotment for Plot 1');
  } else {
    await supabase.from('allotments').insert(allotPayload);
    console.log('Inserted new allotment for Plot 1');
  }

  // 3c. Upsert Allotment Letter in documents
  const { data: existingLetter } = await supabase.from('documents').select('id').eq('document_type', 'allotment_letter').eq('form_data->>ticketId', 'SVI002134').maybeSingle();
  const letterFd = {
    ticketId: 'SVI002134',
    clientName: 'ABHILASHA VARMA',
    email: 'client.svi002134@sviinfra.com',
    phone: '9031439111',
    address: 'Plot 1, Shyam Aangan Phase 1',
    unitNumber: '1',
    plotNo: '1',
    area: '193.90',
    bsp: '5500',
    ratePerSqYd: '5500',
    totalCost: '1066450',
    projectName: 'Shyam Aangan Phase 1',
    advisorName: 'Muskan Varshney',
    bookingDate: '2026-05-24',
    paymentPlan: '12',
    status: 'approved'
  };

  if (existingLetter) {
    await supabase.from('documents').update({ form_data: letterFd, status: 'completed' }).eq('id', existingLetter.id);
    console.log('Updated existing allotment letter for SVI002134');
  } else {
    await supabase.from('documents').insert({
      document_type: 'allotment_letter',
      status: 'completed',
      form_data: letterFd,
      created_at: new Date().toISOString()
    });
    console.log('Inserted new allotment letter for SVI002134');
  }

  // 3d. Update Deal Values in portal_settings
  const { data: setting } = await supabase.from('portal_settings').select('value').eq('key', 'receipt_deal_values').maybeSingle();
  const dealMap = setting?.value || {};
  dealMap['svi002134'] = 1066450;
  await supabase.from('portal_settings').update({ value: dealMap }).eq('key', 'receipt_deal_values');
  console.log('Updated portal_settings.receipt_deal_values for svi002134 = 1066450');

  console.log('--- ALL DONE SUCCESSFULLY! ---');
}

syncAbhilasha().catch(console.error);
