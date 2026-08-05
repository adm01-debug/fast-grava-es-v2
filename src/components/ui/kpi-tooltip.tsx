import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPITooltipProps {
  children: ReactNode;
  title: string;
  description: string;
  formula?: string;
  target?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  benchmark?: string;
  className?: string;
}

export function KPITooltip({
  children,
  title,
  description,
  formula,
  target,
  trend,
  trendValue,
  benchmark,
  className,
}: KPITooltipProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={cn("cursor-help relative group", className)}>
            {children}
            <Info className="h-3 w-3 text-muted-foreground/50 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs p-3 space-y-2"
          sideOffset={8}
        >
          <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>

          {formula && (
            <div className="pt-1 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fórmula</p>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                {formula}
              </code>
            </div>
          )}

          {target && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Meta:</span>
              <span className="font-medium">{target}</span>
            </div>
          )}

          {benchmark && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Benchmark:</span>
              <span className="font-medium">{benchmark}</span>
            </div>
          )}

          {trend && trendValue && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Tendência:</span>
              <div className={cn("flex items-center gap-1 font-medium", trendColor)}>
                <TrendIcon className="h-3 w-3" />
                {trendValue}
              </div>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Pre-defined KPI tooltips for common metrics
export const KPI_DEFINITIONS = {
  oee: {
    title: 'OEE - Overall Equipment Effectiveness',
    description: 'Mede a eficácia geral do equipamento combinando disponibilidade, desempenho e qualidade.',
    formula: 'Disponibilidade × Desempenho × Qualidade',
    target: '≥ 85%',
    benchmark: 'World Class: 85%+',
  },
  mtbf: {
    title: 'MTBF - Mean Time Between Failures',
    description: 'Tempo médio entre falhas. Indica a confiabilidade do equipamento.',
    formula: 'Tempo Total de Operação / Número de Falhas',
    target: 'Maximizar',
    benchmark: 'Varia por equipamento',
  },
  mttr: {
    title: 'MTTR - Mean Time To Repair',
    description: 'Tempo médio para reparo. Indica a eficiência da manutenção.',
    formula: 'Tempo Total de Reparo / Número de Reparos',
    target: 'Minimizar',
    benchmark: '< 2 horas',
  },
  availability: {
    title: 'Disponibilidade',
    description: 'Percentual do tempo que o equipamento está disponível para produção.',
    formula: '(Tempo Planejado - Paradas) / Tempo Planejado',
    target: '≥ 95%',
  },
  performance: {
    title: 'Desempenho',
    description: 'Velocidade real comparada à velocidade ideal de produção.',
    formula: 'Ciclo Real / Ciclo Ideal',
    target: '≥ 95%',
  },
  quality: {
    title: 'Qualidade',
    description: 'Percentual de peças boas em relação ao total produzido.',
    formula: 'Peças Boas / Total Produzido',
    target: '≥ 99%',
  },
  efficiency: {
    title: 'Eficiência',
    description: 'Relação entre produção real e capacidade teórica.',
    formula: 'Produção Real / Capacidade Teórica',
    target: '≥ 90%',
  },
  lossRate: {
    title: 'Taxa de Perdas',
    description: 'Percentual de peças perdidas ou refugadas.',
    formula: 'Peças Perdidas / Total Produzido',
    target: '< 2%',
  },
};
