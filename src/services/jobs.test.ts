import { describe, it, expect } from 'vitest';
import { jobsService } from './jobs';

describe('jobsService', () => {
  it('should have getAll', () => { expect(jobsService.getAll).toBeDefined(); });
  it('should have create', () => { expect(jobsService.create).toBeDefined(); });
});
