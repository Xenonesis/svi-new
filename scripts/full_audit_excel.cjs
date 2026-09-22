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

async function fullAudit() {
  const [allots, scheds, docs, profs] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/allotments?select=*,profiles:user_id(*),properties:property_id(*)', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/payment_schedules?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/documents?document_type=eq.payment_receipt&select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/profiles?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json())
  ]);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = workbook.worksheets[0];

  console.log('=== COMPLETE EXCEL ROW DUMP ===');
  for (let r = 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const nonEmpties = [];
    row.eachCell({ includeEmpty: false }, (cell, c) => {
      nonEmpties.push(`C${c}: "${cleanStr(cell.value)}"`);
    });
    if (nonEmpties.length > 0) {
      console.log(`R${r}: ${nonEmpties.join(' | ')}`);
    }
  }
}

fullAudit().catch(console.error);
