import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Shield } from 'lucide-react';
import { ROLE_PERMISSIONS } from '@/hooks/useRBAC';
import type { AppRole } from '@/contexts/AuthContext';

const PERMISSION_CATEGORIES = {
  'Produção': [
    'jobs:read',
    'jobs:create',
    'jobs:update',
    'jobs:delete',
    'production:register',
  ],
  'Operadores': [
    'operators:read',
    'operators:create',
    'operators:update',
    'operators:delete',
  ],
  'Máquinas': [
    'machines:read',
    'machines:create',
    'machines:update',
    'machines:delete',
  ],
  'Relatórios': [
    'reports:read',
    'reports:create',
    'reports:export',
  ],
  'Configurações': [
    'settings:read',
    'settings:update',
  ],
  'Segurança': [
    'security:read',
    'security:manage',
    'users:manage',
  ],
};

const ROLE_LABELS: Record<AppRole, string> = {
  coordinator: 'Coordenador',
  manager: 'Gerente',
  operator: 'Operador',
};

const ROLE_COLORS: Record<AppRole, string> = {
  coordinator: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  manager: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  operator: 'bg-green-500/10 text-green-500 border-green-500/20',
};

function hasPermission(role: AppRole, permission: string): boolean {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
}

function formatPermissionName(permission: string): string {
  const parts = permission.split(':');
  const action = parts[1];

  const actionLabels: Record<string, string> = {
    read: 'Visualizar',
    create: 'Criar',
    update: 'Editar',
    delete: 'Excluir',
    register: 'Registrar',
    export: 'Exportar',
    manage: 'Gerenciar',
  };

  return actionLabels[action] || action;
}

export function PermissionMatrix() {
  const roles: AppRole[] = ['coordinator', 'manager', 'operator'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Matriz de Permissões
        </CardTitle>
        <CardDescription>
          Visualização das permissões por função no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
            <div key={category}>
              <h3 className="font-semibold mb-3">{category}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Permissão</TableHead>
                    {roles.map(role => (
                      <TableHead key={role} className="text-center">
                        <Badge variant="outline" className={ROLE_COLORS[role]}>
                          {ROLE_LABELS[role]}
                        </Badge>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map(permission => (
                    <TableRow key={permission}>
                      <TableCell className="font-medium">
                        {formatPermissionName(permission)}
                      </TableCell>
                      {roles.map(role => (
                        <TableCell key={`${role}-${permission}`} className="text-center">
                          {hasPermission(role, permission) ? (
                            <div className="flex justify-center">
                              <div className="p-1 rounded-full bg-green-500/10">
                                <Check className="h-4 w-4 text-green-500" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="p-1 rounded-full bg-muted">
                                <X className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
