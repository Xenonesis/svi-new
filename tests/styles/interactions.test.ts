import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Quiet Luxury CSS Tokens', () => {
  it('defines required luxury interaction classes in globals.css', () => {
    const cssContent = fs.readFileSync(path.resolve(process.cwd(), 'app/globals.css'), 'utf-8');

    expect(cssContent).toContain('.touch-lux');
    expect(cssContent).toContain('.card-lux-hover');
    expect(cssContent).toContain('.btn-lux-primary');
    expect(cssContent).toContain('.btn-lux-outline');
    expect(cssContent).toContain('.dock-lux-item');
    expect(cssContent).toContain('(hover: hover) and (pointer: fine)');
  });

  it('enforces luxury cubic-bezier easing curve', () => {
    const cssContent = fs.readFileSync(path.resolve(process.cwd(), 'app/globals.css'), 'utf-8');
    expect(cssContent).toContain('cubic-bezier(0.22, 1, 0.36, 1)');
  });

  it('scopes hover elevation inside media query for hover and pointer fine', () => {
    const cssContent = fs.readFileSync(path.resolve(process.cwd(), 'app/globals.css'), 'utf-8');
    expect(cssContent).toMatch(
      /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)\s*\{[^}]*\.card-lux-hover:hover/s
    );
    expect(cssContent).toMatch(
      /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)\s*\{[^}]*\.btn-lux-primary:hover/s
    );
    expect(cssContent).toMatch(
      /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)\s*\{[^}]*\.btn-lux-outline:hover/s
    );
  });
});
