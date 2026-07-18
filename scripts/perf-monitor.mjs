#!/usr/bin/env node
/**
 * Performance Monitor (dev-only)
 * Logs bundle sizes and image size compliance.
 *
 * Run: pnpm perf:dev
 */

import { statSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const NEXT_BUILD_DIR = join(PROJECT_ROOT, '.next');

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

function printBudgetReport() {
  const CHUNK_BUDGET_KB = 100;
  const CSS_BUDGET_KB = 40;

  console.log('\n📦  Bundle Analysis');
  console.log('='.repeat(60));

  const chunksDir = join(NEXT_BUILD_DIR, 'static', 'chunks');
  const cssDir = join(NEXT_BUILD_DIR, 'static', 'css');

  let chunkViolations = 0;
  const chunks = walkDir(chunksDir, ['.js'])
    .map((f) => ({
      name: f.replace(chunksDir, '').replace(/^[\\/]/, ''),
      kb: statSync(f).size / 1024,
    }))
    .sort((a, b) => b.kb - a.kb)
    .slice(0, 15);

  for (const chunk of chunks) {
    const over = chunk.kb > CHUNK_BUDGET_KB;
    if (over) chunkViolations++;
    console.log(
      `  ${over ? '🔴' : '✅'}  ${chunk.name} — ${chunk.kb.toFixed(1)} KB${over ? ` (>${CHUNK_BUDGET_KB} KB)` : ''}`
    );
  }

  console.log('\n🎨  CSS Files');
  const cssFiles = walkDir(cssDir, ['.css']);
  for (const f of cssFiles) {
    const kb = statSync(f).size / 1024;
    const over = kb > CSS_BUDGET_KB;
    const name = f.replace(cssDir, '').replace(/^[\\/]/, '');
    console.log(
      `  ${over ? '🔴' : '✅'}  ${name} — ${kb.toFixed(1)} KB${over ? ` (>${CSS_BUDGET_KB} KB)` : ''}`
    );
  }

  console.log('\n' + '='.repeat(60));
  if (chunkViolations > 0) {
    console.log(
      `⚠️  ${chunkViolations} chunk(s) exceed ${CHUNK_BUDGET_KB} KB. Consider dynamic imports or tree-shaking.\n`
    );
  } else {
    console.log('✅  All chunks within budget.\n');
  }
}

function checkImageSizes() {
  const imageDir = join(PROJECT_ROOT, 'public', 'images');
  const BUDGETS = { png: 500, jpg: 500, jpeg: 500, webp: 150, avif: 100 };

  console.log('\n🖼️   Image Size Check');
  console.log('='.repeat(60));

  const files = walkDir(imageDir, ['.png', '.jpg', '.jpeg', '.webp', '.avif']);
  let violations = 0;

  for (const f of files) {
    const ext = f.split('.').pop().toLowerCase();
    const budget = BUDGETS[ext] || 200;
    const kb = statSync(f).size / 1024;
    if (kb > budget) {
      violations++;
      const name = f.replace(imageDir, '').replace(/^[\\/]/, '');
      console.log(`  🔴  ${name} — ${kb.toFixed(0)} KB (>${budget} KB budget)`);
    }
  }

  if (violations === 0) {
    console.log('  ✅  All images within size budgets.');
  } else {
    console.log(`\n  ⚠️  ${violations} image(s) exceed budget. Run: pnpm optimize:images`);
  }
  console.log('='.repeat(60) + '\n');
}

function main() {
  console.log('🔍  SVI Performance Monitor — ' + new Date().toLocaleString() + '\n');
  if (!existsSync(NEXT_BUILD_DIR)) {
    console.log('ℹ️  No .next/ build found. Run `pnpm build` first for bundle analysis.\n');
  } else {
    printBudgetReport();
  }
  checkImageSizes();
}

main();
