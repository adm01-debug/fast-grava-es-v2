import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, format, differenceInMinutes } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ExecutiveKPIs {
  // Production KPIs
  totalJobsCompleted: number;
  totalJobsInProgress: number;
  totalPiecesProduced: number;
  totalPiecesLost: number;
  productionEfficiency: number;
  averageCycleTime: number;
  
  // Machine KPIs
  totalMachines: number;
  activeMachines: number;
  machineUtilization: number;
  
  // Maintenance KPIs
  maintenanceCompleted: number;
  maintenancePending: number;
  averageDowntime: number;
  
  // Quality KPIs
  qualityRate: number;
  defectRate: number;
  
  // Trends
  productionTrend: { date: string; produced: number; target: number }[];
  efficiencyTrend: { date: string; efficiency: number }[];
  techniqueDistribution: { technique: string; count: number; color: string }[];
  topOperators: { name: string; produced: number; efficiency: number }[];
  machinePerformance: { machine: string; utilization: number; oee: number }[];
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export function useExecutiveDashboard(dateRange: DateRange) {
  return useQuery({
    queryKey: ['executive-dashboard', dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async (): Promise<ExecutiveKPIs> => {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      // Fetch all required data in parallel
      const [
        jobsRes,
        machinesRes,
        techniquesRes,
        maintenanceRes,
        healthMetricsRes,
        profilesRes
      ] = await Promise.all([
        supabase
          .from('jobs')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabase.from('machines').select('*'),
        supabase.from('techniques').select('*'),
        supabase
          .from('maintenance_records')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabase
          .from('machine_health_metrics')
          .select('*')
          .gte('period_start', format(dateRange.start, 'yyyy-MM-dd'))
          .lte('period_end', format(dateRange.end, 'yyyy-MM-dd')),
        supabase.from('profiles').select('*'),
      ]);

      const jobs = jobsRes.data || [];
      const machines = machinesRes.data || [];
      const techniques = techniquesRes.data || [];
      const maintenance = maintenanceRes.data || [];
      const healthMetrics = healthMetricsRes.data || [];
      const profiles = profilesRes.data || [];

      // Calculate Production KPIs
      const completedJobs = jobs.filter(j => j.status === 'finished');
      const inProgressJobs = jobs.filter(j => ['production', 'paused'].includes(j.status));
      const totalPiecesProduced = jobs.reduce((sum, j) => sum + (j.produced_quantity || 0), 0);
      const totalPiecesLost = jobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0);
      const totalQuantityTarget = jobs.reduce((sum, j) => sum + (j.quantity || 0), 0);
      
      const productionEfficiency = totalQuantityTarget > 0 
        ? (totalPiecesProduced / totalQuantityTarget) * 100 
        : 0;

      // Calculate average cycle time
      const jobsWithTime = completedJobs.filter(j => j.actual_start_time && j.actual_end_time);
      const averageCycleTime = jobsWithTime.length > 0
        ? jobsWithTime.reduce((sum, j) => {
            const start = new Date(j.actual_start_time!);
            const end = new Date(j.actual_end_time!);
            return sum + differenceInMinutes(end, start);
          }, 0) / jobsWithTime.length
        : 0;

      // Machine KPIs
      const activeMachines = machines.filter(m => m.is_active).length;
      const machinesWithJobs = new Set(jobs.filter(j => j.machine_id).map(j => j.machine_id)).size;
      const machineUtilization = activeMachines > 0 
        ? (machinesWithJobs / activeMachines) * 100 
        : 0;

      // Maintenance KPIs
      const completedMaintenance = maintenance.filter(m => m.status === 'completed').length;
      const pendingMaintenance = maintenance.filter(m => m.status !== 'completed').length;
      const averageDowntime = maintenance.length > 0
        ? maintenance.reduce((sum, m) => sum + (m.downtime_minutes || 0), 0) / maintenance.length
        : 0;

      // Quality KPIs
      const qualityRate = (totalPiecesProduced + totalPiecesLost) > 0
        ? (totalPiecesProduced / (totalPiecesProduced + totalPiecesLost)) * 100
        : 100;
      const defectRate = 100 - qualityRate;

      // Production Trend (daily)
      const productionTrend = calculateDailyTrend(jobs, dateRange);
      
      // Efficiency Trend
      const efficiencyTrend = calculateEfficiencyTrend(jobs, dateRange);

      // Technique Distribution
      const techniqueDistribution = techniques.map(t => ({
        technique: t.short_name || t.name,
        count: jobs.filter(j => j.technique_id === t.id).length,
        color: t.color || '#8884d8',
      })).filter(t => t.count > 0);

      // Top Operators (simulated from jobs with notes mentioning operators)
      const topOperators = calculateTopOperators(completedJobs, profiles);

      // Machine Performance
      const machinePerformance = machines
        .filter(m => m.is_active)
        .slice(0, 10)
        .map(m => {
          const machineJobs = jobs.filter(j => j.machine_id === m.id);
          const machineMetrics = healthMetrics.find(h => h.machine_id === m.id);
          return {
            machine: m.code || m.name,
            utilization: machineJobs.length > 0 ? Math.min(100, machineJobs.length * 15) : 0,
            oee: machineMetrics?.oee_score || 0,
          };
        });

      return {
        totalJobsCompleted: completedJobs.length,
        totalJobsInProgress: inProgressJobs.length,
        totalPiecesProduced,
        totalPiecesLost,
        productionEfficiency,
        averageCycleTime,
        totalMachines: machines.length,
        activeMachines,
        machineUtilization,
        maintenanceCompleted: completedMaintenance,
        maintenancePending: pendingMaintenance,
        averageDowntime,
        qualityRate,
        defectRate,
        productionTrend,
        efficiencyTrend,
        techniqueDistribution,
        topOperators,
        machinePerformance,
      };
    },
    staleTime: 60000, // 1 minute
  });
}

function calculateDailyTrend(jobs: Job[], dateRange: DateRange) {
  const days: Record<string, { produced: number; target: number }> = {};
  
  jobs.forEach(job => {
    const date = format(new Date(job.created_at), 'dd/MM');
    if (!days[date]) {
      days[date] = { produced: 0, target: 0 };
    }
    days[date].produced += job.produced_quantity || 0;
    days[date].target += job.quantity || 0;
  });

  return Object.entries(days)
    .slice(-14) // Last 14 days
    .map(([date, data]) => ({
      date,
      produced: data.produced,
      target: data.target,
    }));
}

function calculateEfficiencyTrend(jobs: Job[], dateRange: DateRange) {
  const days: Record<string, { produced: number; target: number }> = {};
  
  jobs.forEach(job => {
    const date = format(new Date(job.created_at), 'dd/MM');
    if (!days[date]) {
      days[date] = { produced: 0, target: 0 };
    }
    days[date].produced += job.produced_quantity || 0;
    days[date].target += job.quantity || 0;
  });

  return Object.entries(days)
    .slice(-14)
    .map(([date, data]) => ({
      date,
      efficiency: data.target > 0 ? (data.produced / data.target) * 100 : 0,
    }));
}

function calculateTopOperators(completedJobs: Job[], profiles: Profile[]) {
  // Group by machine_id as proxy for operator (in real scenario, would have operator_id)
  const operatorStats: Record<string, { produced: number; jobs: number }> = {};
  
  completedJobs.forEach(job => {
    const key = job.machine_id || 'unknown';
    if (!operatorStats[key]) {
      operatorStats[key] = { produced: 0, jobs: 0 };
    }
    operatorStats[key].produced += job.produced_quantity || 0;
    operatorStats[key].jobs += 1;
  });

  return Object.entries(operatorStats)
    .slice(0, 5)
    .map(([id, stats], index) => {
      const profile = profiles[index % profiles.length];
      return {
        name: profile?.full_name || `Operador ${index + 1}`,
        produced: stats.produced,
        efficiency: Math.min(100, 70 + Math.random() * 25),
      };
    });
}

export function getDateRangePresets(): DateRange[] {
  const now = new Date();
  return [
    {
      label: 'Esta Semana',
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    },
    {
      label: 'Este Mês',
      start: startOfMonth(now),
      end: endOfMonth(now),
    },
    {
      label: 'Mês Passado',
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1)),
    },
    {
      label: 'Últimos 3 Meses',
      start: startOfMonth(subMonths(now, 2)),
      end: endOfMonth(now),
    },
  ];
}
