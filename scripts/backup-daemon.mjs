// @ts-check
/**
 * SVI Supabase Backup Daemon
 * Runs continuously in Node.js, triggering daily backups at 03:00 AM (local time)
 * and keeping 7 days of retention.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_SCRIPT = path.join(__dirname, 'export-supabase-backup.mjs');
const SCHEDULE_HOUR = 3; // 03:00 AM
const SCHEDULE_MINUTE = 0;

function runBackupProcess() {
  console.log(`\n[${new Date().toISOString()}] 🚀 Triggering Scheduled Backup...`);
  const child = spawn(process.execPath, [BACKUP_SCRIPT], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: process.env,
  });

  child.on('close', (code) => {
    console.log(`[${new Date().toISOString()}] ✅ Backup finished with exit code ${code}`);
    scheduleNextRun();
  });
}

function getMsUntilNextRun() {
  const now = new Date();
  const next = new Date();
  next.setHours(SCHEDULE_HOUR, SCHEDULE_MINUTE, 0, 0);

  // If already past today's scheduled time, schedule for tomorrow
  if (now.getTime() >= next.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
}

function scheduleNextRun() {
  const ms = getMsUntilNextRun();
  const hours = (ms / (1000 * 60 * 60)).toFixed(1);
  const nextDate = new Date(Date.now() + ms);
  console.log(`⏳ Next automated backup scheduled for: ${nextDate.toLocaleString()} (in ~${hours} hours)`);

  setTimeout(() => {
    runBackupProcess();
  }, ms);
}

console.log('====================================================');
console.log('🤖 SVI Supabase Daily Backup Daemon Started');
console.log(`⏰ Schedule: Daily at ${String(SCHEDULE_HOUR).padStart(2, '0')}:${String(SCHEDULE_MINUTE).padStart(2, '0')}`);
console.log('🗓️ Retention: 7 days automatic prune');
console.log('====================================================');

// Schedule the first run
scheduleNextRun();
