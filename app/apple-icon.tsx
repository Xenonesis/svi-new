import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white', // Apple icons look better with a solid background
      }}
    >
      <img
        src="https://www.sviinfrasolutions.com/logo.png"
        alt="SVI Infra Solutions Logo"
        width="160" // Give a little padding for Apple icons
        height="160"
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
