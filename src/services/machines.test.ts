import { describe, it, expect } from 'vitest';
import { machinesService } from './machines';

describe('machinesService', () => {
  it('should have getAll', () => { expect(machinesService.getAll).toBeDefined(); });
});
