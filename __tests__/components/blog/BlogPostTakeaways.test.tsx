import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BlogPostTakeaways } from '@/src/components/blog/BlogPostTakeaways';

describe('BlogPostTakeaways', () => {
  it('returns null when takeaways is undefined, null, or empty array', () => {
    const { container: c1 } = render(<BlogPostTakeaways />);
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(<BlogPostTakeaways takeaways={[]} />);
    expect(c2.firstChild).toBeNull();

    const { container: c3 } = render(<BlogPostTakeaways takeaways={null} />);
    expect(c3.firstChild).toBeNull();
  });

  it('renders English heading "Key Takeaways" by default', () => {
    const takeaways = ['First takeaway', 'Second takeaway'];
    render(<BlogPostTakeaways takeaways={takeaways} />);

    expect(screen.getByRole('heading', { level: 3, name: /Key Takeaways/i })).toBeDefined();
    expect(screen.getByText('First takeaway')).toBeDefined();
    expect(screen.getByText('Second takeaway')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('renders Hindi heading "ज़रूरी बातें" when isHindi is true or locale is "hi"', () => {
    const takeaways = ['पहला बिंदु', 'दूसरा बिंदु'];
    const { rerender } = render(<BlogPostTakeaways takeaways={takeaways} isHindi={true} />);

    expect(screen.getByRole('heading', { level: 3, name: /ज़रूरी बातें/i })).toBeDefined();
    expect(screen.getByText('पहला बिंदु')).toBeDefined();
    expect(screen.getByText('दूसरा बिंदु')).toBeDefined();

    rerender(<BlogPostTakeaways takeaways={takeaways} locale="hi" />);
    expect(screen.getByRole('heading', { level: 3, name: /ज़रूरी बातें/i })).toBeDefined();
  });

  it('renders correct number badges corresponding to item index', () => {
    const takeaways = ['Point A', 'Point B', 'Point C'];
    render(<BlogPostTakeaways takeaways={takeaways} />);

    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });
});
