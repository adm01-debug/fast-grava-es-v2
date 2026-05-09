import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

export type HistoryPeriodPreset = 'today' | '7d' | '30d' | 'all' | 'custom';

export interface HistoryPeriodValue {
  preset: HistoryPeriodPreset;
  fromDate?: string;
  toDate?: string;
}

interface Props {
  value: HistoryPeriodValue;
  onChange: (next: HistoryPeriodValue) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  resultCount?: number;
}

export function computePeriodRange(preset: HistoryPeriodPreset, range?: DateRange): { fromDate?: string; toDate?: string } {
  const now = new Date();
  if (preset === 'today') {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    return { fromDate: start.toISOString(), toDate: now.toISOString() };
  }
  if (preset === '7d') {
    const start = new Date(now); start.setDate(start.getDate() - 7);
    return { fromDate: start.toISOString(), toDate: now.toISOString() };
  }
  if (preset === '30d') {
    const start = new Date(now); start.setDate(start.getDate() - 30);
    return { fromDate: start.toISOString(), toDate: now.toISOString() };
  }
  if (preset === 'custom' && range?.from) {
    const from = new Date(range.from); from.setHours(0, 0, 0, 0);
    const to = range.to ? new Date(range.to) : new Date(range.from);
    to.setHours(23, 59, 59, 999);
    return { fromDate: from.toISOString(), toDate: to.toISOString() };
  }
  return {};
}

export function HistoryPeriodFilter({ value, onChange, onExport, resultCount }: Props) {
  const [range, setRange] = useState<DateRange | undefined>(
    value.fromDate ? { from: new Date(value.fromDate), to: value.toDate ? new Date(value.toDate) : undefined } : undefined,
  );

  const presets: { key: HistoryPeriodPreset; label: string }[] = useMemo(() => ([
    { key: 'today', label: 'Hoje' },
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: 'all', label: 'Tudo' },
  ]), []);

  const select = (preset: HistoryPeriodPreset) => {
    const r = computePeriodRange(preset);
    onChange({ preset, ...r });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {presets.map((p) => (
        <Button
          key={p.key}
          size="sm"
          variant={value.preset === p.key ? 'default' : 'outline'}
          onClick={() => select(p.key)}
          className="h-8"
        >
          {p.label}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant={value.preset === 'custom' ? 'default' : 'outline'}
            className={cn('h-8 gap-1', value.preset !== 'custom' && 'text-muted-foreground')}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {value.preset === 'custom' && range?.from ? (
              range.to
                ? `${format(range.from, 'dd/MM', { locale: ptBR })} - ${format(range.to, 'dd/MM', { locale: ptBR })}`
                : format(range.from, 'dd/MM/yyyy', { locale: ptBR })
            ) : 'Personalizado'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => {
              setRange(r);
              if (r?.from) {
                const computed = computePeriodRange('custom', r);
                onChange({ preset: 'custom', ...computed });
              }
            }}
            numberOfMonths={1}
            locale={ptBR}
            initialFocus
            className={cn('p-3 pointer-events-auto')}
          />
        </PopoverContent>
      </Popover>

      {onExport && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1 ml-2 text-muted-foreground"
          onClick={() => onExport('csv')}
        >
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </Button>
      )}

      {typeof resultCount === 'number' && (
        <span className="text-xs text-muted-foreground ml-auto">
          {resultCount} {resultCount === 1 ? 'registro' : 'registros'}
        </span>
      )}
    </div>
  );
}
