import { describe, it, expect } from 'vitest';
import { calculateRealOEE } from '../oeeCalculations';
import { DbJob } from '@/hooks/useJobs';

describe('OEE Calculations (calculateRealOEE)', () => {
  it('should calculate OEE correctly for a standard set of finished jobs', () => {
    const mockJobs: Partial<DbJob>[] = [
      {
        id: '1',
        status: 'finished',
        actual_start_time: '2024-05-15T08:00:00Z',
        actual_end_time: '2024-05-15T15:00:00Z', // 7 hours = 420 mins
        estimated_duration: 360, // 6 hours = 360 mins
        produced_quantity: 1000,
        lost_pieces: 50,
      }
    ];

    const result = calculateRealOEE(mockJobs as DbJob[]);

    // totalActualMinutes = 420
    // totalEstimatedMinutes = 360
    // PLANNED_MINUTES_PER_DAY = 660 (11 * 60)
    // plannedMinutes = max(660, 360) = 660
    
    // availability = (420 / 660) * 100 = 63.6363...
    // performance = (360 / 420) * 100 = 85.7142...
    // quality = ((1000 - 50) / 1000) * 100 = 95.0
    
    // oee = (0.6363 * 0.8571 * 0.95) * 100 = 51.818...
    
    expect(result.availability).toBeCloseTo(63.6, 1);
    expect(result.performance).toBeCloseTo(85.7, 1);
    expect(result.quality).toBe(95.0);
    expect(result.oee).toBeCloseTo(51.8, 1);
  });

  it('should return 100 for availability/performance if no time elapsed', () => {
    const mockJobs: Partial<DbJob>[] = [];
    const result = calculateRealOEE(mockJobs as DbJob[]);
    
    expect(result.oee).toBe(100);
    expect(result.availability).toBe(100);
    expect(result.performance).toBe(100);
    expect(result.quality).toBe(100);
  });
});

