// Main TPM hook - combines data, mutations, and stats
// Refactored into smaller modules for maintainability

import { useTPMData, useTPMMutations, useTPMStats } from './tpm';

// Re-export types for backward compatibility
export * from './tpm';

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
    approveMaintenance,
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
    approveMaintenance,
    checkAndGenerateAlerts,
    resolveAlert,
  };
}
