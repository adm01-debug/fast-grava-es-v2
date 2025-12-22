import { describe, it, expect } from 'vitest';
import { ROUTES } from './routes';

describe('ROUTES', () => {
  it('should have HOME', () => { expect(ROUTES.HOME).toBe('/'); });
  it('should have DASHBOARD', () => { expect(ROUTES.DASHBOARD).toBe('/dashboard'); });
});
