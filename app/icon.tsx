import { ImageResponse } from 'next/og';

export const size = {
  width: 192,
  height: 192,
};
export const contentType = 'image/png';
export const runtime = 'edge';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <img
        src="https://www.sviinfrasolutions.com/logo.png"
        alt="SVI Infra Solutions Logo"
        width="192"
        height="192"
        style={{
          objectFit: 'contain',
        }}
      />
    </div>,
    {
      ...size,
    }
  );
}
