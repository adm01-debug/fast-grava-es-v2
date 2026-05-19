export * from './hooks/useMachines';
export * from './hooks/useOperators';
export * from './hooks/useOperatorMachines';
export * from './hooks/useMachineStatusHub';
export * from './hooks/useMachineUtilization';
export * from './hooks/useMachineDowntime';
export * from './hooks/useOEE';
export * from './hooks/useOEEAlerts';
export * from './hooks/usePerformanceMetrics';
export * from './hooks/useProductionLosses';
export * from './hooks/useOperatorProductivity';
export * from './hooks/useOperatorRankings';
export * from './hooks/useOperatorEvolution';
export * from './hooks/useOperatorSkills';
export * from './hooks/useMTBFMTTR';
export * from './services/machinesService';
export * from './services/operatorsService';
export * from './services/maintenanceService';
export * from './services/oeeCalculations';
export * from './types/machine.schema';
export * from './types/operator.schema';
export * from './types/maintenance.schema';

// Compatibility aliases
export type Machine = import('./services/machinesService').Machine;
export type Operator = import('./services/operatorsService').Operator;
export type Maintenance = import('./services/maintenanceService').Maintenance;
export type DbMachine = Machine;
export type DbOperator = Operator;
