import { useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedulingData } from './useSchedulingData';
import { useOperatorMachines } from './useOperatorMachines';

/**
 * Hook that provides dashboard data filtered by user role.
 * Operators see only their assigned machines and related jobs.
 * Coordinators and managers see all data.
 */
export function useOperatorDashboardData() {
  const { user, isOperator } = useAuth();
  const schedulingData = useSchedulingData();
  const { assignments, isLoading: isLoadingAssignments } = useOperatorMachines(user?.id);

  // Get assigned machine IDs for the current operator
  const assignedMachineIds = useMemo(() => {
    if (!isOperator || !assignments) return null;
    return assignments.map(a => a.machine_id);
  }, [isOperator, assignments]);

  // Filter machines based on role
  const machines = useMemo(() => {
    if (!isOperator || !assignedMachineIds) {
      return schedulingData.machines;
    }
    return schedulingData.machines.filter(m => assignedMachineIds.includes(m.id));
  }, [isOperator, assignedMachineIds, schedulingData.machines]);

  // Filter jobs based on role (jobs on assigned machines only for operators)
  const jobs = useMemo(() => {
    if (!isOperator || !assignedMachineIds) {
      return schedulingData.jobs;
    }
    return schedulingData.jobs.filter(j => 
      j.machine_id && assignedMachineIds.includes(j.machine_id)
    );
  }, [isOperator, assignedMachineIds, schedulingData.jobs]);

  // Filter techniques to only those relevant for assigned machines
  const techniques = useMemo(() => {
    if (!isOperator || !assignedMachineIds) {
      return schedulingData.techniques;
    }
    const relevantTechniqueIds = new Set(machines.map(m => m.technique_id));
    return schedulingData.techniques.filter(t => relevantTechniqueIds.has(t.id));
  }, [isOperator, assignedMachineIds, machines, schedulingData.techniques]);

  // Recalculate stats based on filtered data
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayJobs = jobs.filter(j => j.scheduled_date === today);

    return {
      total: jobs.length,
      completed: jobs.filter(j => j.status === 'finished').length,
      inProgress: jobs.filter(j => j.status === 'production').length,
      delayed: jobs.filter(j => j.status === 'delayed').length,
      queue: jobs.filter(j => j.status === 'queue').length,
      ready: jobs.filter(j => j.status === 'ready').length,
      scheduled: jobs.filter(j => j.status === 'scheduled').length,
      paused: jobs.filter(j => j.status === 'paused').length,
      rework: jobs.filter(j => j.status === 'rework').length,
      todayScheduled: todayJobs.length,
      todayCompleted: todayJobs.filter(j => j.status === 'finished').length,
      todayInProgress: todayJobs.filter(j => j.status === 'production').length,
      todayDelayed: todayJobs.filter(j => j.status === 'delayed').length,
      totalPieces: jobs.reduce((sum, j) => sum + j.quantity, 0),
      completedPieces: jobs.filter(j => j.status === 'finished').reduce((sum, j) => sum + j.quantity, 0),
      lostPieces: jobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0),
    };
  }, [jobs]);

  // Helper functions that work with filtered data for operators
  const getJobsByStatus = useCallback((status: string) => {
    return jobs.filter(j => j.status === status);
  }, [jobs]);

  const getJobsByMachine = useCallback((machineId: string) => {
    return jobs.filter(j => j.machine_id === machineId);
  }, [jobs]);

  const getJobsByTechnique = useCallback((techniqueId: string) => {
    return jobs.filter(j => j.technique_id === techniqueId);
  }, [jobs]);

  const getMachinesByTechnique = useCallback((techniqueId: string) => {
    return machines.filter(m => m.technique_id === techniqueId);
  }, [machines]);

  return {
    // Filtered data
    jobs,
    machines,
    techniques,
    stats,

    // Loading states
    isLoading: schedulingData.isLoading || (isOperator && isLoadingAssignments),

    // Helper functions using filtered data (consistent for operators)
    getTechniqueById: schedulingData.getTechniqueById,
    getMachineById: schedulingData.getMachineById,
    getMachinesByTechnique,
    getJobsByStatus,
    getJobsByMachine,
    getJobsByTechnique,

    // Role info
    isOperator,
    assignedMachineIds,

    // Refetch functions
    refetchAll: schedulingData.refetchAll,
  };
}
