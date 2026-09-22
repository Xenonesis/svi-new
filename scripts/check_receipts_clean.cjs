const ExcelJS = require('exceljs');
const SUPABASE_URL = 'https://rfvhjgetfbalndgtkpaa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmhqZ2V0ZmJhbG5kZ3RrcGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk5Njc0MSwiZXhwIjoyMDk0NTcyNzQxfQ.kqsfbfNmq6oVspQ3LyEfdo97r0UixG1L2lrCPY-9zJY';

function cleanStr(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val.result !== undefined) return String(val.result).trim();
    if (val.richText) return val.richText.map(t => t.text).join('').trim();
    if (val.text !== undefined) return String(val.text).trim();
  }
  return String(val).trim();
}

function normPlot(p) {
  let s = String(p || '').trim().toLowerCase().replace(/[-\s+_]/g, '');
  if (/^0\d+$/.test(s)) s = s.replace(/^0+/, '');
  return s;
}

async function checkAllReceiptsClean() {
  const [allots, docs] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/allotments?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/documents?document_type=eq.payment_receipt&select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json())
  ]);
  const validDocs = docs.filter(d => !d.metadata?.is_trashed);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = workbook.worksheets[0];

  console.log('=== EXACT RECEIPT MATCHING VS EXCEL ===\n');

  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const plot = cleanStr(row.getCell(3).value);
    const name = cleanStr(row.getCell(7).value);
    const plId = cleanStr(row.getCell(4).value);
    if (!plot) continue;

    // Excel sum
    let excelSum = 0;
    const paymentCols = [14, 16, 19, 21, 23, 25, 27, 29, 31, 33];
    for (const c of paymentCols) {
      const cellVal = cleanStr(row.getCell(c).value);
      if (cellVal) {
        if (cellVal.includes('=')) {
          excelSum += parseFloat(cellVal.split('=')[1].replace(/[^\d.]/g, '')) || 0;
        } else if (cellVal.includes('+')) {
          const parts = cellVal.split('+');
          let s = 0;
          for (const p of parts) s += parseFloat(p.replace(/[^\d.]/g, '')) || 0;
          excelSum += s;
        } else {
          excelSum += parseFloat(cellVal.replace(/[^\d.]/g, '')) || 0;
        }
      }
    }

    const pNorm = normPlot(plot);

    // Match receipts belonging to this plot
    const matched = validDocs.filter(d => {
      const fd = d.form_data || {};
      const rPlot = normPlot(fd.plotNo);
      const rRef = normPlot(fd.refId);

      if (rPlot && rPlot === pNorm) return true;
      if (rPlot && (pNorm.includes('134') && rPlot.includes('134'))) return true;
      if (rPlot && (pNorm.includes('181') && rPlot.includes('181'))) return true;
      if (rPlot && (pNorm.includes('221') && rPlot.includes('221'))) return true;
      if (rPlot && (pNorm.includes('126') && pNorm.includes('127') && rPlot.includes('126') && rPlot.includes('127'))) return true;

      if (rRef && rRef === 'plot' + pNorm) return true;
      if (rRef && plId && rRef === normPlot(plId)) return true;
      return false;
    });

    const dbSum = matched.reduce((s, d) => s + (parseFloat(d.form_data?.amount) || 0), 0);
    const diff = dbSum - excelSum;

    console.log(`Plot ${plot} (${name}): Excel Sum = ₹${excelSum} | DB Receipts Sum = ₹${dbSum} | Diff = ₹${diff}`);
    if (Math.abs(diff) > 1) {
      console.log(`   ⚠️ Difference:`);
      matched.forEach(d => {
        console.log(`      Receipt ID: ${d.id}, amt: ${d.form_data?.amount}, date: ${d.form_data?.date}, no: ${d.form_data?.receiptNo}, ref: ${d.form_data?.refId}`);
      });
    }
  }
}

checkAllReceiptsClean().catch(console.error);
