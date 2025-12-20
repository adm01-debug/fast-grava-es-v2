import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, parseISO, differenceInDays } from 'date-fns';

interface TrendDataPoint {
  date: string;
  value: number;
  predicted?: boolean;
}

interface TrendAnalysis {
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  forecast: TrendDataPoint[];
  seasonality: {
    weekday: Record<string, number>;
    monthly: Record<string, number>;
  };
  anomalies: Array<{
    date: string;
    value: number;
    expected: number;
    deviation: number;
  }>;
}

interface ProductionTrends {
  daily: TrendDataPoint[];
  weekly: TrendDataPoint[];
  monthly: TrendDataPoint[];
  byTechnique: Record<string, TrendDataPoint[]>;
  byMachine: Record<string, TrendDataPoint[]>;
  analysis: TrendAnalysis;
}

export function useTrendingAnalysis(days: number = 30) {
  return useQuery({
    queryKey: ['trending-analysis', days],
    queryFn: async (): Promise<ProductionTrends> => {
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      // Fetch jobs in period
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
          id,
          status,
          quantity,
          produced_quantity,
          lost_pieces,
          scheduled_date,
          actual_start_time,
          actual_end_time,
          technique_id,
          machine_id,
          created_at
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Daily aggregation
      const dailyData: Record<string, { produced: number; jobs: number; lost: number }> = {};
      const byTechnique: Record<string, Record<string, number>> = {};
      const byMachine: Record<string, Record<string, number>> = {};
      const weekdayTotals: Record<string, number[]> = {};
      const monthlyTotals: Record<string, number[]> = {};

      jobs?.forEach(job => {
        const date = job.scheduled_date || job.created_at.split('T')[0];
        const produced = job.produced_quantity || 0;
        const lost = job.lost_pieces || 0;

        // Daily
        if (!dailyData[date]) {
          dailyData[date] = { produced: 0, jobs: 0, lost: 0 };
        }
        dailyData[date].produced += produced;
        dailyData[date].jobs++;
        dailyData[date].lost += lost;

        // By technique
        if (job.technique_id) {
          if (!byTechnique[job.technique_id]) {
            byTechnique[job.technique_id] = {};
          }
          byTechnique[job.technique_id][date] = (byTechnique[job.technique_id][date] || 0) + produced;
        }

        // By machine
        if (job.machine_id) {
          if (!byMachine[job.machine_id]) {
            byMachine[job.machine_id] = {};
          }
          byMachine[job.machine_id][date] = (byMachine[job.machine_id][date] || 0) + produced;
        }

        // Seasonality - weekday
        try {
          const dateObj = parseISO(date);
          const weekday = format(dateObj, 'EEEE');
          if (!weekdayTotals[weekday]) {
            weekdayTotals[weekday] = [];
          }
          weekdayTotals[weekday].push(produced);

          // Seasonality - monthly
          const month = format(dateObj, 'MMMM');
          if (!monthlyTotals[month]) {
            monthlyTotals[month] = [];
          }
          monthlyTotals[month].push(produced);
        } catch {
          // Invalid date, skip
        }
      });

      // Convert to arrays
      const daily: TrendDataPoint[] = Object.entries(dailyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          date,
          value: data.produced,
        }));

      // Weekly aggregation
      const weeklyData: Record<string, number> = {};
      daily.forEach(point => {
        try {
          const weekStart = format(
            subDays(parseISO(point.date), parseISO(point.date).getDay()),
            'yyyy-MM-dd'
          );
          weeklyData[weekStart] = (weeklyData[weekStart] || 0) + point.value;
        } catch {
          // Skip invalid dates
        }
      });

      const weekly: TrendDataPoint[] = Object.entries(weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({ date, value }));

      // Monthly aggregation
      const monthlyData: Record<string, number> = {};
      daily.forEach(point => {
        const month = point.date.substring(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + point.value;
      });

      const monthly: TrendDataPoint[] = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({ date, value }));

      // Convert by technique/machine
      const byTechniqueArray: Record<string, TrendDataPoint[]> = {};
      Object.entries(byTechnique).forEach(([techId, dates]) => {
        byTechniqueArray[techId] = Object.entries(dates)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, value]) => ({ date, value }));
      });

      const byMachineArray: Record<string, TrendDataPoint[]> = {};
      Object.entries(byMachine).forEach(([machineId, dates]) => {
        byMachineArray[machineId] = Object.entries(dates)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, value]) => ({ date, value }));
      });

      // Calculate trend analysis
      const analysis = calculateTrendAnalysis(daily, weekdayTotals, monthlyTotals);

      return {
        daily,
        weekly,
        monthly,
        byTechnique: byTechniqueArray,
        byMachine: byMachineArray,
        analysis,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}

function calculateTrendAnalysis(
  daily: TrendDataPoint[],
  weekdayTotals: Record<string, number[]>,
  monthlyTotals: Record<string, number[]>
): TrendAnalysis {
  // Calculate trend direction using linear regression
  const n = daily.length;
  if (n < 2) {
    return {
      trend: 'stable',
      changePercent: 0,
      forecast: [],
      seasonality: { weekday: {}, monthly: {} },
      anomalies: [],
    };
  }

  // Simple linear regression
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  daily.forEach((point, i) => {
    sumX += i;
    sumY += point.value;
    sumXY += i * point.value;
    sumX2 += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Trend direction
  const avgValue = sumY / n;
  const changePercent = avgValue > 0 ? (slope * n / avgValue) * 100 : 0;
  
  let trend: 'up' | 'down' | 'stable';
  if (changePercent > 5) {
    trend = 'up';
  } else if (changePercent < -5) {
    trend = 'down';
  } else {
    trend = 'stable';
  }

  // Generate forecast (next 7 days)
  const forecast: TrendDataPoint[] = [];
  for (let i = 1; i <= 7; i++) {
    const predictedValue = Math.max(0, intercept + slope * (n + i - 1));
    const date = format(subDays(new Date(), -i), 'yyyy-MM-dd');
    forecast.push({
      date,
      value: Math.round(predictedValue),
      predicted: true,
    });
  }

  // Calculate seasonality
  const weekdaySeasonality: Record<string, number> = {};
  Object.entries(weekdayTotals).forEach(([day, values]) => {
    weekdaySeasonality[day] = values.length > 0 
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
  });

  const monthlySeasonality: Record<string, number> = {};
  Object.entries(monthlyTotals).forEach(([month, values]) => {
    monthlySeasonality[month] = values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
  });

  // Detect anomalies (values > 2 standard deviations from mean)
  const values = daily.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const anomalies = daily
    .filter(point => Math.abs(point.value - mean) > 2 * stdDev)
    .map(point => ({
      date: point.date,
      value: point.value,
      expected: Math.round(mean),
      deviation: Math.round((point.value - mean) / stdDev * 100) / 100,
    }));

  return {
    trend,
    changePercent: Math.round(changePercent * 100) / 100,
    forecast,
    seasonality: {
      weekday: weekdaySeasonality,
      monthly: monthlySeasonality,
    },
    anomalies,
  };
}

// Demand forecast hook
export function useDemandForecast(techniqueId?: string) {
  return useQuery({
    queryKey: ['demand-forecast', techniqueId],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      let query = supabase
        .from('jobs')
        .select('quantity, scheduled_date, technique_id, status')
        .gte('created_at', thirtyDaysAgo);

      if (techniqueId) {
        query = query.eq('technique_id', techniqueId);
      }

      const { data: jobs, error } = await query;
      if (error) throw error;

      // Calculate average demand per day
      const dailyDemand: Record<string, number> = {};
      jobs?.forEach(job => {
        const date = job.scheduled_date || new Date().toISOString().split('T')[0];
        dailyDemand[date] = (dailyDemand[date] || 0) + (job.quantity || 0);
      });

      const demands = Object.values(dailyDemand);
      const avgDemand = demands.length > 0 
        ? demands.reduce((a, b) => a + b, 0) / demands.length 
        : 0;

      // Calculate confidence interval
      const variance = demands.reduce((sum, d) => sum + Math.pow(d - avgDemand, 2), 0) / demands.length;
      const stdDev = Math.sqrt(variance);

      // Forecast next 7 days
      const forecast = [];
      for (let i = 1; i <= 7; i++) {
        const date = format(subDays(new Date(), -i), 'yyyy-MM-dd');
        forecast.push({
          date,
          predicted: Math.round(avgDemand),
          low: Math.round(Math.max(0, avgDemand - 1.96 * stdDev)),
          high: Math.round(avgDemand + 1.96 * stdDev),
        });
      }

      return {
        avgDailyDemand: Math.round(avgDemand),
        stdDev: Math.round(stdDev),
        forecast,
        confidence: 0.95,
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
