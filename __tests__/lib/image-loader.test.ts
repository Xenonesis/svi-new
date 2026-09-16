import { describe, it, expect } from 'vitest';
import supabaseImageLoader from '@/src/lib/image-loader';

describe('supabaseImageLoader', () => {
  it('encodes spaces in local images with directories having spaces to prevent srcset parsing failures', () => {
    const result = supabaseImageLoader({
      src: '/Shivani Vatika/shivani vatika7.webp',
      width: 640,
    });
    expect(result).toBe('/Shivani%20Vatika/shivani%20vatika7-640w.webp');
    expect(result).not.toContain(' ');
  });

  it('handles already encoded URLs gracefully without double encoding', () => {
    const result = supabaseImageLoader({
      src: '/Shivani%20Vatika/shivani%20vatika7.webp',
      width: 320,
    });
    expect(result).toBe('/Shivani%20Vatika/shivani%20vatika7-320w.webp');
    expect(result).not.toContain('%2520');
  });
  it('selects safe responsive variants for Shivani Vatika 11', () => {
    const result = supabaseImageLoader({
      src: '/Shivani Vatika 11/gate.png',
      width: 640,
    });
    expect(result).toBe('/Shivani%20Vatika%2011/gate-640w.webp');
    expect(result).not.toContain(' ');
  });
  it('selects safe responsive variants for Shivani Vatika 11 webp source', () => {
    const result = supabaseImageLoader({
      src: '/Shivani Vatika 11/gate.webp',
      width: 640,
    });
    expect(result).toBe('/Shivani%20Vatika%2011/gate-640w.webp');
    expect(result).not.toContain(' ');
  });

  it('selects safe responsive variants for Shayam angan', () => {
    const result = supabaseImageLoader({
      src: '/Shayam angan/shyam angan.jpg',
      width: 1024,
    });
    expect(result).toBe('/Shayam%20angan/shyam%20angan-1024w.webp');
    expect(result).not.toContain(' ');
  });

  it('falls back to full-size webp for widths > 1024w', () => {
    const result = supabaseImageLoader({
      src: '/Shivani Vatika/shivani vatika7.webp',
      width: 1920,
    });
    expect(result).toBe('/Shivani%20Vatika/shivani%20vatika7.webp?w=1920');
  });

  it('serves full-size webp for hero background images', () => {
    const result = supabaseImageLoader({
      src: '/images/hero-desktop.png',
      width: 640,
    });
    expect(result).toBe('/images/hero-desktop.webp?w=640');
  });

  it('encodes non-responsive local images with spaces in path', () => {
    const result = supabaseImageLoader({
      src: '/some folder/sample image.png',
      width: 400,
    });
    expect(result).toBe('/some%20folder/sample%20image.png?w=400');
    expect(result).not.toContain(' ');
  });

  it('preserves query parameters on external CDN URLs', () => {
    const result = supabaseImageLoader({
      src: 'https://images.unsplash.com/photo-12345?auto=format',
      width: 800,
    });
    expect(result).toContain('w=800');
    expect(result).toContain('auto=format');
  });
});
