import { describe, it, expect } from 'vitest';
import { formatSeconds } from '@/src/components/admin/leads/telecallingTypes';

describe('formatSeconds', () => {
  it('formats 0 or negative seconds as 0s', () => {
    expect(formatSeconds(0)).toBe('0s');
    expect(formatSeconds(-10)).toBe('0s');
  });

  it('formats pure seconds correctly', () => {
    expect(formatSeconds(45)).toBe('45s');
  });

  it('formats minutes and seconds correctly', () => {
    expect(formatSeconds(125)).toBe('2m 5s');
  });

  it('formats hours and minutes correctly', () => {
    expect(formatSeconds(3665)).toBe('1h 1m');
  });
});
