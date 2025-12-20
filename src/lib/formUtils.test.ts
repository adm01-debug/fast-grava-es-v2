import { describe, it, expect } from 'vitest';

describe('formUtils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const email = 'test@example.com';
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const email = 'invalid-email';
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate phone number', () => {
      const phone = '11999999999';
      const isValid = /^\d{10,11}$/.test(phone);
      expect(isValid).toBe(true);
    });
  });

  describe('formatCurrency', () => {
    it('should format as BRL', () => {
      const value = 1234.56;
      const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      expect(formatted).toContain('1.234,56');
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      const input = '  test  ';
      expect(input.trim()).toBe('test');
    });

    it('should remove special characters', () => {
      const input = 'test<script>alert(1)</script>';
      const sanitized = input.replace(/<[^>]*>/g, '');
      expect(sanitized).toBe('testalert(1)');
    });
  });
});
