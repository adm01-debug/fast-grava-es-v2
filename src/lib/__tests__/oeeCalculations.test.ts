import { describe, it, expect } from 'vitest';
import { calculateOEE, calculateAvailability, calculatePerformance, calculateQuality } from '../oeeCalculations';

describe('OEE Calculations', () => {
  describe('calculateAvailability', () => {
    it('should calculate availability correctly', () => {
      // 480 min total, 60 min downtime = 420 min runtime
      // Availability = 420 / 480 = 0.875
      expect(calculateAvailability(480, 60)).toBeCloseTo(0.875);
    });

    it('should return 0 if total time is 0', () => {
      expect(calculateAvailability(0, 0)).toBe(0);
    });

    it('should not return negative availability', () => {
      expect(calculateAvailability(100, 150)).toBe(0);
    });
  });

  describe('calculatePerformance', () => {
    it('should calculate performance correctly', () => {
      // Ideal rate: 10 units/min
      // Total units: 3500
      // Runtime: 420 min
      // Expected units: 420 * 10 = 4200
      // Performance: 3500 / 4200 = 0.8333
      expect(calculatePerformance(3500, 420, 10)).toBeCloseTo(0.8333, 4);
    });

    it('should return 0 if runtime or ideal rate is 0', () => {
      expect(calculatePerformance(100, 0, 10)).toBe(0);
      expect(calculatePerformance(100, 420, 0)).toBe(0);
    });
  });

  describe('calculateQuality', () => {
    it('should calculate quality correctly', () => {
      // Total: 3500, Good: 3400
      // Quality: 3400 / 3500 = 0.9714
      expect(calculateQuality(3400, 3500)).toBeCloseTo(0.9714, 4);
    });

    it('should return 0 if total units is 0', () => {
      expect(calculateQuality(0, 0)).toBe(0);
    });
  });

  describe('calculateOEE', () => {
    it('should calculate overall OEE correctly', () => {
      const availability = 0.875;
      const performance = 0.8333;
      const quality = 0.9714;
      // OEE = 0.875 * 0.8333 * 0.9714 = 0.7082
      expect(calculateOEE(availability, performance, quality)).toBeCloseTo(0.7082, 3);
    });
  });
});
