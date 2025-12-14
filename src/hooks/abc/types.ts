// ABC Costing Types and Interfaces

export interface ABCActivity {
  id: string;
  name: string;
  description: string | null;
  cost_driver: string;
  technique_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ABCCostPool {
  id: string;
  name: string;
  description: string | null;
  pool_type: string;
  monthly_budget: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ABCActivityRate {
  id: string;
  activity_id: string;
  cost_pool_id: string;
  rate_per_unit: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
  activity?: ABCActivity;
  cost_pool?: ABCCostPool;
}

export interface ABCJobCost {
  id: string;
  job_id: string;
  activity_id: string;
  cost_pool_id: string;
  driver_quantity: number;
  unit_rate: number;
  total_cost: number;
  calculated_at: string;
  created_at: string;
  activity?: ABCActivity;
  cost_pool?: ABCCostPool;
}

export interface JobCostSummary {
  job_id: string;
  order_number: string;
  client: string;
  product: string;
  technique_id: string;
  quantity: number;
  total_cost: number;
  unit_cost: number;
  cost_breakdown: {
    pool_type: string;
    pool_name: string;
    amount: number;
    percentage: number;
  }[];
}

export interface TechniqueCostSummary {
  technique_id: string;
  technique_name: string;
  total_jobs: number;
  total_quantity: number;
  total_cost: number;
  avg_unit_cost: number;
  cost_by_pool: {
    pool_type: string;
    amount: number;
    percentage: number;
  }[];
}

// Error context for debugging
export const ABC_ERROR_CONTEXT = {
  activities: { hook: 'useABCCosts', entity: 'abc_activities' },
  pools: { hook: 'useABCCosts', entity: 'abc_cost_pools' },
  rates: { hook: 'useABCCosts', entity: 'abc_activity_rates' },
  jobCosts: { hook: 'useABCCosts', entity: 'abc_job_costs' },
  calculation: { hook: 'useABCCosts', operation: 'cost_calculation' },
};
