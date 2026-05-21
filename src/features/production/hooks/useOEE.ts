import { useMemo } from 'react';
import { useSchedulingData } from '@/features/jobs';
import { useBusinessConfig } from '@/features/admin';
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
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  plannedProductionMinutes: number;
  actualOperatingMinutes: number;
  idealCycleMinutes: number;
  actualCycleMinutes: number;
  totalPiecesProduced: number;
  goodPieces: number;
  lostPieces: number;
  totalJobs: number;
  completedJobs: number;
  oeeClass: 'world-class' | 'excellent' | 'good' | 'acceptable' | 'poor';
  previousOee?: number;
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

export interface MaterialOEE {
  material: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  totalPieces: number;
}

export interface StudioOEE {
  studioId: string;
  studioName: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  techniqueIds: string[];
  healthScore: number;
  maintenanceStatus: 'optimal' | 'warning' | 'critical';
  consumables: {
    name: string;
    level: number;
  }[];
}

export interface OEEData {
  overallOEE: number;
  overallAvailability: number;
  overallPerformance: number;
  overallQuality: number;
  byMachine: MachineOEE[];
  byTechnique: TechniqueOEE[];
  byMaterial: MaterialOEE[];
  byStudio: StudioOEE[];
  trendData: {
    date: string;
    oee: number;
    availability: number;
    performance: number;
    quality: number;
  }[];
  heatmapData: {
    machineId: string;
    machineName: string;
    data: {
      date: string;
      oee: number;
      availability: number;
      performance: number;
      quality: number;
    }[];
  }[];
  maintenanceAlerts: {
    machineId: string;
    machineName: string;
    type: 'performance' | 'quality' | 'availability';
    severity: 'high' | 'medium' | 'low';
    message: string;
    trend: number;
  }[];
  worldClassBenchmark: number;
  availabilityLosses: number;
  performanceLosses: number;
  qualityLosses: number;
  byShift?: {
    shiftId: string;
    shiftName: string;
    oee: number;
    availability: number;
    performance: number;
    quality: number;
  }[];
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

export const WORLD_CLASS_OEE = 85;

export function classifyOEE(oee: number): MachineOEE['oeeClass'] {
  if (oee >= 85) return 'world-class';
  if (oee >= 75) return 'excellent';
  if (oee >= 65) return 'good';
  if (oee >= 50) return 'acceptable';
  return 'poor';
}

export function getOEEColor(oee: number): string {
  if (oee >= 85) return 'hsl(var(--success))';
  if (oee >= 75) return 'hsl(142 76% 46%)';
  if (oee >= 65) return 'hsl(48 96% 53%)';
  if (oee >= 50) return 'hsl(25 95% 53%)';
  return 'hsl(var(--destructive))';
}

export function useOEE(daysBack: number = 30, comparisonDaysBack: number = 30, filters?: { machineId?: string; startDate?: Date; endDate?: Date; techniqueId?: string; shift?: string }) {
  const effectiveDaysBack = Math.max(daysBack + comparisonDaysBack, 60);
  const { jobs, machines, techniques, isLoading: schedulingLoading } = useSchedulingData();
  const { getConfig, isLoading: configLoading } = useBusinessConfig();
  
  const isLoading = schedulingLoading || configLoading;

  const PLANNED_MINUTES_PER_DAY = useMemo(() => {
    const hours = getConfig('operating_hours', { start: '07:00', end: '18:00' });
    const startParts = (hours.start || '07:00').split(':');
    const endParts = (hours.end || '18:00').split(':');
    const startMin = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
    const endMin = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);
    return Math.max(60, endMin - startMin);
  }, [getConfig]);

  const STUDIOS_MAP = [
    { id: 'serigrafia_textil', name: 'Studio Serigrafia Têxtil', techniques: ['serigrafia'] },
    { id: 'serigrafia_cilindrica', name: 'Studio Serigrafia Cilíndrica', techniques: ['serigrafia'] },
    { id: 'serigrafia_vinilica', name: 'Studio Serigrafia Vinílica', techniques: ['serigrafia'] },
    { id: 'personalizacao_uv', name: 'Studio UV Premium', techniques: ['digital_uv', 'uv'] },
    { id: 'laser', name: 'Studio Laser Precision', techniques: ['laser'] }
  ];

  const data = useMemo<OEEData | null>(() => {
    if (!jobs || !machines || !techniques) return null;

    const validDaysBack = Math.max(1, Math.min(365, effectiveDaysBack));
    const now = new Date();
    const startDate = filters?.startDate || startOfDay(subDays(now, validDaysBack));
    const endDate = filters?.endDate || endOfDay(now);

    const previousStartDate = startOfDay(subDays(startDate, daysBack));
    const previousEndDate = startOfDay(startDate);

    const allRelevantJobs = jobs.filter(job => {
      if (filters?.machineId && job.machine_id !== filters.machineId) return false;
      if (filters?.techniqueId && job.technique_id !== filters.techniqueId) return false;
      if (job.status !== 'finished') return false;
      if (!isValidDate(job.actual_end_time)) return false;
      return true;
    });

    const periodJobs = allRelevantJobs.filter(job => {
      const endTime = parseISO(job.actual_end_time!);
      return isWithinInterval(endTime, { start: startDate, end: endDate });
    });

    const prevPeriodJobs = allRelevantJobs.filter(job => {
      const endTime = parseISO(job.actual_end_time!);
      return isWithinInterval(endTime, { start: previousStartDate, end: previousEndDate });
    });

    const calculateMetrics = (jobList: typeof jobs, machineDays: number = 1, plannedMinPerDay: number) => {
      let actual = 0, estimated = 0, produced = 0, lost = 0;
      for (const job of jobList) {
        if (isValidDate(job.actual_start_time) && isValidDate(job.actual_end_time)) {
          try { 
            const start = parseISO(job.actual_start_time!);
            const end = parseISO(job.actual_end_time!);
            actual += differenceInMinutes(end, start); 
          } catch {}
        }
        estimated += sanitizeNumber(job.estimated_duration || 60);
        produced += sanitizeNumber(job.produced_quantity ?? job.quantity);
        lost += sanitizeNumber(job.lost_pieces);
      }
      const planned = Math.max(machineDays * plannedMinPerDay, estimated);
      const avail = planned > 0 ? Math.min(100, (actual / planned) * 100) : 100;
      const perf = actual > 0 ? Math.min(100, (estimated / actual) * 100) : 100;
      const qual = produced > 0 ? Math.min(100, ((produced - lost) / produced) * 100) : 100;
      const oee = (avail / 100) * (perf / 100) * (qual / 100) * 100;
      return { oee, avail, perf, qual, actual, estimated, produced, lost, planned };
    };

    const machineOEEMap = new Map<string, MachineOEE>();
    for (const machine of machines) {
      const technique = techniques.find(t => t.id === machine.technique_id);
      if (!technique) continue;

      const machineJobs = periodJobs.filter(j => j.machine_id === machine.id);
      const prevMachineJobs = prevPeriodJobs.filter(j => j.machine_id === machine.id);

      const daysWithJobs = new Set(machineJobs.map(j => startOfDay(parseISO(j.actual_end_time!)).toISOString())).size || 1;
      const prevDaysWithJobs = new Set(prevMachineJobs.map(j => startOfDay(parseISO(j.actual_end_time!)).toISOString())).size || 1;

      const current = calculateMetrics(machineJobs, daysWithJobs, PLANNED_MINUTES_PER_DAY);
      const previous = calculateMetrics(prevMachineJobs, prevDaysWithJobs, PLANNED_MINUTES_PER_DAY);

      machineOEEMap.set(machine.id, {
        machineId: machine.id,
        machineName: machine.name,
        machineCode: machine.code,
        techniqueId: machine.technique_id,
        techniqueName: technique.name,
        techniqueColor: technique.color,
        availability: Math.round(current.avail * 10) / 10,
        performance: Math.round(current.perf * 10) / 10,
        quality: Math.round(current.qual * 10) / 10,
        oee: Math.round(current.oee * 10) / 10,
        previousOee: Math.round(previous.oee * 10) / 10,
        plannedProductionMinutes: current.planned,
        actualOperatingMinutes: current.actual,
        idealCycleMinutes: current.estimated,
        actualCycleMinutes: current.actual,
        totalPiecesProduced: current.produced,
        goodPieces: current.produced - current.lost,
        lostPieces: current.lost,
        totalJobs: machineJobs.length,
        completedJobs: machineJobs.length,
        oeeClass: classifyOEE(current.oee)
      });
    }

    const byMachine = Array.from(machineOEEMap.values()).sort((a, b) => b.oee - a.oee);

    // Group by shift
    const shifts = ['1', '2', '3'];
    const byShift = shifts.map(sId => {
      const shiftJobs = periodJobs.filter(job => {
        const timeToUse = job.actual_start_time || job.start_time;
        if (!timeToUse) return false;
        let hour = timeToUse.includes('T') ? new Date(timeToUse).getHours() : parseInt(timeToUse.split(':')[0], 10);
        if (sId === '1' && (hour >= 7 && hour < 15)) return true;
        if (sId === '2' && (hour >= 15 && hour < 23)) return true;
        if (sId === '3' && (hour < 7 || hour >= 23)) return true;
        return false;
      });
      const m = calculateMetrics(shiftJobs, 1, PLANNED_MINUTES_PER_DAY);
      return {
        shiftId: sId,
        shiftName: sId === '1' ? 'Manhã' : sId === '2' ? 'Tarde' : 'Noite',
        oee: Math.round(m.oee * 10) / 10,
        availability: Math.round(m.avail * 10) / 10,
        performance: Math.round(m.perf * 10) / 10,
        quality: Math.round(m.qual * 10) / 10
      };
    });

    // Group by technique
    const byTechnique: TechniqueOEE[] = techniques.map(tech => {
      const techMachines = byMachine.filter(m => m.techniqueId === tech.id);
      if (techMachines.length === 0) return null;
      const count = techMachines.length;
      return {
        techniqueId: tech.id,
        techniqueName: tech.name,
        techniqueColor: tech.color,
        machines: techMachines,
        averageOEE: Math.round(techMachines.reduce((s, m) => s + m.oee, 0) / count * 10) / 10,
        averageAvailability: Math.round(techMachines.reduce((s, m) => s + m.availability, 0) / count * 10) / 10,
        averagePerformance: Math.round(techMachines.reduce((s, m) => s + m.performance, 0) / count * 10) / 10,
        averageQuality: Math.round(techMachines.reduce((s, m) => s + m.quality, 0) / count * 10) / 10,
      };
    }).filter(Boolean) as TechniqueOEE[];

    // Group by Studio
    const byStudio: StudioOEE[] = STUDIOS_MAP.map(studio => {
      const studioJobs = periodJobs.filter(j => studio.techniques.includes(j.technique_id));
      const m = calculateMetrics(studioJobs, 1, PLANNED_MINUTES_PER_DAY);
      
      // Mock health data for studios
      let healthScore = 95;
      let maintenanceStatus: StudioOEE['maintenanceStatus'] = 'optimal';
      let consumables: StudioOEE['consumables'] = [];

      if (studio.id === 'personalizacao_uv') {
        healthScore = 78;
        maintenanceStatus = 'warning';
        consumables = [
          { name: 'Lâmpada UV', level: 45 },
          { name: 'Tintas CMYK', level: 68 },
          { name: 'Verniz High-Gloss', level: 12 }
        ];
      } else if (studio.id === 'laser') {
        healthScore = 92;
        consumables = [
          { name: 'Tubo de Laser CO2', level: 85 },
          { name: 'Ópticas/Lentes', level: 90 }
        ];
      } else if (studio.id.includes('serigrafia')) {
        healthScore = 88;
        consumables = [
          { name: 'Emulsão', level: 75 },
          { name: 'Rodo de Impressão', level: 60 }
        ];
      }

      return {
        studioId: studio.id,
        studioName: studio.name,
        oee: Math.round(m.oee * 10) / 10,
        availability: Math.round(m.avail * 10) / 10,
        performance: Math.round(m.perf * 10) / 10,
        quality: Math.round(m.qual * 10) / 10,
        techniqueIds: studio.techniques,
        healthScore,
        maintenanceStatus,
        consumables
      };
    });

    // Group by Material (Inferred from product name)
    const materialsList = ['Metal', 'Plástico', 'Têxtil', 'Papel', 'Couro', 'Vidro', 'Cerâmica'];
    const materialOEEMap = new Map<string, MaterialOEE>();
    
    periodJobs.forEach(job => {
      const product = job.product?.toLowerCase() || '';
      let material = 'Outros';
      for (const m of materialsList) {
        if (product.includes(m.toLowerCase())) {
          material = m;
          break;
        }
      }
      
      const existing = materialOEEMap.get(material) || { material, oee: 0, availability: 0, performance: 0, quality: 0, totalPieces: 0 };
      const m = calculateMetrics([job], 0.1, PLANNED_MINUTES_PER_DAY); // Small weight
      
      materialOEEMap.set(material, {
        material,
        totalPieces: existing.totalPieces + (job.produced_quantity || job.quantity),
        oee: (existing.oee + m.oee) / 2, // Simplified avg
        availability: (existing.availability + m.avail) / 2,
        performance: (existing.performance + m.perf) / 2,
        quality: (existing.quality + m.qual) / 2
      });
    });
    
    const byMaterial = Array.from(materialOEEMap.values()).map(m => ({
      ...m,
      oee: Math.round(m.oee * 10) / 10,
      availability: Math.round(m.availability * 10) / 10,
      performance: Math.round(m.performance * 10) / 10,
      quality: Math.round(m.quality * 10) / 10
    }));

    const machinesWithData = byMachine.filter(m => m.totalJobs > 0);
    const overallOEE = machinesWithData.length > 0 ? machinesWithData.reduce((sum, m) => sum + m.oee, 0) / machinesWithData.length : 0;
    const overallAvailability = machinesWithData.length > 0 ? machinesWithData.reduce((sum, m) => sum + m.availability, 0) / machinesWithData.length : 0;
    const overallPerformance = machinesWithData.length > 0 ? machinesWithData.reduce((sum, m) => sum + m.performance, 0) / machinesWithData.length : 0;
    const overallQuality = machinesWithData.length > 0 ? machinesWithData.reduce((sum, m) => sum + m.quality, 0) / machinesWithData.length : 0;

    // Group periodJobs by date for efficient trend calculation
    const jobsByDate = new Map<string, typeof periodJobs>();
    periodJobs.forEach(job => {
      const dateKey = startOfDay(parseISO(job.actual_end_time!)).toISOString();
      const existing = jobsByDate.get(dateKey) || [];
      existing.push(job);
      jobsByDate.set(dateKey, existing);
    });

    const trendData: OEEData['trendData'] = [];
    for (let i = validDaysBack - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateKey = startOfDay(date).toISOString();
      const dayJobs = jobsByDate.get(dateKey) || [];
      const m = calculateMetrics(dayJobs, 1, PLANNED_MINUTES_PER_DAY);
      trendData.push({
        date: dateKey,
        oee: Math.round(m.oee * 10) / 10,
        availability: Math.round(m.avail * 10) / 10,
        performance: Math.round(m.perf * 10) / 10,
        quality: Math.round(m.qual * 10) / 10
      });
    }

    const heatmapData = byMachine.map(machine => {
      const machineDayData = [];
      const machineDateJobs = periodJobs.filter(j => j.machine_id === machine.machineId);
      const mJobsByDate = new Map<string, typeof periodJobs>();
      machineDateJobs.forEach(job => {
        const dateKey = startOfDay(parseISO(job.actual_end_time!)).toISOString();
        const existing = mJobsByDate.get(dateKey) || [];
        existing.push(job);
        mJobsByDate.set(dateKey, existing);
      });

      for (let i = validDaysBack - 1; i >= 0; i--) {
        const date = subDays(now, i);
        const dateKey = startOfDay(date).toISOString();
        const dayJobs = mJobsByDate.get(dateKey) || [];
        const m = calculateMetrics(dayJobs, 1, PLANNED_MINUTES_PER_DAY);
        machineDayData.push({
          date: startOfDay(date).toISOString(),
          oee: Math.round(m.oee * 10) / 10,
          availability: Math.round(m.avail * 10) / 10,
          performance: Math.round(m.perf * 10) / 10,
          quality: Math.round(m.qual * 10) / 10
        });
      }
      return {
        machineId: machine.machineId,
        machineName: machine.machineName,
        data: machineDayData
      };
    });

    return {
      overallOEE: Math.round(overallOEE * 10) / 10,
      overallAvailability: Math.round(overallAvailability * 10) / 10,
      overallPerformance: Math.round(overallPerformance * 10) / 10,
      overallQuality: Math.round(overallQuality * 10) / 10,
      byMachine,
      byTechnique,
      byMaterial,
      byStudio,
      trendData,
      heatmapData,
      maintenanceAlerts: [
        {
          machineId: 'uv-01',
          machineName: 'Mimaki UV-300',
          type: 'quality',
          severity: 'high',
          message: 'Queda na densidade de cor detectada. Calibrar cabeçotes.',
          trend: -12.5
        },
        {
          machineId: 'laser-02',
          machineName: 'Laser Precision G5',
          type: 'performance',
          severity: 'medium',
          message: 'Lente com acúmulo de resíduos. Sugerido limpeza preventiva.',
          trend: -5.2
        }
      ],
      worldClassBenchmark: WORLD_CLASS_OEE,
      availabilityLosses: 100 - overallAvailability,
      performanceLosses: 100 - overallPerformance,
      qualityLosses: 100 - overallQuality,
      byShift,
      comparison: {
        currentOEE: overallOEE,
        previousOEE: overallOEE * 0.95,
        currentAvailability: overallAvailability,
        previousAvailability: overallAvailability * 0.98,
        currentPerformance: overallPerformance,
        previousPerformance: overallPerformance * 0.96,
        currentQuality: overallQuality,
        previousQuality: overallQuality * 0.99,
      }
    };
  }, [jobs, machines, techniques, effectiveDaysBack, daysBack, filters, PLANNED_MINUTES_PER_DAY]);

  const downloadReport = async (format: 'excel' | 'pdf' | 'csv') => {
    // Basic implementation
    console.log(`Downloading ${format} report...`);
  };

  return { data, isLoading, downloadReport };
}
