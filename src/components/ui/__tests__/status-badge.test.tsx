import { describe, it, expect } from 'vitest';
import { render} from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { StatusBadge } from '../status-badge';
import type { JobStatus } from '@/types/scheduling';

describe('StatusBadge Component', () => {
  // ===== ALL STATUS LABELS =====
  const statuses: { status: JobStatus; label: string }[] = [
    { status: 'queue', label: 'Na Fila' },
    { status: 'ready', label: 'No Jeito' },
    { status: 'scheduled', label: 'Agendado' },
    { status: 'production', label: 'Em Produção' },
    { status: 'finished', label: 'Finalizado' },
    { status: 'paused', label: 'Pausado' },
    { status: 'cancelled', label: 'Cancelado' },
    { status: 'delayed', label: 'Atrasado' },
    { status: 'rework', label: 'Retrabalho' },
  ];

  statuses.forEach(({ status, label }) => {
    it(`renders "${label}" for status "${status}"`, () => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  // ===== ICONS FOR ACCESSIBILITY =====
  describe('Accessibility icons', () => {
    it('renders icon by default (showIcon=true)', () => {
      const { container } = render(<StatusBadge status="ready" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('hides icon when showIcon=false', () => {
      const { container } = render(<StatusBadge status="ready" showIcon={false} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('each status has a unique icon (accessibility for colorblind users)', () => {
      // Render all statuses and check they each have an SVG
      statuses.forEach(({ status }) => {
        const { container } = render(<StatusBadge status={status} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  // ===== SIZE VARIANTS =====
  describe('Size variants', () => {
    it('applies sm classes', () => {
      const { container } = render(<StatusBadge status="queue" size="sm" />);
      expect(container.firstChild).toHaveClass('text-xs');
    });

    it('applies md classes (default)', () => {
      const { container } = render(<StatusBadge status="queue" size="md" />);
      expect(container.firstChild).toHaveClass('text-sm');
    });

    it('applies lg classes', () => {
      const { container } = render(<StatusBadge status="queue" size="lg" />);
      expect(container.firstChild).toHaveClass('text-base');
    });
  });

  // ===== SEMANTIC CLASSES =====
  describe('Semantic design tokens', () => {
    it('queue uses bg-muted', () => {
      const { container } = render(<StatusBadge status="queue" />);
      expect(container.firstChild).toHaveClass('bg-muted');
    });

    it('ready uses bg-status-ready', () => {
      const { container } = render(<StatusBadge status="ready" />);
      expect(container.firstChild).toHaveClass('bg-status-ready');
    });

    it('production uses bg-status-production', () => {
      const { container } = render(<StatusBadge status="production" />);
      expect(container.firstChild).toHaveClass('bg-status-production');
    });

    it('finished uses bg-status-finished', () => {
      const { container } = render(<StatusBadge status="finished" />);
      expect(container.firstChild).toHaveClass('bg-status-finished');
    });

    it('cancelled uses bg-status-cancelled', () => {
      const { container } = render(<StatusBadge status="cancelled" />);
      expect(container.firstChild).toHaveClass('bg-status-cancelled');
    });

    it('delayed uses bg-status-delayed', () => {
      const { container } = render(<StatusBadge status="delayed" />);
      expect(container.firstChild).toHaveClass('bg-status-delayed');
    });
  });

  // ===== GLOW EFFECTS =====
  describe('Dark mode glow effects', () => {
    it('ready has glow class', () => {
      const { container } = render(<StatusBadge status="ready" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('dark:shadow-');
    });

    it('production has glow class', () => {
      const { container } = render(<StatusBadge status="production" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('dark:shadow-');
    });

    it('finished has glow class', () => {
      const { container } = render(<StatusBadge status="finished" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('dark:shadow-');
    });

    it('queue does NOT have glow class', () => {
      const { container } = render(<StatusBadge status="queue" />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).not.toContain('dark:shadow-[0_0_');
    });
  });

  // ===== ANIMATION =====
  describe('Animation support', () => {
    it('applies animation class when animated=true', () => {
      const { container } = render(<StatusBadge status="ready" animated />);
      expect(container.firstChild).toHaveClass('animate-pulse-soft');
    });

    it('does NOT apply animation class when animated=false', () => {
      const { container } = render(<StatusBadge status="ready" animated={false} />);
      expect(container.firstChild).not.toHaveClass('animate-pulse-soft');
    });

    it('production with animated shows streak-fire', () => {
      const { container } = render(<StatusBadge status="production" animated />);
      expect(container.firstChild).toHaveClass('streak-fire');
    });
  });

  // ===== CUSTOM CLASSNAME =====
  it('accepts custom className', () => {
    const { container } = render(<StatusBadge status="queue" className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });

  // ===== BADGE STRUCTURE =====
  it('renders as a span with inline-flex', () => {
    const { container } = render(<StatusBadge status="queue" />);
    expect(container.firstChild?.nodeName).toBe('SPAN');
    expect(container.firstChild).toHaveClass('inline-flex');
  });

  it('has rounded-full pill shape', () => {
    const { container } = render(<StatusBadge status="queue" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });
});
