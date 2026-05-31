import { useState, useMemo, useCallback, useEffect } from 'react';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { toast } from 'sonner';

export interface OEEDashboardFilters {
  period: string;
  machineId: string;
  techniqueId: string;
  studioId: string;
  shift: string;
  activeTab: string;
}

export interface OEEDateRange {
  start: Date;
  end: Date;
}

export interface OEEQueryFilters {
  machineId?: string;
  techniqueId?: string;
  shift?: string;
  startDate: Date;
  endDate: Date;
}

export interface OEELossFilters extends Omit<OEEQueryFilters, 'startDate' | 'endDate'> {
  startDate: string;
  endDate: string;
}

export function useOEEDashboardFilters() {
  const [period, setPeriod] = useState('30');
  const [machineId, setMachineId] = useState('all');
  const [techniqueId, setTechniqueId] = useState('all');
  const [studioId, setStudioId] = useState('all');
  const [shift, setShift] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('period');
    const m = params.get('machineId');
    const t = params.get('techniqueId');
    const s = params.get('shift');
    const tab = params.get('tab');

    if (p) setPeriod(p);
    if (m) setMachineId(m);
    if (t) setTechniqueId(t);
    if (s) setShift(s);
    if (tab) setActiveTab(tab);
  }, []);

  const dateRange = useMemo<OEEDateRange>(() => {
    const now = new Date();
    return {
      start: startOfDay(subDays(now, parseInt(period, 10))),
      end: endOfDay(now),
    };
  }, [period]);

  const oeeFilters = useMemo<OEEQueryFilters>(() => ({
    machineId: machineId === 'all' ? undefined : machineId,
    techniqueId: techniqueId === 'all' ? undefined : techniqueId,
    shift: shift === 'all' ? undefined : shift,
    startDate: dateRange.start,
    endDate: dateRange.end,
  }), [machineId, techniqueId, shift, dateRange]);

  const lossFilters = useMemo<OEELossFilters>(() => ({
    ...oeeFilters,
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString(),
  }), [oeeFilters, dateRange]);

  const handleShare = useCallback(() => {
    const params = new URLSearchParams({ period, machineId, techniqueId, shift, tab: activeTab });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast.success('Link de compartilhamento copiado!', {
      description: 'Todos os filtros atuais foram incluídos no link.',
    });
  }, [period, machineId, techniqueId, shift, activeTab]);

  return {
    period, setPeriod,
    machineId, setMachineId,
    techniqueId, setTechniqueId,
    studioId, setStudioId,
    shift, setShift,
    activeTab, setActiveTab,
    dateRange,
    oeeFilters,
    lossFilters,
    handleShare,
  };
}
