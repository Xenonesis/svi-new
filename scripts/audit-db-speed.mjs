// @ts-check
/**
 * Comprehensive Database Speed & Latency Audit
 * Audits all pages and core functionalities across SVI Infra Solutions.
 * STRICTLY READ-ONLY: Zero writes, zero drops, zero mutations, zero DB reset.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Helper to benchmark a function
async function benchmark(name, pageOrModule, queryFn, iterations = 3) {
  const times = [];
  let rowCount = 0;
  let sampleError = null;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      const res = await queryFn();
      const duration = performance.now() - start;
      times.push(duration);
      if (res && res.error) {
        sampleError = res.error.message || JSON.stringify(res.error);
      } else if (res && res.count !== undefined && res.count !== null) {
        rowCount = res.count;
      } else if (res && Array.isArray(res.data)) {
        rowCount = res.data.length;
      } else if (res && res.data) {
        rowCount = 1;
      }
    } catch (err) {
      times.push(performance.now() - start);
      sampleError = err.message;
    }
  }

  // Sort to compute min, max, median, mean
  times.sort((a, b) => a - b);
  const min = times[0];
  const max = times[times.length - 1];
  const median = times[Math.floor(times.length / 2)];
  const avg = times.reduce((s, t) => s + t, 0) / times.length;

  let grade = '🟢 FAST';
  if (median > 300) grade = '🔴 SLOW';
  else if (median > 150) grade = '🟡 MODERATE';

  return {
    test: name,
    module: pageOrModule,
    rows: rowCount,
    min_ms: parseFloat(min.toFixed(1)),
    median_ms: parseFloat(median.toFixed(1)),
    max_ms: parseFloat(max.toFixed(1)),
    grade,
    error: sampleError || null,
  };
}

async function runAudit() {
  console.log('========================================================================');
  console.log('🔍 SVI INFRA SOLUTIONS - COMPREHENSIVE DB SPEED AUDIT');
  console.log(`📡 Remote Instance: ${supabaseUrl}`);
  console.log(`⏱️ Audit Date: ${new Date().toISOString()}`);
  console.log('🛡️ Safety Guarantee: STRICTLY READ-ONLY (Zero DB Reset / Zero Mutations)');
  console.log('========================================================================\n');

  const results = [];

  // --- 1. PUBLIC PAGES ---
  console.log('Testing Public Pages Queries...');

  // 1.1 Homepage - Active Properties
  results.push(
    await benchmark('Active Properties Fetch', 'Public / Homepage', async () => {
      return await supabase
        .from('properties')
        .select('id, name, location, price, status, image_url')
        .order('created_at', { ascending: false })
        .limit(10);
    })
  );

  // 1.2 Homepage / Global - Portal Settings
  results.push(
    await benchmark('Portal Global Settings', 'Public / Global Layout', async () => {
      return await supabase.from('portal_settings').select('*');
    })
  );

  // 1.3 Public Lottery / Giveaway Page
  results.push(
    await benchmark('Active Lotteries & State', 'Public / Lottery Page', async () => {
      return await supabase
        .from('lotteries')
        .select('id, title, status, draw_date, total_winners, prize_description')
        .order('created_at', { ascending: false });
    })
  );

  // 1.4 Public Lottery Participants Count (305 rows)
  results.push(
    await benchmark('Lottery Participants Count', 'Public / Lottery Draw Counter', async () => {
      return await supabase
        .from('lottery_participants')
        .select('*', { count: 'exact', head: true });
    })
  );

  // 1.5 Careers Page - Open Positions
  results.push(
    await benchmark('Open Job Positions', 'Public / Careers Page', async () => {
      return await supabase
        .from('careers')
        .select('id, title, department, location, type, is_active')
        .order('created_at', { ascending: false });
    })
  );

  // --- 2. ADMIN PORTAL - WORKFORCE & HR HUB ---
  console.log('Testing Workforce & HR Hub Queries...');

  // 2.1 Workforce Directory - Profiles List
  results.push(
    await benchmark('Employee Directory List', 'Admin / Workforce Directory', async () => {
      return await supabase
        .from('profiles')
        .select('id, full_name, email, role, department, phone, is_active, created_at')
        .order('full_name', { ascending: true })
        .limit(50);
    })
  );

  // 2.2 Teams & Member Hierarchy
  results.push(
    await benchmark('Teams & Member Mapping', 'Admin / Workforce Teams', async () => {
      return await supabase
        .from('teams')
        .select('id, name, description, created_at');
    })
  );

  // 2.3 Workforce Leads Pipeline (chat_leads with filtering)
  results.push(
    await benchmark('Chat Leads Pipeline (Top 25)', 'Admin / Workforce Leads', async () => {
      return await supabase
        .from('chat_leads')
        .select('id, name, phone, email, project_interest, lifecycle_status, temperature, created_at')
        .order('created_at', { ascending: false })
        .limit(25);
    })
  );

  // 2.4 Attendance Radar - Recent Punches
  results.push(
    await benchmark('Live Attendance Punches', 'Admin / Workforce Attendance Radar', async () => {
      return await supabase
        .from('attendance_records')
        .select('id, user_id, punch_in, punch_out, date, verified_by_geofence')
        .order('date', { ascending: false })
        .limit(30);
    })
  );

  // 2.5 Geofence Locations Config
  results.push(
    await benchmark('Geofence Coordinates Config', 'Admin & Employee / Geofence', async () => {
      return await supabase.from('geofence_locations').select('*');
    })
  );

  // 2.6 Salary Structures & Payroll
  results.push(
    await benchmark('Employee Salary Structures', 'Admin / Workforce Payroll', async () => {
      return await supabase.from('employee_salary_structures').select('*');
    })
  );

  // --- 3. ADMIN PORTAL - RECORDS & ALLOTMENTS ---
  console.log('Testing Records & Allotments Queries...');

  // 3.1 Portal Allotments Master List
  results.push(
    await benchmark('Portal Allotments Master List', 'Admin / Portal Allotments', async () => {
      return await supabase
        .from('allotment_records')
        .select('id, client_name, plot_number, total_cost, amount_received, outstanding_balance, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
    })
  );

  // 3.2 Payment Schedules & Financial Milestones
  results.push(
    await benchmark('Payment Schedules & Milestones', 'Admin / Financial Ledgers', async () => {
      return await supabase
        .from('payment_schedules')
        .select('id, milestone_name, due_amount, status, due_date')
        .limit(50);
    })
  );

  // 3.3 Documents Vault (78 rows, paginated & sorted)
  results.push(
    await benchmark('Documents Archive (Page 1)', 'Admin / Documents Management', async () => {
      return await supabase
        .from('documents')
        .select('id, document_type, title, file_url, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
    })
  );

  // --- 4. ADMIN PORTAL - SYSTEM, AUDIT LOGS & NOTIFICATIONS ---
  console.log('Testing High-Volume Tables & Logs...');

  // 4.1 Notifications - Unread Count (WHERE is_read = false on 1,502 rows)
  results.push(
    await benchmark('Unread Notifications Count', 'Admin / Header Bell Icon', async () => {
      return await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
    })
  );

  // 4.2 Notifications - Recent List (Limit 15 on 1,502 rows)
  results.push(
    await benchmark('Recent Notifications Feed', 'Admin / Notification Dropdown', async () => {
      return await supabase
        .from('notifications')
        .select('id, title, message, is_read, created_at')
        .order('created_at', { ascending: false })
        .limit(15);
    })
  );

  // 4.3 Activity Logs - Paginated Audit Trail (458 rows)
  results.push(
    await benchmark('Activity Audit Trail (Limit 20)', 'Admin / Activity Logs', async () => {
      return await supabase
        .from('activity_logs')
        .select('id, user_id, action_type, description, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
    })
  );

  // 4.4 Rate Limits Check
  results.push(
    await benchmark('Rate Limit Window Check', 'Security / Rate Limiter', async () => {
      return await supabase
        .from('rate_limits')
        .select('key, points, expire')
        .limit(10);
    })
  );

  // --- 5. EMAIL CENTER ---
  console.log('Testing Email Center Queries...');

  // 5.1 Outbound Email Messages Archive (82 rows)
  results.push(
    await benchmark('Sent Email Messages Archive', 'Admin / Email Center Outbox', async () => {
      return await supabase
        .from('email_messages')
        .select('id, to_email, subject, status, sent_at')
        .order('sent_at', { ascending: false })
        .limit(25);
    })
  );

  // 5.2 Inbound Email Inbox (13 rows)
  results.push(
    await benchmark('Inbound Email Inbox', 'Admin / Email Center Inbox', async () => {
      return await supabase
        .from('email_inbox')
        .select('id, from_email, subject, received_at')
        .order('received_at', { ascending: false })
        .limit(25);
    })
  );

  // --- 6. ADVANCED RPC & SEARCH ---
  console.log('Testing RPC & Search Queries...');

  // 6.1 RPC: get_distinct_registration_filters
  results.push(
    await benchmark('Registration Filters RPC', 'Admin / Registrations Filter Dropdowns', async () => {
      return await supabase.rpc('get_distinct_registration_filters');
    })
  );

  // 6.2 Fuzzy ILIKE Search on Registrations
  results.push(
    await benchmark('Fuzzy Customer Search (ILIKE)', 'Admin / Registration Search', async () => {
      return await supabase
        .from('registrations')
        .select('id, name, email, phone, project')
        .or('name.ilike.%singh%,email.ilike.%singh%,phone.ilike.%singh%')
        .limit(10);
    })
  );

  // Output formatting
  console.log('\n========================================================================');
  console.log('📊 AUDIT RESULTS SUMMARY');
  console.log('========================================================================');
  console.table(
    results.map((r) => ({
      'Module / Page': r.module,
      'Query Description': r.test,
      'Rows': r.rows,
      'Median (ms)': r.median_ms,
      'Min (ms)': r.min_ms,
      'Max (ms)': r.max_ms,
      'Speed Grade': r.grade,
      'Status': r.error ? `❌ ${r.error}` : '✅ OK',
    }))
  );

  const avgSpeed = (
    results.reduce((acc, r) => acc + r.median_ms, 0) / results.length
  ).toFixed(1);
  const fastCount = results.filter((r) => r.grade === '🟢 FAST').length;
  const modCount = results.filter((r) => r.grade === '🟡 MODERATE').length;
  const slowCount = results.filter((r) => r.grade === '🔴 SLOW').length;

  console.log(`\n📈 Total Benchmarked Queries: ${results.length}`);
  console.log(`⚡ Average Median Latency:     ${avgSpeed} ms`);
  console.log(`🟢 Fast (<150ms):              ${fastCount}`);
  console.log(`🟡 Moderate (150-300ms):       ${modCount}`);
  console.log(`🔴 Slow (>300ms):              ${slowCount}`);

  // Save audit report to JSON
  const auditReport = {
    audited_at: new Date().toISOString(),
    remote_url: supabaseUrl,
    average_median_ms: parseFloat(avgSpeed),
    fast_count: fastCount,
    moderate_count: modCount,
    slow_count: slowCount,
    queries: results,
  };

  const reportPath = path.resolve(process.cwd(), 'backups', 'db_speed_audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2), 'utf8');
  console.log(`\n💾 Saved detailed audit report to: backups/db_speed_audit_report.json\n`);
}

runAudit().catch(console.error);
