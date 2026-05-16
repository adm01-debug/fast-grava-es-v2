import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getOEEColor } from '@/hooks/useOEE';

interface OEEHeatmapProps {
  data: {
    machineId: string;
    machineName: string;
    data: {
      date: string;
      oee: number;
    }[];
  }[];
}

export const OEEHeatmap = memo(function OEEHeatmap({ data }: OEEHeatmapProps) {
  const { t } = useTranslation();

  // Get unique dates for the header
  const dates = useMemo(() => {
    if (!data.length || !data[0].data.length) return [];
    return data[0].data.map(d => d.date);
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-background/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          Mapa de Calor: Performance por Máquina
        </CardTitle>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-sm bg-destructive" />
             <span className="text-[10px] text-muted-foreground">Baixa</span>
           </div>
           <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-sm bg-indicator-warning" />
             <span className="text-[10px] text-muted-foreground">Média</span>
           </div>
           <div className="flex items-center gap-1">
             <div className="w-2 h-2 rounded-sm bg-success" />
             <span className="text-[10px] text-muted-foreground">Alta</span>
           </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase p-1 sticky left-0 bg-background/80 backdrop-blur-sm z-10 w-24">
                  Máquina
                </th>
                {dates.map((date, idx) => (
                  <th key={date} className="text-center text-[10px] font-bold text-muted-foreground uppercase p-1 min-w-[30px]">
                    {idx % 3 === 0 ? format(parseISO(date), 'dd/MM', { locale: ptBR }) : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((machine) => (
                <tr key={machine.machineId}>
                  <td className="text-left text-[11px] font-medium p-1 sticky left-0 bg-background/80 backdrop-blur-sm z-10 whitespace-nowrap border-r border-border/50">
                    {machine.machineName}
                  </td>
                  {machine.data.map((day) => (
                    <td key={day.date} className="p-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "w-full h-8 rounded-sm transition-all hover:scale-110 hover:z-20 cursor-help",
                                day.oee === 0 ? "bg-muted/20" : ""
                              )}
                              style={{ 
                                backgroundColor: day.oee > 0 ? getOEEColor(day.oee) : undefined,
                                opacity: day.oee > 0 ? 0.8 : 0.3
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-black/90 border-primary/20">
                            <div className="text-[10px] space-y-1">
                              <p className="font-bold">{machine.machineName}</p>
                              <p>{format(parseISO(day.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                              <p className="text-primary font-black">OEE: {day.oee}%</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});