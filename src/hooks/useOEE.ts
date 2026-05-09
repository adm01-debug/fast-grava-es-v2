import { useMemo } from 'react';
import { useSchedulingData } from './useSchedulingData';
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

export function useOEE(daysBack: number = 30) {
  const { jobs, machines, techniques, isLoading } = useSchedulingData();
  
  const data = useMemo<OEEData | null>(() => {
    if (!jobs || !machines || !techniques) return null;
    
    // Validate daysBack parameter
    const validDaysBack = Math.max(1, Math.min(365, daysBack));
    
    const now = new Date();
    const startDate = startOfDay(subDays(now, validDaysBack));
    const endDate = endOfDay(now);
    
    // Filter completed jobs within the period with validation
    const periodJobs = jobs.filter(job => {
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
        totalEstimatedMinutes += sanitizeNumber(job.estimated_duration, 60);
        
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
    
    // Generate trend data (last 14 days)
    const trendData: OEEData['trendData'] = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayJobs = periodJobs.filter(job => {
        if (!job.actual_end_time) return false;
        const endTime = parseISO(job.actual_end_time);
        return isWithinInterval(endTime, { start: dayStart, end: dayEnd });
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
        if (job.actual_start_time && job.actual_end_time) {
          dayActual += differenceInMinutes(parseISO(job.actual_end_time), parseISO(job.actual_start_time));
        }
        dayEstimated += job.estimated_duration ?? 60;
        dayProduced += job.produced_quantity ?? job.quantity ?? 0;
        dayLost += job.lost_pieces ?? 0;
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
    
    return {
      overallOEE: Math.round(overallOEE * 10) / 10,
      overallAvailability: Math.round(overallAvailability * 10) / 10,
      overallPerformance: Math.round(overallPerformance * 10) / 10,
      overallQuality: Math.round(overallQuality * 10) / 10,
      
      byMachine,
      byTechnique,
      trendData,
      
      worldClassBenchmark: WORLD_CLASS_OEE,
      
      availabilityLosses: Math.round(availabilityLosses * 10) / 10,
      performanceLosses: Math.round(performanceLosses * 10) / 10,
      qualityLosses: Math.round(qualityLosses * 10) / 10
    };
  }, [jobs, machines, techniques, daysBack]);
  
  return { data, isLoading };
}

export { getOEEColor, classifyOEE, WORLD_CLASS_OEE };
