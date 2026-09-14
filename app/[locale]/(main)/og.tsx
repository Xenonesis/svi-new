import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export const alt = 'SVI Infra Solutions - Premium Real Estate Developer';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const filePath = path.join(process.cwd(), 'public', 'og-image.png');
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  }

  // Fallback if static image is not on disk
  const { ImageResponse } = await import('next/og');
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#080D18',
        color: '#ffffff',
      }}
    >
      <div style={{ fontSize: 52, fontWeight: 800, color: '#ffffff' }}>SVI INFRA SOLUTIONS</div>
      <div style={{ fontSize: 26, color: '#D4AF37', marginTop: 16 }}>
        Premium Real Estate &amp; Integrated Townships
      </div>
    </div>,
    {
      ...size,
    }
  );
}
