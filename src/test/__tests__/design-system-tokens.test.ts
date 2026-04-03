// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cssContent = readFileSync(resolve(__dirname, '../../index.css'), 'utf-8');

describe('Design System CSS Tokens', () => {
  // ===== DARK MODE CARD CONTRAST (P0 fix) =====
  describe('P0: Dark mode card contrast', () => {
    it('dark mode --card is set to 220 10% 10% (not 8%)', () => {
      // Ensure the dark theme card has improved contrast
      const darkSection = cssContent.split('.dark')[1]?.split('}')[0] || '';
      expect(darkSection).toContain('--card: 220 10% 10%');
    });

    it('dark mode --card-elevated is 220 10% 12%', () => {
      const darkSection = cssContent.split('.dark')[1]?.split('}')[0] || '';
      expect(darkSection).toContain('--card-elevated: 220 10% 12%');
    });

    it('dark mode --border is 220 10% 18%', () => {
      const darkSection = cssContent.split('.dark')[1]?.split('}')[0] || '';
      expect(darkSection).toContain('--border: 220 10% 18%');
    });
  });

  // ===== GLOW EFFECTS (P0) =====
  describe('P0: Glow effects', () => {
    it('has shadow-glow-primary token defined in :root', () => {
      expect(cssContent).toContain('--shadow-glow-primary');
    });

    it('has shadow-glow-primary token defined in .dark', () => {
      const darkSection = cssContent.substring(cssContent.indexOf('.dark'));
      expect(darkSection).toContain('--shadow-glow-primary');
    });

    it('shadow-glow-success token exists', () => {
      expect(cssContent).toContain('--shadow-glow-success');
    });
  });

  // ===== FLUID TYPOGRAPHY (Tier 3) =====
  describe('Tier 3: Fluid typography', () => {
    it('h1 uses clamp() for responsive sizing', () => {
      expect(cssContent).toContain('clamp(1.75rem');
    });

    it('h2 uses clamp() for responsive sizing', () => {
      expect(cssContent).toContain('clamp(1.5rem');
    });

    it('h3 uses clamp() for responsive sizing', () => {
      expect(cssContent).toContain('clamp(1.25rem');
    });
  });

  // ===== MOTION DESIGN SYSTEM =====
  describe('Motion design tokens', () => {
    it('defines duration-instant', () => {
      expect(cssContent).toContain('--duration-instant: 75ms');
    });

    it('defines duration-fast', () => {
      expect(cssContent).toContain('--duration-fast: 150ms');
    });

    it('defines duration-normal', () => {
      expect(cssContent).toContain('--duration-normal: 250ms');
    });

    it('defines duration-slow', () => {
      expect(cssContent).toContain('--duration-slow: 400ms');
    });

    it('defines easing-standard', () => {
      expect(cssContent).toContain('--easing-standard');
    });

    it('defines easing-enter', () => {
      expect(cssContent).toContain('--easing-enter');
    });

    it('defines easing-exit', () => {
      expect(cssContent).toContain('--easing-exit');
    });

    it('defines easing-spring', () => {
      expect(cssContent).toContain('--easing-spring');
    });
  });

  // ===== PREMIUM TYPOGRAPHY FONTS =====
  describe('Premium typography', () => {
    it('uses Outfit as primary font', () => {
      expect(cssContent).toContain("'Outfit'");
    });

    it('uses Plus Jakarta Sans as display font', () => {
      expect(cssContent).toContain("'Plus Jakarta Sans'");
    });

    it('uses JetBrains Mono as mono font', () => {
      expect(cssContent).toContain("'JetBrains Mono'");
    });

    it('defines font-display utility', () => {
      expect(cssContent).toContain('.font-display');
    });
  });

  // ===== ACCESSIBILITY =====
  describe('Accessibility features', () => {
    it('respects prefers-reduced-motion', () => {
      expect(cssContent).toContain('prefers-reduced-motion: reduce');
    });

    it('supports high contrast mode', () => {
      expect(cssContent).toContain('prefers-contrast: high');
    });

    it('has focus-visible ring styles', () => {
      expect(cssContent).toContain(':focus-visible');
    });

    it('disables tap highlight on touch', () => {
      expect(cssContent).toContain('-webkit-tap-highlight-color: transparent');
    });
  });

  // ===== STATUS COLOR TOKENS =====
  describe('Status color tokens', () => {
    const statusTokens = [
      'status-queue', 'status-ready', 'status-scheduled',
      'status-production', 'status-finished', 'status-paused',
      'status-cancelled', 'status-delayed', 'status-rework',
    ];

    statusTokens.forEach((token) => {
      it(`defines --${token} token`, () => {
        expect(cssContent).toContain(`--${token}:`);
      });

      it(`defines --${token}-foreground token`, () => {
        expect(cssContent).toContain(`--${token}-foreground:`);
      });
    });
  });

  // ===== GRADIENT TOKENS =====
  describe('Gradient tokens', () => {
    it('defines gradient-primary', () => {
      expect(cssContent).toContain('--gradient-primary');
    });

    it('defines gradient-success', () => {
      expect(cssContent).toContain('--gradient-success');
    });

    it('defines gradient-xp', () => {
      expect(cssContent).toContain('--gradient-xp');
    });

    it('defines gradient-hero', () => {
      expect(cssContent).toContain('--gradient-hero');
    });
  });

  // ===== SEMANTIC SURFACES =====
  describe('Semantic surface tokens', () => {
    it('defines surface-success', () => {
      expect(cssContent).toContain('--surface-success');
    });

    it('defines surface-warning', () => {
      expect(cssContent).toContain('--surface-warning');
    });

    it('defines surface-destructive', () => {
      expect(cssContent).toContain('--surface-destructive');
    });

    it('defines surface-info', () => {
      expect(cssContent).toContain('--surface-info');
    });
  });

  // ===== GLASS MORPHISM =====
  describe('Glassmorphism tokens', () => {
    it('defines glass-bg', () => {
      expect(cssContent).toContain('--glass-bg');
    });

    it('defines glass-border', () => {
      expect(cssContent).toContain('--glass-border');
    });
  });

  // ===== ELEVATION SYSTEM =====
  describe('Elevation system', () => {
    it('defines shadow-xs through shadow-2xl', () => {
      ['--shadow-xs', '--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl', '--shadow-2xl'].forEach((s) => {
        expect(cssContent).toContain(`${s}:`);
      });
    });
  });

  // ===== SAFE AREA INSETS =====
  describe('Safe area insets (notch devices)', () => {
    it('defines safe-area-top', () => {
      expect(cssContent).toContain('--safe-area-top');
    });

    it('defines safe-area-bottom', () => {
      expect(cssContent).toContain('--safe-area-bottom');
    });
  });

  // ===== AMOLED MODE =====
  describe('AMOLED black mode', () => {
    it('defines .dark.amoled theme', () => {
      expect(cssContent).toContain('.dark.amoled');
    });

    it('AMOLED uses pure black background', () => {
      const amoledSection = cssContent.split('.dark.amoled')[1]?.split('}')[0] || '';
      expect(amoledSection).toContain('--background: 0 0% 0%');
    });
  });

  // ===== GAMIFICATION TOKENS =====
  describe('Gamification design tokens', () => {
    it('defines --xp token', () => {
      expect(cssContent).toContain('--xp:');
    });

    it('defines --coins token', () => {
      expect(cssContent).toContain('--coins:');
    });

    it('defines --streak token', () => {
      expect(cssContent).toContain('--streak:');
    });

    it('defines rank tokens (gold, silver, bronze)', () => {
      expect(cssContent).toContain('--rank-gold');
      expect(cssContent).toContain('--rank-silver');
      expect(cssContent).toContain('--rank-bronze');
    });
  });

  // ===== CHART TOKENS =====
  describe('Chart color tokens', () => {
    for (let i = 1; i <= 5; i++) {
      it(`defines --chart-${i}`, () => {
        expect(cssContent).toContain(`--chart-${i}:`);
      });
    }
  });

  // ===== INTERACTION OVERLAYS =====
  describe('Interaction overlay tokens', () => {
    it('defines --hover-overlay', () => {
      expect(cssContent).toContain('--hover-overlay');
    });

    it('defines --pressed-overlay', () => {
      expect(cssContent).toContain('--pressed-overlay');
    });

    it('defines --focus-ring-inset', () => {
      expect(cssContent).toContain('--focus-ring-inset');
    });
  });
});
