const ExcelJS = require('exceljs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

function parseNum(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'object') {
    if (val.result !== undefined) return parseFloat(val.result) || 0;
    return 0;
  }
  const clean = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
  return parseFloat(clean) || 0;
}

async function runAnalysis() {
  console.log('--- 1. PARSING DELHI OFFICE STATEMENT (1).xlsx ---');
  const wb1 = new ExcelJS.Workbook();
  await wb1.xlsx.readFile('DELHI OFFICE STATEMENT (1).xlsx');

  const delhiSheets = [];

  wb1.worksheets.forEach(ws => {
    const r1 = ws.getRow(1);
    const r2 = ws.getRow(2);
    const r3 = ws.getRow(3);
    const r4 = ws.getRow(4);

    const clientName = cleanStr(r2.getCell(1).value);
    const plotNo = cleanStr(r2.getCell(2).value);
    const plotSize = parseNum(r2.getCell(3).value);
    const rate = parseNum(r2.getCell(4).value);
    const plotAmt = parseNum(r2.getCell(5).value);
    const totalRecAmt = parseNum(r3.getCell(5).value);
    const balance = parseNum(r4.getCell(5).value);

    // Read advisor
    let advisor = '';
    for (let r = 1; r <= 15; r++) {
      const v = cleanStr(ws.getRow(r).getCell(8).value);
      if (v && v.toLowerCase() !== 'advisor' && v.toLowerCase() !== 'agent') {
        advisor = v.replace(/\n/g, ' ').trim();
        break;
      }
    }

    // Read receipts
    const receipts = [];
    let totalAmtRecFromRow = 0;
    for (let r = 2; r <= ws.rowCount; r++) {
      const dateCell = cleanStr(ws.getRow(r).getCell(6).value);
      const amtCell = parseNum(ws.getRow(r).getCell(7).value);
      if (dateCell.toLowerCase().includes('total') || String(ws.getRow(r).getCell(6).value || '').includes('TOTAL')) {
        totalAmtRecFromRow = amtCell;
        continue;
      }
      if (dateCell && amtCell > 0) {
        receipts.push({ row: r, date: dateCell, amount: amtCell });
      }
    }

    delhiSheets.push({
      sheetName: ws.name,
      clientName,
      plotNo,
      plotSize,
      rate,
      plotAmt,
      totalRecAmt: totalRecAmt || totalAmtRecFromRow,
      balance,
      advisor,
      receiptsCount: receipts.length,
      receiptsSum: receipts.reduce((s, x) => s + x.amount, 0),
      receipts
    });
  });

  console.log(`Parsed ${delhiSheets.length} sheets in DELHI OFFICE STATEMENT:`);
  delhiSheets.forEach(s => {
    console.log(`- Sheet: ${s.sheetName} | Client: "${s.clientName}" | Plot: ${s.plotNo} | Size: ${s.plotSize} | Rate: ${s.rate} | TotalCost: ${s.plotAmt} | TotalPaid: ${s.totalRecAmt} | Balance: ${s.balance} | Advisor: "${s.advisor}" | Receipts: ${s.receiptsCount} (Sum: ${s.receiptsSum})`);
  });

  console.log('\n--- 2. PARSING SVI Payment Details.xlsx ---');
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.readFile('SVI Payment Details.xlsx');
  const ws2 = wb2.getWorksheet('Sheet1');
  const paymentDetailsRows = [];

  for (let r = 2; r <= ws2.rowCount; r++) {
    const row = ws2.getRow(r);
    const projectName = cleanStr(row.getCell(1).value);
    const plotSize = cleanStr(row.getCell(2).value);
    const plotNo = cleanStr(row.getCell(3).value);
    const plId = cleanStr(row.getCell(4).value);
    const bsp = parseNum(row.getCell(5).value);
    const fullName = cleanStr(row.getCell(7).value);
    const phone = cleanStr(row.getCell(9).value);
    const advisor = cleanStr(row.getCell(12).value);

    // Sum all payments in the row (Col 14, 16, 19, 21, 23, 25, 27, 29, 31, etc.)
    const payments = [];
    // Date 10% (13) / Pay 10% (14)
    if (parseNum(row.getCell(14).value) > 0) payments.push({ type: '10%', date: cleanStr(row.getCell(13).value), amount: parseNum(row.getCell(14).value) });
    // Date 20% (15) / Pay 20% (16)
    if (parseNum(row.getCell(16).value) > 0) payments.push({ type: '20%', date: cleanStr(row.getCell(15).value), amount: parseNum(row.getCell(16).value) });
    // EMIs
    for (let c = 18; c <= 40; c += 2) {
      const emiDate = cleanStr(row.getCell(c).value);
      const emiAmt = parseNum(row.getCell(c + 1).value);
      if (emiAmt > 0) {
        payments.push({ type: 'EMI', date: emiDate, amount: emiAmt });
      }
    }

    if (fullName || plId || plotNo) {
      paymentDetailsRows.push({
        rowNum: r,
        projectName,
        plotSize,
        plotNo,
        plId,
        bsp,
        fullName,
        phone,
        advisor,
        paymentsCount: payments.length,
        totalPaid: payments.reduce((s, p) => s + p.amount, 0),
        payments
      });
    }
  }

  console.log(`Parsed ${paymentDetailsRows.length} client rows from SVI Payment Details.xlsx.`);
  paymentDetailsRows.slice(0, 10).forEach(p => {
    console.log(`- Row ${p.rowNum} | PL: ${p.plId} | Client: "${p.fullName}" | Plot: ${p.plotNo} | Size: ${p.plotSize} | BSP: ${p.bsp} | TotalPaid: ${p.totalPaid} | Advisor: "${p.advisor}"`);
  });

  console.log('\n--- 3. FETCHING SUPABASE DB DATA ---');
  // Documents / Payment Receipts
  const { data: receiptsDocs, error: docErr } = await supabase
    .from('documents')
    .select('id, form_data, created_at, status, metadata')
    .eq('document_type', 'payment_receipt');
  
  console.log(`DB payment_receipt docs: ${receiptsDocs?.length || 0}`);

  // Allotments
  const { data: allotments, error: allotErr } = await supabase
    .from('allotments')
    .select('*');
  console.log(`DB allotments: ${allotments?.length || 0}`);

  // Registrations
  const { data: registrations, error: regErr } = await supabase
    .from('registrations')
    .select('id, submission_id, full_name, phone_number, plot_number, plot_size, advisor_name, total_amount, scheme_amount');
  console.log(`DB registrations: ${registrations?.length || 0}`);

  // Portal Settings receipt_deal_values
  const { data: setting } = await supabase
    .from('portal_settings')
    .select('value')
    .eq('key', 'receipt_deal_values')
    .maybeSingle();
  console.log('receipt_deal_values in portal_settings:', setting?.value);

  // Cross-compare Delhi Sheets with DB
  console.log('\n--- 4. CROSS-COMPARING DELHI SHEETS vs DB vs SVI PAYMENT DETAILS ---');
  const report = [];

  for (const ds of delhiSheets) {
    // Find matching receipts in DB by client name or plotNo
    const matchedDocs = (receiptsDocs || []).filter(d => {
      const fd = d.form_data || {};
      const matchName = cleanStr(fd.name).toLowerCase() === ds.clientName.toLowerCase();
      const matchPlot = cleanStr(fd.plotNo) === cleanStr(ds.plotNo);
      return matchName || (matchPlot && ds.plotNo !== '');
    });

    // Find allotment
    const matchedAllotment = (allotments || []).find(a => {
      const meta = a.metadata || {};
      const tId = cleanStr(meta.ticket_id || meta.ticketId || meta.refId);
      const matchUnit = cleanStr(a.unit_no) === cleanStr(ds.plotNo);
      return matchUnit;
    });

    // Find in SVI Payment Details
    const matchedSviPayment = paymentDetailsRows.find(sp => {
      const matchPl = ds.sheetName.includes(sp.plotNo) || cleanStr(sp.plotNo) === cleanStr(ds.plotNo);
      const matchName = sp.fullName.toLowerCase().includes(ds.clientName.toLowerCase()) || ds.clientName.toLowerCase().includes(sp.fullName.toLowerCase());
      return matchPl || matchName;
    });

    const dbTotalPaid = matchedDocs.reduce((s, d) => s + parseNum(d.form_data?.amount), 0);
    const dbRefId = matchedDocs[0]?.form_data?.refId || matchedAllotment?.metadata?.ticket_id || 'NOT_IN_DB';
    const dbTotalCost = matchedAllotment?.metadata?.total_cost || (setting?.value && setting.value[dbRefId]) || 0;

    report.push({
      sheet: ds.sheetName,
      client: ds.clientName,
      plotNo: ds.plotNo,
      delhiTotalAmt: ds.plotAmt,
      delhiTotalPaid: ds.totalRecAmt,
      delhiBalance: ds.balance,
      delhiAdvisor: ds.advisor,
      delhiReceiptsCount: ds.receiptsCount,
      sviPayDetailFound: !!matchedSviPayment,
      sviPlotNo: matchedSviPayment?.plotNo,
      sviPL: matchedSviPayment?.plId,
      sviClient: matchedSviPayment?.fullName,
      sviTotalPaid: matchedSviPayment?.totalPaid,
      sviAdvisor: matchedSviPayment?.advisor,
      dbRefId,
      dbReceiptsCount: matchedDocs.length,
      dbTotalPaid,
      dbTotalCost,
    });
  }

  console.log('\n--- SUMMARY REPORT TABLE ---');
  console.table(report);
}

runAnalysis().catch(console.error);
