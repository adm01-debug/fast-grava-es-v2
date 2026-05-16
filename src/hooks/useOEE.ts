import { useMemo } from 'react';
import { useSchedulingData } from './useSchedulingData';
import { useBusinessConfig } from './useBusinessConfig';
import { startOfDay, endOfDay, subDays, differenceInMinutes, parseISO, isWithinInterval, isValid } from 'date-fns';

// Data validation helpers
function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    return isValid(date);
  } catch {
    return false;
  }
}

function sanitizeNumber(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}


export interface MachineOEE {
  machineId: string;
  machineName: string;
  machineCode: string;
  techniqueId: string;
  techniqueName: string;
  techniqueColor: string;

  // Core OEE Metrics (0-100%)
  availability: number;
  performance: number;
  quality: number;
  oee: number;

  // Raw Data
  plannedProductionMinutes: number;
  actualOperatingMinutes: number;
  idealCycleMinutes: number;
  actualCycleMinutes: number;
  totalPiecesProduced: number;
  goodPieces: number;
  lostPieces: number;

  // Job Stats
  totalJobs: number;
  completedJobs: number;

  // Classification
  oeeClass: 'world-class' | 'excellent' | 'good' | 'acceptable' | 'poor';
}

export interface TechniqueOEE {
  techniqueId: string;
  techniqueName: string;
  techniqueColor: string;
  machines: MachineOEE[];
  averageOEE: number;
  averageAvailability: number;
  averagePerformance: number;
  averageQuality: number;
}

export interface OEEData {
  overallOEE: number;
  overallAvailability: number;
  overallPerformance: number;
  overallQuality: number;

  byMachine: MachineOEE[];
  byTechnique: TechniqueOEE[];

  // Trend data for charts
  trendData: {
    date: string;
    oee: number;
    availability: number;
    performance: number;
    quality: number;
  }[];

  // World-class benchmark
  worldClassBenchmark: number;

  // Losses breakdown
  availabilityLosses: number;
  performanceLosses: number;
  qualityLosses: number;
  comparison?: {
    currentOEE: number;
    previousOEE: number;
    currentAvailability: number;
    previousAvailability: number;
    currentPerformance: number;
    previousPerformance: number;
    currentQuality: number;
    previousQuality: number;
  };
}

// Operating hours per day (7:00 to 18:00 = 11 hours, can extend to 20:00 = 13 hours)
const PLANNED_HOURS_PER_DAY = 11;
const PLANNED_MINUTES_PER_DAY = PLANNED_HOURS_PER_DAY * 60;

// World-class OEE benchmark
const WORLD_CLASS_OEE = 85;

function classifyOEE(oee: number): MachineOEE['oeeClass'] {
  if (oee >= 85) return 'world-class';
  if (oee >= 75) return 'excellent';
  if (oee >= 65) return 'good';
  if (oee >= 50) return 'acceptable';
  return 'poor';
}

function getOEEColor(oee: number): string {
  if (oee >= 85) return 'hsl(var(--success))';
  if (oee >= 75) return 'hsl(142 76% 46%)';
  if (oee >= 65) return 'hsl(48 96% 53%)';
  if (oee >= 50) return 'hsl(25 95% 53%)';
  return 'hsl(var(--destructive))';
}

export function useOEE(daysBack: number = 30, comparisonDaysBack: number = 30, filters?: { machineId?: string; shiftId?: string; startDate?: Date; endDate?: Date }) {
  // Use at least double the period to have enough data for comparison
  const effectiveDaysBack = Math.max(daysBack + comparisonDaysBack, 60);
  const { jobs, machines, techniques, isLoading: schedulingLoading } = useSchedulingData();
  const { getConfig, isLoading: configLoading } = useBusinessConfig();
  
  const isLoading = schedulingLoading || configLoading;

  const PLANNED_MINUTES_PER_DAY = useMemo(() => {
    const hours = getConfig('operating_hours', { start: '07:00', end: '18:00' });
    // Assuming start and end are in "HH:MM" format
    const startParts = (hours.start || '07:00').split(':');
    const endParts = (hours.end || '18:00').split(':');
    const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    return Math.max(60, endMin - startMin);
  }, [getConfig]);

  const data = useMemo<OEEData | null>(() => {
    if (!jobs || !machines || !techniques) return null;

    // Validate daysBack parameter
    const validDaysBack = Math.max(1, Math.min(365, effectiveDaysBack));

    const now = new Date();
    const startDate = filters?.startDate || startOfDay(subDays(now, validDaysBack));
    const endDate = filters?.endDate || endOfDay(now);

    // Filter completed jobs within the period with validation
    const periodJobs = jobs.filter(job => {
      if (filters?.machineId && job.machine_id !== filters.machineId) return false;
      if (job.status !== 'finished') return false;
      if (!isValidDate(job.actual_end_time)) return false;

      try {
        const endTime = parseISO(job.actual_end_time!);
        return isWithinInterval(endTime, { start: startDate, end: endDate });
      } catch {
        return false;
      }
    });

    // Calculate OEE per machine
    const machineOEEMap = new Map<string, MachineOEE>();

    for (const machine of machines) {
      const technique = techniques.find(t => t.id === machine.technique_id);
      if (!technique) continue;

      const machineJobs = periodJobs.filter(j => j.machine_id === machine.id);

      // Calculate metrics
      let totalActualMinutes = 0;
      let totalEstimatedMinutes = 0;
      let totalProducedPieces = 0;
      let totalLostPieces = 0;
      let totalQuantity = 0;

      for (const job of machineJobs) {
        // Actual operating time with validation
        if (isValidDate(job.actual_start_time) && isValidDate(job.actual_end_time)) {
          try {
            const start = parseISO(job.actual_start_time!);
            const end = parseISO(job.actual_end_time!);
            const minutes = differenceInMinutes(end, start);
            totalActualMinutes += sanitizeNumber(minutes);
          } catch {
            // Skip invalid date pairs
          }
        }

        // Estimated time (ideal cycle time)
        totalEstimatedMinutes += sanitizeNumber(job.estimated_duration || 60);

        // Quality metrics - use produced_quantity if available, otherwise use quantity
        const producedQty = sanitizeNumber(job.produced_quantity ?? job.quantity);
        totalProducedPieces += producedQty;
        totalLostPieces += sanitizeNumber(job.lost_pieces);
        totalQuantity += sanitizeNumber(job.quantity);
      }

      // Calculate planned production time (days with jobs × hours per day)
      const daysWithJobs = new Set(
        machineJobs.map(j => j.actual_end_time ? startOfDay(parseISO(j.actual_end_time)).toISOString() : null)
          .filter(Boolean)
      ).size || 1; // Default to 1 to avoid division by zero

      const plannedMinutes = Math.max(daysWithJobs * PLANNED_MINUTES_PER_DAY, totalEstimatedMinutes);

      // REAL OEE CALCULATION based on flow metrics:

      // AVAILABILITY = Actual Operating Time / Planned Production Time
      // Availability = (Total Time - Downtime) / Total Time
      const availability = plannedMinutes > 0
        ? Math.min(100, (totalActualMinutes / plannedMinutes) * 100)
        : 100;

      // PERFORMANCE = (Total Produced Pieces * Ideal Cycle Time per Piece) / Operating Time
      // Or simply: Ideal Cycle Time for Total Production / Actual Operating Time
      const performance = totalActualMinutes > 0
        ? Math.min(100, (totalEstimatedMinutes / totalActualMinutes) * 100)
        : 100;

      // QUALITY = Good Pieces / Total Pieces Produced
      const goodPieces = totalProducedPieces - totalLostPieces;
      const quality = totalProducedPieces > 0
        ? Math.min(100, (goodPieces / totalProducedPieces) * 100)
        : 100;

      // OEE = Availability × Performance × Quality
      const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;

      machineOEEMap.set(machine.id, {
        machineId: machine.id,
        machineName: machine.name,
        machineCode: machine.code,
        techniqueId: machine.technique_id,
        techniqueName: technique.name,
        techniqueColor: technique.color,

        availability: Math.round(availability * 10) / 10,
        performance: Math.round(performance * 10) / 10,
        quality: Math.round(quality * 10) / 10,
        oee: Math.round(oee * 10) / 10,

        plannedProductionMinutes: plannedMinutes,
        actualOperatingMinutes: totalActualMinutes,
        idealCycleMinutes: totalEstimatedMinutes,
        actualCycleMinutes: totalActualMinutes,
        totalPiecesProduced: totalProducedPieces,
        goodPieces,
        lostPieces: totalLostPieces,

        totalJobs: machineJobs.length,
        completedJobs: machineJobs.length,

        oeeClass: classifyOEE(oee)
      });
    }

    const byMachine = Array.from(machineOEEMap.values()).sort((a, b) => b.oee - a.oee);

    // Group by technique
    const techniqueMap = new Map<string, TechniqueOEE>();

    for (const technique of techniques) {
      const techniqueMachines = byMachine.filter(m => m.techniqueId === technique.id);
      if (techniqueMachines.length === 0) continue;

      const avgOEE = techniqueMachines.reduce((sum, m) => sum + m.oee, 0) / techniqueMachines.length;
      const avgAvailability = techniqueMachines.reduce((sum, m) => sum + m.availability, 0) / techniqueMachines.length;
      const avgPerformance = techniqueMachines.reduce((sum, m) => sum + m.performance, 0) / techniqueMachines.length;
      const avgQuality = techniqueMachines.reduce((sum, m) => sum + m.quality, 0) / techniqueMachines.length;

      techniqueMap.set(technique.id, {
        techniqueId: technique.id,
        techniqueName: technique.name,
        techniqueColor: technique.color,
        machines: techniqueMachines,
        averageOEE: Math.round(avgOEE * 10) / 10,
        averageAvailability: Math.round(avgAvailability * 10) / 10,
        averagePerformance: Math.round(avgPerformance * 10) / 10,
        averageQuality: Math.round(avgQuality * 10) / 10
      });
    }

    const byTechnique = Array.from(techniqueMap.values()).sort((a, b) => b.averageOEE - a.averageOEE);

    // Calculate overall metrics
    const machinesWithData = byMachine.filter(m => m.totalJobs > 0);
    const overallOEE = machinesWithData.length > 0
      ? machinesWithData.reduce((sum, m) => sum + m.oee, 0) / machinesWithData.length
      : 0;
    const overallAvailability = machinesWithData.length > 0
      ? machinesWithData.reduce((sum, m) => sum + m.availability, 0) / machinesWithData.length
      : 0;
    const overallPerformance = machinesWithData.length > 0
      ? machinesWithData.reduce((sum, m) => sum + m.performance, 0) / machinesWithData.length
      : 0;
    const overallQuality = machinesWithData.length > 0
      ? machinesWithData.reduce((sum, m) => sum + m.quality, 0) / machinesWithData.length
      : 0;

    // Calculate losses
    const availabilityLosses = 100 - overallAvailability;
    const performanceLosses = (overallAvailability / 100) * (100 - overallPerformance);
    const qualityLosses = (overallAvailability / 100) * (overallPerformance / 100) * (100 - overallQuality);

    // Generate trend data (last 30 days for better historical view)
    const trendData: OEEData['trendData'] = [];
    const trendDays = validDaysBack;

    for (let i = trendDays - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayJobs = periodJobs.filter(job => {
        if (!job.actual_end_time) return false;
        try {
          const endTime = parseISO(job.actual_end_time);
          return isWithinInterval(endTime, { start: dayStart, end: dayEnd });
        } catch {
          return false;
        }
      });

      if (dayJobs.length === 0) {
        trendData.push({
          date: dayStart.toISOString(),
          oee: 0,
          availability: 0,
          performance: 0,
          quality: 0
        });
        continue;
      }

      // Calculate day metrics
      let dayActual = 0, dayEstimated = 0, dayProduced = 0, dayLost = 0;

      for (const job of dayJobs) {
        if (isValidDate(job.actual_start_time) && isValidDate(job.actual_end_time)) {
          try {
            dayActual += differenceInMinutes(parseISO(job.actual_end_time!), parseISO(job.actual_start_time!));
          } catch {}
        }
        dayEstimated += sanitizeNumber(job.estimated_duration || 60);
        dayProduced += sanitizeNumber(job.produced_quantity ?? job.quantity);
        dayLost += sanitizeNumber(job.lost_pieces);
      }

      const dayPlanned = Math.max(PLANNED_MINUTES_PER_DAY, dayEstimated);
      const dayAvail = dayPlanned > 0 ? Math.min(100, (dayActual / dayPlanned) * 100) : 0;
      const dayPerf = dayActual > 0 ? Math.min(100, (dayEstimated / dayActual) * 100) : 0;
      const dayQual = dayProduced > 0 ? Math.min(100, ((dayProduced - dayLost) / dayProduced) * 100) : 0;
      const dayOEE = (dayAvail / 100) * (dayPerf / 100) * (dayQual / 100) * 100;

      trendData.push({
        date: dayStart.toISOString(),
        oee: Math.round(dayOEE * 10) / 10,
        availability: Math.round(dayAvail * 10) / 10,
        performance: Math.round(dayPerf * 10) / 10,
        quality: Math.round(dayQual * 10) / 10
      });
    }

    // Calculate period-over-period comparison (e.g., last 30 days vs previous 30 days)
    const currentPeriod = trendData.slice(Math.max(0, trendData.length - daysBack));
    const previousPeriod = trendData.slice(0, Math.max(0, trendData.length - daysBack));

    const avg = (arr: OEEData['trendData'], key: keyof OEEData['trendData'][0]) => arr.length > 0 ? arr.reduce((s, x) => s + (x[key] as number), 0) / arr.length : 0;

    const comparison = {
      currentOEE: avg(currentPeriod, 'oee'),
      previousOEE: avg(previousPeriod, 'oee'),
      currentAvailability: avg(currentPeriod, 'availability'),
      previousAvailability: avg(previousPeriod, 'availability'),
      currentPerformance: avg(currentPeriod, 'performance'),
      previousPerformance: avg(previousPeriod, 'performance'),
      currentQuality: avg(currentPeriod, 'quality'),
      previousQuality: avg(previousPeriod, 'quality'),
    };

    return {
      overallOEE: Math.round(overallOEE * 10) / 10,
      overallAvailability: Math.round(overallAvailability * 10) / 10,
      overallPerformance: Math.round(overallPerformance * 10) / 10,
      overallQuality: Math.round(overallQuality * 10) / 10,

      byMachine,
      byTechnique,
      trendData,
      comparison,

      worldClassBenchmark: WORLD_CLASS_OEE,

      availabilityLosses: Math.round(availabilityLosses * 10) / 10,
      performanceLosses: Math.round(performanceLosses * 10) / 10,
      qualityLosses: Math.round(qualityLosses * 10) / 10
    };
  }, [jobs, machines, techniques, effectiveDaysBack, daysBack, filters]);

  const downloadReport = async () => {
    if (!data) return;
    try {
      const { exportExecutiveDashboardExcel } = await import('@/lib/excelExport');
      // We adapt OEE data to the executive format or similar
      await exportExecutiveDashboardExcel({
        title: 'Relatório de OEE',
        dateRange: {
          start: subDays(new Date(), daysBack),
          end: new Date(),
          label: `Últimos ${daysBack} dias`
        },
        kpis: {
          totalJobsCompleted: data.byMachine.reduce((sum, m) => sum + m.completedJobs, 0),
          totalJobsInProgress: 0,
          totalPiecesProduced: data.byMachine.reduce((sum, m) => sum + m.totalPiecesProduced, 0),
          totalPiecesLost: data.byMachine.reduce((sum, m) => sum + m.lostPieces, 0),
          productionEfficiency: data.overallPerformance,
          averageCycleTime: 0,
          totalMachines: machines?.length || 0,
          activeMachines: data.byMachine.filter(m => m.totalJobs > 0).length,
          machineUtilization: data.overallAvailability,
          maintenanceCompleted: 0,
          maintenancePending: 0,
          averageDowntime: 0,
          qualityRate: data.overallQuality,
          defectRate: 100 - data.overallQuality,
          trends: {
            production: 0,
            efficiency: data.comparison ? data.comparison.currentOEE - data.comparison.previousOEE : 0,
            quality: data.comparison ? data.comparison.currentQuality - data.comparison.previousQuality : 0,
            utilization: data.comparison ? data.comparison.currentAvailability - data.comparison.previousAvailability : 0,
          },
          productionTrend: data.trendData.map(t => ({ date: t.date, produced: t.oee, target: 85 })),
          efficiencyTrend: data.trendData.map(t => ({ date: t.date, efficiency: t.oee })),
          techniqueDistribution: data.byTechnique.map(t => ({ technique: t.techniqueName, count: t.machines.length, color: t.techniqueColor })),
          topOperators: [],
          machinePerformance: data.byMachine.map(m => ({ machine: m.machineName, utilization: m.availability, oee: m.oee }))
        }
      });
    } catch (err) {

    }
  };

  return { data, isLoading, downloadReport };
}

export { getOEEColor, classifyOEE, WORLD_CLASS_OEE };
