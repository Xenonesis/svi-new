#!/usr/bin/env node
/**
 * Image Optimization Pipeline
 * Converts public/images/**\/*.png → .webp + .avif
 * Generates responsive sizes: 320, 640, 1024, 1920
 * Outputs blurDataURL for next/image placeholder
 *
 * Run: node scripts/optimize-images.mjs
 * Or via: pnpm optimize:images
 *
 * Set SKIP_IMAGE_OPTIMIZE=true to bypass (e.g., in CI for faster builds).
 */

// Allow CI to skip this expensive step
if (process.env.SKIP_IMAGE_OPTIMIZE === 'true') {
  console.log('ℹ️  SKIP_IMAGE_OPTIMIZE=true — skipping image optimization.');
  process.exit(0);
}

import { createRequire } from 'module';
import { readdir, stat, mkdir, access, readFile, writeFile } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('❌  sharp is not installed. Run: pnpm add sharp');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const INPUT_DIR = join(PROJECT_ROOT, 'public', 'images');
const OUTPUT_DIR = join(PROJECT_ROOT, 'public', 'images');

const RESPONSIVE_SIZES = [320, 640, 1024, 1920];
const WEBP_QUALITY = 80;
const AVIF_QUALITY = 60;
const BLUR_SIZE = 10; // tiny placeholder size for blurDataURL

const MAX_SIZE_WEBP_KB = 300;
const MAX_SIZE_AVIF_KB = 250;

let totalSaved = 0;
let processedCount = 0;
let skippedCount = 0;
const blurDataURLs = {};
const warnings = [];

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function getFiles(dir, exts = ['.png', '.jpg', '.jpeg']) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFiles(full, exts)));
    } else if (exts.includes(extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function generateBlurDataURL(inputPath) {
  const buffer = await sharp(inputPath)
    .resize(BLUR_SIZE, BLUR_SIZE, { fit: 'inside' })
    .webp({ quality: 20 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

async function optimizeImage(inputPath) {
  const name = basename(inputPath, extname(inputPath));
  const relDir = dirname(inputPath)
    .replace(INPUT_DIR, '')
    .replace(/^[/\\]/, '');
  const outDir = relDir ? join(OUTPUT_DIR, relDir) : OUTPUT_DIR;
  await ensureDir(outDir);

  const inputStat = await stat(inputPath);
  const inputSizeKB = inputStat.size / 1024;

  console.log(
    `\n📷  Processing: ${relDir ? relDir + '/' : ''}${name}.png (${inputSizeKB.toFixed(0)} KB)`
  );

  // Generate blur placeholder
  const blurDataURL = await generateBlurDataURL(inputPath);
  const key = inputPath.replace(PROJECT_ROOT, '').replace(/\\/g, '/');
  blurDataURLs[key] = blurDataURL;

  // Get original dimensions
  const meta = await sharp(inputPath).metadata();
  const origWidth = meta.width || 1920;

  let savedBytes = 0;

  for (const size of RESPONSIVE_SIZES) {
    if (size > origWidth * 1.2) continue; // skip sizes much larger than original

    // WebP
    const webpOut = join(outDir, `${name}-${size}w.webp`);
    const webpBuf = await sharp(inputPath)
      .resize(size, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();
    const webpKB = webpBuf.byteLength / 1024;

    if (webpKB > MAX_SIZE_WEBP_KB) {
      warnings.push(
        `⚠️  ${name}-${size}w.webp is ${webpKB.toFixed(0)} KB (>${MAX_SIZE_WEBP_KB} KB limit)`
      );
    }

    await sharp(webpBuf).toFile(webpOut);
    savedBytes += inputStat.size / RESPONSIVE_SIZES.length - webpBuf.byteLength;

    // AVIF
    const avifOut = join(outDir, `${name}-${size}w.avif`);
    const avifBuf = await sharp(inputPath)
      .resize(size, null, { fit: 'inside', withoutEnlargement: true })
      .avif({ quality: AVIF_QUALITY, effort: 4 })
      .toBuffer();
    const avifKB = avifBuf.byteLength / 1024;

    if (avifKB > MAX_SIZE_AVIF_KB) {
      warnings.push(
        `⚠️  ${name}-${size}w.avif is ${avifKB.toFixed(0)} KB (>${MAX_SIZE_AVIF_KB} KB limit)`
      );
    }

    await sharp(avifBuf).toFile(avifOut);

    console.log(`  ✅  ${size}w → WebP ${webpKB.toFixed(0)} KB | AVIF ${avifKB.toFixed(0)} KB`);
  }

  // Also generate a full-size WebP (no size suffix) as a fallback
  const webpFullOut = join(outDir, `${name}.webp`);
  const webpFullBuf = await sharp(inputPath).webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
  await sharp(webpFullBuf).toFile(webpFullOut);
  console.log(`  ✅  Full → WebP ${(webpFullBuf.byteLength / 1024).toFixed(0)} KB`);

  totalSaved += savedBytes;
  processedCount++;
}

async function loadExistingBlurDataURLs() {
  try {
    const manifestPath = join(PROJECT_ROOT, 'src', 'data', 'blur-data-urls.json');
    const content = await readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeBlurURLsManifest() {
  const manifestPath = join(PROJECT_ROOT, 'src', 'data', 'blur-data-urls.json');
  await ensureDir(join(PROJECT_ROOT, 'src', 'data'));
  await writeFile(manifestPath, JSON.stringify(blurDataURLs, null, 2), 'utf-8');
  console.log(`\n📄  Blur data URLs written to src/data/blur-data-urls.json`);
}

async function main() {
  console.log('🚀  SVI Image Optimization Pipeline\n');
  console.log(`   Input:  ${INPUT_DIR}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log(`   Sizes:  ${RESPONSIVE_SIZES.join(', ')}`);
  console.log(`   WebP quality: ${WEBP_QUALITY} | AVIF quality: ${AVIF_QUALITY}\n`);

  if (!sharp) {
    console.error('❌  sharp is required. Run: pnpm add sharp');
    process.exit(1);
  }

  const files = await getFiles(INPUT_DIR);

  if (files.length === 0) {
    console.log('ℹ️  No PNG/JPG images found in public/images/');
    return;
  }

  console.log(`Found ${files.length} image(s) to process...\n`);

  // Load existing blur data URLs so we don't lose entries for already-processed images
  const existingBlurDataURLs = await loadExistingBlurDataURLs();

  for (const file of files) {
    // Skip already-generated webp/avif files
    if (file.endsWith('.webp') || file.endsWith('.avif')) {
      skippedCount++;
      continue;
    }

    // Check if this image has already been processed (full-size .webp exists)
    const name = basename(file, extname(file));
    const relDir = dirname(file).replace(INPUT_DIR, '').replace(/^[/\\]/, '');
    const outDir = relDir ? join(OUTPUT_DIR, relDir) : OUTPUT_DIR;
    const webpFullOut = join(outDir, `${name}.webp`);

    let alreadyProcessed = false;
    try {
      await access(webpFullOut);
      alreadyProcessed = true;
    } catch {
      /* .webp doesn't exist — needs processing */
    }

    if (alreadyProcessed) {
      const key = file.replace(PROJECT_ROOT, '').replace(/\\/g, '/');
      if (existingBlurDataURLs[key]) {
        blurDataURLs[key] = existingBlurDataURLs[key];
      }
      console.log(`  ⏭️  ${name} — already processed`);
      skippedCount++;
      continue;
    }

    try {
      await optimizeImage(file);
    } catch (err) {
      console.error(`❌  Failed to process ${file}: ${err.message}`);
    }
  }

  await writeBlurURLsManifest();

  console.log('\n' + '='.repeat(60));
  console.log(`✅  Done! Processed: ${processedCount} | Skipped: ${skippedCount}`);
  if (totalSaved > 0) {
    console.log(`💾  Estimated savings: ~${(totalSaved / 1024 / 1024).toFixed(1)} MB`);
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach((w) => console.log('   ' + w));
  }

  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
