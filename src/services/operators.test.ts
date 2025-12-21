import { describe, it, expect } from 'vitest';
import { operatorsService } from './operators';

describe('operatorsService', () => {
  it('should have getAll', () => { expect(operatorsService.getAll).toBeDefined(); });
});
