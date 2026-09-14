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
  // Resize hero image to 1200x630 cover
  const bgBuffer = await sharp(heroPath)
    .resize(width, height, { fit: 'cover', position: 'right top' })
    .toBuffer();

  // Resize logo badge to 110x110
  const badgeBuffer = await sharp(badgePath)
    .resize(110, 110, { fit: 'contain' })
    .toBuffer();

  // Create luxury overlay SVG with typography and branding
  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Deep luxury dark vignette gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#080D18" stop-opacity="0.96"/>
        <stop offset="42%" stop-color="#090E1B" stop-opacity="0.92"/>
        <stop offset="68%" stop-color="#0B1324" stop-opacity="0.75"/>
        <stop offset="85%" stop-color="#0B1324" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#080D18" stop-opacity="0.25"/>
      </linearGradient>

      <!-- Gold accent gradient -->
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F7D070"/>
        <stop offset="50%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#AA820A"/>
      </linearGradient>
    </defs>

    <!-- Gradient Background Mask over Hero Photo -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>

    <!-- Subtle Luxury Border -->
    <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="16" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-opacity="0.25"/>

    <!-- Top Badge / Experience Pill -->
    <g transform="translate(205, 68)">
      <rect width="285" height="32" rx="16" fill="#D4AF37" fill-opacity="0.15" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.4"/>
      <circle cx="16" cy="16" r="4" fill="#F7D070"/>
      <text x="30" y="21" fill="#F7D070" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="700" letter-spacing="1.2">
        17+ YEARS OF REAL ESTATE TRUST
      </text>
    </g>

    <!-- Corporate Entity Name -->
    <text x="205" y="132" fill="#FFFFFF" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" letter-spacing="0.5">
      SVI INFRA SOLUTIONS
    </text>
    <text x="205" y="156" fill="#94A3B8" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500" letter-spacing="1">
      PVT. LTD. • RERA APPROVED DEVELOPER
    </text>

    <!-- Main Value Proposition Headline -->
    <text x="70" y="245" fill="#FFFFFF" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" line-height="1.2">
      Premium Real Estate &amp;
    </text>
    <text x="70" y="302" fill="url(#goldGrad)" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800">
      Integrated Townships
    </text>

    <!-- Gold Accent Line -->
    <rect x="70" y="330" width="90" height="4" rx="2" fill="url(#goldGrad)"/>

    <!-- Key Highlights / Feature Badges -->
    <g transform="translate(70, 360)">
      <!-- Pill 1 -->
      <rect x="0" y="0" width="225" height="42" rx="10" fill="#1E293B" fill-opacity="0.75" stroke="#334155" stroke-width="1"/>
      <text x="16" y="26" fill="#F1F5F9" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600">
        ✓ Luxury Residential
      </text>

      <!-- Pill 2 -->
      <rect x="237" y="0" width="235" height="42" rx="10" fill="#1E293B" fill-opacity="0.75" stroke="#334155" stroke-width="1"/>
      <text x="16" y="26" fill="#F1F5F9" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" transform="translate(237, 0)">
        ✓ Commercial Hubs
      </text>

      <!-- Pill 3 -->
      <rect x="484" y="0" width="215" height="42" rx="10" fill="#1E293B" fill-opacity="0.75" stroke="#334155" stroke-width="1"/>
      <text x="16" y="26" fill="#F1F5F9" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" transform="translate(484, 0)">
        ✓ Smart Townships
      </text>
    </g>

    <!-- Strategic Location Footprint -->
    <g transform="translate(70, 440)">
      <text x="0" y="0" fill="#D4AF37" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="2">
        STRATEGIC LOCATIONS
      </text>
      <text x="0" y="28" fill="#E2E8F0" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="600">
        Jaipur  •  Noida  •  Phulera Smart City  •  DMIC Corridor
      </text>
    </g>

    <!-- Bottom Bar: Verified Badge & Website URL -->
    <g transform="translate(70, 530)">
      <rect width="1060" height="48" rx="12" fill="#0F172A" fill-opacity="0.85" stroke="#334155" stroke-width="1"/>
      
      <!-- Trust metric -->
      <text x="24" y="30" fill="#F7D070" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">
        ★ 5,000+ Happy Families
      </text>
      <text x="215" y="30" fill="#64748B" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="14">|</text>
      <text x="235" y="30" fill="#94A3B8" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500">
        RERA Registered &amp; JDA Approved Projects
      </text>

      <!-- URL Badge -->
      <g transform="translate(805, 8)">
        <rect width="235" height="32" rx="8" fill="#D4AF37" fill-opacity="0.2" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.5"/>
        <text x="18" y="21" fill="#FFFFFF" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" letter-spacing="0.5">
          sviinfrasolutions.com
        </text>
      </g>
    </g>
  </svg>
  `;

  console.log('Compositing layers with sharp...');
  const compositeLayers = [
    { input: Buffer.from(svgOverlay), top: 0, left: 0 },
    { input: badgeBuffer, top: 62, left: 70 },
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
