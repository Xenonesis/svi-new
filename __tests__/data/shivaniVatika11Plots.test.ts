import { describe, it, expect } from 'vitest';
import {
  SHIVANI_VATIKA_11_PLOTS,
  normalizeUnitNumber,
  parseCompoundUnitNumbers,
} from '@/src/data/shivaniVatika11Plots';

describe('shivaniVatika11Plots dataset', () => {
  it('contains exactly 230 demarcated units', () => {
    expect(SHIVANI_VATIKA_11_PLOTS.length).toBe(230);
  });

  it('includes residential, A-Block, and commercial units', () => {
    const blocks = new Set(SHIVANI_VATIKA_11_PLOTS.map((p) => p.block));
    expect(blocks.has('Residential')).toBe(true);
    expect(blocks.has('A-Block')).toBe(true);
    expect(blocks.has('Commercial')).toBe(true);
  });

  it('has correct block breakdown: 168 Residential, 50 A-Block, and 12 Commercial', () => {
    const residential = SHIVANI_VATIKA_11_PLOTS.filter((p) => p.block === 'Residential');
    const aBlock = SHIVANI_VATIKA_11_PLOTS.filter((p) => p.block === 'A-Block');
    const commercial = SHIVANI_VATIKA_11_PLOTS.filter((p) => p.block === 'Commercial');

    expect(residential.length).toBe(168);
    expect(aBlock.length).toBe(50);
    expect(commercial.length).toBe(12);
  });

  it('has valid positive size and price estimates for all plots', () => {
    SHIVANI_VATIKA_11_PLOTS.forEach((plot) => {
      expect(plot.sizeSqYd).toBeGreaterThan(0);
      expect(plot.priceEstimate).toBeGreaterThan(0);
      expect(plot.plotNo).toBeDefined();
      expect(typeof plot.plotNo).toBe('string');
      expect(plot.plotNo.length).toBeGreaterThan(0);
      expect(plot.dimensions).toBeDefined();
      expect(plot.roadWidth).toBeDefined();
      expect(['East', 'North', 'West', 'South', 'Park Facing', 'Corner', 'Highway']).toContain(
        plot.facing
      );
      expect(['AVAILABLE', 'BOOKED', 'RESERVED']).toContain(plot.status);
    });
  });

  it('normalizes unit numbers correctly', () => {
    expect(normalizeUnitNumber('Plot #32')).toBe('32');
    expect(normalizeUnitNumber('Unit 31')).toBe('31');
    expect(normalizeUnitNumber(' A-15 ')).toBe('a-15');
    expect(normalizeUnitNumber('Plot#32')).toBe('32');
    expect(normalizeUnitNumber('Shop-1')).toBe('shop-1');
  });

  it('parses compound unit strings correctly', () => {
    expect(parseCompoundUnitNumbers('126+127')).toEqual(['126', '127']);
    expect(parseCompoundUnitNumbers('94,95')).toEqual(['94', '95']);
    expect(parseCompoundUnitNumbers('32')).toEqual(['32']);
    expect(parseCompoundUnitNumbers('Plot #126 & Unit 127')).toEqual(['126', '127']);
    expect(parseCompoundUnitNumbers('A-181 and 182')).toEqual(['a-181', '182']);
  });
});
