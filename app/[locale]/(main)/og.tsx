import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SVI Infra Solutions - Premium Real Estate Developer';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#1a2744',
        backgroundImage:
          'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
        backgroundSize: '40px 40px',
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Company Name */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#ffffff',
            fontFamily: 'serif',
            textAlign: 'center',
            lineHeight: '1.2',
          }}
        >
          SVI Infra Solutions
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            color: '#c9a84c',
            fontWeight: '600',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Premium Real Estate Developer
        </div>

        {/* Divider */}
        <div
          style={{
            width: '200px',
            height: '4px',
            backgroundColor: '#c9a84c',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        />

        {/* Locations */}
        <div
          style={{
            fontSize: '24px',
            color: '#e5e7eb',
            display: 'flex',
            gap: '30px',
            alignItems: 'center',
          }}
        >
          <span>Jaipur</span>
          <span style={{ color: '#c9a84c' }}>•</span>
          <span>Noida</span>
          <span style={{ color: '#c9a84c' }}>•</span>
          <span>Phulera Smart City</span>
        </div>

        {/* Website URL */}
        <div
          style={{
            fontSize: '20px',
            color: '#9ca3af',
            marginTop: '30px',
          }}
        >
          sviiinfrasolutions.com
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
