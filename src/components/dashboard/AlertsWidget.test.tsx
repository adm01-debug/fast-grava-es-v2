import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertsWidget } from './AlertsWidget';

// Mock data
const mockAlerts = [
  {
    id: 'alert-1',
    type: 'critical',
    title: 'Máquina parada',
    message: 'A máquina CNC-01 está parada há mais de 2 horas',
    machine_id: 'machine-1',
    machine_name: 'CNC-01',
    timestamp: new Date().toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-2',
    type: 'warning',
    title: 'Baixa eficiência',
    message: 'A eficiência da linha de montagem está abaixo de 70%',
    machine_id: 'machine-2',
    machine_name: 'Linha A',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-3',
    type: 'info',
    title: 'Manutenção programada',
    message: 'Manutenção preventiva agendada para amanhã',
    machine_id: 'machine-3',
    machine_name: 'Prensa-01',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    acknowledged: true,
  },
];

describe('AlertsWidget', () => {
  const mockOnAcknowledge = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the widget with title', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(/alertas/i)).toBeInTheDocument();
    });

    it('should render all alerts', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Máquina parada')).toBeInTheDocument();
      expect(screen.getByText('Baixa eficiência')).toBeInTheDocument();
      expect(screen.getByText('Manutenção programada')).toBeInTheDocument();
    });

    it('should display alert messages', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(/máquina CNC-01 está parada/i)).toBeInTheDocument();
      expect(screen.getByText(/eficiência da linha de montagem/i)).toBeInTheDocument();
    });

    it('should display machine names', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('CNC-01')).toBeInTheDocument();
      expect(screen.getByText('Linha A')).toBeInTheDocument();
    });

    it('should show alert count', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      // Should show count badge or similar indicator
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Alert Types', () => {
    it('should render critical alerts with appropriate styling', () => {
      render(
        <AlertsWidget
          alerts={[mockAlerts[0]]}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      const alert = screen.getByText('Máquina parada').closest('div');
      expect(alert).toBeInTheDocument();
    });

    it('should render warning alerts', () => {
      render(
        <AlertsWidget
          alerts={[mockAlerts[1]]}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Baixa eficiência')).toBeInTheDocument();
    });

    it('should render info alerts', () => {
      render(
        <AlertsWidget
          alerts={[mockAlerts[2]]}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Manutenção programada')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onAcknowledge when clicking acknowledge button', async () => {
      const user = userEvent.setup();
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      const acknowledgeButtons = screen.getAllByRole('button', { name: /confirmar|acknowledge/i });
      if (acknowledgeButtons.length > 0) {
        await user.click(acknowledgeButtons[0]);
        expect(mockOnAcknowledge).toHaveBeenCalled();
      }
    });

    it('should call onDismiss when clicking dismiss button', async () => {
      const user = userEvent.setup();
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      const dismissButtons = screen.getAllByRole('button', { name: /dismiss|fechar/i });
      if (dismissButtons.length > 0) {
        await user.click(dismissButtons[0]);
        expect(mockOnDismiss).toHaveBeenCalled();
      }
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no alerts', () => {
      render(
        <AlertsWidget
          alerts={[]}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(/nenhum alerta|sem alertas/i)).toBeInTheDocument();
    });
  });

  describe('Acknowledged State', () => {
    it('should show acknowledged status for acknowledged alerts', () => {
      render(
        <AlertsWidget
          alerts={[mockAlerts[2]]}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      // Acknowledged alert should have different styling or indicator
      expect(screen.getByText('Manutenção programada')).toBeInTheDocument();
    });

    it('should not show acknowledge button for already acknowledged alerts', () => {
      render(
        <AlertsWidget
          alerts={[mockAlerts[2]]}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      // Should not have acknowledge button for acknowledged alert
      const acknowledgeButtons = screen.queryAllByRole('button', { name: /confirmar|acknowledge/i });
      expect(acknowledgeButtons.length).toBe(0);
    });
  });

  describe('Filtering', () => {
    it('should filter alerts by type when filter is provided', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
          filterType="critical"
        />
      );

      expect(screen.getByText('Máquina parada')).toBeInTheDocument();
      expect(screen.queryByText('Baixa eficiência')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort alerts by timestamp (newest first)', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      const alertTitles = screen.getAllByRole('heading').map(h => h.textContent);
      // First alert should be the newest
      expect(alertTitles[0]).toBe('Máquina parada');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible alert items', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      const alertItems = screen.getAllByRole('article');
      expect(alertItems.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('Timestamp Display', () => {
    it('should display relative timestamps', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      // Should show relative time like "há 1 hora" or similar
      expect(screen.getByText(/agora|minuto|hora/i)).toBeInTheDocument();
    });
  });

  describe('Badge/Count', () => {
    it('should show unacknowledged count', () => {
      render(
        <AlertsWidget
          alerts={mockAlerts}
          onAcknowledge={mockOnAcknowledge}
          onDismiss={mockOnDismiss}
        />
      );

      // 2 unacknowledged alerts
      const badge = screen.getByText('2');
      expect(badge).toBeInTheDocument();
    });
  });
});
