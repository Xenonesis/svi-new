const ExcelJS = require('exceljs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function cleanStr(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val.richText) return val.richText.map(t => t.text).join('').trim();
    if (val.result !== undefined) return String(val.result).trim();
    return JSON.stringify(val);
  }
  return String(val).trim();
}

function parseCellMath(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'object') {
    if (val.result !== undefined) return parseFloat(val.result) || 0;
    val = cleanStr(val);
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
    if (tokens) {
      return tokens.reduce((sum, t) => sum + parseFloat(t), 0);
    }
  } catch (e) {}
  return parseFloat(str) || 0;
}

function parseNum(val) {
  return parseCellMath(val);
}

async function compareAll() {
  // 1. Delhi Office Statement
  const wb1 = new ExcelJS.Workbook();
  await wb1.xlsx.readFile('DELHI OFFICE STATEMENT (1).xlsx');
  const delhiClients = [];

  wb1.worksheets.forEach((ws, idx) => {
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
    let sumReceipts = 0;
    for (let r = 2; r <= ws.rowCount; r++) {
      const dateCell = cleanStr(ws.getRow(r).getCell(6).value);
      const amtCell = parseNum(ws.getRow(r).getCell(7).value);
      if (dateCell.toLowerCase().includes('total')) continue;
      if (dateCell && amtCell > 0) {
        receipts.push({ row: r, date: dateCell, amount: amtCell });
        sumReceipts += amtCell;
      }
    }

    delhiClients.push({
      sheetName: ws.name,
      name: clientName,
      plotNo,
      plotSize,
      rate,
      totalCost: plotAmt,
      totalPaid: totalRecAmt || sumReceipts,
      balance,
      advisor,
      receiptsCount: receipts.length,
      receiptsSum: sumReceipts,
      receipts
    });
  });

  // 2. SVI Payment Details
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.readFile('SVI Payment Details.xlsx');
  const ws2 = wb2.getWorksheet(1);
  const sviDetails = [];

  for (let r = 2; r <= ws2.rowCount; r++) {
    const row = ws2.getRow(r);
    const fullName = cleanStr(row.getCell(7).value);
    const plotNo = cleanStr(row.getCell(3).value);
    const plId = cleanStr(row.getCell(4).value);
    if (!fullName && !plotNo && !plId) continue;

    const plotSize = cleanStr(row.getCell(2).value);
    const bsp = parseNum(row.getCell(5).value);
    const phone = cleanStr(row.getCell(9).value);
    const advisor = cleanStr(row.getCell(12).value);
    const drawDate = cleanStr(row.getCell(11).value);

    const payments = [];
    if (parseNum(row.getCell(14).value) > 0) payments.push({ type: '10%', date: cleanStr(row.getCell(13).value), amount: parseNum(row.getCell(14).value) });
    if (parseNum(row.getCell(16).value) > 0) payments.push({ type: '20%', date: cleanStr(row.getCell(15).value), amount: parseNum(row.getCell(16).value) });
    for (let c = 18; c <= 40; c += 2) {
      const emiDate = cleanStr(row.getCell(c).value);
      const emiAmt = parseNum(row.getCell(c + 1).value);
      if (emiAmt > 0) {
        payments.push({ type: 'EMI', date: emiDate, amount: emiAmt });
      }
    }
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

    sviDetails.push({
      rowNum: r,
      fullName,
      plotNo,
      plId,
      plotSize,
      bsp,
      phone,
      advisor,
      drawDate,
      paymentsCount: payments.length,
      totalPaid,
      payments
    });
  }

  // 3. Supabase DB
  const { data: docs } = await supabase.from('documents').select('id, form_data, created_at').eq('document_type', 'payment_receipt');
  const { data: allotments } = await supabase.from('allotments').select('*');
  const { data: registrations } = await supabase.from('registrations').select('*');
  const { data: setting } = await supabase.from('portal_settings').select('value').eq('key', 'receipt_deal_values').maybeSingle();
  const dealValues = setting?.value || {};

  // Group DB receipts by refId / name
  const dbReceiptsByRef = {};
  docs.forEach(d => {
    const fd = d.form_data || {};
    const ref = cleanStr(fd.refId).toUpperCase().replace(/\s+/g, '').replace(/-/g, '');
    const name = cleanStr(fd.name).toUpperCase().trim();
    const plot = cleanStr(fd.plotNo).trim();
    const amt = parseNum(fd.amount);

    const key = ref || name || 'UNKNOWN';
    if (!dbReceiptsByRef[key]) {
      dbReceiptsByRef[key] = {
        refId: fd.refId,
        rawKeys: [key],
        name: fd.name,
        plotNo: fd.plotNo,
        count: 0,
        totalPaid: 0,
        receipts: []
      };
    }
    dbReceiptsByRef[key].count++;
    dbReceiptsByRef[key].totalPaid += amt;
    dbReceiptsByRef[key].receipts.push({ date: fd.date, amount: amt, no: fd.receiptNo, id: d.id });
  });

  console.log('--- DELHI CLIENTS COUNT:', delhiClients.length);
  console.log('--- SVI DETAILS ROWS COUNT:', sviDetails.length);
  console.log('--- DB RECEIPTS KEYS COUNT:', Object.keys(dbReceiptsByRef).length, 'TOTAL RECEIPTS:', docs.length);
  console.log('--- DB ALLOTMENTS COUNT:', allotments.length);

  console.log('\n=============================================================');
  console.log('1. DETAILED ROW-BY-ROW COMPARISON (DELHI vs SVI DETAILS vs DB)');
  console.log('=============================================================');

  delhiClients.forEach((d, i) => {
    // Exact mapping to SVI Details
    const sviMatch = sviDetails.find(s => {
      // Direct name tokens
      const sTokens = s.fullName.toLowerCase().split(/[^a-z]/).filter(t => t.length > 2 && t !== 'sharma' && t !== 'kumar');
      const dTokens = d.name.toLowerCase().split(/[^a-z]/).filter(t => t.length > 2 && t !== 'sharma' && t !== 'kumar');
      const tokenMatch = sTokens.some(st => dTokens.includes(st));

      // Plot numbers match
      const sPlotNums = (s.plotNo.match(/\d+/g) || []).join(',');
      const dPlotNums = (d.sheetName.match(/\d+/g) || []).join(',');
      const plotMatch = sPlotNums && dPlotNums && (sPlotNums === dPlotNums || sPlotNums.includes(dPlotNums) || dPlotNums.includes(sPlotNums));

      if (tokenMatch && plotMatch) return true;
      if (tokenMatch) return true;
      if (sPlotNums && dPlotNums && sPlotNums === dPlotNums) return true;
      return false;
    });

    // Match in DB
    const dbMatches = Object.values(dbReceiptsByRef).filter(db => {
      const dbNorm = (db.name || '').toLowerCase().replace(/[^a-z]/g, '');
      const dNorm = d.name.toLowerCase().replace(/[^a-z]/g, '');
      
      const dbRef = (db.refId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const sviPl = (sviMatch?.plId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const matchPl = sviPl && dbRef && (dbRef === sviPl || dbRef.includes(sviPl) || sviPl.includes(dbRef));
      
      // Token match
      const dbTokens = (db.name || '').toLowerCase().split(/[^a-z]/).filter(t => t.length > 2 && t !== 'sharma' && t !== 'kumar');
      const dTokens = d.name.toLowerCase().split(/[^a-z]/).filter(t => t.length > 2 && t !== 'sharma' && t !== 'kumar');
      const nameMatch = dbTokens.some(t => dTokens.includes(t));

      return matchPl || nameMatch;
    });

    const dbTotalPaid = dbMatches.reduce((s, m) => s + m.totalPaid, 0);
    const dbReceiptCount = dbMatches.reduce((s, m) => s + m.count, 0);
    const dbRefs = dbMatches.map(m => m.refId).join(', ') || 'NONE';

    console.log(`\n[${i+1}] DELHI SHEET: "${d.sheetName}" - Client: "${d.name}" (Plot: ${d.plotNo}, SqYd: ${d.plotSize}, Rate: Rs.${d.rate})`);
    console.log(`    - Delhi Statement: TotalCost=Rs.${d.totalCost}, Paid=Rs.${d.totalPaid} (${d.receiptsCount} receipts), Bal=Rs.${d.balance}, Advisor="${d.advisor}"`);
    if (sviMatch) {
      console.log(`    - SVI Pay Details: PL_ID=${sviMatch.plId || 'N/A'}, Name="${sviMatch.fullName}", Plot=${sviMatch.plotNo}, Size=${sviMatch.plotSize}, BSP=Rs.${sviMatch.bsp}, Paid=Rs.${sviMatch.totalPaid} (${sviMatch.paymentsCount} payments), Phone=${sviMatch.phone || 'N/A'}, Advisor="${sviMatch.advisor}"`);
    } else {
      console.log(`    - SVI Pay Details: *** NOT FOUND IN SVI PAYMENT DETAILS ***`);
    }
    console.log(`    - Supabase DB:     Ref=${dbRefs}, Paid=Rs.${dbTotalPaid} (${dbReceiptCount} receipts)`);

    // Discrepancy flags
    const diffs = [];
    if (sviMatch && Math.abs(d.totalPaid - sviMatch.totalPaid) > 1) {
      diffs.push(`PAID MISMATCH (Delhi Rs.${d.totalPaid} vs SVI Details Rs.${sviMatch.totalPaid})`);
    }
    if (Math.abs(d.totalPaid - dbTotalPaid) > 1) {
      diffs.push(`PAID MISMATCH WITH DB (Delhi Rs.${d.totalPaid} vs DB Rs.${dbTotalPaid}, Diff: Rs.${d.totalPaid - dbTotalPaid})`);
    }
    if (d.receiptsCount !== dbReceiptCount) {
      diffs.push(`RECEIPT COUNT MISMATCH (Delhi ${d.receiptsCount} recs vs DB ${dbReceiptCount} recs)`);
    }
    if (sviMatch && d.rate !== sviMatch.bsp) {
      diffs.push(`RATE/BSP MISMATCH (Delhi Rs.${d.rate} vs SVI Rs.${sviMatch.bsp})`);
    }
    if (sviMatch && d.advisor && sviMatch.advisor && !d.advisor.toLowerCase().includes(sviMatch.advisor.toLowerCase()) && !sviMatch.advisor.toLowerCase().includes(d.advisor.toLowerCase())) {
      diffs.push(`ADVISOR MISMATCH (Delhi "${d.advisor}" vs SVI "${sviMatch.advisor}")`);
    }
    if (diffs.length > 0) {
      diffs.forEach(df => console.log(`      * ${df}`));
    } else {
      console.log(`      * PERFECT MATCH`);
    }
  });

  console.log('\n=============================================================');
  console.log('2. CLIENTS IN SVI PAYMENT DETAILS BUT NOT IN DELHI STATEMENT:');
  console.log('=============================================================');
  sviDetails.forEach(s => {
    const sNorm = s.fullName.toLowerCase().replace(/[^a-z]/g, '');
    const sPlot = s.plotNo.replace(/[^0-9]/g, '');
    const inDelhi = delhiClients.some(d => {
      const dNorm = d.name.toLowerCase().replace(/[^a-z]/g, '');
      const dPlot = d.sheetName.replace(/[^0-9]/g, '');
      return (sPlot && dPlot && sPlot === dPlot) || (sNorm.length > 3 && (dNorm.includes(sNorm) || sNorm.includes(dNorm)));
    });
    if (!inDelhi) {
      console.log(`- Row ${s.rowNum}: Name="${s.fullName}", Plot=${s.plotNo}, PL_ID=${s.plId}, Paid=Rs.${s.totalPaid}, Advisor="${s.advisor}"`);
    }
  });

  console.log('\n=============================================================');
  console.log('3. CLIENTS / RECEIPTS IN DB BUT NOT IN DELHI STATEMENT:');
  console.log('=============================================================');
  Object.values(dbReceiptsByRef).forEach(db => {
    const dbNorm = (db.name || '').toLowerCase().replace(/[^a-z]/g, '');
    const inDelhi = delhiClients.some(d => {
      const dNorm = d.name.toLowerCase().replace(/[^a-z]/g, '');
      return (dbNorm.length > 3 && (dNorm.includes(dbNorm) || dbNorm.includes(dNorm)));
    });
    if (!inDelhi) {
      console.log(`- DB Ref=${db.refId}, Name="${db.name}", Plot=${db.plotNo}, Paid=Rs.${db.totalPaid}, Count=${db.count}`);
    }
  });
}

compareAll().catch(console.error);
