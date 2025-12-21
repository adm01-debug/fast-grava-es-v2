export interface Operator {
  id: string;
  name: string;
  email: string;
  role: 'operator' | 'supervisor' | 'admin';
  machines?: string[];
  skills?: string[];
  active: boolean;
  created_at: string;
}

export interface OperatorStats {
  operatorId: string;
  productivity: number;
  quality: number;
  efficiency: number;
}
