import { describe, it, expect } from 'vitest';
import { calculateRealOEE } from '../oeeCalculations';
import { DbJob } from '@/hooks/useJobs';

describe('calculateRealOEE', () => {
  const mockBaseJob: Partial<DbJob> = {
    id: '1',
    status: 'finished',
    quantity: 100,
    produced_quantity: 100,
    estimated_duration: 60,
    actual_start_time: '2024-01-01T08:00:00Z',
    actual_end_time: '2024-01-01T09:00:00Z',
    lost_pieces: 0,
  };

  it('calculates 100% OEE correctly for a perfect scenario', () => {
    const jobs = [mockBaseJob as DbJob];
    const result = calculateRealOEE(jobs);
    
    expect(result.performance).toBe(100);
    expect(result.quality).toBe(100);
    expect(result.availability).toBeCloseTo(9.1, 1);
    expect(result.oee).toBeCloseTo(9.1, 1);
  });

  it('calculates performance correctly when actual time exceeds estimated', () => {
    const jobs = [{
      ...mockBaseJob,
      estimated_duration: 30,
      actual_end_time: '2024-01-01T09:00:00Z',
    } as DbJob];
    
    const result = calculateRealOEE(jobs);
    expect(result.performance).toBe(50);
  });

  it('calculates quality correctly with lost pieces', () => {
    const jobs = [{
      ...mockBaseJob,
      produced_quantity: 100,
      lost_pieces: 10,
    } as DbJob];
    
    const result = calculateRealOEE(jobs);
    expect(result.quality).toBe(90);
  });

  it('handles empty job list', () => {
    const result = calculateRealOEE([]);
    expect(result.oee).toBe(0);
    expect(result.availability).toBe(100);
    expect(result.performance).toBe(100);
    expect(result.quality).toBe(100);
  });

  it('handles invalid dates gracefully', () => {
    const jobs = [{
      ...mockBaseJob,
      actual_start_time: 'invalid-date',
    } as DbJob];
    
    const result = calculateRealOEE(jobs);
    expect(result.totalActualMinutes).toBe(0);
    expect(result.availability).toBe(0);
    expect(result.performance).toBe(100);
  });

  it('limits availability, performance and quality to 100%', () => {
    const jobs = [{
        ...mockBaseJob,
        estimated_duration: 120,
        actual_end_time: '2024-01-01T09:00:00Z',
        lost_pieces: -10,
    } as DbJob];

    const result = calculateRealOEE(jobs);
    expect(result.performance).toBe(100);
    expect(result.quality).toBe(100);
  });
});
