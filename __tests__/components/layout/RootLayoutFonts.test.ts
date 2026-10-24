import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('RootLayoutFonts', () => {
  it('does not preload Devanagari font when browsing English locale', () => {
    const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
    expect(layoutContent).toContain('preload: false');
  });
});
