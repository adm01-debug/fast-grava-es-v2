import { describe, it, expect, vi } from 'vitest';
import { apiService } from './api';

describe('apiService', () => {
  it('should have get method', () => { expect(apiService.get).toBeDefined(); });
  it('should have post method', () => { expect(apiService.post).toBeDefined(); });
});
