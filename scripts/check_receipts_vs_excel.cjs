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

async function checkAllReceiptsVsExcel() {
  const docsRes = await fetch(SUPABASE_URL + '/rest/v1/documents?document_type=eq.payment_receipt&select=*', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
  });
  const allDocs = await docsRes.json();
  const validDocs = allDocs.filter(d => !d.metadata?.is_trashed);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = workbook.worksheets[0];

  // Map each plot's total in excel vs DB receipts sum
  const excelPlots = {};
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const plot = cleanStr(row.getCell(3).value);
    const name = cleanStr(row.getCell(7).value);
    if (!plot) continue;

    // sum all payment cells in row
    let rowSum = 0;
    const paymentCols = [14, 16, 19, 21, 23, 25, 27, 29, 31, 33];
    for (const c of paymentCols) {
      const cellVal = cleanStr(row.getCell(c).value);
      if (cellVal) {
        // if it has additions like "50000+50000+1000+2100=103100"
        if (cellVal.includes('=')) {
          rowSum += parseFloat(cellVal.split('=')[1].replace(/[^\d.]/g, '')) || 0;
        } else if (cellVal.includes('+')) {
          const parts = cellVal.split('+');
          let s = 0;
          for (const p of parts) s += parseFloat(p.replace(/[^\d.]/g, '')) || 0;
          rowSum += s;
        } else {
          rowSum += parseFloat(cellVal.replace(/[^\d.]/g, '')) || 0;
        }
      }
    }
    excelPlots[plot] = { row: r, name, excelSum: rowSum };
  }

  console.log('=== DB RECEIPTS SUM VS EXCEL SUM FOR EACH PLOT ===\n');
  for (const [plot, data] of Object.entries(excelPlots)) {
    const norm = p => String(p || '').trim().toLowerCase().replace(/[-\s+_]/g, '');
    const pNorm = norm(plot);
    const matchedDocs = validDocs.filter(d => {
      const fd = d.form_data || {};
      const rPlot = norm(fd.plotNo);
      const rRef = norm(fd.refId);
      if (rPlot === pNorm || (pNorm.length > 1 && (rPlot.includes(pNorm) || pNorm.includes(rPlot)))) return true;
      if (rRef === 'plot' + pNorm || rRef === pNorm) return true;
      return false;
    });

    const dbSum = matchedDocs.reduce((s, d) => s + (parseFloat(d.form_data?.amount) || 0), 0);
    const diff = dbSum - data.excelSum;
    console.log(`Plot ${plot} (${data.name}):`);
    console.log(`   Excel Sum: ₹${data.excelSum} | DB Receipts (${matchedDocs.length}): ₹${dbSum} | Diff: ₹${diff}`);
    if (Math.abs(diff) > 1) {
      console.log(`   ⚠️ Difference detected!`);
      matchedDocs.forEach(d => {
        console.log(`      Receipt: amt=${d.form_data?.amount}, date=${d.form_data?.date}, no=${d.form_data?.receiptNo}, ref=${d.form_data?.refId}`);
      });
    }
  }
}

checkAllReceiptsVsExcel().catch(console.error);
