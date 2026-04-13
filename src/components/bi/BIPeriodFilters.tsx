import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type PeriodFilter = '7d' | '30d' | '90d' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

interface BIPeriodFiltersProps {
  periodFilter: PeriodFilter;
  setPeriodFilter: (v: PeriodFilter) => void;
  customRange: DateRange;
  setCustomRange: React.Dispatch<React.SetStateAction<DateRange>>;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (v: boolean) => void;
  periodLabel: string;
  periodJobs: number;
  comparisonMode: boolean;
  periodFilter2: PeriodFilter;
  setPeriodFilter2: (v: PeriodFilter) => void;
  customRange2: DateRange;
  setCustomRange2: React.Dispatch<React.SetStateAction<DateRange>>;
  isCalendarOpen2: boolean;
  setIsCalendarOpen2: (v: boolean) => void;
  periodLabel2: string;
  periodJobs2: number;
}

export function BIPeriodFilters({
  periodFilter, setPeriodFilter, customRange, setCustomRange,
  isCalendarOpen, setIsCalendarOpen, periodLabel, periodJobs,
  comparisonMode, periodFilter2, setPeriodFilter2, customRange2, setCustomRange2,
  isCalendarOpen2, setIsCalendarOpen2, periodLabel2, periodJobs2,
}: BIPeriodFiltersProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-xp/5 glass-card">
      <CardContent className="pt-4 pb-4">
        <div className="space-y-4">
          {/* Period 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">1</Badge>
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Período 1:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['7d', '30d', '90d'] as const).map(p => (
                <Button key={p} variant={periodFilter === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriodFilter(p)}>
                  {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
                </Button>
              ))}
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant={periodFilter === 'custom' ? 'default' : 'outline'} size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Personalizado
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-4 space-y-4">
                    <p className="text-sm font-medium">Selecione o período 1</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">De:</p>
                        <Calendar mode="single" selected={customRange.from} onSelect={(date) => date && setCustomRange(prev => ({ ...prev, from: date }))} disabled={(date) => date > new Date() || date > customRange.to} className={cn("p-3 pointer-events-auto")} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Até:</p>
                        <Calendar mode="single" selected={customRange.to} onSelect={(date) => date && setCustomRange(prev => ({ ...prev, to: date }))} disabled={(date) => date > new Date() || date < customRange.from} className={cn("p-3 pointer-events-auto")} />
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => { setPeriodFilter('custom'); setIsCalendarOpen(false); }}>Aplicar</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {periodLabel} • {periodJobs} jobs
            </Badge>
          </div>

          {/* Period 2 */}
          {comparisonMode && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">2</Badge>
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Período 2:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(['7d', '30d', '90d'] as const).map(p => (
                  <Button key={p} variant={periodFilter2 === p ? 'secondary' : 'outline'} size="sm" onClick={() => setPeriodFilter2(p)}>
                    {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
                  </Button>
                ))}
                <Popover open={isCalendarOpen2} onOpenChange={setIsCalendarOpen2}>
                  <PopoverTrigger asChild>
                    <Button variant={periodFilter2 === 'custom' ? 'secondary' : 'outline'} size="sm" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Personalizado
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-4 space-y-4">
                      <p className="text-sm font-medium">Selecione o período 2</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">De:</p>
                          <Calendar mode="single" selected={customRange2.from} onSelect={(date) => date && setCustomRange2(prev => ({ ...prev, from: date }))} disabled={(date) => date > new Date() || date > customRange2.to} className={cn("p-3 pointer-events-auto")} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Até:</p>
                          <Calendar mode="single" selected={customRange2.to} onSelect={(date) => date && setCustomRange2(prev => ({ ...prev, to: date }))} disabled={(date) => date > new Date() || date < customRange2.from} className={cn("p-3 pointer-events-auto")} />
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => { setPeriodFilter2('custom'); setIsCalendarOpen2(false); }}>Aplicar</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Badge variant="outline" className="ml-auto">
                {periodLabel2} • {periodJobs2} jobs
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
