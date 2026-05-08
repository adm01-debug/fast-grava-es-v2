import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateEstimatedTime, formatDuration } from '../useKPIs';

describe('useKPIs utils', () => {
  describe('calculateEstimatedTime', () => {
    it('should calculate base time correctly', () => {
      const result = calculateEstimatedTime({
        quantity: 100,
        techniqueSetupTime: 15,
        baseTimePerPiece: 30, // 3000 seconds = 50 mins
      });
      // 15 setup + 50 production = 65
      expect(result).toBe(65);
    });

    it('should apply complexity factor', () => {
      const result = calculateEstimatedTime({
        quantity: 100,
        techniqueSetupTime: 10,
        baseTimePerPiece: 60, // 6000 seconds = 100 mins
        complexityFactor: 2, // 200 mins
      });
      expect(result).toBe(210);
    });

    it('should apply color adjustment', () => {
      // 100 pieces * 60s = 6000s = 100 mins
      // 2 colors = 1 + (2-1)*0.15 = 1.15
      // 100 * 1.15 = 115 mins
      // 115 + 10 setup = 125
      const result = calculateEstimatedTime({
        quantity: 100,
        techniqueSetupTime: 10,
        baseTimePerPiece: 60,
        colorCount: 2,
      });
      expect(result).toBe(125);
    });

    it('should handle zero quantity', () => {
      const result = calculateEstimatedTime({
        quantity: 0,
        techniqueSetupTime: 20,
      });
      expect(result).toBe(20);
    });
  });

  describe('formatDuration', () => {
    it('should format minutes correctly', () => {
      expect(formatDuration(45)).toBe('45min');
    });

    it('should format hours correctly', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
    });

    it('should format hours and minutes correctly', () => {
      expect(formatDuration(75)).toBe('1h 15min');
      expect(formatDuration(150)).toBe('2h 30min');
    });
  });
});
