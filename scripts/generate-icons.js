import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple script to copy logo as placeholder icons
// In production, you should generate proper sized icons

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const resourcesDir = path.join(__dirname, '..', 'resources');

if (!fs.existsSync(logoPath)) {
  console.error('Logo file not found at:', logoPath);
  process.exit(1);
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

console.log('Generating PWA & App icons from official logo.png...');

sizes.forEach((size) => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.copyFileSync(logoPath, iconPath);
  console.log(`✓ Created icon-${size}x${size}.png`);
});

fs.copyFileSync(logoPath, path.join(resourcesDir, 'icon.png'));
console.log('✓ Updated resources/icon.png');

console.log('\nNote: These are placeholder icons. For production, use proper resized icons.');
console.log(
  'Use an online tool like https://realfavicongenerator.net/pwa/ to generate optimized icons.'
);
