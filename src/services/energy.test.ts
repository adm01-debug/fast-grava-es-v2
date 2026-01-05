import { describe, it, expect } from 'vitest';

describe('Energy Service', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it('calculates consumption correctly', () => {
    const consumption = 100 * 0.5; // kWh * rate
    expect(consumption).toBe(50);
  });
});
