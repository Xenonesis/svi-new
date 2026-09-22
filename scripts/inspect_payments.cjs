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

async function inspectPayments() {
  const [allots, scheds, docs] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/allotments?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/payment_schedules?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/documents?document_type=eq.payment_receipt&select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json())
  ]);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = workbook.worksheets[0];

  const headers = [];
  ws.getRow(1).eachCell({ includeEmpty: true }, (c, idx) => {
    headers[idx] = cleanStr(c.value);
  });

  console.log('Payment Column Headers in Excel:');
  for (let c = 13; c <= headers.length; c++) {
    if (headers[c]) console.log(`  Col ${c}: "${headers[c]}"`);
  }

  // Check each row's payment installments
  console.log('\n=== EXCEL INSTALLMENT VALUES VS DB SCHEDULES ===\n');
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const plot = cleanStr(row.getCell(3).value);
    const name = cleanStr(row.getCell(7).value);
    if (!plot) continue;

    const norm = p => String(p || '').trim().toLowerCase().replace(/[-\s+_]/g, '');
    const allot = allots.find(a => {
      const u = norm(a.unit_no);
      const ep = norm(plot);
      return u === ep || (ep.includes('134') && u.includes('134')) || (ep.includes('181') && u.includes('181')) || (ep.includes('221') && u.includes('221')) || (ep.includes('126') && ep.includes('127') && u.includes('126') && u.includes('127'));
    });

    const allotScheds = allot ? scheds.filter(s => s.allotment_id === allot.id) : [];

    console.log(`[Row ${r}] Plot: ${plot} (${name}) -> DB Allotment: ${allot ? allot.unit_no : 'NONE'}`);
    
    // Print Excel payment cells
    const excelPayments = [];
    for (let c = 13; c <= 35; c++) {
      const val = cleanStr(row.getCell(c).value);
      if (val) {
        excelPayments.push(`Col ${c} (${headers[c]}): ${val}`);
      }
    }
    console.log('   Excel Payments:', excelPayments.join(' | '));
    console.log('   DB Schedules (Count: ' + allotScheds.length + '):', allotScheds.map(s => `amt:${s.amount}, due:${s.due_date}, status:${s.status}`).join(' | '));
    console.log('');
  }
}

inspectPayments().catch(console.error);
