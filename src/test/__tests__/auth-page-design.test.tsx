/// <reference types="node" />
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const authPageCode = readFileSync(resolve(__dirname, '../../pages/AuthPage.tsx'), 'utf-8');
const authLoginFormCode = readFileSync(resolve(__dirname, '../../components/auth/AuthLoginForm.tsx'), 'utf-8');
const authSignupFormCode = readFileSync(resolve(__dirname, '../../components/auth/AuthSignupForm.tsx'), 'utf-8');
// Combined source for assertions that may live in AuthPage or its extracted subcomponents
const authCombinedCode = authPageCode + '\n' + authLoginFormCode + '\n' + authSignupFormCode;

describe('AuthPage Design Improvements', () => {
  // ===== STAGGERED ANIMATIONS =====
  describe('Staggered entry animations', () => {
    it('imports framer-motion', () => {
      expect(authPageCode).toContain("from 'framer-motion'");
    });

    it('uses motion.div for logo icon', () => {
      expect(authPageCode).toContain('motion.div');
    });

    it('uses motion.h1 for title', () => {
      expect(authPageCode).toContain('motion.h1');
    });

    it('uses motion.p for subtitle', () => {
      expect(authPageCode).toContain('motion.p');
    });

    it('logo has scale animation (spring)', () => {
      expect(authPageCode).toContain('scale: 0.8');
      expect(authPageCode).toContain('scale: 1');
    });

    it('title has delay of 0.15', () => {
      expect(authPageCode).toContain('delay: 0.15');
    });

    it('subtitle has delay of 0.25', () => {
      expect(authPageCode).toContain('delay: 0.25');
    });

    it('card has delay of 0.35', () => {
      expect(authPageCode).toContain('delay: 0.35');
    });
  });

  // ===== CTA BUTTON =====
  describe('CTA button prominence', () => {
    it('login button uses variant="gradient"', () => {
      expect(authCombinedCode).toContain('variant="gradient"');
    });

    it('login button has large height (h-12)', () => {
      expect(authCombinedCode).toContain('h-12');
    });

    it('login button has tracking-wide for readability', () => {
      expect(authCombinedCode).toContain('tracking-wide');
    });
  });

  // ===== CARD DESIGN =====
  describe('Card visual polish', () => {
    it('card uses variant="elevated"', () => {
      expect(authPageCode).toContain('variant="elevated"');
    });

    it('card has backdrop-blur-xl for glass effect', () => {
      expect(authPageCode).toContain('backdrop-blur-xl');
    });

    it('card has shadow-xl', () => {
      expect(authPageCode).toContain('shadow-xl');
    });

    it('card has dark:shadow-glow-primary', () => {
      expect(authPageCode).toContain('dark:shadow-glow-primary');
    });

    it('card has border-border/60 for subtle borders', () => {
      expect(authPageCode).toContain('border-border/60');
    });
  });

  // ===== BACKGROUND DECORATIONS =====
  describe('Background decorations', () => {
    it('has gradient background', () => {
      expect(authPageCode).toContain('bg-gradient-to-br');
    });

    it('has primary blur orb', () => {
      expect(authPageCode).toContain('bg-primary/10');
      expect(authPageCode).toContain('blur-3xl');
    });

    it('has accent blur orb', () => {
      expect(authPageCode).toContain('bg-accent/10');
    });
  });

  // ===== LOGO DESIGN =====
  describe('Logo/Icon', () => {
    it('logo has gradient background', () => {
      expect(authPageCode).toContain('bg-gradient-to-br from-primary to-accent');
    });

    it('logo has shadow-xl with primary color', () => {
      expect(authPageCode).toContain('shadow-primary/25');
    });

    it('logo has rounded-2xl corners', () => {
      expect(authPageCode).toContain('rounded-2xl');
    });
  });

  // ===== GRADIENT TEXT =====
  describe('Gradient text', () => {
    it('app name uses gradient text', () => {
      expect(authPageCode).toContain('bg-gradient-to-r from-primary via-accent to-primary');
    });

    it('text is clipped to gradient', () => {
      expect(authPageCode).toContain('bg-clip-text text-transparent');
    });
  });

  // ===== THEME TOGGLE =====
  describe('Theme toggle', () => {
    it('has theme toggle button', () => {
      expect(authPageCode).toContain('setTheme');
    });

    it('uses Sun and Moon icons', () => {
      expect(authPageCode).toContain('Sun');
      expect(authPageCode).toContain('Moon');
    });
  });

  // ===== LANGUAGE SWITCHER =====
  describe('Language switcher', () => {
    it('includes LanguageSwitcher component', () => {
      expect(authPageCode).toContain('LanguageSwitcher');
    });
  });

  // ===== PASSWORD STRENGTH =====
  describe('Password strength indicator', () => {
    it('includes PasswordStrengthIndicator in signup', () => {
      expect(authCombinedCode).toContain('PasswordStrengthIndicator');
    });
  });

  // ===== PASSKEY LOGIN =====
  describe('Passkey login support', () => {
    it('includes PasskeyLoginButton', () => {
      expect(authCombinedCode).toContain('PasskeyLoginButton');
    });
  });

  // ===== SOCIAL LOGIN =====
  describe('Social login', () => {
    it('has Google login button', () => {
      expect(authPageCode).toContain('handleGoogleLogin');
    });

    it('shows loading state for social login', () => {
      expect(authPageCode).toContain('socialLoading');
    });
  });

  // ===== REMEMBER ME =====
  describe('Remember me', () => {
    it('has remember me checkbox', () => {
      expect(authPageCode).toContain('rememberMe');
    });

    it('persists to localStorage', () => {
      expect(authPageCode).toContain("localStorage.setItem('rememberedEmail'");
    });
  });

  // ===== FORGOT PASSWORD =====
  describe('Forgot password dialog', () => {
    it('has forgot password dialog', () => {
      expect(authPageCode).toContain('showForgotPassword');
    });

    it('dialog has KeyRound icon', () => {
      expect(authPageCode).toContain('KeyRound');
    });
  });

  // ===== FORM VALIDATION =====
  describe('Form validation with Zod', () => {
    it('uses zod for validation', () => {
      expect(authPageCode).toContain("from 'zod'");
    });

    it('validates login email format', () => {
      expect(authPageCode).toContain('loginSchema');
    });

    it('validates signup with password confirmation', () => {
      expect(authPageCode).toContain('signupSchema');
    });

    it('validates password match', () => {
      expect(authPageCode).toContain('passwordMismatch');
    });
  });

  // ===== LOCKOUT HANDLING =====
  describe('Account lockout feedback', () => {
    it('handles lockout error', () => {
      expect(authPageCode).toContain('isLockout');
    });

    it('shows remaining minutes', () => {
      expect(authPageCode).toContain('remainingMinutes');
    });
  });

  // ===== RESPONSIVE DESIGN =====
  describe('Responsive design', () => {
    it('uses max-w-md for form width', () => {
      expect(authPageCode).toContain('max-w-md');
    });

    it('uses min-h-screen for full height', () => {
      expect(authPageCode).toContain('min-h-screen');
    });
  });
});
