import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  const heroPath = path.join(root, 'public', 'images', 'hero1.png');
  const badgePath = path.join(root, 'public', 'logo-app-badge.png');
  const outJpgPath = path.join(root, 'public', 'og-image.jpg');
  const outPngPath = path.join(root, 'public', 'og-image.png');

  console.log('Loading base hero image...');
  // Resize hero image to 1200x630 cover with subtle dimming
  const bgBuffer = await sharp(heroPath)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .toBuffer();

  // Resize logo badge to 140x140 for crystal clarity
  const badgeSize = 135;
  const badgeBuffer = await sharp(badgePath)
    .resize(badgeSize, badgeSize, { fit: 'contain' })
    .toBuffer();

  // Card dimensions: strictly placed inside the 630x630 center square
  // Center is x=600. Square crop bounds: x=285 to 915.
  // Card width: 540 (x: 330 to 870), nicely padded by 45px on each side of the square crop!
  const cardW = 540;
  const cardH = 510;
  const cardX = 330;
  const cardY = 60;
  const centerX = 600;

  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Cinematic backdrop gradient that keeps the villa visible on wings -->
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#070B14" stop-opacity="0.88"/>
        <stop offset="50%" stop-color="#070B14" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="#070B14" stop-opacity="0.55"/>
      </radialGradient>

      <!-- Gold gradient -->
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCE192"/>
        <stop offset="50%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#99730E"/>
      </linearGradient>

      <!-- Soft card drop shadow -->
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.65"/>
      </filter>
    </defs>

    <!-- Dark Vignette over panoramic photo -->
    <rect width="${width}" height="${height}" fill="url(#vignette)"/>

    <!-- Outer Decorative Border for wide screens -->
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="16" fill="none" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.2"/>

    <!-- CENTER SAFE-ZONE CARD (Width 540, centered at 600) -->
    <!-- Guaranteed 100% visible in WhatsApp 1:1 square crop (285px to 915px) -->
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="24"
      fill="#090E1B" fill-opacity="0.94"
      stroke="url(#goldGrad)" stroke-width="2" stroke-opacity="0.7"
      filter="url(#shadow)"/>

    <!-- Inner gold hairline -->
    <rect x="${cardX + 8}" y="${cardY + 8}" width="${cardW - 16}" height="${cardH - 16}" rx="18"
      fill="none" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.2"/>

    <!-- Top Trust Pill -->
    <g transform="translate(${centerX - 135}, ${cardY + 165})">
      <rect width="270" height="30" rx="15" fill="#D4AF37" fill-opacity="0.18" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.5"/>
      <circle cx="16" cy="15" r="4" fill="#FCE192"/>
      <text x="28" y="20" fill="#FCE192" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="1.2">
        17+ YEARS OF TRUST &amp; EXCELLENCE
      </text>
    </g>

    <!-- Company Name Headline -->
    <text x="${centerX}" y="${cardY + 235}" text-anchor="middle"
      fill="#FFFFFF" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" letter-spacing="0.5">
      SVI INFRA SOLUTIONS
    </text>

    <!-- Gold Tagline -->
    <text x="${centerX}" y="${cardY + 270}" text-anchor="middle"
      fill="url(#goldGrad)" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" letter-spacing="2">
      PREMIUM REAL ESTATE DEVELOPER
    </text>

    <!-- Gold Divider Bar with Diamond -->
    <g transform="translate(${centerX - 80}, ${cardY + 290})">
      <line x1="0" y1="0" x2="65" y2="0" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.6"/>
      <polygon points="80,-5 85,0 80,5 75,0" fill="#FCE192"/>
      <line x1="95" y1="0" x2="160" y2="0" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.6"/>
    </g>

    <!-- Key Offerings / Categories -->
    <text x="${centerX}" y="${cardY + 330}" text-anchor="middle"
      fill="#E2E8F0" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="600">
      Luxury Residential  •  Commercial Hubs  •  Townships
    </text>

    <!-- Prime Locations -->
    <text x="${centerX}" y="${cardY + 365}" text-anchor="middle"
      fill="#94A3B8" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500" letter-spacing="0.5">
      Jaipur  •  Noida  •  Phulera Smart City  •  DMIC
    </text>

    <!-- Bottom Credential / RERA Badge -->
    <g transform="translate(${centerX - 220}, ${cardY + 400})">
      <rect width="440" height="42" rx="10" fill="#131C2E" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
      <text x="220" y="26" text-anchor="middle" fill="#CBD5E1" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">
        ✓ JDA Approved &amp; RERA Registered Projects
      </text>
    </g>

    <!-- Official Website Footer Pill -->
    <g transform="translate(${centerX - 120}, ${cardY + 458})">
      <rect width="240" height="28" rx="8" fill="#D4AF37" fill-opacity="0.2" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.4"/>
      <text x="120" y="19" text-anchor="middle" fill="#FCE192" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" letter-spacing="0.5">
        sviinfrasolutions.com
      </text>
    </g>
  </svg>
  `;

  console.log('Compositing layers with sharp...');
  // Badge positioned at top center of the card:
  // cardX = 330, cardW = 540, center = 600.
  // Badge size = 135 -> left = 600 - (135/2) = 532.5 -> 532.
  // top = cardY + 20 = 80.
  const badgeLeft = Math.round(centerX - badgeSize / 2);
  const badgeTop = cardY + 18;

  const compositeLayers = [
    { input: Buffer.from(svgOverlay), top: 0, left: 0 },
    { input: badgeBuffer, top: badgeTop, left: badgeLeft },
  ];

  // Generate high-resolution JPEG (< 250KB for fast WhatsApp crawl)
  await sharp(bgBuffer)
    .composite(compositeLayers)
    .jpeg({ quality: 90, progressive: true })
    .toFile(outJpgPath);

  // Also generate PNG version
  await sharp(bgBuffer)
    .composite(compositeLayers)
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(outPngPath);

  const jpgStats = fs.statSync(outJpgPath);
  const pngStats = fs.statSync(outPngPath);

  console.log(`Generated: public/og-image.jpg (${Math.round(jpgStats.size / 1024)} KB)`);
  console.log(`Generated: public/og-image.png (${Math.round(pngStats.size / 1024)} KB)`);
}

generateOgImage().catch(console.error);
