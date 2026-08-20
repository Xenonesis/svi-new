import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.join(__dirname, '..');
const logoPath = path.join(root, 'public', 'logo.png');
const iconsDir = path.join(root, 'public', 'icons');
const faviconsDir = path.join(root, 'public', 'favicons');
const screenshotsDir = path.join(root, 'public', 'screenshots');
const resourcesDir = path.join(root, 'resources');

// PWA icon sizes. Every icon is a real square; the logo is centered on a
// solid background at LOGO_WIDTH_RATIO of the canvas, which keeps it inside
// the 80% maskable safe zone for all launcher shapes.
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const LOGO_WIDTH_RATIO = 0.68;
const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };

// Manifest screenshot sources -> 16:9 wide output (JPEG q82, photo content).
const SCREENSHOTS = [
  { src: 'hero1.png', out: 'hero1-1280x720.jpg' },
  { src: 'project1.png', out: 'project1-1280x720.jpg' },
  { src: 'house1.png', out: 'house1-1280x720.jpg' },
];

// Favicons stored as JPEG bytes under a .png name while metadata declares
// image/png — re-encode them as true PNGs.
const JPEG_FAVICONS = ['favicon_48x48.png', 'favicon_64x64.png', 'favicon_128x128.png', 'favicon_256x256.png'];

for (const dir of [iconsDir, screenshotsDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

if (!fs.existsSync(logoPath)) {
  console.error('Logo file not found at:', logoPath);
  process.exit(1);
}

console.log('Generating PWA & app icons from official logo.png...');

for (const size of ICON_SIZES) {
  const logo = await sharp(logoPath).resize({ width: Math.round(size * LOGO_WIDTH_RATIO), fit: 'inside' }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
  console.log(`✓ icon-${size}x${size}.png (${size}×${size})`);
}

// resources/icon.png feeds the Capacitor native app icon pipeline (needs 1024²).
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: BACKGROUND } })
  .composite([{ input: await sharp(logoPath).resize({ width: Math.round(1024 * LOGO_WIDTH_RATIO), fit: 'inside' }).toBuffer(), gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(resourcesDir, 'icon.png'));
console.log('✓ resources/icon.png (1024×1024)');

// Compact mark icon extracted from logo.png for collapsed sidebars & compact UI
const croppedMark = await sharp(logoPath)
  .extract({ left: 6, top: 4, width: 60, height: 50 })
  .toBuffer();

await sharp({
  create: {
    width: 256,
    height: 256,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    {
      input: await sharp(croppedMark).resize({ width: 200, height: 167, fit: 'inside' }).toBuffer(),
      gravity: 'center',
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, 'public', 'logo-icon.png'));
console.log('✓ public/logo-icon.png (256×256 compact emblem)');

console.log('Converting JPEG-content favicons to true PNGs...');
for (const f of JPEG_FAVICONS) {
  const target = path.join(faviconsDir, f);
  const tmp = path.join(faviconsDir, `.${f}.tmp`);
  const png = await sharp(target).png().toBuffer();
  fs.writeFileSync(tmp, png);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      fs.renameSync(tmp, target);
      break;
    } catch {
      if (attempt === 4) throw new Error(`Could not replace ${f} — file is locked (Windows)`);
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  console.log(`✓ ${f} re-encoded as PNG`);
}

console.log('Generating 1280×720 manifest screenshots...');
for (const { src, out } of SCREENSHOTS) {
  const srcPath = path.join(root, 'public', 'images', src);
  await sharp(srcPath).resize(1280, 720, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82 }).toFile(path.join(screenshotsDir, out));
  console.log(`✓ ${out}`);
}

console.log('\nDone. All PWA icons are true squares; screenshots are 1280×720 JPEG.');
