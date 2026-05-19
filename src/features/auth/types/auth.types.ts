import { createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'coordinator' | 'operator' | 'manager';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isCoordinator: boolean;
  isOperator: boolean;
  isManager: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type Permission = {
  permission: string;
  resource: string;
  label: string;
  description: string;
};

export const AVAILABLE_PERMISSIONS: Permission[] = [
  { permission: 'admin:all', resource: 'admin', label: 'Acesso Total Admin', description: 'Permite acesso a todas as funções administrativas' },
  { permission: 'jobs:view', resource: 'jobs', label: 'Visualizar Agendamentos', description: 'Permite visualizar a lista de agendamentos' },
  { permission: 'jobs:create', resource: 'jobs', label: 'Criar Agendamento', description: 'Permite criar novos agendamentos' },
  { permission: 'jobs:edit', resource: 'jobs', label: 'Editar Agendamento', description: 'Permite editar agendamentos existentes' },
  { permission: 'jobs:delete', resource: 'jobs', label: 'Excluir Agendamento', description: 'Permite excluir agendamentos' },
  { permission: 'production:view', resource: 'production', label: 'Visualizar Produção', description: 'Permite visualizar dados de produção' },
  { permission: 'production:register', resource: 'production', label: 'Registrar Produção', description: 'Permite registrar progresso de produção' },
  { permission: 'operators:view', resource: 'operators', label: 'Visualizar Operadores', description: 'Permite ver a lista de operadores' },
  { permission: 'operators:manage', resource: 'operators', label: 'Gerenciar Operadores', description: 'Permite gerenciar cadastros de operadores' },
  { permission: 'telemetry:view', resource: 'admin', label: 'Visualizar Telemetria', description: 'Visualizar dados técnicos do sistema' },
  { permission: 'settings:manage', resource: 'settings', label: 'Gerenciar Configurações', description: 'Alterar configurações do sistema' }
];

export const RESOURCE_LABELS: Record<string, string> = {
  admin: 'Administração',
  jobs: 'Agendamentos',
  production: 'Produção',
  operators: 'Operadores',
  telemetry: 'Telemetria',
  settings: 'Configurações'
};

