// Main ABC Costing hook - combines data, mutations, and calculations
// Refactored into smaller modules for maintainability

import { useABCData, useABCMutations, useABCCalculations } from './abc';

// Re-export types for backward compatibility
export * from './abc';

export function useABCCosts() {
  // Data fetching
  const {
    activities,
    costPools,
    activityRates,
    jobCosts,
    jobs,
    techniques,
    isLoading,
  } = useABCData();

  // Mutations for cost calculations and updates
  const {
    calculateJobCost,
    calculateAllJobsCosts,
    updateActivityRate,
    updateCostPoolBudget,
  } = useABCMutations({ activities, activityRates, jobs, techniques });

  // Cost calculation helpers
  const {
    getJobCostSummary,
    getTechniqueCostSummary,
    totalBudget,
    totalAllocatedCost,
    averageUnitCost,
  } = useABCCalculations({ costPools, jobCosts, jobs, techniques });

  return {
    // Data
    activities,
    costPools,
    activityRates,
    jobCosts,
    jobs,
    techniques,
    
    // Loading states
    isLoading,
    
    // Calculations
    getJobCostSummary,
    getTechniqueCostSummary,
    totalBudget,
    totalAllocatedCost,
    averageUnitCost,
    
    // Mutations
    calculateJobCost,
    calculateAllJobsCosts,
    updateActivityRate,
    updateCostPoolBudget,
  };
}
