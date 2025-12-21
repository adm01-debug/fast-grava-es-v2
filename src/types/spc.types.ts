export interface SPCChart { id: string; type: 'xbar' | 'r' | 'p' | 'c'; data: SPCDataPoint[]; limits: ControlLimits; }
export interface SPCDataPoint { timestamp: string; value: number; subgroup?: number; }
export interface ControlLimits { ucl: number; lcl: number; cl: number; }
