import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS } from './api';

describe('API_ENDPOINTS', () => {
  it('should have JOBS', () => { expect(API_ENDPOINTS.JOBS).toBe('/api/jobs'); });
});
