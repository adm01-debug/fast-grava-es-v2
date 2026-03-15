import { describe, it, expect } from 'vitest';

// ===== SPC CAPABILITY INDICES =====
describe('SPC Capability Indices (Cp/Cpk)', () => {
  function calculateCapabilityIndices(
    means: number[],
    usl: number,
    lsl: number
  ): { cp: number; cpk: number; mean: number; stdDev: number } | null {
    if (means.length < 10) return null;

    const overallMean = means.reduce((a, b) => a + b, 0) / means.length;
    const variance = means.reduce((sum, v) => sum + Math.pow(v - overallMean, 2), 0) / means.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return null;

    const cp = (usl - lsl) / (6 * stdDev);
    const cpu = (usl - overallMean) / (3 * stdDev);
    const cpl = (overallMean - lsl) / (3 * stdDev);
    const cpk = Math.min(cpu, cpl);

    return { cp, cpk, mean: overallMean, stdDev };
  }

  it('returns null for fewer than 10 measurements', () => {
    expect(calculateCapabilityIndices([1, 2, 3], 10, 0)).toBeNull();
    expect(calculateCapabilityIndices([], 10, 0)).toBeNull();
  });

  it('returns null for zero std deviation (all same values)', () => {
    const same = Array(20).fill(5);
    expect(calculateCapabilityIndices(same, 10, 0)).toBeNull();
  });

  it('calculates Cp correctly for centered process', () => {
    // Process centered at 5.0, USL=10, LSL=0
    const means = Array.from({ length: 20 }, (_, i) => 5 + (i % 3 - 1) * 0.5); // 4.5, 5.0, 5.5 pattern
    const result = calculateCapabilityIndices(means, 10, 0);
    expect(result).not.toBeNull();
    expect(result!.cp).toBeGreaterThan(1); // Wide spec relative to variation
  });

  it('Cpk < Cp when process is off-center', () => {
    // Process shifted toward USL
    const means = Array.from({ length: 20 }, (_, i) => 8 + (i % 3 - 1) * 0.3);
    const result = calculateCapabilityIndices(means, 10, 0);
    expect(result).not.toBeNull();
    expect(result!.cpk).toBeLessThan(result!.cp);
  });

  it('Cpk = Cp when perfectly centered', () => {
    // Perfectly centered between USL=10 and LSL=0, mean=5
    const means = Array.from({ length: 100 }, (_, i) => 5 + Math.sin(i * 0.1) * 0.5);
    const result = calculateCapabilityIndices(means, 10, 0);
    expect(result).not.toBeNull();
    // For a centered process, Cp ≈ Cpk (approximately)
    expect(Math.abs(result!.cp - result!.cpk)).toBeLessThan(result!.cp * 0.3);
  });

  it('Cpk is negative when mean is outside spec limits', () => {
    const means = Array.from({ length: 20 }, (_, i) => 12 + (i % 3 - 1) * 0.2); // mean ~12, USL=10
    const result = calculateCapabilityIndices(means, 10, 0);
    expect(result).not.toBeNull();
    expect(result!.cpk).toBeLessThan(0);
  });

  it('Cp >= 1.33 is considered capable', () => {
    // Tight process with wide spec
    const means = Array.from({ length: 50 }, (_, i) => 50 + Math.sin(i) * 0.5);
    const result = calculateCapabilityIndices(means, 100, 0);
    expect(result).not.toBeNull();
    expect(result!.cp).toBeGreaterThan(1.33);
  });

  it('calculates correct mean', () => {
    const means = Array.from({ length: 10 }, (_, i) => i + 1); // 1..10, mean=5.5
    const result = calculateCapabilityIndices(means, 20, 0);
    expect(result).not.toBeNull();
    expect(result!.mean).toBeCloseTo(5.5);
  });

  it('handles large datasets', () => {
    const means = Array.from({ length: 1000 }, (_, i) => 50 + Math.random() * 2 - 1);
    const result = calculateCapabilityIndices(means, 60, 40);
    expect(result).not.toBeNull();
    expect(result!.cp).toBeGreaterThan(0);
  });
});

// ===== SPC CONTROL LIMIT CALCULATION =====
describe('SPC Control Limits (X-bar R Chart)', () => {
  // A2 constants by sample size
  const A2_TABLE: Record<number, number> = {
    2: 1.880, 3: 1.023, 4: 0.729, 5: 0.577,
    6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308,
  };

  function calculateControlLimits(means: number[], ranges: number[], sampleSize: number) {
    if (means.length < 10) return null;

    const xBar = means.reduce((a, b) => a + b, 0) / means.length;
    const rBar = ranges.reduce((a, b) => a + b, 0) / ranges.length;
    const A2 = A2_TABLE[sampleSize] ?? 0.577;
    const ucl = xBar + A2 * rBar;
    const lcl = xBar - A2 * rBar;

    return { xBar, rBar, ucl, lcl };
  }

  it('returns null for fewer than 10 subgroups', () => {
    expect(calculateControlLimits([1, 2], [1, 1], 5)).toBeNull();
  });

  it('calculates UCL > LCL', () => {
    const means = Array.from({ length: 20 }, () => 50 + Math.random() * 2);
    const ranges = Array.from({ length: 20 }, () => 1 + Math.random() * 2);
    const result = calculateControlLimits(means, ranges, 5);
    expect(result).not.toBeNull();
    expect(result!.ucl).toBeGreaterThan(result!.lcl);
  });

  it('UCL = LCL when all ranges are 0', () => {
    const means = Array.from({ length: 10 }, () => 50);
    const ranges = Array.from({ length: 10 }, () => 0);
    const result = calculateControlLimits(means, ranges, 5);
    expect(result).not.toBeNull();
    expect(result!.ucl).toBe(result!.lcl);
    expect(result!.ucl).toBe(50);
  });

  it('uses correct A2 for sample size 5', () => {
    const means = Array.from({ length: 10 }, () => 100);
    const ranges = Array.from({ length: 10 }, () => 10);
    const result = calculateControlLimits(means, ranges, 5);
    // UCL = 100 + 0.577 * 10 = 105.77
    expect(result!.ucl).toBeCloseTo(105.77, 1);
    // LCL = 100 - 0.577 * 10 = 94.23
    expect(result!.lcl).toBeCloseTo(94.23, 1);
  });

  it('uses correct A2 for sample size 2', () => {
    const means = Array.from({ length: 10 }, () => 100);
    const ranges = Array.from({ length: 10 }, () => 5);
    const result = calculateControlLimits(means, ranges, 2);
    // UCL = 100 + 1.880 * 5 = 109.4
    expect(result!.ucl).toBeCloseTo(109.4, 1);
  });

  it('defaults A2 to 0.577 for unknown sample size', () => {
    const means = Array.from({ length: 10 }, () => 100);
    const ranges = Array.from({ length: 10 }, () => 10);
    const result5 = calculateControlLimits(means, ranges, 5);
    const result99 = calculateControlLimits(means, ranges, 99);
    expect(result5!.ucl).toBe(result99!.ucl); // both use 0.577
  });

  it('wider ranges produce wider control limits', () => {
    const means = Array.from({ length: 10 }, () => 50);
    const narrowRanges = Array.from({ length: 10 }, () => 1);
    const wideRanges = Array.from({ length: 10 }, () => 10);
    const narrow = calculateControlLimits(means, narrowRanges, 5);
    const wide = calculateControlLimits(means, wideRanges, 5);
    expect(wide!.ucl - wide!.lcl).toBeGreaterThan(narrow!.ucl - narrow!.lcl);
  });
});

// ===== SPC OUT OF CONTROL DETECTION =====
describe('SPC Out of Control Detection', () => {
  function checkControl(mean: number, ucl: number | null, lcl: number | null): { isInControl: boolean; type: string | null } {
    if (ucl !== null && mean > ucl) return { isInControl: false, type: 'above_ucl' };
    if (lcl !== null && mean < lcl) return { isInControl: false, type: 'below_lcl' };
    return { isInControl: true, type: null };
  }

  it('in control when within limits', () => {
    expect(checkControl(50, 60, 40)).toEqual({ isInControl: true, type: null });
  });

  it('out of control above UCL', () => {
    expect(checkControl(65, 60, 40)).toEqual({ isInControl: false, type: 'above_ucl' });
  });

  it('out of control below LCL', () => {
    expect(checkControl(35, 60, 40)).toEqual({ isInControl: false, type: 'below_lcl' });
  });

  it('exactly at UCL is in control', () => {
    expect(checkControl(60, 60, 40)).toEqual({ isInControl: true, type: null });
  });

  it('exactly at LCL is in control', () => {
    expect(checkControl(40, 60, 40)).toEqual({ isInControl: true, type: null });
  });

  it('handles null limits (no limits set)', () => {
    expect(checkControl(1000, null, null)).toEqual({ isInControl: true, type: null });
    expect(checkControl(50, 60, null)).toEqual({ isInControl: true, type: null });
    expect(checkControl(50, null, 40)).toEqual({ isInControl: true, type: null });
  });

  it('handles negative values', () => {
    expect(checkControl(-5, 10, -10)).toEqual({ isInControl: true, type: null });
    expect(checkControl(-15, 10, -10)).toEqual({ isInControl: false, type: 'below_lcl' });
  });
});

// ===== SPC MEASUREMENT STATISTICS =====
describe('SPC Measurement Statistics', () => {
  function calculateStats(values: number[]) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const range = Math.max(...values) - Math.min(...values);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return { mean, range, stdDev };
  }

  it('calculates correct mean', () => {
    expect(calculateStats([1, 2, 3, 4, 5]).mean).toBe(3);
    expect(calculateStats([10, 10, 10]).mean).toBe(10);
  });

  it('calculates correct range', () => {
    expect(calculateStats([1, 5, 3, 2, 4]).range).toBe(4);
    expect(calculateStats([10, 10, 10]).range).toBe(0);
  });

  it('calculates correct std deviation', () => {
    const stats = calculateStats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(stats.stdDev).toBeCloseTo(2, 0);
  });

  it('std deviation is 0 for identical values', () => {
    expect(calculateStats([5, 5, 5, 5]).stdDev).toBe(0);
  });

  it('handles single value', () => {
    const stats = calculateStats([42]);
    expect(stats.mean).toBe(42);
    expect(stats.range).toBe(0);
    expect(stats.stdDev).toBe(0);
  });

  it('handles negative values', () => {
    const stats = calculateStats([-5, -3, -1, 1, 3, 5]);
    expect(stats.mean).toBe(0);
    expect(stats.range).toBe(10);
  });
});

// ===== MTBF/MTTR CALCULATIONS =====
describe('MTBF/MTTR Calculations', () => {
  function calculateMTBFMTTR(periodHours: number, failures: Array<{ downtimeMinutes: number }>) {
    const totalFailures = failures.length;
    const totalRepairTime = failures.reduce((sum, f) => sum + f.downtimeMinutes, 0);
    
    const operatingHours = periodHours - (totalRepairTime / 60);
    const mtbf = totalFailures > 0 ? operatingHours / totalFailures : null;
    const mttr = totalFailures > 0 ? totalRepairTime / totalFailures : null;
    
    const availabilityRaw = ((periodHours - (totalRepairTime / 60)) / periodHours) * 100;
    const availability = Math.max(0, Math.min(100, availabilityRaw));
    
    return { mtbf, mttr, availability, totalFailures, totalRepairTime };
  }

  it('calculates MTBF correctly', () => {
    // 90 days = 2160 hours, 4 failures with 60min each = 4 hours repair
    // Operating = 2160 - 4 = 2156 hours
    // MTBF = 2156 / 4 = 539 hours
    const result = calculateMTBFMTTR(2160, [
      { downtimeMinutes: 60 }, { downtimeMinutes: 60 },
      { downtimeMinutes: 60 }, { downtimeMinutes: 60 },
    ]);
    expect(result.mtbf).toBeCloseTo(539, 0);
  });

  it('calculates MTTR correctly', () => {
    const result = calculateMTBFMTTR(2160, [
      { downtimeMinutes: 30 }, { downtimeMinutes: 90 },
      { downtimeMinutes: 60 },
    ]);
    // MTTR = (30+90+60)/3 = 60 minutes
    expect(result.mttr).toBe(60);
  });

  it('returns null for no failures', () => {
    const result = calculateMTBFMTTR(2160, []);
    expect(result.mtbf).toBeNull();
    expect(result.mttr).toBeNull();
  });

  it('availability is 100% with no failures', () => {
    const result = calculateMTBFMTTR(2160, []);
    expect(result.availability).toBe(100);
  });

  it('availability decreases with downtime', () => {
    // 2160 hours, 216 hours repair = 10% downtime
    const result = calculateMTBFMTTR(2160, [{ downtimeMinutes: 216 * 60 }]);
    expect(result.availability).toBeCloseTo(90, 0);
  });

  it('availability is clamped to 0-100', () => {
    // More repair time than period (shouldn't happen but handle edge case)
    const result = calculateMTBFMTTR(100, [{ downtimeMinutes: 200 * 60 }]);
    expect(result.availability).toBe(0);
  });

  it('handles single short failure', () => {
    const result = calculateMTBFMTTR(2160, [{ downtimeMinutes: 15 }]);
    expect(result.mtbf).toBeCloseTo(2160 - 0.25, 0);
    expect(result.mttr).toBe(15);
    expect(result.availability).toBeGreaterThan(99);
  });

  it('handles many small failures', () => {
    const failures = Array.from({ length: 100 }, () => ({ downtimeMinutes: 10 }));
    const result = calculateMTBFMTTR(2160, failures);
    expect(result.totalFailures).toBe(100);
    expect(result.totalRepairTime).toBe(1000);
    expect(result.mttr).toBe(10);
  });
});

// ===== RELIABILITY SCORE =====
describe('Reliability Score Classification', () => {
  function calculateReliabilityScore(mtbf: number | null, mttr: number | null): string {
    if (mtbf === null || mttr === null) return 'moderate';
    if (mtbf >= 500 && mttr <= 60) return 'excellent';
    if (mtbf >= 300 && mttr <= 90) return 'good';
    if (mtbf >= 150 && mttr <= 120) return 'moderate';
    if (mtbf >= 50 || mttr <= 180) return 'poor';
    return 'critical';
  }

  it('excellent: high MTBF, low MTTR', () => {
    expect(calculateReliabilityScore(600, 30)).toBe('excellent');
    expect(calculateReliabilityScore(500, 60)).toBe('excellent');
  });

  it('good: moderately high MTBF, moderate MTTR', () => {
    expect(calculateReliabilityScore(400, 80)).toBe('good');
    expect(calculateReliabilityScore(300, 90)).toBe('good');
  });

  it('moderate: average MTBF and MTTR', () => {
    expect(calculateReliabilityScore(200, 100)).toBe('moderate');
    expect(calculateReliabilityScore(150, 120)).toBe('moderate');
  });

  it('poor: low MTBF or high MTTR', () => {
    expect(calculateReliabilityScore(80, 150)).toBe('poor');
    expect(calculateReliabilityScore(50, 200)).toBe('poor'); // mtbf >= 50 triggers poor
  });

  it('critical: very low MTBF and very high MTTR', () => {
    expect(calculateReliabilityScore(30, 300)).toBe('critical');
    expect(calculateReliabilityScore(10, 500)).toBe('critical');
  });

  it('null values default to moderate', () => {
    expect(calculateReliabilityScore(null, null)).toBe('moderate');
    expect(calculateReliabilityScore(null, 30)).toBe('moderate');
    expect(calculateReliabilityScore(500, null)).toBe('moderate');
  });

  it('boundary cases', () => {
    expect(calculateReliabilityScore(500, 60)).toBe('excellent');
    expect(calculateReliabilityScore(499, 60)).toBe('good');
    expect(calculateReliabilityScore(300, 91)).toBe('moderate');
    expect(calculateReliabilityScore(149, 121)).toBe('poor');
  });
});

// ===== SPC WESTERN ELECTRIC RULES =====
describe('SPC Western Electric Rules', () => {
  // Rule 1: One point beyond 3σ
  function rule1(value: number, mean: number, sigma: number): boolean {
    return Math.abs(value - mean) > 3 * sigma;
  }

  // Rule 2: Two of three successive points beyond 2σ on same side
  function rule2(values: number[], mean: number, sigma: number): boolean {
    if (values.length < 3) return false;
    const last3 = values.slice(-3);
    const aboveCount = last3.filter(v => v > mean + 2 * sigma).length;
    const belowCount = last3.filter(v => v < mean - 2 * sigma).length;
    return aboveCount >= 2 || belowCount >= 2;
  }

  // Rule 3: Four of five successive points beyond 1σ on same side
  function rule3(values: number[], mean: number, sigma: number): boolean {
    if (values.length < 5) return false;
    const last5 = values.slice(-5);
    const aboveCount = last5.filter(v => v > mean + sigma).length;
    const belowCount = last5.filter(v => v < mean - sigma).length;
    return aboveCount >= 4 || belowCount >= 4;
  }

  // Rule 4: Eight successive points on one side of center
  function rule4(values: number[], mean: number): boolean {
    if (values.length < 8) return false;
    const last8 = values.slice(-8);
    return last8.every(v => v > mean) || last8.every(v => v < mean);
  }

  it('Rule 1: detects point beyond 3σ', () => {
    expect(rule1(70, 50, 5)).toBe(true);  // 70 > 50+15
    expect(rule1(60, 50, 5)).toBe(false); // 60 < 50+15
    expect(rule1(34, 50, 5)).toBe(true);  // 34 < 50-15 (wait: |34-50|=16 > 15)
    expect(rule1(36, 50, 5)).toBe(false); // |36-50|=14 < 15
  });

  it('Rule 2: detects 2/3 points beyond 2σ', () => {
    // mean=50, σ=5, 2σ=60
    expect(rule2([61, 55, 62], 50, 5)).toBe(true); // 61 and 62 > 60
    expect(rule2([55, 55, 55], 50, 5)).toBe(false);
    expect(rule2([61, 55, 55], 50, 5)).toBe(false); // only 1 of 3
  });

  it('Rule 3: detects 4/5 points beyond 1σ', () => {
    // mean=50, σ=5, 1σ=55
    expect(rule3([56, 57, 56, 54, 58], 50, 5)).toBe(true); // 4 of 5 > 55
    expect(rule3([56, 51, 56, 54, 58], 50, 5)).toBe(false); // only 3
  });

  it('Rule 4: detects 8 points on one side', () => {
    const above = [51, 52, 53, 51, 52, 53, 51, 52]; // all > 50
    expect(rule4(above, 50)).toBe(true);
    
    const mixed = [51, 49, 53, 51, 52, 53, 51, 52]; // one below
    expect(rule4(mixed, 50)).toBe(false);
  });

  it('rules handle insufficient data', () => {
    expect(rule2([1], 50, 5)).toBe(false);
    expect(rule3([1, 2, 3], 50, 5)).toBe(false);
    expect(rule4([1, 2, 3, 4], 50)).toBe(false);
  });
});
