import { describe, it, expect } from 'vitest';
import { classifyOEE } from '../../hooks/useOEE';

describe('classifyOEE', () => {
  it('classifies world-class (>= 85)', () => {
    expect(classifyOEE(85)).toBe('world-class');
    expect(classifyOEE(90)).toBe('world-class');
    expect(classifyOEE(100)).toBe('world-class');
  });

  it('classifies excellent (75-84)', () => {
    expect(classifyOEE(75)).toBe('excellent');
    expect(classifyOEE(80)).toBe('excellent');
    expect(classifyOEE(84.9)).toBe('excellent');
  });

  it('classifies good (65-74)', () => {
    expect(classifyOEE(65)).toBe('good');
    expect(classifyOEE(70)).toBe('good');
    expect(classifyOEE(74.9)).toBe('good');
  });

  it('classifies acceptable (50-64)', () => {
    expect(classifyOEE(50)).toBe('acceptable');
    expect(classifyOEE(60)).toBe('acceptable');
    expect(classifyOEE(64.9)).toBe('acceptable');
  });

  it('classifies poor (< 50)', () => {
    expect(classifyOEE(0)).toBe('poor');
    expect(classifyOEE(30)).toBe('poor');
    expect(classifyOEE(49.9)).toBe('poor');
  });

  it('handles boundary values precisely', () => {
    expect(classifyOEE(84.99)).toBe('excellent');
    expect(classifyOEE(85.0)).toBe('world-class');
    expect(classifyOEE(74.99)).toBe('good');
    expect(classifyOEE(75.0)).toBe('excellent');
  });

  it('handles negative values', () => {
    expect(classifyOEE(-10)).toBe('poor');
  });
});
