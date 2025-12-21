import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ABCActivityRatesCard } from './ABCActivityRatesCard';
import { ABCActivity, ABCCostPool, ABCActivityRate } from '@/hooks/useABCCosts';

// Mock data
const mockActivities: ABCActivity[] = [
  {
    id: 'act-1',
    name: 'Atividade de Produção',
    description: 'Produção de itens na linha de montagem',
    cost_driver: 'machine_hours',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'act-2',
    name: 'Setup de Máquina',
    description: 'Configuração de máquinas para novos lotes',
    cost_driver: 'setup_count',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'act-3',
    name: 'Controle de Qualidade',
    description: 'Inspeção de qualidade dos produtos',
    cost_driver: 'quantity',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockCostPools: ABCCostPool[] = [
  {
    id: 'pool-1',
    name: 'Pool de Produção',
    description: 'Custos relacionados à produção',
    total_cost: 50000,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pool-2',
    name: 'Pool de Qualidade',
    description: 'Custos relacionados à qualidade',
    total_cost: 20000,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const currentMonth = new Date().toISOString().slice(0, 7);
const periodStart = `${currentMonth}-01`;
const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

const mockActivityRates: ABCActivityRate[] = [
  {
    id: 'rate-1',
    activity_id: 'act-1',
    cost_pool_id: 'pool-1',
    rate_per_unit: 25.5,
    period_start: periodStart,
    period_end: periodEnd,
    created_at: '2024-01-01T00:00:00Z',
  },
];

describe('ABCActivityRatesCard', () => {
  const mockOnUpdateRate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('Taxas por Atividade')).toBeInTheDocument();
    });

    it('should render all activities', () => {
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('Atividade de Produção')).toBeInTheDocument();
      expect(screen.getByText('Setup de Máquina')).toBeInTheDocument();
      expect(screen.getByText('Controle de Qualidade')).toBeInTheDocument();
    });

    it('should display activity descriptions', () => {
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('Produção de itens na linha de montagem')).toBeInTheDocument();
      expect(screen.getByText('Configuração de máquinas para novos lotes')).toBeInTheDocument();
    });

    it('should display cost driver badges with translated labels', () => {
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('Hora Máquina')).toBeInTheDocument();
      expect(screen.getByText('Setups')).toBeInTheDocument();
      expect(screen.getByText('Quantidade')).toBeInTheDocument();
    });

    it('should display configured rate for activity with rate', () => {
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('Pool de Produção')).toBeInTheDocument();
      expect(screen.getByText('R$ 25.5000')).toBeInTheDocument();
    });

    it('should display "Taxa não configurada" for activity without rate', () => {
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      const unconfiguredTexts = screen.getAllByText('Taxa não configurada');
      expect(unconfiguredTexts.length).toBeGreaterThan(0);
    });

    it('should render configure buttons for all activities', () => {
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      const configureButtons = screen.getAllByRole('button', { name: /configurar/i });
      expect(configureButtons).toHaveLength(mockActivities.length);
    });

    it('should render empty state when no activities', () => {
      render(
        <ABCActivityRatesCard
          activities={[]}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('Taxas por Atividade')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /configurar/i })).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode when clicking configure button', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      const configureButtons = screen.getAllByRole('button', { name: /configurar/i });
      await user.click(configureButtons[0]);

      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
      expect(screen.getByText('Pool de custo')).toBeInTheDocument();
    });

    it('should pre-fill values when activity has existing rate', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      const configureButtons = screen.getAllByRole('button', { name: /configurar/i });
      await user.click(configureButtons[0]);

      const input = screen.getByPlaceholderText('0.00');
      expect(input).toHaveValue(25.5);
    });

    it('should cancel edit mode when clicking cancel button', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      const configureButtons = screen.getAllByRole('button', { name: /configurar/i });
      await user.click(configureButtons[0]);

      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();

      // Find and click cancel button (X icon)
      const cancelButton = screen.getByRole('button', { name: '' });
      const buttons = screen.getAllByRole('button');
      const xButton = buttons.find(btn => btn.querySelector('.text-red-500'));
      
      if (xButton) {
        await user.click(xButton);
      }

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('0.00')).not.toBeInTheDocument();
      });
    });

    it('should update rate when saving with valid data', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={[]}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      const configureButtons = screen.getAllByRole('button', { name: /configurar/i });
      await user.click(configureButtons[0]);

      // Enter rate value
      const input = screen.getByPlaceholderText('0.00');
      await user.clear(input);
      await user.type(input, '15.75');

      // Select cost pool
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const poolOption = await screen.findByText('Pool de Produção');
      await user.click(poolOption);

      // Click save button
      const buttons = screen.getAllByRole('button');
      const saveButton = buttons.find(btn => btn.querySelector('.text-green-500'));
      
      if (saveButton) {
        await user.click(saveButton);
      }

      await waitFor(() => {
        expect(mockOnUpdateRate).toHaveBeenCalledWith({
          activity_id: 'act-1',
          cost_pool_id: 'pool-1',
          rate_per_unit: 15.75,
          period_start: periodStart,
          period_end: periodEnd,
        });
      });
    });

    it('should not call onUpdateRate when saving without cost pool', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={[]}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      const configureButtons = screen.getAllByRole('button', { name: /configurar/i });
      await user.click(configureButtons[0]);

      // Only enter rate value, don't select pool
      const input = screen.getByPlaceholderText('0.00');
      await user.type(input, '15.75');

      // Click save button
      const buttons = screen.getAllByRole('button');
      const saveButton = buttons.find(btn => btn.querySelector('.text-green-500'));
      
      if (saveButton) {
        await user.click(saveButton);
      }

      expect(mockOnUpdateRate).not.toHaveBeenCalled();
    });

    it('should not call onUpdateRate when saving without rate value', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={[]}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      const configureButtons = screen.getAllByRole('button', { name: /configurar/i });
      await user.click(configureButtons[0]);

      // Only select pool, don't enter rate
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      
      const poolOption = await screen.findByText('Pool de Produção');
      await user.click(poolOption);

      // Click save button
      const buttons = screen.getAllByRole('button');
      const saveButton = buttons.find(btn => btn.querySelector('.text-green-500'));
      
      if (saveButton) {
        await user.click(saveButton);
      }

      expect(mockOnUpdateRate).not.toHaveBeenCalled();
    });
  });

  describe('Cost Driver Labels', () => {
    it('should display correct label for machine_hours', () => {
      const activities: ABCActivity[] = [{
        id: 'act-1',
        name: 'Test',
        description: 'Test desc',
        cost_driver: 'machine_hours',
        created_at: '2024-01-01T00:00:00Z',
      }];

      render(
        <ABCActivityRatesCard
          activities={activities}
          costPools={mockCostPools}
          activityRates={[]}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('Hora Máquina')).toBeInTheDocument();
    });

    it('should display correct label for labor_hours', () => {
      const activities: ABCActivity[] = [{
        id: 'act-1',
        name: 'Test',
        description: 'Test desc',
        cost_driver: 'labor_hours',
        created_at: '2024-01-01T00:00:00Z',
      }];

      render(
        <ABCActivityRatesCard
          activities={activities}
          costPools={mockCostPools}
          activityRates={[]}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('Hora Trabalho')).toBeInTheDocument();
    });

    it('should fallback to raw cost driver name for unknown drivers', () => {
      const activities: ABCActivity[] = [{
        id: 'act-1',
        name: 'Test',
        description: 'Test desc',
        cost_driver: 'custom_driver' as any,
        created_at: '2024-01-01T00:00:00Z',
      }];

      render(
        <ABCActivityRatesCard
          activities={activities}
          costPools={mockCostPools}
          activityRates={[]}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('custom_driver')).toBeInTheDocument();
    });
  });

  describe('Rate Display Formatting', () => {
    it('should format rate with 4 decimal places', () => {
      const rates: ABCActivityRate[] = [{
        id: 'rate-1',
        activity_id: 'act-1',
        cost_pool_id: 'pool-1',
        rate_per_unit: 12.3456789,
        period_start: periodStart,
        period_end: periodEnd,
        created_at: '2024-01-01T00:00:00Z',
      }];

      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={rates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('R$ 12.3457')).toBeInTheDocument();
    });

    it('should display zero rate correctly', () => {
      const rates: ABCActivityRate[] = [{
        id: 'rate-1',
        activity_id: 'act-1',
        cost_pool_id: 'pool-1',
        rate_per_unit: 0,
        period_start: periodStart,
        period_end: periodEnd,
        created_at: '2024-01-01T00:00:00Z',
      }];

      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={rates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByText('R$ 0.0000')).toBeInTheDocument();
    });
  });

  describe('Period Handling', () => {
    it('should only show rates within current period', () => {
      const pastRates: ABCActivityRate[] = [{
        id: 'rate-1',
        activity_id: 'act-1',
        cost_pool_id: 'pool-1',
        rate_per_unit: 100,
        period_start: '2020-01-01',
        period_end: '2020-01-31',
        created_at: '2020-01-01T00:00:00Z',
      }];

      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={pastRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.queryByText('R$ 100.0000')).not.toBeInTheDocument();
      expect(screen.getAllByText('Taxa não configurada').length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible card structure', () => {
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      expect(screen.getByRole('heading', { name: /taxas por atividade/i })).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      const configureButtons = screen.getAllByRole('button', { name: /configurar/i });
      configureButtons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });

    it('should have accessible input fields in edit mode', async () => {
      const user = userEvent.setup();
      
      render(
        <ABCActivityRatesCard
          activities={mockActivities}
          costPools={mockCostPools}
          activityRates={mockActivityRates}
          onUpdateRate={mockOnUpdateRate}
        />
      );

      const configureButtons = screen.getAllByRole('button', { name: /configurar/i });
      await user.click(configureButtons[0]);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });
});
