import { memo, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchedulingData } from '@/hooks/useSchedulingData';
import { Skeleton } from '@/components/ui/skeleton';

interface OccupancyData {
  technique: string;
  shortName: string;
  occupancy: number;
  color: string;
}

// Cores vibrantes como na referência
const vibrantColors = [
  'hsl(145, 80%, 45%)',   // Verde vibrante
  'hsl(24, 100%, 50%)',   // Laranja
  'hsl(180, 100%, 45%)',  // Ciano
  'hsl(280, 85%, 55%)',   // Roxo
  'hsl(48, 100%, 50%)',   // Amarelo
  'hsl(330, 85%, 55%)',   // Rosa/Magenta
  'hsl(210, 100%, 55%)',  // Azul
  'hsl(145, 80%, 45%)',   // Verde
  'hsl(24, 100%, 50%)',   // Laranja
  'hsl(195, 100%, 50%)',  // Ciano claro
];

// Memoized tooltip content style
const tooltipContentStyle = {
  backgroundColor: 'hsl(222, 18%, 10%)',
  border: '1px solid hsl(222, 15%, 20%)',
  borderRadius: '8px',
  boxShadow: '0 8px 32px -4px rgb(0 0 0 / 0.5)',
  color: 'hsl(0, 0%, 95%)',
};

const tooltipLabelStyle = { color: 'hsl(0, 0%, 95%)' };

// Memoized cell renderer
const OccupancyCell = memo(({ color, index }: { color: string; index: number }) => (
  <Cell 
    key={`cell-${index}`} 
    fill={color}
    style={{ filter: 'brightness(1.1)' }}
  />
));
OccupancyCell.displayName = 'OccupancyCell';

function OccupancyChartComponent() {
  const { techniques, jobs, isLoading } = useSchedulingData();

  // Calculate real occupancy data based on jobs
  const occupancyData: OccupancyData[] = useMemo(() => {
    return techniques.slice(0, 10).map((tech, index) => {
      // Count jobs for this technique
      const techniqueJobs = jobs.filter(job => job.technique_id === tech.id);
      const activeJobs = techniqueJobs.filter(job => 
        ['production', 'scheduled', 'ready'].includes(job.status)
      );
      const finishedJobs = techniqueJobs.filter(job => job.status === 'finished');
      
      // Calculate occupancy based on jobs distribution
      // If no jobs at all, show 0% occupancy (real data, not fake)
      let occupancy = 0;
      if (techniqueJobs.length > 0) {
        const activeAndFinished = activeJobs.length + finishedJobs.length;
        occupancy = Math.min(100, Math.round((activeAndFinished / techniqueJobs.length) * 100));
      }

      return {
        technique: tech.name,
        shortName: tech.short_name,
        occupancy,
        color: tech.color || vibrantColors[index % vibrantColors.length],
      };
    }).filter(item => item.occupancy > 0 || jobs.some(j => j.technique_id === techniques.find(t => t.short_name === item.shortName)?.id));
  }, [techniques, jobs]);

  // Memoized tooltip formatter
  const tooltipFormatter = useMemo(() => (value: number) => [`${value}%`, 'Ocupação'], []);
  const tooltipLabelFormatter = useMemo(() => 
    (label: string) => occupancyData.find(d => d.shortName === label)?.technique || label,
    [occupancyData]
  );

  if (isLoading) {
    return (
      <Card className="glass-card card-interactive animate-fade-in-up">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card card-interactive animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.1s] dark:hover:shadow-[0_8px_32px_-8px_hsl(142,70%,50%,0.2)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <span className="gradient-text">Ocupação por Técnica</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="h-[320px] min-w-[400px]">
          {occupancyData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhuma técnica cadastrada
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  horizontal={true} 
                  vertical={false} 
                  stroke="hsl(222, 15%, 18%)" 
                />
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  tickFormatter={(value) => `${value}%`}
                  stroke="hsl(220, 10%, 45%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="shortName" 
                  width={75}
                  stroke="hsl(220, 10%, 55%)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={tooltipFormatter}
                  labelFormatter={tooltipLabelFormatter}
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                />
                <Bar dataKey="occupancy" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {occupancyData.map((entry, index) => (
                    <OccupancyCell key={`cell-${index}`} color={entry.color} index={index} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const OccupancyChart = memo(OccupancyChartComponent);
OccupancyChart.displayName = 'OccupancyChart';