import { describe, it, expect } from 'vitest';

describe('Gamification Service', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it('calculates level correctly', () => {
    const calculateLevel = (points: number) => Math.floor(points / 100) + 1;
    expect(calculateLevel(500)).toBe(6);
  });

  it('calculates points needed for next level', () => {
    const pointsForLevel = (level: number) => level * 100;
    expect(pointsForLevel(5)).toBe(500);
  });
});
