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

const TICKET_ID_MAP = {
  5: 'PL2050',
  6: 'PL2066',
  7: 'PL2065',
  10: 'PL2081',
  12: 'PL2006',
  13: 'PL2126',
  14: 'PL2221',
  17: 'PL2181',
};

async function verifyAll() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = wb.getWorksheet(1);

  // Fetch DB data
  const { data: allotments } = await supabase.from('allotments').select('*');
  const { data: docs } = await supabase.from('documents').select('id, form_data').eq('document_type', 'payment_receipt');
  const { data: setting } = await supabase.from('portal_settings').select('value').eq('key', 'receipt_deal_values').maybeSingle();
  const dealMap = setting?.value || {};

  console.log(`\n=============================================================`);
  console.log(`VERIFICATION REPORT: SVI PAYMENT DETAILS vs SUPABASE DB`);
  console.log(`Total Allotments in DB: ${allotments.length}`);
  console.log(`Total Payment Receipts in DB: ${docs.length}`);
  console.log(`=============================================================\n`);

  let allOk = true;

  for (let r = 2; r <= 19; r++) {
    const row = ws.getRow(r);
    const rawName = String(row.getCell(7).value || '').trim();
    const cleanName = rawName.replace(/\s+A$/, '').replace(/\s+/g, ' ').trim();
    const plotNo = String(row.getCell(3).value || '').trim();
    let plId = String(row.getCell(4).value || '').trim() || TICKET_ID_MAP[r];
    const sizeNum = parseSize(row.getCell(2).value);
    const bsp = parseCellMath(row.getCell(5).value);
    const expectedCost = Math.round(sizeNum * bsp);

    // Sum expected payments from Excel
    const p10 = parseCellMath(row.getCell(14).value);
    const p20 = parseCellMath(row.getCell(16).value);
    let emiSum = 0;
    for (let c = 18; c <= 40; c += 2) {
      emiSum += parseCellMath(row.getCell(c + 1).value);
    }
    const expectedPaid = p10 + p20 + emiSum;
    const expectedBalance = expectedCost - expectedPaid;

    // Check in Allotments
    const normTicket = plId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const allot = allotments.find(a => {
      const aTicket = String(a.metadata?.ticket_id || a.metadata?.ticketId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const aUnit = String(a.unit_no || '').trim().toLowerCase();
      return (aTicket && aTicket === normTicket) || (aUnit && plotNo && aUnit === plotNo.toLowerCase());
    });

    // Check in DB Receipts
    const clientDocs = docs.filter(d => {
      const fd = d.form_data || {};
      const dRef = String(fd.refId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return dRef === normTicket;
    });

    const dbTotalPaid = clientDocs.reduce((s, d) => s + parseCellMath(d.form_data?.amount), 0);
    const dbCost = allot?.metadata?.total_cost || dealMap[plId] || dealMap[normTicket] || 0;
    const dbBal = dbCost - dbTotalPaid;

    const paidMatch = Math.abs(dbTotalPaid - expectedPaid) <= 2;
    const costMatch = dbCost === expectedCost;

    const statusMark = (paidMatch && costMatch && allot) ? '✅ OK' : '⚠️ MISMATCH';
    if (!paidMatch || !costMatch || !allot) allOk = false;

    console.log(`[${statusMark}] Row ${r}: ${cleanName} (${plId}, Plot: ${plotNo})`);
    console.log(`    Cost: Expected ₹${expectedCost} | DB ₹${dbCost} (${costMatch ? 'MATCH' : 'MISMATCH'})`);
    console.log(`    Paid: Expected ₹${expectedPaid} | DB ₹${dbTotalPaid} (${clientDocs.length} recs) (${paidMatch ? 'MATCH' : 'MISMATCH'})`);
    console.log(`    Balance: Expected ₹${expectedBalance} | DB ₹${dbBal}`);
    console.log(`    Allotment: ${allot ? `ID ${allot.id} (Status: ${allot.status}, Unit: ${allot.unit_no}, Advisor: ${allot.metadata?.advisor_name})` : 'MISSING'}\n`);
  }

  // Also verify Abhilasha Varma
  console.log('--- VERIFYING PRESERVED CLIENT: ABHILASHA VARMA (SVI002134) ---');
  const abhilashaAllot = allotments.find(a => String(a.metadata?.ticket_id || '').toUpperCase().includes('SVI002134'));
  const abhilashaDocs = docs.filter(d => String(d.form_data?.refId || '').toUpperCase().includes('SVI002134'));
  const abhilashaPaid = abhilashaDocs.reduce((s, d) => s + parseCellMath(d.form_data?.amount), 0);
  console.log(`Abhilasha Varma: Allotment: ${abhilashaAllot ? 'EXISTS' : 'MISSING'}, Cost: ₹${abhilashaAllot?.metadata?.total_cost}, Total Paid: ₹${abhilashaPaid} (${abhilashaDocs.length} recs)`);

  console.log(`\n=============================================================`);
  console.log(allOk ? '🎉 ALL 18 CLIENTS FULLY VERIFIED AND MATCH EXCEL EXACTLY!' : '⚠️ SOME DISCREPANCIES DETECTED');
  console.log(`=============================================================\n`);
}

verifyAll().catch(console.error);
