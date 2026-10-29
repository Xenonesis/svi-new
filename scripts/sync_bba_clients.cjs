const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => {
  const match = envContent.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CLIENT_BBA_MAPPINGS = [
  {
    file: 'Aditya Sharma Bba.pdf',
    storageKey: 'aditya-sharma-bba.pdf',
    clientName: 'Aditya Sharma',
    unitNo: 'A-181 and 182',
    ticketId: 'SVI2029',
    allotmentId: 'c1b325c1-65c9-456e-b63f-eb76fefb85d8',
    userId: 'dde8f4b9-220e-41e8-a6fe-542095e37c04',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Akshat Pardeshi Jha Bba2 (1).pdf',
    storageKey: 'akshat-pardeshi-bba.pdf',
    clientName: 'AKSHAT PARDESHI',
    unitNo: '32',
    ticketId: 'PL2076',
    allotmentId: '8f184209-65f4-49bc-8a7c-e2708222aee4',
    userId: '7f57c76a-165a-44ce-8228-23df532819b2',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Ashok Kumar Bba.pdf',
    storageKey: 'ashok-kumar-bba.pdf',
    clientName: 'Ashok Kumar',
    unitNo: '65',
    ticketId: 'PL2082',
    allotmentId: 'a8499a96-8b76-425e-93d1-63b57bbb7ecc',
    userId: '34fb89b5-3a09-43f1-9525-f1ebf4deb9d3',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Gaurav kohli Bba.pdf',
    storageKey: 'gaurav-kohli-bba.pdf',
    clientName: 'GAURAV KOHLI',
    unitNo: '30',
    ticketId: 'SVI002025',
    allotmentId: '3c32b94a-8e46-4ec2-a395-134eb66c62b4',
    userId: 'd613e509-1653-402c-b28e-2806d5da1a4a',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Kundan Kumar Jha Bba.pdf',
    storageKey: 'kundan-kumar-jha-bba.pdf',
    clientName: 'Kundan Kumar Jha',
    unitNo: '31',
    ticketId: 'PL2075',
    allotmentId: '5ae37186-2236-48dc-909d-ea95a68c5035',
    userId: '5823dbd1-5623-464e-8c67-fc9ee410c9df',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Lalita Jindal Bba3.pdf',
    storageKey: 'lalita-jindal-bba.pdf',
    clientName: 'LALITA JINDAL',
    unitNo: '33',
    ticketId: 'PL2079',
    allotmentId: 'dbe6a56d-e655-4dd3-8ed0-29146dd7bc01',
    userId: '36155148-61fe-48f1-a02d-0aebaa234218',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Manish Bba3.pdf',
    storageKey: 'manish-bba.pdf',
    clientName: 'Manish',
    unitNo: '50',
    ticketId: 'PL2081',
    allotmentId: '3f42ec2d-de9c-4dee-8d89-d08f8d89a998',
    userId: '8db8869d-ce0e-4fbf-b00c-54d8289f492a',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Piyush Sharma Bba.pdf',
    storageKey: 'piyush-sharma-bba.pdf',
    clientName: 'PIYUSH SHARMA',
    unitNo: '35',
    ticketId: 'SVI002050',
    allotmentId: 'e3a1a9f8-40d1-440f-997c-6f7371ec4a30',
    userId: '4770bf10-db2c-4d25-b131-c061828d09ab',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Raj Arora Bba.pdf',
    storageKey: 'raj-arora-bba.pdf',
    clientName: 'Raj Arora',
    unitNo: '66',
    ticketId: 'PL2083',
    allotmentId: '708a3f8e-fbc7-46fb-957b-6147962702f6',
    userId: '8c86a450-81d0-4895-a1a9-ed814e7ab050',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Rani Bhatnagar Bba.pdf',
    storageKey: 'rani-bhatnagar-bba.pdf',
    clientName: 'RANI BHATNAGAR',
    unitNo: '5',
    ticketId: 'PL2078',
    allotmentId: '45246230-754b-4fa8-b4f2-0d0baaaf1388',
    userId: '06910ad7-5684-4625-9f38-f2642f6193a8',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Rohit Bba (1).pdf',
    storageKey: 'rohit-bba.pdf',
    clientName: 'Rohit',
    unitNo: '126',
    ticketId: 'PL2080',
    allotmentId: '5ee0d5e8-c2b9-4f4e-a79c-b24abfd66296',
    userId: '2c1e5dd4-66d1-4f74-8b27-586c0d5bf62a',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Sarita Joshi&Shantanu Joshi Bba (1).pdf',
    storageKey: 'shantanu-joshi-bba.pdf',
    clientName: 'SHANTANU JOSHI',
    unitNo: 'old 134,135 New 128,129',
    ticketId: 'PL2077',
    allotmentId: '6a3e8107-f54a-4975-b06c-8fd78129c81c',
    userId: 'b380ba70-9662-4249-9109-afdd4de2e72b',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Shiv Bhagwan Bba (1).pdf',
    storageKey: 'shiv-bhagwan-bba.pdf',
    clientName: 'Shiv Bhagwan',
    unitNo: '149',
    ticketId: 'SVI002106',
    allotmentId: '0155df28-b0ae-4de8-a03a-c64e620973ee',
    userId: '207d2cf2-6806-4d7c-a8c1-9aa7b683f98d',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Shyam Mohan Sharma Bba1.pdf',
    storageKey: 'shyam-mohan-sharma-bba.pdf',
    clientName: 'Shyam mohan sharma',
    unitNo: 'A-221 and A-222',
    ticketId: 'SVI2015',
    allotmentId: '896e143e-0576-414b-bb05-29ce32466ce8',
    userId: '0555600f-c5e8-41f9-8b9d-d4a160e8a6c8',
    projectName: 'Shyam Aangan Phase 1',
  },
  {
    file: 'Sunil Bhatnagar Bba1.pdf',
    storageKey: 'sunil-bhatnagar-bba.pdf',
    clientName: 'Sunil Bhatnagar',
    unitNo: '6',
    ticketId: 'PL2084',
    allotmentId: 'd1918563-91d9-438f-9af4-26c4de44812e',
    userId: '91c25358-c379-4a02-a502-9f071c6757d0',
    projectName: 'Shyam Aangan Phase 1',
  },
];

async function syncBbaClients() {
  console.log('=== SYNCING 15 CLIENT BBA AGREEMENTS TO DATABASE & STORAGE ===');

  const bbaDir = path.resolve(__dirname, '../public/BBA CLIENTS');
  const nowIso = new Date().toISOString();

  let uploadedCount = 0;
  let docsUpdatedCount = 0;
  let allotmentsUpdatedCount = 0;

  for (const item of CLIENT_BBA_MAPPINGS) {
    const filePath = path.join(bbaDir, item.file);
    if (!fs.existsSync(filePath)) {
      console.error(`[MISSING FILE] Cannot find: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileSizeKB = Math.round(fileBuffer.length / 1024);

    // 1. Upload to Supabase Storage 'bba-documents'
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('bba-documents')
      .upload(item.storageKey, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadErr) {
      console.error(`[STORAGE ERROR] ${item.clientName}:`, uploadErr.message);
    } else {
      uploadedCount++;
    }

    const { data: publicUrlData } = supabase.storage
      .from('bba-documents')
      .getPublicUrl(item.storageKey);

    const cdnUrl = publicUrlData?.publicUrl || `/BBA CLIENTS/${encodeURIComponent(item.file)}`;
    const localFallback = `/BBA CLIENTS/${encodeURIComponent(item.file)}`;

    // 2. Check if a BBA document already exists in `documents`
    const { data: existingDocs } = await supabase
      .from('documents')
      .select('id, metadata, form_data')
      .eq('document_type', 'bba')
      .or(`user_id.eq.${item.userId},form_data->>ticketId.eq.${item.ticketId}`);

    let documentId = null;

    const bbaDocPayload = {
      document_type: 'bba',
      user_id: item.userId,
      status: 'completed',
      pdf_url: cdnUrl,
      metadata: {
        is_locked: true,
        locked_at: nowIso,
        locked_by: 'admin',
        locked_reason: 'Final Executed BBA Agreement',
        original_filename: item.file,
        storage_key: item.storageKey,
        storage_bucket: 'bba-documents',
        local_fallback_url: localFallback,
        allotment_id: item.allotmentId,
        ticket_id: item.ticketId,
        unit_no: item.unitNo,
        customer_name: item.clientName,
        filesize_kb: fileSizeKB,
      },
      form_data: {
        clientName: item.clientName,
        applicantName: item.clientName,
        unitNumber: item.unitNo,
        projectName: item.projectName,
        ticketId: item.ticketId,
        pdf_url: cdnUrl,
        is_locked: true,
        agreementType: 'Executed Builder-Buyer Agreement',
        executionDate: '2026-06-01',
      },
    };

    if (existingDocs && existingDocs.length > 0) {
      documentId = existingDocs[0].id;
      const { error: docUpdateErr } = await supabase
        .from('documents')
        .update(bbaDocPayload)
        .eq('id', documentId);

      if (docUpdateErr) {
        console.error(`[DOC UPDATE ERROR] ${item.clientName}:`, docUpdateErr.message);
      } else {
        docsUpdatedCount++;
      }
    } else {
      const { data: insertedDoc, error: docInsertErr } = await supabase
        .from('documents')
        .insert(bbaDocPayload)
        .select('id')
        .single();

      if (docInsertErr) {
        console.error(`[DOC INSERT ERROR] ${item.clientName}:`, docInsertErr.message);
      } else {
        documentId = insertedDoc.id;
        docsUpdatedCount++;
      }
    }

    // 3. Update Allotments Table
    const { data: currentAllotment } = await supabase
      .from('allotments')
      .select('metadata')
      .eq('id', item.allotmentId)
      .single();

    const currentMeta = currentAllotment?.metadata || {};
    const updatedMeta = {
      ...currentMeta,
      ticket_no: currentMeta.ticket_no || item.ticketId,
      customer_name: currentMeta.customer_name || item.clientName,
      bba_document_id: documentId,
      bba_url: cdnUrl,
      bba_local_url: localFallback,
      bba_status: 'locked',
      bba_locked: true,
      bba_updated_at: nowIso,
      bba_filename: item.file,
    };

    const { error: allotErr } = await supabase
      .from('allotments')
      .update({
        metadata: updatedMeta,
        updated_at: nowIso,
      })
      .eq('id', item.allotmentId);

    if (allotErr) {
      console.error(`[ALLOTMENT UPDATE ERROR] ${item.clientName}:`, allotErr.message);
    } else {
      allotmentsUpdatedCount++;
      console.log(
        `✓ [SYNCED & LOCKED] ${item.clientName.padEnd(20)} | Unit: ${item.unitNo.padEnd(25)} | Ticket: ${item.ticketId.padEnd(10)} | Doc: ${documentId?.slice(0, 8)} | CDN: ${cdnUrl.slice(0, 40)}...`
      );
    }
  }

  console.log('\n=== SYNC SUMMARY ===');
  console.log(`Storage Uploads: ${uploadedCount} / ${CLIENT_BBA_MAPPINGS.length}`);
  console.log(`Documents Synced & Locked: ${docsUpdatedCount} / ${CLIENT_BBA_MAPPINGS.length}`);
  console.log(`Allotments Synced & Locked: ${allotmentsUpdatedCount} / ${CLIENT_BBA_MAPPINGS.length}`);
}

syncBbaClients().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
