import { describe, it, expect } from 'vitest';
import { measurePerformance, startTimer, endTimer } from './performance';

describe('performance', () => {
  it('measurePerformance should be defined', () => { expect(measurePerformance).toBeDefined(); });
  it('startTimer should be defined', () => { expect(startTimer).toBeDefined(); });
  it('endTimer should be defined', () => { expect(endTimer).toBeDefined(); });
});
