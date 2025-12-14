// Main TPM hook - combines data, mutations, and stats
// Refactored into smaller modules for maintainability

import { useTPMData } from './tpm/useTPMData';
import { useTPMMutations } from './tpm/useTPMMutations';
import { useTPMStats } from './tpm/useTPMStats';

// Re-export types for backward compatibility
export * from './tpm/types';

export function useTPM() {
  // Data fetching with realtime subscriptions
  const {
    maintenanceTypes,
    schedules,
    checklists,
    records,
    alerts,
    machines,
    isLoading,
  } = useTPMData();

  // Mutations for CRUD operations
  const {
    createSchedule,
    startMaintenance,
    completeMaintenance,
    checkAndGenerateAlerts,
    resolveAlert,
  } = useTPMMutations({ schedules, alerts });

  // Statistics and helpers
  const { stats, getSchedulesByStatus } = useTPMStats({ schedules, records, alerts });

  return {
    // Data
    maintenanceTypes,
    schedules,
    checklists,
    records,
    alerts,
    machines,
    stats,
    
    // Loading
    isLoading,
    
    // Helpers
    getSchedulesByStatus,
    
    // Mutations
    createSchedule,
    startMaintenance,
    completeMaintenance,
    checkAndGenerateAlerts,
    resolveAlert,
  };
}
