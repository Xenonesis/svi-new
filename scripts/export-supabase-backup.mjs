// @ts-check
/**
 * Supabase Live Database Data Exporter
 * Creates a complete local SQL backup of all table data from remote Supabase
 * Strictly READ-ONLY: ZERO DB reset, ZERO table drops, ZERO mutations.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 1. Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Format JavaScript values into valid PostgreSQL SQL literals
function formatSqlLiteral(val) {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  if (typeof val === 'boolean') {
    return val ? 'TRUE' : 'FALSE';
  }
  if (typeof val === 'number') {
    return Number.isFinite(val) ? String(val) : 'NULL';
  }
  if (val instanceof Date) {
    return `'${val.toISOString()}'`;
  }
  if (Array.isArray(val)) {
    // If array of objects or complex data, treat as JSONB
    const hasObject = val.some((item) => typeof item === 'object' && item !== null);
    if (hasObject) {
      const jsonStr = JSON.stringify(val).replace(/'/g, "''");
      return `'${jsonStr}'::jsonb`;
    }
    // Simple scalar array (text[], int[], etc.)
    const items = val.map((item) => {
      if (item === null) return 'NULL';
      if (typeof item === 'number') return item;
      if (typeof item === 'boolean') return item ? 'TRUE' : 'FALSE';
      return `'${String(item).replace(/'/g, "''")}'`;
    });
    return `ARRAY[${items.join(', ')}]`;
  }
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  if (typeof val === 'string') {
    // Replace null bytes if any, and escape single quotes
    const cleaned = val.replace(/\0/g, '').replace(/'/g, "''");
    return `'${cleaned}'`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

// Escape SQL identifiers (table names and column names)
function escapeIdentifier(id) {
  return `"${id.replace(/"/g, '""')}"`;
}

async function runBackup() {
  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dateFolder = new Date().toISOString().split('T')[0];

  console.log('🚀 Starting Safe Supabase Data Backup (Read-Only)...');
  console.log(`📡 Remote Instance: ${supabaseUrl}`);
  console.log(`⏱️ Timestamp: ${new Date().toISOString()}`);

  // Ensure backups directory exists
  const backupsDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const backupFilename = `supabase_backup_${timestamp}.sql`;
  const backupFilePath = path.join(backupsDir, backupFilename);
  const latestFilePath = path.join(backupsDir, 'supabase_backup_latest.sql');
  const writeStream = fs.createWriteStream(backupFilePath, { encoding: 'utf8' });

  // 1. Write standard Postgres dump headers
  writeStream.write(`-- =============================================================================\n`);
  writeStream.write(`-- Supabase PostgreSQL Live Database Data Backup\n`);
  writeStream.write(`-- Generated: ${new Date().toISOString()}\n`);
  writeStream.write(`-- Source Instance: ${supabaseUrl}\n`);
  writeStream.write(`-- Type: Full Data Export (Safe, Read-Only, Zero DB Reset)\n`);
  writeStream.write(`-- =============================================================================\n\n`);
  writeStream.write(`SET statement_timeout = 0;\n`);
  writeStream.write(`SET lock_timeout = 0;\n`);
  writeStream.write(`SET client_encoding = 'UTF8';\n`);
  writeStream.write(`SET standard_conforming_strings = on;\n`);
  writeStream.write(`SET check_function_bodies = false;\n`);
  writeStream.write(`SET xmloption = content;\n`);
  writeStream.write(`SET client_min_messages = warning;\n`);
  writeStream.write(`SET row_security = off;\n\n`);
  writeStream.write(`-- Disable triggers and foreign key checks during data insertion\n`);
  writeStream.write(`SET session_replication_role = 'replica';\n\n`);

  // 2. Discover all tables via PostgREST OpenAPI
  console.log('🔍 Discovering public schema tables...');
  let tables = [];
  try {
    const specRes = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    const spec = await specRes.json();
    tables = Object.keys(spec.definitions || {}).sort();
    console.log(`📋 Found ${tables.length} tables in public schema.`);
  } catch (err) {
    console.warn('⚠️ OpenAPI discovery failed, falling back to known tables list:', err);
    tables = [
      'profiles', 'portal_settings', 'properties', 'project_images', 'registrations',
      'site_visits', 'rate_limits', 'documents', 'allotment_records', 'bba_records',
      'offer_letter_records', 'email_messages', 'email_inbox', 'email_drafts',
      'scheduled_emails', 'email_deletions', 'campaigns', 'contact_groups',
      'push_subscriptions', 'notifications', 'chat_leads', 'chat_logs',
      'whatsapp_contacts', 'whatsapp_conversations', 'whatsapp_messages',
      'whatsapp_templates', 'whatsapp_follow_ups', 'whatsapp_site_visit_requests',
      'whatsapp_company_settings', 'whatsapp_processing_jobs', 'lotteries',
      'lottery_participants', 'activity_logs', 'careers', 'teams', 'team_members',
      'attendance_records', 'attendance_settings', 'geofence_locations',
      'employee_tasks', 'employee_work_logs', 'employee_leaves',
      'attendance_regularizations', 'lead_activities', 'employee_salary_structures',
      'monthly_payrolls', 'payroll_items'
    ];
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    source_url: supabaseUrl,
    backup_file: backupFilename,
    tables_processed: 0,
    total_rows: 0,
    table_stats: [],
  };

  const BATCH_SIZE = 1000;

  // 3. Process each table and write SQL INSERTs
  for (const table of tables) {
    try {
      // Get total count
      const { count, error: countErr } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (countErr) {
        // May be a view or internal endpoint that can't be selected directly
        continue;
      }

      if (!count || count === 0) {
        manifest.table_stats.push({ table, rows: 0, status: 'EMPTY' });
        continue;
      }

      console.log(`  💾 Exporting table "${table}" (${count} rows)...`);
      writeStream.write(`-- ----------------------------------------------------------------------------\n`);
      writeStream.write(`-- Table Data: public.${escapeIdentifier(table)} (${count} rows)\n`);
      writeStream.write(`-- ----------------------------------------------------------------------------\n`);

      let fetchedCount = 0;

      while (fetchedCount < count) {
        const to = Math.min(fetchedCount + BATCH_SIZE - 1, count - 1);
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .range(fetchedCount, to);

        if (error) {
          console.error(`  ❌ Error fetching rows from ${table} (${fetchedCount}-${to}):`, error.message);
          break;
        }

        if (!data || data.length === 0) {
          break;
        }

        // Write batch of INSERT statements
        const columns = Object.keys(data[0]);
        const columnListSql = columns.map(escapeIdentifier).join(', ');

        writeStream.write(`INSERT INTO public.${escapeIdentifier(table)} (${columnListSql})\nVALUES\n`);

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const valuesSql = columns.map((col) => formatSqlLiteral(row[col])).join(', ');
          const isLastInBatch = i === data.length - 1;
          writeStream.write(`  (${valuesSql})${isLastInBatch ? '' : ','}\n`);
        }

        writeStream.write(`ON CONFLICT DO NOTHING;\n\n`);

        fetchedCount += data.length;
      }

      manifest.table_stats.push({ table, rows: fetchedCount, status: 'SUCCESS' });
      manifest.total_rows += fetchedCount;
      manifest.tables_processed += 1;
    } catch (tblErr) {
      console.error(`  ❌ Exception exporting ${table}:`, tblErr);
      manifest.table_stats.push({ table, rows: 0, status: 'ERROR', error: String(tblErr) });
    }
  }

  // 4. Export Auth Users (accounts & identities)
  console.log('👤 Exporting Auth Users metadata...');
  try {
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
    if (!authErr && authData?.users?.length > 0) {
      const users = authData.users;
      console.log(`  💾 Exporting ${users.length} Auth Users...`);
      writeStream.write(`-- ----------------------------------------------------------------------------\n`);
      writeStream.write(`-- Reference: Auth Users (${users.length} accounts)\n`);
      writeStream.write(`-- Note: Auth passwords are encrypted hashes managed by Supabase GoTrue Auth.\n`);
      writeStream.write(`-- ----------------------------------------------------------------------------\n`);

      for (const u of users) {
        const uMeta = JSON.stringify(u.user_metadata || {}).replace(/'/g, "''");
        const aMeta = JSON.stringify(u.app_metadata || {}).replace(/'/g, "''");
        writeStream.write(
          `-- User: id='${u.id}' email='${u.email || ''}' phone='${u.phone || ''}' created_at='${u.created_at}' role='${u.role || ''}'\n`
        );
      }
      writeStream.write(`\n`);
      manifest.auth_users = users.length;
    }
  } catch (authEx) {
    console.warn('  ⚠️ Could not export auth users:', authEx);
  }

  // 5. Restore replication role
  writeStream.write(`-- ----------------------------------------------------------------------------\n`);
  writeStream.write(`-- Re-enable foreign key checks and triggers\n`);
  writeStream.write(`-- ----------------------------------------------------------------------------\n`);
  writeStream.write(`SET session_replication_role = 'DEFAULT';\n\n`);
  writeStream.write(`-- End of Backup (${manifest.total_rows} rows from ${manifest.tables_processed} tables)\n`);

  writeStream.end();

  await new Promise((resolve) => writeStream.on('finish', resolve));

  // Copy to latest file as well
  fs.copyFileSync(backupFilePath, latestFilePath);

  const stats = fs.statSync(backupFilePath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  manifest.file_size_bytes = stats.size;
  manifest.file_size_mb = sizeMb;
  manifest.duration_seconds = durationSec;

  // 6. Automatic Retention Pruning (Default: 7 days)
  const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10);
  const prunedFiles = pruneOldBackups(backupsDir, retentionDays);
  manifest.retention_days = retentionDays;
  manifest.pruned_backups_count = prunedFiles;

  // Write manifest
  fs.writeFileSync(
    path.join(backupsDir, 'backup_manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  console.log('\n============================================================');
  console.log('✅ BACKUP COMPLETE (100% Zero DB Reset)');
  console.log(`📁 File: backups/${backupFilename}`);
  console.log(`📁 Latest: backups/supabase_backup_latest.sql`);
  console.log(`📊 Size: ${sizeMb} MB (${stats.size.toLocaleString()} bytes)`);
  console.log(`📋 Tables: ${manifest.tables_processed} populated tables`);
  console.log(`🔢 Total Rows: ${manifest.total_rows.toLocaleString()} rows`);
  console.log(`⏱️ Duration: ${durationSec} seconds`);
  console.log(`🗓️ Retention Policy: Keep last ${retentionDays} days (${prunedFiles} pruned today)`);
  console.log('============================================================\n');

  // Print summary table
  const populatedTables = manifest.table_stats.filter((s) => s.rows > 0);
  console.table(populatedTables);
}

/**
 * Automatically delete backups older than `retentionDays` (Default: 7 days)
 */
function pruneOldBackups(backupsDir, retentionDays = 7) {
  console.log(`\n🧹 Checking for backups older than ${retentionDays} days (1 week)...`);
  const files = fs.readdirSync(backupsDir);
  const now = Date.now();
  const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;
  let prunedCount = 0;

  for (const file of files) {
    // Only check timestamped backup files, never delete latest or manifest
    if (
      !file.startsWith('supabase_backup_') ||
      file === 'supabase_backup_latest.sql' ||
      !file.endsWith('.sql')
    ) {
      continue;
    }

    const filePath = path.join(backupsDir, file);
    try {
      const stats = fs.statSync(filePath);
      const fileAgeMs = now - stats.mtimeMs;
      const fileAgeDays = (fileAgeMs / (1000 * 60 * 60 * 24)).toFixed(1);

      if (fileAgeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        console.log(`  🗑️ Deleted old backup: ${file} (Age: ${fileAgeDays} days > ${retentionDays} days)`);
        prunedCount++;
      } else {
        console.log(`  🛡️ Kept backup: ${file} (Age: ${fileAgeDays} days <= ${retentionDays} days)`);
      }
    } catch (err) {
      console.warn(`  ⚠️ Could not process ${file}:`, err.message);
    }
  }

  if (prunedCount === 0) {
    console.log(`  ✨ All backups are within the ${retentionDays}-day retention window.`);
  } else {
    console.log(`  ✅ Successfully deleted ${prunedCount} old backup file(s).`);
  }

  return prunedCount;
}

runBackup().catch((err) => {
  console.error('Fatal backup error:', err);
  process.exit(1);
});

