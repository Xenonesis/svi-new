const { createClient } = require('@supabase/supabase-js');
const ExcelJS = require('exceljs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const sb = createClient(supabaseUrl, serviceKey);

function normalizeRefId(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function formatDate(val) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split('T')[0];
  }
  const s = String(val).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return s;
}

async function syncAllotmentModes() {
  console.log('Reading SVI Payment Details.xlsx...');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = wb.getWorksheet(1);

  const clientModes = [];

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const vals = row.values;
    const plotNo = String(vals[3] || '').trim();
    const plId = vals[4] ? String(vals[4]).trim() : '';
    const fullName = String(vals[7] || '').replace(/ A$/, '').trim();
    const col11 = vals[11]; // Draw Date col
    const col13 = vals[13]; // Date 10% col

    const rawDraw = col11 instanceof Date ? col11.toISOString().split('T')[0] : String(col11 || '').trim();
    const rawDate10 = col13 instanceof Date ? col13.toISOString().split('T')[0] : String(col13 || '').trim();

    let allotmentMode = 'Draw';
    let drawDate = null;
    let allotmentDate = null;

    if (rawDraw.toLowerCase().includes('direct')) {
      allotmentMode = 'Direct Sell';
      drawDate = 'Direct sell';
      allotmentDate = formatDate(col13) || rawDate10;
    } else {
      allotmentMode = 'Draw';
      drawDate = formatDate(col11) || rawDraw;
      allotmentDate = drawDate;
    }

    clientModes.push({
      rowNumber,
      plotNo,
      plId,
      normRef: normalizeRefId(plId),
      fullName,
      allotmentMode,
      drawDate,
      allotmentDate,
      bookingDate: formatDate(col13) || rawDate10,
    });
  });

  console.log(`Parsed ${clientModes.length} client allotment modes.`);

  const { data: allotments, error: allotErr } = await sb
    .from('allotments')
    .select('id, user_id, unit_no, metadata');
  if (allotErr) throw allotErr;

  let updatedCount = 0;

  for (const c of clientModes) {
    const matched = allotments.filter((a) => {
      const meta = a.metadata || {};
      const tid = normalizeRefId(meta.ticket_id || meta.ticketId || meta.refId || meta.ref_id || a.id);
      if (c.normRef && tid === c.normRef) return true;
      if (c.plotNo && (a.unit_no === c.plotNo || a.unit_no === c.plotNo.replace(/^0+/, ''))) return true;
      return false;
    });

    console.log(`\nClient: ${c.fullName} (Plot: ${c.plotNo}, Ref: ${c.plId}) -> Mode: ${c.allotmentMode} (${c.allotmentDate}) [Matches: ${matched.length}]`);

    for (const allot of matched) {
      const existingMeta = allot.metadata || {};
      const updatedMeta = {
        ...existingMeta,
        allotment_mode: c.allotmentMode,
        sale_type: c.allotmentMode,
        draw_date: c.drawDate,
        allotment_date: c.allotmentDate,
        booking_date: c.bookingDate,
        updated_at: new Date().toISOString(),
      };

      const { error: upErr } = await sb
        .from('allotments')
        .update({
          metadata: updatedMeta,
          ...(c.allotmentDate && !allot.allotted_date ? { allotted_date: c.allotmentDate } : {}),
        })
        .eq('id', allot.id);

      if (upErr) {
        console.error(`  Error updating allotment ${allot.id}:`, upErr.message);
      } else {
        updatedCount++;
        console.log(`  ✓ Updated allotment ${allot.id} (Plot ${allot.unit_no}) -> ${c.allotmentMode} • ${c.allotmentDate}`);
      }
    }
  }

  console.log(`\n================ SYNC SUMMARY ================`);
  console.log(`Total Allotments Updated: ${updatedCount}`);
}

syncAllotmentModes().catch(console.error);
