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

// Official SVI Brand Palette extracted directly from public/logo.png
const NAVY = '#003560';
const GOLD = '#db8d3d';

/**
 * Generates the official SVI House Emblem SVG with precision geometry
 * matching public/logo.png from the Navbar pixel-for-pixel:
 * - Navy roof (#003560) apex at (35,4), eaves extending to (5,32) and (65,32)
 * - Crisp white interior fill (#ffffff) ensuring high visibility on dark and light browser tabs
 * - Navy left vertical pillar from y=31.5 to 53
 * - Gold right vertical pillar (#db8d3d) from y=31.5 to 53
 * - Gold bottom foundation bar (#db8d3d) spanning y=46 to 53
 * - 2x2 Navy center window panes (x=[24..29], [32..37], y=[26..31], [33.5..38.5])
 */
function createSviNavbarEmblemSvg({
  size = 512,
  includeBackground = false,
  backgroundColor = '#ffffff',
  padding = 0,
  round = false,
}) {
  const contentSize = size - padding * 2;
  const offset = padding;
  // Bounding box in source logo space is 70 x 58
  const scale = contentSize / 60;
  const transX = offset - (10 * scale);
  const transY = offset - (2 * scale);

  let bgElement = '';
  if (includeBackground) {
    if (round) {
      bgElement = `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${backgroundColor}" />`;
    } else {
      bgElement = `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${backgroundColor}" />`;
    }
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${bgElement}
  <g transform="translate(${transX}, ${transY}) scale(${scale})">
    <!-- House body white fill -->
    <polygon points="35,12 13,32 13,53 51,53 51,32" fill="#ffffff" />
    
    <!-- Dark Navy Roof -->
    <polygon points="35,4 65,32 57,32 35,12 13,32 5,32" fill="${NAVY}" />
    
    <!-- Left Wall Pillar (Navy) -->
    <rect x="13" y="31.5" width="5.5" height="21.5" fill="${NAVY}" />
    
    <!-- Right Wall Pillar (Gold) -->
    <rect x="45.5" y="31.5" width="5.5" height="21.5" fill="${GOLD}" />
    
    <!-- Bottom Foundation (Gold) -->
    <rect x="18.5" y="46" width="32.5" height="7" fill="${GOLD}" />
    
    <!-- 2x2 Windows (Navy) -->
    <rect x="24" y="26" width="5.5" height="5.5" rx="0.5" fill="${NAVY}" />
    <rect x="31.5" y="26" width="5.5" height="5.5" rx="0.5" fill="${NAVY}" />
    <rect x="24" y="33.5" width="5.5" height="5.5" rx="0.5" fill="${NAVY}" />
    <rect x="31.5" y="33.5" width="5.5" height="5.5" rx="0.5" fill="${NAVY}" />
  </g>
</svg>`;
}

/**
 * Creates multi-resolution ICO binary from PNG buffers.
 */
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Image size in bytes
    entry.writeUInt32LE(offset, 12); // Offset to image data
    dirEntries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((b) => b.buffer)]);
}

async function main() {
  console.log('1. Generating master vector SVG emblem (Navbar logo spec)...');
  const masterSvg = createSviNavbarEmblemSvg({ size: 512, includeBackground: false });
  fs.writeFileSync(path.join(root, 'public', 'favicon.svg'), masterSvg);
  console.log('✓ public/favicon.svg (Vector SVG Favicon)');

  console.log('\n2. Generating public/logo-icon.png (512×512 master transparent emblem)...');
  const masterPng = await sharp(Buffer.from(masterSvg)).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(root, 'public', 'logo-icon.png'), masterPng);
  console.log('✓ public/logo-icon.png (512×512)');

  console.log('\n3. Generating multi-resolution favicons in public/favicons/ ...');
  const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];
  const icoPngBuffers = [];

  for (const size of FAVICON_SIZES) {
    const sizeSvg = createSviNavbarEmblemSvg({ size, includeBackground: false });
    const buf = await sharp(Buffer.from(sizeSvg)).png({ compressionLevel: 9 }).toBuffer();
    const dest = path.join(faviconsDir, `favicon_${size}x${size}.png`);
    fs.writeFileSync(dest, buf);
    console.log(`✓ public/favicons/favicon_${size}x${size}.png (${size}×${size})`);

    if ([16, 32, 48, 64].includes(size)) {
      icoPngBuffers.push({ width: size, height: size, buffer: buf });
    }
  }

  console.log('\n4. Generating production multi-layer favicon.ico (16×16, 32×32, 48×48, 64×64)...');
  const icoData = createIco(icoPngBuffers);
  fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), icoData);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoData);
  console.log('✓ public/favicon.ico');
  console.log('✓ app/favicon.ico');

  console.log('\n5. Generating Apple touch icons & App Router static icons (Navbar Capsule Style)...');
  const appleSvg = createSviNavbarEmblemSvg({ size: 180, includeBackground: true, backgroundColor: '#ffffff', padding: 16 });
  const applePng = await sharp(Buffer.from(appleSvg)).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(root, 'public', 'apple-touch-icon.png'), applePng);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), applePng);
  console.log('✓ public/apple-touch-icon.png (180×180)');
  console.log('✓ app/apple-icon.png (180×180)');

  const appIconSvg = createSviNavbarEmblemSvg({ size: 512, includeBackground: false });
  const appIconPng = await sharp(Buffer.from(appIconSvg)).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(appDir, 'icon.png'), appIconPng);
  console.log('✓ app/icon.png (512×512)');

  console.log('\n6. Generating PWA launcher icons (72 to 512px)...');
  const PWA_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
  for (const size of PWA_SIZES) {
    const pwaSvg = createSviNavbarEmblemSvg({
      size,
      includeBackground: true,
      backgroundColor: '#ffffff',
      padding: Math.round(size * 0.12),
    });
    const pwaPng = await sharp(Buffer.from(pwaSvg)).png({ compressionLevel: 9 }).toBuffer();
    const dest = path.join(iconsDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(dest, pwaPng);
    console.log(`✓ public/icons/icon-${size}x${size}.png (${size}×${size})`);
  }

  console.log('\n7. Generating resources/icon.png (1024×1024) for Capacitor native builds...');
  const resSvg = createSviNavbarEmblemSvg({ size: 1024, includeBackground: true, backgroundColor: '#ffffff', padding: 120 });
  const resPng = await sharp(Buffer.from(resSvg)).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(resourcesDir, 'icon.png'), resPng);
  console.log('✓ resources/icon.png (1024×1024)');

  if (fs.existsSync(androidResDir)) {
    console.log('\n8. Generating Android mipmap launcher icons...');
    const MIPMAP_DENSITIES = [
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
      const launcherSvg = createSviNavbarEmblemSvg({ size, includeBackground: true, backgroundColor: '#ffffff', padding: Math.round(size * 0.12) });
      await sharp(Buffer.from(launcherSvg)).png().toFile(path.join(folder, 'ic_launcher.png'));

      // Round launcher
      const roundSvg = createSviNavbarEmblemSvg({ size, includeBackground: true, backgroundColor: '#ffffff', padding: Math.round(size * 0.12), round: true });
      await sharp(Buffer.from(roundSvg)).png().toFile(path.join(folder, 'ic_launcher_round.png'));

      // Adaptive foreground
      const fgSvg = createSviNavbarEmblemSvg({ size: adaptiveSize, includeBackground: false, padding: Math.round(adaptiveSize * 0.2) });
      await sharp(Buffer.from(fgSvg)).png().toFile(path.join(folder, 'ic_launcher_foreground.png'));

      console.log(`✓ android mipmap-${name} (launcher & adaptive foreground)`);
    }
  }

  console.log('\n9. Generating manifest screenshots...');
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

  console.log('\nAll favicons, App Router icons, Android mipmaps, and PWA assets generated successfully from Navbar logo.');
}

main().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
