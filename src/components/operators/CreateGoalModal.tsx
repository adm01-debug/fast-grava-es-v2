import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOperatorGoals, GoalType, GOAL_TYPE_LABELS, CreateGoalInput } from '@/features/production';
import { useOperators } from '@/features/production';
import { Loader2, Target } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultOperatorId?: string;
}

export function CreateGoalModal({ open, onOpenChange, defaultOperatorId }: CreateGoalModalProps) {
  const { createGoal, isCreating, getCurrentMonthPeriod } = useOperatorGoals();
  const { data: operators } = useOperators();
  const defaultPeriod = getCurrentMonthPeriod();

  const [formData, setFormData] = useState<CreateGoalInput>({
    operator_id: defaultOperatorId || '',
    goal_type: 'efficiency',
    target_value: 80,
    period_start: defaultPeriod.start,
    period_end: defaultPeriod.end,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.operator_id) {
      return;
    }

    createGoal(formData, {
      onSuccess: () => {
        onOpenChange(false);
        // Reset form
        setFormData({
          operator_id: defaultOperatorId || '',
          goal_type: 'efficiency',
          target_value: 80,
          period_start: defaultPeriod.start,
          period_end: defaultPeriod.end,
        });
      },
    });
  };

  const handlePeriodPreset = (preset: 'current' | 'next' | 'quarter') => {
    const now = new Date();
    let start: Date, end: Date;

    switch (preset) {
      case 'current':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'next':
        start = startOfMonth(addMonths(now, 1));
        end = endOfMonth(addMonths(now, 1));
        break;
      case 'quarter':
        start = startOfMonth(now);
        end = endOfMonth(addMonths(now, 2));
        break;
    }

    setFormData(prev => ({
      ...prev,
      period_start: format(start, 'yyyy-MM-dd'),
      period_end: format(end, 'yyyy-MM-dd'),
    }));
  };

  const getDefaultValue = (type: GoalType): number => {
    switch (type) {
      case 'efficiency': return 80;
      case 'jobs_completed': return 50;
      case 'pieces_produced': return 1000;
      case 'loss_rate': return 5;
    }
  };

  const getValueLabel = (type: GoalType): string => {
    switch (type) {
      case 'efficiency':
      case 'loss_rate':
        return 'Valor (%)';
      default:
        return 'Valor';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Nova Meta
          </DialogTitle>
          <DialogDescription>
            Defina uma meta de desempenho para o operador
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Operator Selection */}
          <div className="space-y-2">
            <Label>Operador</Label>
            <Select
              value={formData.operator_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, operator_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um operador" />
              </SelectTrigger>
              <SelectContent>
              {operators?.map(op => (
                <SelectItem key={op.user_id} value={op.user_id}>
                  {op.full_name || 'Sem nome'}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goal Type */}
          <div className="space-y-2">
            <Label>Tipo de Meta</Label>
            <Select
              value={formData.goal_type}
              onValueChange={(value: GoalType) => setFormData(prev => ({
                ...prev,
                goal_type: value,
                target_value: getDefaultValue(value),
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(GOAL_TYPE_LABELS) as GoalType[]).map(type => (
                  <SelectItem key={type} value={type}>
                    {GOAL_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <Label>{getValueLabel(formData.goal_type)}</Label>
            <Input
              type="number"
              step={formData.goal_type === 'efficiency' || formData.goal_type === 'loss_rate' ? '0.1' : '1'}
              min="0"
              max={formData.goal_type === 'efficiency' || formData.goal_type === 'loss_rate' ? '100' : undefined}
              value={formData.target_value}
              onChange={(e) => setFormData(prev => ({ ...prev, target_value: parseFloat(e.target.value) || 0 }))}
            />
            {formData.goal_type === 'loss_rate' && (
              <p className="text-xs text-muted-foreground">Para taxa de perda, quanto menor, melhor</p>
            )}
          </div>

          {/* Period Presets */}
          <div className="space-y-2">
            <Label>Período</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => handlePeriodPreset('current')}>
                Mês Atual
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handlePeriodPreset('next')}>
                Próximo Mês
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handlePeriodPreset('quarter')}>
                Trimestre
              </Button>
            </div>
          </div>

          {/* Period Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início</Label>
              <Input
                type="date"
                value={formData.period_start}
                onChange={(e) => setFormData(prev => ({ ...prev, period_start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input
                type="date"
                value={formData.period_end}
                onChange={(e) => setFormData(prev => ({ ...prev, period_end: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || !formData.operator_id}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Meta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
