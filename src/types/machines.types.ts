export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'maintenance' | 'inactive';
  location?: string;
  specifications?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MachineStats {
  machineId: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}
