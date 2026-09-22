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

async function detailedCompare() {
  const [allots, profs, docs, scheds] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/allotments?select=*,profiles:user_id(*),properties:property_id(*)', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/profiles?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/documents?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/payment_schedules?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json())
  ]);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = workbook.worksheets[0];

  const colHeaders = [];
  ws.getRow(1).eachCell({ includeEmpty: true }, (c, idx) => {
    colHeaders[idx] = cleanStr(c.value);
  });

  console.log('=== EXCEL COLUMN HEADERS ===');
  colHeaders.forEach((h, idx) => {
    if (h) console.log(`Col ${idx}: ${h}`);
  });

  console.log('\n=== COMPARING EACH CLIENT (EXCEL vs SUPABASE DB) ===\n');

  // Parse Excel clients
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const plot = cleanStr(row.getCell(3).value); // Col 3 is Plot number
    const plId = cleanStr(row.getCell(4).value); // Col 4 is PL ID / Ticket
    const name = cleanStr(row.getCell(7).value); // Col 7 is Full Name
    const email = cleanStr(row.getCell(8).value);
    const phone = cleanStr(row.getCell(9).value);
    const address = cleanStr(row.getCell(10).value);
    const advisor = cleanStr(row.getCell(12).value);

    if (!plot && !name) continue;

    // Find in Supabase allotments
    const norm = p => String(p || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedAllot = allots.find(a => {
      const u = norm(a.unit_no);
      const ep = norm(plot);
      return u === ep || (u && ep && (u.includes(ep) || ep.includes(u)));
    });

    console.log(`----------------------------------------------------------------------`);
    console.log(`EXCEL ROW ${r}: Plot "${plot}" | Name: "${name}" | Ticket: "${plId}"`);
    if (!matchedAllot) {
      console.log(`   ❌ NOT FOUND IN SUPABASE ALLOTMENTS!`);
    } else {
      const p = matchedAllot.profiles || {};
      const m = matchedAllot.metadata || {};
      const dbTicket = m.ticket_id || m.ticketId || '';
      console.log(`   ✓ SUPABASE ALLOTMENT (ID: ${matchedAllot.id}, Unit: ${matchedAllot.unit_no})`);
      console.log(`     DB Client: "${p.full_name || m.client_name}" | DB Ticket: "${dbTicket}"`);
      console.log(`     DB Email: "${p.email}" | DB Phone: "${p.phone}"`);
      console.log(`     DB Advisor: "${matchedAllot.advisor_name || m.advisor_name || m.advisorName}"`);

      // Check diffs
      const diffs = [];
      if (norm(plId) !== norm(dbTicket)) {
        diffs.push(`TICKET ID MISMATCH: Excel="${plId}" vs DB="${dbTicket}"`);
      }
      if (p.email && email && p.email.toLowerCase() !== email.toLowerCase()) {
        diffs.push(`EMAIL MISMATCH: Excel="${email}" vs DB="${p.email}"`);
      }
      if (p.phone && phone && norm(p.phone) !== norm(phone)) {
        diffs.push(`PHONE MISMATCH: Excel="${phone}" vs DB="${p.phone}"`);
      }
      const dbAdvisor = matchedAllot.advisor_name || m.advisor_name || m.advisorName || '';
      if (dbAdvisor && advisor && norm(dbAdvisor) !== norm(advisor)) {
        diffs.push(`ADVISOR MISMATCH: Excel="${advisor}" vs DB="${dbAdvisor}"`);
      }

      if (diffs.length > 0) {
        console.log(`     ⚠️ DISCREPANCIES:`);
        diffs.forEach(d => console.log(`        - ${d}`));
      } else {
        console.log(`     ✓ ALL CHECKED FIELDS MATCH!`);
      }
    }
  }

  // Check if there are any allotments in Supabase DB not in Excel!
  console.log(`\n======================================================================`);
  console.log(`CHECKING IF SUPABASE HAS ALLOTMENTS NOT IN EXCEL:`);
  allots.forEach(a => {
    const norm = p => String(p || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    let found = false;
    for (let r = 2; r <= ws.rowCount; r++) {
      const plot = cleanStr(ws.getRow(r).getCell(3).value);
      if (norm(a.unit_no) === norm(plot)) {
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`   ⚠️ SUPABASE ALLOTMENT Unit "${a.unit_no}" (Client: "${a.profiles?.full_name}") IS NOT IN EXCEL!`);
    }
  });
}

detailedCompare().catch(console.error);
