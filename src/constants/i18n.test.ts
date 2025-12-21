import { describe, it, expect } from 'vitest';
import { LOCALES, DEFAULT_LOCALE } from './i18n';

describe('LOCALES', () => {
  it('should have PT_BR', () => { expect(LOCALES.PT_BR).toBe('pt-BR'); });
});
describe('DEFAULT_LOCALE', () => {
  it('should be PT_BR', () => { expect(DEFAULT_LOCALE).toBe('pt-BR'); });
});
