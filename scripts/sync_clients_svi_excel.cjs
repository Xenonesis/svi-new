const ExcelJS = require('exceljs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseCellMath(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'object') {
    if (val.result !== undefined) return parseFloat(val.result) || 0;
    if (val.richText) val = val.richText.map(t => t.text).join('').trim();
    else val = JSON.stringify(val);
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
    if (tokens) return tokens.reduce((sum, t) => sum + parseFloat(t), 0);
  } catch (e) {}
  return parseFloat(str) || 0;
}

function parseSize(val) {
  if (typeof val === 'number') return val;
  const str = String(val || '').trim();
  if (str.includes('+')) {
    return str.split('+').reduce((s, x) => s + (parseFloat(x) || 0), 0);
  }
  return parseFloat(str) || 0;
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    if (val.getFullYear() === 2005) val.setFullYear(2025);
    return val.toISOString().split('T')[0];
  }
  let str = String(val).trim();
  const cleanDate = str.replace(/\s+/g, '');
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanDate)) {
    const [d, m, y] = cleanDate.split('-');
    return `${y === '2005' ? '2025' : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return str.replace(/^2005-/, '2025-');
}

const TICKET_ID_MAP = {
  5: 'PL2050',
  6: 'PL2066',
  7: 'PL2065',
  10: 'PL2081',
  13: 'PL2126',
  14: 'PL2221',
  17: 'PL2181',
};

async function syncClients() {
  console.log('--- 1. PARSING SVI PAYMENT DETAILS.XLSX ---');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = wb.getWorksheet(1);
  const clients = [];

  for (let r = 2; r <= 19; r++) {
    const row = ws.getRow(r);
    const rawName = String(row.getCell(7).value || '').trim();
    const cleanName = rawName.replace(/\s+A$/, '').replace(/\s+/g, ' ').trim();
    const plotNo = String(row.getCell(3).value || '').trim();
    let plId = String(row.getCell(4).value || '').trim();
    if (!plId && TICKET_ID_MAP[r]) {
      plId = TICKET_ID_MAP[r];
    }
    const rawSize = row.getCell(2).value;
    const sizeNum = parseSize(rawSize);
    const bsp = parseCellMath(row.getCell(5).value);
    const phone = String(row.getCell(9).value || '').trim();
    const advisor = String(row.getCell(12).value || '').trim();
    const drawDate = formatDate(row.getCell(11).value);

    const totalCost = Math.round(sizeNum * bsp);

    // Payments
    const payments = [];
    const d10 = formatDate(row.getCell(13).value);
    const p10 = parseCellMath(row.getCell(14).value);
    if (p10 > 0) payments.push({ type: '10% Payment', date: d10, amount: p10 });

    const d20 = formatDate(row.getCell(15).value);
    const p20 = parseCellMath(row.getCell(16).value);
    if (p20 > 0) payments.push({ type: '20% Payment', date: d20, amount: p20 });

    for (let c = 18; c <= 40; c += 2) {
      const emiDate = formatDate(row.getCell(c).value);
      const emiAmt = parseCellMath(row.getCell(c + 1).value);
      if (emiAmt > 0) {
        payments.push({ type: 'EMI ' + ((c - 16) / 2), date: emiDate, amount: emiAmt });
      }
    }

    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const balance = totalCost - totalPaid;

    clients.push({
      row: r,
      plId,
      name: cleanName,
      plotNo,
      size: sizeNum,
      rawSize,
      bsp,
      totalCost,
      totalPaid,
      balance,
      paymentsCount: payments.length,
      phone,
      advisor,
      drawDate,
      payments
    });
  }

  console.log(`Parsed ${clients.length} clients from Excel.`);

  // --- 2. UPDATE PORTAL SETTINGS (receipt_deal_values) ---
  console.log('\n--- 2. UPDATING PORTAL SETTINGS (receipt_deal_values) ---');
  const { data: settingData } = await supabase
    .from('portal_settings')
    .select('value')
    .eq('key', 'receipt_deal_values')
    .maybeSingle();

  const currentDealValues = (settingData && settingData.value) ? { ...settingData.value } : {};

  // Preserve existing deal values (e.g. SVI002134 for Abhilasha Varma)
  clients.forEach(c => {
    currentDealValues[c.plId] = c.totalCost;
    currentDealValues[c.plId.toLowerCase()] = c.totalCost;
    // Also add variant without prefix if standard
    const norm = c.plId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    currentDealValues[norm] = c.totalCost;
  });

  const { error: setErr } = await supabase
    .from('portal_settings')
    .upsert({ key: 'receipt_deal_values', value: currentDealValues }, { onConflict: 'key' });

  if (setErr) {
    console.error('Error updating portal_settings:', setErr);
  } else {
    console.log('Successfully updated receipt_deal_values in portal_settings.');
  }

  // --- 3. UPSERT ALLOTMENTS & PROFILES ---
  console.log('\n--- 3. UPSERTING ALLOTMENTS & PROFILES ---');
  const { data: existingAllotments } = await supabase.from('allotments').select('*');
  const { data: existingProfiles } = await supabase.from('profiles').select('*');
  const defaultPropertyId = 'e154bd4e-eecb-4dc0-ac44-b017cb61a6f0'; // Shyam Aangan Phase 1

  async function resolveProfile(c) {
    // Check by phone
    if (c.phone) {
      const byPhone = (existingProfiles || []).find(p => p.phone && p.phone.trim() === c.phone.trim());
      if (byPhone) return byPhone.id;
    }
    // Check by email
    const safeSlug = c.plId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `client.${safeSlug}@sviinfra.com`;
    const byEmail = (existingProfiles || []).find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
    if (byEmail) return byEmail.id;

    // Check by name
    const byName = (existingProfiles || []).find(p => p.full_name && p.full_name.toLowerCase().trim() === c.name.toLowerCase().trim());
    if (byName) return byName.id;

    // Create auth user & profile
    const tempPassword = `SviClient@${c.plId.replace(/[^a-zA-Z0-9]/g, '') || '2026'}`;
    let userId = null;
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: c.name,
        phone: c.phone || undefined,
        ticket_id: c.plId
      }
    });

    if (authErr) {
      const { data: usersList } = await supabase.auth.admin.listUsers();
      const existingUser = usersList?.users?.find(u => u.email === email);
      if (existingUser) userId = existingUser.id;
    } else if (authData?.user) {
      userId = authData.user.id;
    }

    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: c.name,
        email,
        phone: c.phone || null,
        role: 'client',
        is_active: true,
        notes: `Approved client for Ticket/Ref: ${c.plId}`
      }, { onConflict: 'id' });
      return userId;
    }
    return null;
  }

  for (const c of clients) {
    const normTicket = c.plId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // Find matching allotment
    const match = (existingAllotments || []).find(a => {
      const aTicket = String(a.metadata?.ticket_id || a.metadata?.ticketId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const aUnit = String(a.unit_no || '').trim().toLowerCase();
      const cPlot = String(c.plotNo || '').trim().toLowerCase();
      return (aTicket && (aTicket === normTicket || aTicket.includes(normTicket) || normTicket.includes(aTicket))) ||
             (aUnit && cPlot && aUnit === cPlot);
    });

    const profileId = match?.user_id || await resolveProfile(c);
    if (!profileId) {
      console.error(`Could not resolve profile ID for ${c.name} (${c.plId})`);
      continue;
    }

    const metadata = {
      ...(match?.metadata || {}),
      ticket_id: c.plId,
      ticketId: c.plId,
      total_cost: c.totalCost,
      rate_per_sq_yd: c.bsp,
      area: String(c.size),
      advisor_name: c.advisor,
      client_name: c.name,
      client_phone: c.phone || match?.metadata?.client_phone || '',
      draw_date: c.drawDate || match?.metadata?.draw_date || '',
      source: 'payment_receipt, allotment_letter',
      approved_at: match?.metadata?.approved_at || new Date().toISOString(),
      approved_by: match?.metadata?.approved_by || 'sviiinfrasolutions@gmail.com'
    };

    const allottedDate = (c.drawDate && c.drawDate.includes('-')) ? c.drawDate : new Date().toISOString().split('T')[0];

    if (match) {
      console.log(`Updating allotment ID ${match.id} for ${c.name} (${c.plId}, Plot ${c.plotNo})...`);
      const { error: updErr } = await supabase
        .from('allotments')
        .update({
          unit_no: c.plotNo,
          status: 'Allotted',
          metadata,
          notes: `Approved client allotment from Ticket ID ${c.plId}`
        })
        .eq('id', match.id);
      if (updErr) console.error(`Error updating allotment ${match.id}:`, updErr);
    } else {
      console.log(`Inserting new allotment for ${c.name} (${c.plId}, Plot ${c.plotNo})...`);
      const { error: insErr } = await supabase
        .from('allotments')
        .insert({
          user_id: profileId,
          property_id: defaultPropertyId,
          unit_no: c.plotNo,
          status: 'Allotted',
          allotted_date: allottedDate,
          notes: `Approved client allotment from Ticket ID ${c.plId}`,
          metadata
        });
      if (insErr) console.error(`Error inserting allotment:`, insErr);
    }
  }

  // --- 4. INSERT MISSING PAYMENT RECEIPTS ---
  console.log('\n--- 4. INSERTING MISSING PAYMENT RECEIPTS IN DOCUMENTS ---');
  const { data: existingDocs } = await supabase
    .from('documents')
    .select('id, form_data')
    .eq('document_type', 'payment_receipt');

  let insertedCount = 0;
  let updatedCount = 0;

  for (const c of clients) {
    const normTicket = c.plId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // Get all existing receipts for this client
    const clientDocs = (existingDocs || []).filter(d => {
      const fd = d.form_data || {};
      const dRef = String(fd.refId || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const dName = String(fd.name || '').toLowerCase();
      const cNameTokens = c.name.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      const nameMatch = cNameTokens.some(t => dName.includes(t));
      return (dRef && (dRef === normTicket || normTicket.includes(dRef) || dRef.includes(normTicket))) || nameMatch;
    });

    console.log(`\nClient: ${c.name} (${c.plId}) | Expected: ${c.payments.length} payments | DB existing: ${clientDocs.length} receipts`);

    // Track used DB docs to prevent multi-matching
    const usedDocIds = new Set();

    for (let i = 0; i < c.payments.length; i++) {
      const pay = c.payments[i];
      // Find matching receipt in clientDocs by amount within +/- 1
      const matchDoc = clientDocs.find(d => {
        if (usedDocIds.has(d.id)) return false;
        const amt = parseCellMath(d.form_data?.amount);
        return Math.abs(amt - pay.amount) <= 1;
      });

      if (matchDoc) {
        usedDocIds.add(matchDoc.id);
        // Ensure metadata / advisor / refId is clean
        const fd = matchDoc.form_data || {};
        const shouldUpdate = !fd.advisorName || fd.refId !== c.plId || !fd.installmentType;
        if (shouldUpdate) {
          const updatedFd = {
            ...fd,
            refId: c.plId,
            name: c.name,
            plotNo: c.plotNo,
            phone: c.phone || fd.phone,
            advisorName: c.advisor || fd.advisorName,
            installmentType: pay.type,
          };
          await supabase.from('documents').update({ form_data: updatedFd }).eq('id', matchDoc.id);
          updatedCount++;
        }
      } else {
        // Missing! Insert new receipt document
        const receiptNo = `SVI-${c.plId}-${i + 1}`;
        const newFd = {
          refId: c.plId,
          name: c.name,
          phone: c.phone || '',
          plotNo: c.plotNo,
          amount: String(pay.amount),
          date: pay.date || c.drawDate || new Date().toISOString().split('T')[0],
          paymentMode: 'Bank Transfer',
          installmentType: pay.type,
          receiptNo,
          advisorName: c.advisor,
          notes: `${pay.type} as per SVI Payment Details`,
          status: 'approved'
        };

        const { error: insDocErr } = await supabase.from('documents').insert({
          document_type: 'payment_receipt',
          status: 'completed',
          form_data: newFd,
          metadata: {
            ticket_id: c.plId,
            client_name: c.name,
            installment_type: pay.type
          }
        });

        if (insDocErr) {
          console.error(`Error inserting receipt for ${c.name} (${pay.type}, ₹${pay.amount}):`, insDocErr);
        } else {
          insertedCount++;
          console.log(`  + Inserted missing receipt: ${pay.type} | ₹${pay.amount} | Date: ${pay.date || 'N/A'}`);
        }
      }
    }
  }

  console.log(`\n=============================================================`);
  console.log(`SYNC COMPLETE: Inserted ${insertedCount} missing receipts, Updated ${updatedCount} existing.`);
  console.log(`=============================================================`);
}

syncClients().catch(console.error);
