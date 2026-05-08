import { describe, it, expect } from 'vitest';
import { calculateEstimatedTime, formatDuration } from '../useKPIs';

describe('useKPIs utility functions', () => {
  describe('calculateEstimatedTime', () => {
    it('should calculate time correctly with base values', () => {
      const result = calculateEstimatedTime({
        quantity: 100,
        techniqueSetupTime: 20,
        baseTimePerPiece: 30, // 3000 seconds = 50 mins
      });
      // 20 + 50 = 70
      expect(result).toBe(70);
    });

    it('should handle complexity factors', () => {
      const result = calculateEstimatedTime({
        quantity: 100,
        techniqueSetupTime: 20,
        baseTimePerPiece: 30,
        complexityFactor: 2, // 6000 seconds = 100 mins
      });
      // 20 + 100 = 120
      expect(result).toBe(120);
    });

    it('should handle multiple colors', () => {
      const result = calculateEstimatedTime({
        quantity: 100,
        techniqueSetupTime: 20,
        baseTimePerPiece: 30,
        colorCount: 3, // 1 + (3-1)*0.15 = 1.3x
      });
      // 50 * 1.3 = 65
      // 20 + 65 = 85
      expect(result).toBe(85);
    });

    it('should handle zero quantity', () => {
      const result = calculateEstimatedTime({
        quantity: 0,
        techniqueSetupTime: 15,
      });
      expect(result).toBe(15);
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

