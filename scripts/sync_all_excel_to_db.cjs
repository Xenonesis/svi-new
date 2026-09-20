const ExcelJS = require('exceljs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseCellMath(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'object') {
    if (val.result !== undefined) return parseFloat(val.result) || 0;
    if (val.richText) val = val.richText.map(t => t.text).join('').trim();
    else if (val.text) val = val.text;
    else val = JSON.stringify(val);
  }
  let str = String(val).trim();
  if (str.includes('=')) {
    const parts = str.split('=');
    const afterEq = parts[parts.length - 1].trim().replace(/,/g, '');
    const num = parseFloat(afterEq);
    if (!isNaN(num)) return num;
  }
  str = str.replace(/,/g, '').replace(/[^0-9+-.]/g, '');
  try {
    const tokens = str.match(/([+-]?\d+(\.\d+)?)/g);
    if (tokens) return tokens.reduce((sum, t) => sum + parseFloat(t), 0);
  } catch (e) {}
  return parseFloat(str) || 0;
}

function parseSize(val) {
  if (typeof val === 'number') return val;
  const str = String(val || '').trim();
  if (str.includes('+')) {
    return str.split('+').reduce((s, x) => s + (parseFloat(x) || 0), 0);
  }
  return parseFloat(str) || 0;
}

function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (val.getFullYear() === 2005) val.setFullYear(2025);
    return val.toISOString().split('T')[0];
  }
  let str = String(val).trim();
  if (str.toLowerCase().includes('jan 2026') || str.toLowerCase().includes('1u')) {
    return '2026-01-15';
  }
  const cleanDate = str.replace(/\s+/g, '');
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanDate)) {
    const [d, m, y] = cleanDate.split('-');
    return `${y === '2005' ? '2025' : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return str.replace(/^2005-/, '2025-');
}

const TICKET_ID_MAP = {
  5: 'PL2050',
  6: 'PL2083', // Excel row 6 explicitly has PL2083
  7: 'PL2065',
  10: 'PL2081',
  12: 'PL2082',
  13: 'SVI2007',
  14: 'PL2221',
  17: 'SVI2029',
};

const normalize = (s) => (s || '').toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

async function syncAll() {
  console.log('=== STARTING FULL DATABASE SYNC FROM SVI Payment Details.xlsx ===\n');

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('SVI Payment Details.xlsx');
  const sheet = wb.getWorksheet(1);

  // 1. Fetch DB records
  const { data: allotments, error: aErr } = await supabase
    .from('allotments')
    .select('*, profiles:user_id(id, full_name, email, phone, role), properties:property_id(id, name)');

  if (aErr) throw aErr;

  const { data: receipts } = await supabase
    .from('documents')
    .select('*')
    .eq('document_type', 'payment_receipt');

  const { data: existingSchedules } = await supabase
    .from('payment_schedules')
    .select('*');

  const { data: settingData } = await supabase
    .from('portal_settings')
    .select('value')
    .eq('key', 'receipt_deal_values')
    .maybeSingle();

  const currentDealValues = (settingData && settingData.value) ? { ...settingData.value } : {};

  // Parse Excel
  const excelClients = [];
  for (let r = 2; r <= 20; r++) {
    const row = sheet.getRow(r);
    const plotNo = String(row.getCell(3).value || '').trim();
    const rawName = String(row.getCell(7).value || '').trim();
    if (!plotNo && !rawName) continue;

    let ticketId = String(row.getCell(4).value || '').trim();
    if (!ticketId && TICKET_ID_MAP[r]) ticketId = TICKET_ID_MAP[r];

    const cleanName = rawName.replace(/\s+A$/, '').replace(/\s+/g, ' ').trim();
    const rawSize = row.getCell(2).value;
    const sizeNum = parseSize(rawSize);
    const bsp = parseCellMath(row.getCell(5).value);
    const totalCost = Math.round(sizeNum * bsp);

    let email = row.getCell(8).value;
    if (typeof email === 'object' && email !== null) email = email.text || email.hyperlink || '';
    email = String(email || '').trim();

    const phone = String(row.getCell(9).value || '').trim();
    const address = String(row.getCell(10).value || '').trim();
    const drawDate = parseDate(row.getCell(11).value);
    const advisor = String(row.getCell(12).value || '').trim();
    const specialStatus = String(row.getCell(17).value || '').trim();

    // Payments
    const payments = [];
    const p10Date = parseDate(row.getCell(13).value);
    const p10 = parseCellMath(row.getCell(14).value);
    if (p10 > 0) payments.push({ type: '10% Booking', amount: p10, date: p10Date });

    const p20Date = parseDate(row.getCell(15).value);
    const p20 = parseCellMath(row.getCell(16).value);
    if (p20 > 0) payments.push({ type: '20% Allotment', amount: p20, date: p20Date });

    for (let c = 18; c <= 32; c += 2) {
      const emiAmt = parseCellMath(row.getCell(c + 1).value);
      const emiDate = parseDate(row.getCell(c).value);
      if (emiAmt > 0) {
        payments.push({ type: `EMI ${(c - 16) / 2}`, amount: emiAmt, date: emiDate });
      }
    }

    excelClients.push({
      row: r,
      plotNo,
      ticketId,
      name: cleanName,
      sizeNum,
      bsp,
      totalCost,
      email,
      phone,
      address,
      drawDate,
      advisor,
      specialStatus,
      payments,
    });
  }

  console.log(`Parsed ${excelClients.length} clients from Excel.`);

  // --- STEP 1: UPDATE portal_settings (receipt_deal_values) ---
  console.log('\n--- 1. UPDATING PORTAL SETTINGS (receipt_deal_values) ---');
  for (const c of excelClients) {
    if (c.totalCost > 0) {
      if (c.ticketId) {
        currentDealValues[c.ticketId] = c.totalCost;
        currentDealValues[c.ticketId.toLowerCase()] = c.totalCost;
        currentDealValues[normalize(c.ticketId)] = c.totalCost;
      }
      // Also map by plot number
      currentDealValues[`PLOT_${c.plotNo}`] = c.totalCost;
      currentDealValues[`plot_${c.plotNo.toLowerCase()}`] = c.totalCost;
    }
  }

  // Add explicit known fallback keys
  currentDealValues['PL2050'] = 658200;
  currentDealValues['PL2083'] = 1000000;
  currentDealValues['PL2066'] = 1000000;
  currentDealValues['PL2065'] = 1000000;
  currentDealValues['SVI002023'] = 1375000;
  currentDealValues['SVI2023'] = 1375000;
  currentDealValues['PL2081'] = 626808;
  currentDealValues['PL2082'] = 516362;
  currentDealValues['SVI2007'] = 500000;
  currentDealValues['PL2126'] = 500000;
  currentDealValues['PL2221'] = 1450200;
  currentDealValues['SVI2029'] = 1450200;
  currentDealValues['PL2181'] = 1450200;

  const { error: settingsErr } = await supabase
    .from('portal_settings')
    .upsert({
      key: 'receipt_deal_values',
      value: currentDealValues,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

  if (settingsErr) {
    console.error('Failed to update portal_settings:', settingsErr);
  } else {
    console.log(`✅ portal_settings updated successfully (${Object.keys(currentDealValues).length} keys).`);
  }

  // --- STEP 2: UPDATE ALLOTMENTS, PROFILES & PAYMENT SCHEDULES ---
  console.log('\n--- 2. UPDATING ALLOTMENTS, PROFILES & PAYMENT SCHEDULES ---');

  for (const c of excelClients) {
    const normPlId = normalize(c.ticketId);
    const normPlotNo = normalize(c.plotNo);

    // Find allotment
    const match = (allotments || []).find(a => {
      const aTicket = normalize(a.metadata?.ticket_id || a.metadata?.ticketId);
      const aUnit = normalize(a.unit_no);
      const aName = normalize(a.profiles?.full_name);
      const cName = normalize(c.name);

      if (normPlId && aTicket && normPlId === aTicket) return true;
      if (normPlotNo && aUnit && normPlotNo === aUnit) return true;
      if (aName && cName && (aName.includes(cName) || cName.includes(aName))) return true;
      return false;
    });

    if (!match) {
      console.warn(`[SKIP] No matching allotment found for ${c.name} (${c.plotNo})`);
      continue;
    }

    console.log(`\nProcessing Row ${c.row}: ${c.name} (Plot: "${c.plotNo}", Ref: "${c.ticketId}")`);

    // Determine updated allotment fields
    const updatedMetadata = {
      ...(match.metadata || {}),
      ticket_id: c.ticketId || match.metadata?.ticket_id || match.metadata?.ticketId || TICKET_ID_MAP[c.row],
      area: c.sizeNum,
      bsp: c.bsp,
      total_cost: c.totalCost,
      advisor_name: c.advisor || match.metadata?.advisor_name,
      client_phone: c.phone || match.metadata?.client_phone || match.profiles?.phone,
      client_email: c.email || match.metadata?.client_email || match.profiles?.email,
      client_address: c.address || match.metadata?.client_address,
      draw_date: c.drawDate || match.metadata?.draw_date,
    };

    let targetStatus = match.status;
    let targetNotes = match.notes;

    if (c.specialStatus && c.specialStatus.toLowerCase().includes('refund')) {
      targetNotes = `Refund Done as per SVI Payment Details.xlsx (${c.specialStatus})`;
      updatedMetadata.refund_status = 'refund_done';
      updatedMetadata.refund_notes = c.specialStatus;
      updatedMetadata.status = 'Refunded';
    }
    const allotmentUpdates = {
      metadata: updatedMetadata,
      status: targetStatus,
      notes: targetNotes,
      updated_at: new Date().toISOString(),
    };

    // Assign unit_no if currently Unassigned or mismatched
    if (match.unit_no === 'Unassigned' || !match.unit_no || (c.plotNo === '33' && match.unit_no !== '33')) {
      allotmentUpdates.unit_no = c.plotNo;
      console.log(`   👉 Assigning unit_no: "${c.plotNo}" (was "${match.unit_no}")`);
    }

    const { error: aUpErr } = await supabase
      .from('allotments')
      .update(allotmentUpdates)
      .eq('id', match.id);

    if (aUpErr) {
      console.error(`   ❌ Failed to update allotment ${match.id}:`, aUpErr);
    } else {
      console.log(`   ✅ Allotment ${match.id} updated (Unit: ${allotmentUpdates.unit_no || match.unit_no}, Status: ${targetStatus}, Ref: ${updatedMetadata.ticket_id})`);
    }

    // Update Profile Contact Info
    if (match.user_id) {
      const profileUpdates = {};
      if (c.phone && c.phone !== match.profiles?.phone) {
        profileUpdates.phone = c.phone;
      }
      if (c.email && c.email.includes('@') && c.email !== match.profiles?.email && !match.profiles?.email?.includes('@gmail.com')) {
        profileUpdates.email = c.email;
      }
      if (c.address && (!match.profiles?.notes || match.profiles?.notes.length < 5)) {
        profileUpdates.notes = `Address: ${c.address}`;
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profErr } = await supabase
          .from('profiles')
          .update({ ...profileUpdates, updated_at: new Date().toISOString() })
          .eq('id', match.user_id);

        if (profErr) {
          console.error(`   ❌ Failed to update profile ${match.user_id}:`, profErr);
        } else {
          console.log(`   ✅ Profile ${match.user_id} updated with real contacts (${Object.keys(profileUpdates).join(', ')})`);
        }
      }

      // Sync Payment Schedules if missing
      const clientSchedules = (existingSchedules || []).filter(s => s.allotment_id === match.id);
      if (clientSchedules.length === 0 && c.payments && c.payments.length > 0) {
        console.log(`   👉 Inserting ${c.payments.length} missing payment schedule rows...`);
        const scheduleInserts = c.payments.map((p, idx) => ({
          allotment_id: match.id,
          user_id: match.user_id,
          title: `Payment ${p.type}`,
          amount: p.amount,
          due_date: p.date || new Date().toISOString().split('T')[0],
          status: 'paid',
          paid_date: p.date || new Date().toISOString().split('T')[0],
          notes: `Synced from SVI Payment Details.xlsx milestone ${idx + 1}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: sInsErr } = await supabase
          .from('payment_schedules')
          .insert(scheduleInserts);

        if (sInsErr) {
          console.error(`   ❌ Failed to insert payment schedules:`, sInsErr);
        } else {
          console.log(`   ✅ Inserted ${c.payments.length} payment schedule milestones into DB.`);
        }
      }
    }
  }

  console.log('\n====================================================');
  console.log('SYNC PROCESS COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

syncAll().catch(console.error);
