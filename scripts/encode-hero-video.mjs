#!/usr/bin/env node
/**
 * Hero Video Optimization Helper
 *
 * This script DOCUMENTS the FFmpeg commands needed to encode
 * the hero video into AV1/VP9/H.264 variants.
 *
 * Prerequisites:
 *   - FFmpeg installed: https://ffmpeg.org/download.html
 *   - Source file: public/a svi 1.mp4 (currently 64 MB H.264)
 *
 * Run EACH command below in your terminal from the project root.
 * After encoding, update HeroSection.tsx to use the <video> element
 * with multiple <source> tags (see the template at the bottom).
 *
 * Expected output sizes (64 MB → ~5-10 MB total across all variants):
 *   hero-poster.webp  ~  80-120 KB
 *   hero.h264.mp4     ~ 10-15 MB  (360p + 720p)
 *   hero.vp9.webm     ~  5-8 MB
 *   hero.av1.mp4      ~  3-6 MB
 */

const VIDEO_SRC = 'public/a svi 1.mp4';
const POSTER_OUT = 'public/images/hero-poster.webp';

const commands = [
  {
    label: '1. Extract poster frame (frame at 2s, WebP quality 70)',
    cmd: `ffmpeg -ss 00:00:02 -i "${VIDEO_SRC}" -vframes 1 -q:v 70 ${POSTER_OUT}`,
    note: 'Target: < 100 KB',
  },
  {
    label: '2. H.264 720p — universal fallback',
    cmd: `ffmpeg -i "${VIDEO_SRC}" -vf scale=1280:720 -c:v libx264 -b:v 1500k -c:a aac -b:a 128k -movflags +faststart public/hero.h264.mp4`,
    note: 'Target: ~8-12 MB for a typical 30s clip',
  },
  {
    label: '3. VP9 720p — good compression, broad support',
    cmd: `ffmpeg -i "${VIDEO_SRC}" -vf scale=1280:720 -c:v libvpx-vp9 -b:v 0 -crf 33 -c:a libopus -b:a 128k public/hero.vp9.webm`,
    note: 'Target: ~4-8 MB',
  },
  {
    label: '4. AV1 720p — best compression (requires libaom or libsvtav1)',
    cmd: `ffmpeg -i "${VIDEO_SRC}" -vf scale=1280:720 -c:v libsvtav1 -crf 35 -preset 8 -c:a libopus -b:a 128k "public/hero.av1.mp4"`,
    note: 'Target: ~2-5 MB. Use libsvtav1 for speed; libaom-av1 for best quality but slow',
  },
];

console.log('\n🎬  Hero Video Optimization Commands\n');
console.log('='.repeat(70));
console.log(`Source: ${VIDEO_SRC} (currently ~64 MB)`);
console.log('='.repeat(70) + '\n');

for (const { label, cmd, note } of commands) {
  console.log(`📌  ${label}`);
  if (note) console.log(`    ℹ️  ${note}`);
  console.log(`\n    $ ${cmd}\n`);
}

console.log('='.repeat(70));
console.log('\n📝  After encoding, replace the video usage with:\n');
console.log(`
<video
  preload="metadata"
  poster="/images/hero-poster.webp"
  muted
  playsInline
  autoPlay={false}
  ref={videoRef}
  // Use IntersectionObserver to call videoRef.current?.play() when in viewport
>
  {/* AV1 — best compression */}
  <source src="/hero.av1.mp4" type='video/mp4; codecs="av01.0.05M.08"' />
  {/* VP9 — broad support */}
  <source src="/hero.vp9.webm" type="video/webm; codecs=vp9" />
  {/* H.264 — universal fallback */}
  <source src="/hero.h264.mp4" type="video/mp4" />
</video>
`);
console.log('='.repeat(70) + '\n');
