const { createClient } = require('@supabase/supabase-js');
const ExcelJS = require('exceljs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE credentials in .env.local');
  process.exit(1);
}

const sb = createClient(supabaseUrl, serviceKey);

function normalizeRefId(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function sync() {
  console.log('Reading SVI Payment Details.xlsx...');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = wb.getWorksheet(1);

  const excelClients = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const vals = row.values;
    const plotNo = vals[3];
    const plId = vals[4];
    const fullName = vals[7];
    let email = vals[8];
    if (typeof email === 'object' && email !== null) {
      email = email.text || email.result || '';
    }
    const phone = vals[9];
    const address = vals[10];

    // Determine normalized ref key
    let ref = plId ? String(plId).trim() : '';
    const normRef = normalizeRefId(ref);
    const cleanPhone = phone && phone !== 0 ? String(phone).replace(/[^\d+]/g, '').trim() : null;
    const cleanEmail = email && String(email).trim() !== '0' && String(email).trim() !== 'NA' && String(email).trim() !== 'N/A' ? String(email).trim() : null;
    const cleanAddress = address && address !== 0 && String(address).trim() !== '0' && String(address).trim() !== 'NA' && String(address).trim() !== 'N/A'
      ? String(address).replace(/\r?\n/g, ', ').replace(/\s+/g, ' ').trim()
      : null;

    excelClients.push({
      rowNumber,
      plotNo: String(plotNo || '').trim(),
      ref,
      normRef,
      fullName: String(fullName || '').replace(/ A$/, '').trim(),
      email: cleanEmail,
      phone: cleanPhone,
      address: cleanAddress,
    });
  });

  console.log(`Parsed ${excelClients.length} clients from Excel.`);

  // Fetch all allotments and profiles from Supabase
  const { data: allotments, error: allotErr } = await sb
    .from('allotments')
    .select('id, user_id, unit_no, metadata');
  if (allotErr) throw allotErr;

  const { data: profiles, error: profErr } = await sb
    .from('profiles')
    .select('id, full_name, email, real_email, phone, notes');
  if (profErr) throw profErr;

  const profMap = new Map(profiles.map((p) => [p.id, p]));

  let updatedAllotments = 0;
  let updatedProfiles = 0;

  for (const client of excelClients) {
    // Find matching allotment in DB
    const matching = allotments.filter((a) => {
      const meta = a.metadata || {};
      const tid = normalizeRefId(meta.ticket_id || meta.ticketId || meta.refId || meta.ref_id || a.id);
      if (client.normRef && tid === client.normRef) return true;
      if (client.plotNo && (a.unit_no === client.plotNo || a.unit_no === client.plotNo.replace(/^0+/, ''))) return true;
      return false;
    });

    console.log(`\nClient: ${client.fullName} (Ref: ${client.ref || client.plotNo}) -> Matches found: ${matching.length}`);

    for (const allot of matching) {
      const existingMeta = allot.metadata || {};
      const updatedMeta = {
        ...existingMeta,
        ...(client.phone ? { client_phone: client.phone } : {}),
        ...(client.email ? { client_email: client.email } : {}),
        ...(client.address ? { client_address: client.address, address: client.address } : {}),
        updated_at: new Date().toISOString(),
      };

      const { error: upErr } = await sb
        .from('allotments')
        .update({ metadata: updatedMeta })
        .eq('id', allot.id);

      if (upErr) {
        console.error(`  Error updating allotment ${allot.id}:`, upErr.message);
      } else {
        updatedAllotments++;
        console.log(`  ✓ Updated allotment ${allot.id} (Plot: ${allot.unit_no})`);
      }

      // Update linked profile
      if (allot.user_id) {
        const prof = profMap.get(allot.user_id);
        if (prof) {
          const profUpdates = {};
          if (client.phone && prof.phone !== client.phone) {
            profUpdates.phone = client.phone;
          }
          if (client.email && prof.real_email !== client.email) {
            profUpdates.real_email = client.email;
          }
          if (client.address) {
            const currentNotes = prof.notes || '';
            if (!currentNotes.toLowerCase().includes('address:')) {
              profUpdates.notes = currentNotes ? `${currentNotes} | Address: ${client.address}` : `Address: ${client.address}`;
            }
          }

          if (Object.keys(profUpdates).length > 0) {
            const { error: pErr } = await sb
              .from('profiles')
              .update(profUpdates)
              .eq('id', prof.id);

            if (pErr) {
              console.error(`  Error updating profile ${prof.id}:`, pErr.message);
            } else {
              updatedProfiles++;
              console.log(`  ✓ Updated profile ${prof.id} (${prof.full_name}) with:`, Object.keys(profUpdates));
            }
          }
        }
      }
    }
  }

  console.log(`\n================ SYNC SUMMARY ================`);
  console.log(`Total Allotments Updated: ${updatedAllotments}`);
  console.log(`Total Profiles Updated: ${updatedProfiles}`);
  console.log(`Sync complete!`);
}

sync().catch(console.error);
