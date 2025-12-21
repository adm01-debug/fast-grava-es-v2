import { describe, it, expect } from 'vitest';
import { STORAGE_KEYS } from './storage';

describe('STORAGE_KEYS', () => {
  it('should have TOKEN', () => { expect(STORAGE_KEYS.TOKEN).toBe('auth_token'); });
  it('should have THEME', () => { expect(STORAGE_KEYS.THEME).toBe('theme'); });
});
