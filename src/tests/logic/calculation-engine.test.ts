import { describe, it, expect } from 'vitest';
import { calculateRealOEE } from '@/lib/oeeCalculations';

describe('OEE Calculation Logic', () => {
  it('should calculate 100% OEE for perfect matches', () => {
    const jobs = [{
      status: 'finished',
      actual_start_time: '2026-05-15T08:00:00Z',
      actual_end_time: '2026-05-15T09:00:00Z',
      estimated_duration: 60,
      quantity: 100,
      produced_quantity: 100,
      lost_pieces: 0
    }] as any;

    const result = calculateRealOEE(jobs);
    // Availability will depend on PLANNED_MINUTES_PER_DAY (11*60=660)
    // performance = (60/60)*100 = 100
    // quality = (100/100)*100 = 100
    expect(result.performance).toBe(100);
    expect(result.quality).toBe(100);
  });

  it('should handle zero jobs gracefully', () => {
    const result = calculateRealOEE([]);
    expect(result.oee).toBe(100);
  });

  it('should handle division by zero or invalid numbers', () => {
    const jobs = [{
      status: 'finished',
      actual_start_time: '2026-05-15T08:00:00Z',
      actual_end_time: '2026-05-15T08:00:00Z', // 0 minutes
      estimated_duration: 0,
      quantity: 0,
      lost_pieces: 10 // Lost more than quantity?
    }] as any;

    const result = calculateRealOEE(jobs);
    expect(result.oee).toBeDefined();
    expect(Number.isFinite(result.oee)).toBe(true);
  });

  it('should calculate performance drops when actual > estimated', () => {
    const jobs = [{
      status: 'finished',
      actual_start_time: '2026-05-15T08:00:00Z',
      actual_end_time: '2026-05-15T10:00:00Z', // 120 minutes
      estimated_duration: 60,
      quantity: 100,
      produced_quantity: 100,
      lost_pieces: 0
    }] as any;

    const result = calculateRealOEE(jobs);
    expect(result.performance).toBe(50);
  });
});
