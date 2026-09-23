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

describe('Mobile Sticky Dock & Header Interactive Upgrades', () => {
  it('applies dock-lux-item and min-h-[44px] touch target to all 4 mobile dock buttons in FloatingContact', () => {
    const fileContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/layout/FloatingContact.tsx'),
      'utf-8'
    );
    const matches = fileContent.match(/dock-lux-item/g);
    expect(matches).not.toBeNull();
    expect(matches?.length).toBe(4);

    // Ensure all 4 also retain min-h-[44px]
    const linesWithDockLux = fileContent
      .split('\n')
      .filter((line) => line.includes('dock-lux-item'));
    expect(linesWithDockLux.length).toBe(4);
    linesWithDockLux.forEach((line) => {
      expect(line).toContain('min-h-[44px]');
    });
  });

  it('applies touch-lux to the close button in MobileDrawerHeader', () => {
    const fileContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/layout/MobileDrawerHeader.tsx'),
      'utf-8'
    );
    expect(fileContent).toContain('touch-lux');
    expect(fileContent).toMatch(
      /<button[^>]*className="[^"]*touch-lux[^"]*"[^>]*aria-label=\{t\('closeMenu'\)\}/
    );
  });

  it('applies touch-lux to LanguageToggle and ThemeToggle', () => {
    const langContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ui/LanguageToggle.tsx'),
      'utf-8'
    );
    const themeContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ui/ThemeToggle.tsx'),
      'utf-8'
    );
    expect(langContent).toContain('touch-lux');
    expect(themeContent).toContain('touch-lux');
  });
});
