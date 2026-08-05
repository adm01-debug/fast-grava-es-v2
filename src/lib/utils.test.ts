import { describe, it, expect } from 'vitest';
import { cn, safeParseInt, safeParseFloat } from './utils';

describe('cn', () => {
  it('merges tailwind classes and dedupes conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', null, undefined, 'font-bold')).toBe('text-sm font-bold');
  });
});

describe('safeParseInt', () => {
  it('parses common integer strings', () => {
    expect(safeParseInt('42')).toBe(42);
    expect(safeParseInt('  -3  ')).toBe(-3);
    expect(safeParseInt('08')).toBe(8); // ensures radix 10
    expect(safeParseInt('0x10')).toBe(0); // hex is not treated as int
  });

  it('returns fallback for invalid/empty input', () => {
    expect(safeParseInt('')).toBe(0);
    expect(safeParseInt('not a number')).toBe(0);
    expect(safeParseInt(null)).toBe(0);
    expect(safeParseInt(undefined)).toBe(0);
    expect(safeParseInt({}, 99)).toBe(99);
    expect(safeParseInt(NaN, 7)).toBe(7);
  });

  it('truncates numbers passed directly', () => {
    expect(safeParseInt(3.9)).toBe(3);
    expect(safeParseInt(-3.9)).toBe(-3);
  });

  it('respects custom fallback', () => {
    expect(safeParseInt('abc', 10)).toBe(10);
    expect(safeParseInt('', -1)).toBe(-1);
  });
});

describe('safeParseFloat', () => {
  it('parses decimal numbers', () => {
    expect(safeParseFloat('3.14')).toBeCloseTo(3.14);
    expect(safeParseFloat('  -2.5 ')).toBeCloseTo(-2.5);
  });

  it('accepts BR-style decimal comma', () => {
    expect(safeParseFloat('3,14')).toBeCloseTo(3.14);
  });

  it('returns fallback for invalid input', () => {
    expect(safeParseFloat('')).toBe(0);
    expect(safeParseFloat('abc', 1.5)).toBe(1.5);
    expect(safeParseFloat(null)).toBe(0);
    expect(safeParseFloat(NaN, 9)).toBe(9);
  });

  it('passes through finite numbers', () => {
    expect(safeParseFloat(3.14)).toBeCloseTo(3.14);
    expect(safeParseFloat(Infinity, 0)).toBe(0);
  });
});
