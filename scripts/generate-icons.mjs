import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.join(__dirname, '..');
const iconsDir = path.join(root, 'public', 'icons');
const faviconsDir = path.join(root, 'public', 'favicons');
const screenshotsDir = path.join(root, 'public', 'screenshots');
const resourcesDir = path.join(root, 'resources');
const appDir = path.join(root, 'app');
const androidResDir = path.join(root, 'android', 'app', 'src', 'main', 'res');

[iconsDir, faviconsDir, screenshotsDir, resourcesDir, appDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Creates multi-resolution ICO binary from PNG buffers.
 */
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  let offset = 6 + count * 16;

  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((b) => b.buffer)]);
}

async function main() {
  const masterBadgePath = path.join(root, 'public', 'logo-app-badge.png');
  if (!fs.existsSync(masterBadgePath)) {
    throw new Error('Master badge source image public/logo-app-badge.png not found');
  }

  console.log('1. Loading master badge source asset...');
  const masterBuf = fs.readFileSync(masterBadgePath);

  console.log('\n2. Generating public/favicon.svg (Vector SVG Favicon with high-definition art)...');
  const base64 = masterBuf.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254" width="100%" height="100%">
  <image width="1254" height="1254" href="data:image/png;base64,${base64}"/>
</svg>`;
  fs.writeFileSync(path.join(root, 'public', 'favicon.svg'), svgContent);
  console.log('✓ public/favicon.svg');

  console.log('\n3. Generating public/logo-icon.png (512×512 master transparent emblem)...');
  const master512 = await sharp(masterBuf)
    .resize(512, 512, { kernel: sharp.kernel.lanczos3, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(root, 'public', 'logo-icon.png'), master512);
  console.log('✓ public/logo-icon.png (512×512)');

  console.log('\n4. Generating multi-resolution favicons in public/favicons/ ...');
  const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];
  const icoPngBuffers = [];

  for (const size of FAVICON_SIZES) {
    const buf = await sharp(masterBuf)
      .resize(size, size, { kernel: sharp.kernel.lanczos3, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    const dest = path.join(faviconsDir, `favicon_${size}x${size}.png`);
    fs.writeFileSync(dest, buf);
    console.log(`✓ public/favicons/favicon_${size}x${size}.png (${size}×${size})`);

    if ([16, 32, 48, 64].includes(size)) {
      icoPngBuffers.push({ width: size, height: size, buffer: buf });
    }
  }

  console.log('\n5. Generating production multi-layer favicon.ico (16×16, 32×32, 48×48, 64×64)...');
  const icoData = createIco(icoPngBuffers);
  fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), icoData);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoData);
  console.log('✓ public/favicon.ico');
  console.log('✓ app/favicon.ico');

  console.log('\n6. Generating Apple touch icons & App Router static icons...');
  const applePng = await sharp(masterBuf)
    .resize(180, 180, { kernel: sharp.kernel.lanczos3, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(root, 'public', 'apple-touch-icon.png'), applePng);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), applePng);
  console.log('✓ public/apple-touch-icon.png (180×180)');
  console.log('✓ app/apple-icon.png (180×180)');

  const appIconPng = await sharp(masterBuf)
    .resize(512, 512, { kernel: sharp.kernel.lanczos3, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(appDir, 'icon.png'), appIconPng);
  console.log('✓ app/icon.png (512×512)');

  console.log('\n7. Generating PWA launcher icons (72 to 512px)...');
  const PWA_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
  for (const size of PWA_SIZES) {
    const pwaPng = await sharp(masterBuf)
      .resize(size, size, { kernel: sharp.kernel.lanczos3, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    const dest = path.join(iconsDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(dest, pwaPng);
    console.log(`✓ public/icons/icon-${size}x${size}.png (${size}×${size})`);
  }

  console.log('\n8. Generating resources/icon.png (1024×1024) and splash.png for Capacitor native builds...');
  const resPng = await sharp(masterBuf)
    .resize(1024, 1024, { kernel: sharp.kernel.lanczos3, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(resourcesDir, 'icon.png'), resPng);
  console.log('✓ resources/icon.png (1024×1024)');

  const resSplash = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(masterBuf)
          .resize(480, 480, { kernel: sharp.kernel.lanczos3, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        gravity: 'centre',
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(resourcesDir, 'splash.png'), resSplash);
  console.log('✓ resources/splash.png (1024×1024)');

  if (fs.existsSync(androidResDir)) {
    console.log('\n9. Generating Android mipmap launcher icons & adaptive layers...');
    const MIPMAP_DENSITIES = [
      { name: 'ldpi', size: 36, adaptiveSize: 81 },
      { name: 'mdpi', size: 48, adaptiveSize: 108 },
      { name: 'hdpi', size: 72, adaptiveSize: 162 },
      { name: 'xhdpi', size: 96, adaptiveSize: 216 },
      { name: 'xxhdpi', size: 144, adaptiveSize: 324 },
      { name: 'xxxhdpi', size: 192, adaptiveSize: 432 },
    ];

    for (const { name, size, adaptiveSize } of MIPMAP_DENSITIES) {
      const folder = path.join(androidResDir, `mipmap-${name}`);
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

      // Standard legacy launcher
      await sharp(masterBuf)
        .resize(size, size, { kernel: sharp.kernel.lanczos3, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(path.join(folder, 'ic_launcher.png'));

      // Round launcher with smooth circular clip
      const roundMask = Buffer.from(
        `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
      );
      await sharp(masterBuf)
        .resize(size, size, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
        .composite([{ input: roundMask, blend: 'dest-in' }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(folder, 'ic_launcher_round.png'));

      // Adaptive Background (clean solid white layer)
      await sharp({
        create: {
          width: adaptiveSize,
          height: adaptiveSize,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .png({ compressionLevel: 9 })
        .toFile(path.join(folder, 'ic_launcher_background.png'));

      // Adaptive Foreground (badge scaled to ~68% safe zone, centered)
      const badgeSize = Math.round(adaptiveSize * 0.68);
      const innerBadge = await sharp(masterBuf)
        .resize(badgeSize, badgeSize, {
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      await sharp({
        create: {
          width: adaptiveSize,
          height: adaptiveSize,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([{ input: innerBadge, gravity: 'centre' }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(folder, 'ic_launcher_foreground.png'));

      console.log(`✓ android mipmap-${name} (launcher, round, bg, & adaptive fg)`);
    }

    console.log('\n10. Generating Android splash screen drawables...');
    const SPLASH_SCREENS = [
      { folder: 'drawable', width: 320, height: 480, night: false },
      { folder: 'drawable-night', width: 320, height: 240, night: true },
      { folder: 'drawable-port-ldpi', width: 240, height: 320, night: false },
      { folder: 'drawable-port-mdpi', width: 320, height: 480, night: false },
      { folder: 'drawable-port-hdpi', width: 480, height: 800, night: false },
      { folder: 'drawable-port-xhdpi', width: 720, height: 1280, night: false },
      { folder: 'drawable-port-xxhdpi', width: 960, height: 1600, night: false },
      { folder: 'drawable-port-xxxhdpi', width: 1280, height: 1920, night: false },
      { folder: 'drawable-port-night-ldpi', width: 240, height: 320, night: true },
      { folder: 'drawable-port-night-mdpi', width: 320, height: 480, night: true },
      { folder: 'drawable-port-night-hdpi', width: 480, height: 800, night: true },
      { folder: 'drawable-port-night-xhdpi', width: 720, height: 1280, night: true },
      { folder: 'drawable-port-night-xxhdpi', width: 960, height: 1600, night: true },
      { folder: 'drawable-port-night-xxxhdpi', width: 1280, height: 1920, night: true },
      { folder: 'drawable-land-ldpi', width: 320, height: 240, night: false },
      { folder: 'drawable-land-mdpi', width: 480, height: 320, night: false },
      { folder: 'drawable-land-hdpi', width: 800, height: 480, night: false },
      { folder: 'drawable-land-xhdpi', width: 1280, height: 720, night: false },
      { folder: 'drawable-land-xxhdpi', width: 1600, height: 960, night: false },
      { folder: 'drawable-land-xxxhdpi', width: 1920, height: 1280, night: false },
      { folder: 'drawable-land-night-ldpi', width: 320, height: 240, night: true },
      { folder: 'drawable-land-night-mdpi', width: 480, height: 320, night: true },
      { folder: 'drawable-land-night-hdpi', width: 800, height: 480, night: true },
      { folder: 'drawable-land-night-xhdpi', width: 1280, height: 720, night: true },
      { folder: 'drawable-land-night-xxhdpi', width: 1600, height: 960, night: true },
      { folder: 'drawable-land-night-xxxhdpi', width: 1920, height: 1280, night: true },
    ];

    for (const { folder, width, height, night } of SPLASH_SCREENS) {
      const destDir = path.join(androidResDir, folder);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

      const minDim = Math.min(width, height);
      const splashLogoSize = Math.round(minDim * 0.42);

      const logoBuf = await sharp(masterBuf)
        .resize(splashLogoSize, splashLogoSize, {
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      const bg = night
        ? { r: 0, g: 26, b: 51, alpha: 1 } // Deep SVI Navy #001a33
        : { r: 255, g: 255, b: 255, alpha: 1 }; // Crisp White #ffffff

      await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: bg,
        },
      })
        .composite([{ input: logoBuf, gravity: 'centre' }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(destDir, 'splash.png'));
    }
    console.log('✓ android splash screens generated (all portrait, landscape, day, and night configurations)');
  }

  console.log('\n11. Generating manifest screenshots...');
  const SCREENSHOTS = [
    { src: 'hero1.png', out: 'hero1-1280x720.jpg' },
    { src: 'project1.png', out: 'project1-1280x720.jpg' },
    { src: 'house1.png', out: 'house1-1280x720.jpg' },
  ];
  for (const { src, out } of SCREENSHOTS) {
    const srcPath = path.join(root, 'public', 'images', src);
    if (fs.existsSync(srcPath)) {
      await sharp(srcPath)
        .resize(1280, 720, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 82 })
        .toFile(path.join(screenshotsDir, out));
      console.log(`✓ public/screenshots/${out}`);
    }
  }

  console.log('\nAll favicons, App Router icons, Android mipmaps, splash screens, and PWA assets generated successfully from uploaded badge.');
}

main().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
