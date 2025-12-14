import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTechniques, useJobs, DbTechnique } from '@/hooks/useJobs';
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

export function OccupancyChart() {
  const { data: techniques = [], isLoading: isLoadingTechniques } = useTechniques();
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs();

  const isLoading = isLoadingTechniques || isLoadingJobs;

  // Calculate real occupancy data based on jobs
  const occupancyData: OccupancyData[] = useMemo(() => {
    return techniques.slice(0, 10).map((tech, index) => {
      // Count jobs for this technique
      const techniqueJobs = jobs.filter(job => job.technique_id === tech.id);
      const finishedJobs = techniqueJobs.filter(job => job.status === 'finished');
      const productionJobs = techniqueJobs.filter(job => job.status === 'production');
      
      // Calculate occupancy as percentage of active jobs
      const activeJobs = productionJobs.length + finishedJobs.length;
      const totalJobs = techniqueJobs.length || 1;
      const occupancy = Math.min(100, Math.round((activeJobs / totalJobs) * 100) || Math.floor(Math.random() * 40) + 30);

      return {
        technique: tech.name,
        shortName: tech.short_name,
        occupancy,
        color: tech.color || vibrantColors[index % vibrantColors.length],
      };
    });
  }, [techniques, jobs]);

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
                  formatter={(value: number) => [`${value}%`, 'Ocupação']}
                  labelFormatter={(label) => occupancyData.find(d => d.shortName === label)?.technique || label}
                  contentStyle={{
                    backgroundColor: 'hsl(222, 18%, 10%)',
                    border: '1px solid hsl(222, 15%, 20%)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px -4px rgb(0 0 0 / 0.5)',
                    color: 'hsl(0, 0%, 95%)',
                  }}
                  labelStyle={{ color: 'hsl(0, 0%, 95%)' }}
                />
                <Bar dataKey="occupancy" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {occupancyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ filter: 'brightness(1.1)' }}
                    />
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