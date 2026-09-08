import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Global Motion Tokens & CSS Utilities', () => {
  const cssPath = path.resolve(process.cwd(), 'app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  it('defines the core luxury and tactile cubic-bezier easing curves', () => {
    expect(cssContent).toContain('0.22, 1, 0.36, 1'); // ease-luxury
    expect(cssContent).toContain('0.16, 1, 0.3, 1'); // ease-tactile
  });

  it('defines the universal .btn-tactile class with active scale', () => {
    expect(cssContent).toContain('.btn-tactile');
    expect(cssContent).toContain('transform: scale(0.975)');
    expect(cssContent).toContain('touch-action: manipulation');
  });

  it('guards desktop hover effects under (hover: hover) and (pointer: fine)', () => {
    expect(cssContent).toMatch(
      /@media\s*\(\s*hover:\s*hover\s*\)\s*and\s*\(\s*pointer:\s*fine\s*\)/
    );
    expect(cssContent).toContain('.hover-lift');
    expect(cssContent).toContain('.hover-lift-sm');
    expect(cssContent).toContain('.hover-gold-glow');
    expect(cssContent).toContain('.table-row-hover');
    expect(cssContent).toContain('.group-hover-nudge-x');
  });

  it('maintains prefers-reduced-motion overrides', () => {
    expect(cssContent).toContain('prefers-reduced-motion: reduce');
  });
});
