const ExcelJS = require('exceljs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanStr(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val.richText) return val.richText.map(t => t.text).join('').trim();
    if (val.result !== undefined) return String(val.result).trim();
    return JSON.stringify(val);
  }
  return String(val).trim();
}

function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'object') {
    if (val.result !== undefined) return parseFloat(val.result) || 0;
    val = cleanStr(val);
  }
  let str = String(val).trim().replace(/,/g, '').replace(/[^0-9.-]/g, '');
  return parseFloat(str) || 0;
}

async function checkDelhiVsDB() {
  const fs = require('fs');
  const wb = new ExcelJS.Workbook();
  const targetFile = fs.existsSync('DELHI OFFICE STATEMENT (1)_UPDATED.xlsx') ? 'DELHI OFFICE STATEMENT (1)_UPDATED.xlsx' : 'DELHI OFFICE STATEMENT (1).xlsx';
  await wb.xlsx.readFile(targetFile);

  const { data: allotments } = await supabase.from('allotments').select('*');
  const { data: docs } = await supabase.from('documents').select('id, form_data').eq('document_type', 'payment_receipt');
  const { data: setting } = await supabase.from('portal_settings').select('value').eq('key', 'receipt_deal_values').maybeSingle();
  const dealMap = setting?.value || {};

  console.log('=============================================================================');
  console.log('COMPARISON: DELHI OFFICE STATEMENT (1).xlsx (16 Sheets) vs CURRENT SUPABASE DB');
  console.log('=============================================================================\n');

  wb.worksheets.forEach((ws, idx) => {
    const r2 = ws.getRow(2);
    const r3 = ws.getRow(3);
    const r4 = ws.getRow(4);

    const clientName = cleanStr(r2.getCell(1).value).replace(/\n/g, ' ').trim();
    const plotNo = cleanStr(r2.getCell(2).value);
    const plotSize = parseNum(r2.getCell(3).value);
    const rate = parseNum(r2.getCell(4).value);
    const plotAmt = parseNum(r2.getCell(5).value);
    const totalRecAmt = parseNum(r3.getCell(5).value);
    const balance = parseNum(r4.getCell(5).value);

    let advisor = '';
    for (let r = 1; r <= 15; r++) {
      const v = cleanStr(ws.getRow(r).getCell(8).value);
      if (v && !v.toLowerCase().includes('advisor') && !v.toLowerCase().includes('agent')) {
        advisor = v.replace(/\n/g, ' ').trim();
        break;
      }
    }

    const receipts = [];
    for (let r = 2; r <= ws.rowCount; r++) {
      const dateCell = cleanStr(ws.getRow(r).getCell(6).value);
      const amtCell = parseNum(ws.getRow(r).getCell(7).value);
      if (dateCell.toLowerCase().includes('total')) continue;
      if (dateCell && amtCell > 0) {
        receipts.push({ date: dateCell, amount: amtCell });
      }
    }

    const receiptsSum = receipts.reduce((s, x) => s + x.amount, 0);

    // Explicit mapping of Delhi sheet to DB ticket ID
    const SHEET_TO_TICKET = {
      'P.NO. 5': 'PL2078',
      'P.NO. 6': 'PL2006',
      'P.NO. 31': 'PL2075',
      'P.NO. 32': 'PL2076',
      'P.NO. 33': 'SVI002023',
      'P.NO. 65': 'PL2065',
      'P.NO. 66': 'PL2066',
      'P.NO. 126': 'PL2080',
      'P.NO. 126,127': 'PL2126',
      'P.NO. 128,129': 'PL2077',
      'P.NO. 121,122': 'PL2221',
      'P.NO. 30': 'SVI002025',
      'P.NO. 149': 'SVI002106',
      'P.NO. 181,182': 'PL2181',
      'P.NO. 35': 'SVI002050',
      'P.NO. 36': 'SVI002051',
      'P.NO. 50': 'PL2050',
      'P.NO. 81': 'PL2081',
      'P.NO. 1': 'SVI002134',
    };

    const ticketId = SHEET_TO_TICKET[ws.name];
    const normTicket = String(ticketId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    const matchedAllot = allotments.find(a => {
      const aTicket = String(a.metadata?.ticket_id || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return aTicket === normTicket;
    });

    const matchedDocs = docs.filter(d => {
      const fd = d.form_data || {};
      const ref = String(fd.refId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return normTicket && ref === normTicket;
    });

    const dbTotalPaid = matchedDocs.reduce((s, d) => s + parseNum(d.form_data?.amount), 0);
    const dbCost = matchedAllot?.metadata?.total_cost || dealMap[normTicket] || 0;

    const paidDiff = Math.round((totalRecAmt || receiptsSum) - dbTotalPaid);
    const costDiff = Math.round(plotAmt - dbCost);

    console.log(`[Sheet ${idx+1}: ${ws.name}] "${clientName}" (Plot: ${plotNo})`);
    console.log(`  - Total Cost: Delhi ₹${plotAmt} | DB ₹${dbCost} | Diff: ₹${costDiff}`);
    console.log(`  - Total Paid: Delhi ₹${totalRecAmt || receiptsSum} (${receipts.length} receipts) | DB ₹${dbTotalPaid} (${matchedDocs.length} receipts) | Diff: ₹${paidDiff}`);
    console.log(`  - Balance:    Delhi ₹${balance} | DB ₹${dbCost - dbTotalPaid}`);
    console.log(`  - Advisor:    Delhi "${advisor}" | DB "${matchedAllot?.metadata?.advisor_name || 'N/A'}"`);
    console.log(`  - Ticket ID:  ${ticketId || 'NOT FOUND'}`);

    const diffs = [];
    if (costDiff !== 0) diffs.push(`Plot Cost differs by ₹${costDiff}`);
    if (paidDiff !== 0) diffs.push(`Total Paid differs by ₹${paidDiff}`);
    if (receipts.length !== matchedDocs.length) diffs.push(`Receipt count differs (Delhi ${receipts.length} vs DB ${matchedDocs.length})`);
    
    if (diffs.length > 0) {
      console.log(`  >>> DIFFERENCE: ${diffs.join(' | ')}`);
    } else {
      console.log(`  >>> EXACT MATCH WITH DELHI SHEET`);
    }
    console.log('');
  });
}

checkDelhiVsDB().catch(console.error);
