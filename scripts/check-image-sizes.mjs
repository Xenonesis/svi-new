#!/usr/bin/env node
/**
 * CI Image Size Check
 * Fails if any unoptimized PNG > 100 KB exists or WebP/AVIF exceed budgets.
 * Usage: node scripts/check-image-sizes.mjs
 */

import { statSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const IMAGE_DIR = join(PROJECT_ROOT, 'public', 'images');

const BUDGETS_KB = {
  png: 100, // raw PNGs should be converted → fail CI if forgotten
  jpg: 100,
  jpeg: 100,
  webp: 150,
  avif: 100,
};

function walkDir(dir, exts) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkDir(full, exts));
    else if (!exts || exts.some((e) => entry.name.endsWith(e))) results.push(full);
  }
  return results;
}

const files = walkDir(IMAGE_DIR, ['.png', '.jpg', '.jpeg', '.webp', '.avif']);
let exitCode = 0;

console.log(`\n🖼️  Image Size CI Check (${files.length} files)\n`);

for (const f of files) {
  const ext = f.split('.').pop().toLowerCase();
  const budgetKB = BUDGETS_KB[ext];
  if (!budgetKB) continue;
  const kb = statSync(f).size / 1024;
  const name = f.replace(IMAGE_DIR, '').replace(/^[\\/]/, '');
  if (kb > budgetKB) {
    console.error(`  ❌  ${name} — ${kb.toFixed(0)} KB exceeds ${budgetKB} KB budget`);
    exitCode = 1;
  } else {
    console.log(`  ✅  ${name} — ${kb.toFixed(0)} KB`);
  }
}

if (exitCode !== 0) {
  console.error('\n💡  Run: npm run optimize:images  to fix image sizes\n');
}
process.exit(exitCode);
