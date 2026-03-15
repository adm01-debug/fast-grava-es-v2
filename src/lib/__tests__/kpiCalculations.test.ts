import { describe, it, expect } from 'vitest';
import { calculateEstimatedTime, formatDuration } from '../../hooks/useKPIs';

describe('calculateEstimatedTime', () => {
  it('calculates basic time with defaults', () => {
    const result = calculateEstimatedTime({
      quantity: 100,
      techniqueSetupTime: 15,
    });
    // 15 setup + (100 * 30 * 1 * 1 * 1 / 60) = 15 + 50 = 65
    expect(result).toBe(65);
  });

  it('applies complexity factor', () => {
    const simple = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, complexityFactor: 1 });
    const complex = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, complexityFactor: 3 });
    expect(complex).toBeGreaterThan(simple);
    expect(complex).toBeCloseTo(simple * 3 - 20, -1); // roughly 3x production time
  });

  it('applies size multiplier', () => {
    const small = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, sizeMultiplier: 1 });
    const large = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, sizeMultiplier: 2 });
    expect(large).toBeGreaterThan(small);
  });

  it('applies color adjustment (15% per extra color)', () => {
    const oneColor = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, colorCount: 1 });
    const threeColors = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, colorCount: 3 });
    expect(threeColors).toBeGreaterThan(oneColor);
  });

  it('returns ceiling value', () => {
    const result = calculateEstimatedTime({ quantity: 1, techniqueSetupTime: 0 });
    expect(result).toBe(Math.ceil(result));
  });

  it('handles zero quantity', () => {
    const result = calculateEstimatedTime({ quantity: 0, techniqueSetupTime: 15 });
    expect(result).toBe(15);
  });

  it('handles zero setup time', () => {
    const result = calculateEstimatedTime({ quantity: 60, techniqueSetupTime: 0 });
    expect(result).toBeGreaterThan(0);
  });

  it('handles large quantities', () => {
    const result = calculateEstimatedTime({ quantity: 10000, techniqueSetupTime: 30 });
    expect(result).toBeGreaterThan(5000);
  });

  it('handles all parameters combined', () => {
    const result = calculateEstimatedTime({
      quantity: 500,
      techniqueSetupTime: 20,
      baseTimePerPiece: 45,
      colorCount: 4,
      complexityFactor: 2,
      sizeMultiplier: 1.5,
    });
    expect(result).toBeGreaterThan(0);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('formatDuration', () => {
  it('formats minutes under 60', () => {
    expect(formatDuration(30)).toBe('30min');
    expect(formatDuration(1)).toBe('1min');
    expect(formatDuration(59)).toBe('59min');
  });

  it('formats exact hours', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(300)).toBe('5h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(150)).toBe('2h 30min');
    expect(formatDuration(61)).toBe('1h 1min');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0min');
  });
});
