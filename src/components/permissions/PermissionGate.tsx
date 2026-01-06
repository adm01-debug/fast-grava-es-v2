import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Crown,
  User,
  Users,
  Settings,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================================================
// MELHORIA #15: SISTEMA DE PERMISSÕES GRANULAR
// Controle de acesso baseado em roles e permissões específicas
// ============================================================================

// Tipos de roles do sistema
export type UserRole = "admin" | "supervisor" | "operator" | "viewer" | "guest";

// Tipos de permissões
export type Permission =
  | "jobs.view"
  | "jobs.create"
  | "jobs.edit"
  | "jobs.delete"
  | "jobs.assign"
  | "machines.view"
  | "machines.create"
  | "machines.edit"
  | "machines.delete"
  | "maintenance.view"
  | "maintenance.create"
  | "maintenance.complete"
  | "maintenance.approve"
  | "reports.view"
  | "reports.export"
  | "reports.create"
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "settings.view"
  | "settings.edit"
  | "audit.view";

// Mapeamento de roles para permissões
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "jobs.view", "jobs.create", "jobs.edit", "jobs.delete", "jobs.assign",
    "machines.view", "machines.create", "machines.edit", "machines.delete",
    "maintenance.view", "maintenance.create", "maintenance.complete", "maintenance.approve",
    "reports.view", "reports.export", "reports.create",
    "users.view", "users.create", "users.edit", "users.delete",
    "settings.view", "settings.edit",
    "audit.view",
  ],
  supervisor: [
    "jobs.view", "jobs.create", "jobs.edit", "jobs.assign",
    "machines.view", "machines.edit",
    "maintenance.view", "maintenance.create", "maintenance.complete", "maintenance.approve",
    "reports.view", "reports.export", "reports.create",
    "users.view",
    "settings.view",
    "audit.view",
  ],
  operator: [
    "jobs.view", "jobs.edit",
    "machines.view",
    "maintenance.view", "maintenance.create", "maintenance.complete",
    "reports.view",
  ],
  viewer: [
    "jobs.view",
    "machines.view",
    "maintenance.view",
    "reports.view",
  ],
  guest: [],
};

// Ícones para roles
const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Crown className="h-4 w-4" />,
  supervisor: <ShieldCheck className="h-4 w-4" />,
  operator: <User className="h-4 w-4" />,
  viewer: <Eye className="h-4 w-4" />,
  guest: <Users className="h-4 w-4" />,
};

// Labels para roles
const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  operator: "Operador",
  viewer: "Visualizador",
  guest: "Convidado",
};

// Cores para roles
const roleColors: Record<UserRole, string> = {
  admin: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  supervisor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  operator: "text-green-500 bg-green-500/10 border-green-500/20",
  viewer: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  guest: "text-gray-500 bg-gray-500/10 border-gray-500/20",
};

// Context para permissões
interface PermissionContextType {
  role: UserRole;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  setRole: (role: UserRole) => void;
  addPermission: (permission: Permission) => void;
  removePermission: (permission: Permission) => void;
}

const PermissionContext = React.createContext<PermissionContextType | null>(null);

// Provider de permissões
interface PermissionProviderProps {
  children: React.ReactNode;
  initialRole?: UserRole;
  customPermissions?: Permission[];
}

export function PermissionProvider({
  children,
  initialRole = "operator",
  customPermissions = [],
}: PermissionProviderProps) {
  const [role, setRole] = React.useState<UserRole>(initialRole);
  const [extraPermissions, setExtraPermissions] = React.useState<Permission[]>(customPermissions);

  const permissions = React.useMemo(() => {
    return [...new Set([...rolePermissions[role], ...extraPermissions])];
  }, [role, extraPermissions]);

  const hasPermission = React.useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions]
  );

  const hasAnyPermission = React.useCallback(
    (perms: Permission[]) => perms.some((p) => permissions.includes(p)),
    [permissions]
  );

  const hasAllPermissions = React.useCallback(
    (perms: Permission[]) => perms.every((p) => permissions.includes(p)),
    [permissions]
  );

  const addPermission = React.useCallback((permission: Permission) => {
    setExtraPermissions((prev) => [...new Set([...prev, permission])]);
  }, []);

  const removePermission = React.useCallback((permission: Permission) => {
    setExtraPermissions((prev) => prev.filter((p) => p !== permission));
  }, []);

  return (
    <PermissionContext.Provider
      value={{
        role,
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        setRole,
        addPermission,
        removePermission,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

// Hook para usar permissões
export function usePermissions() {
  const context = React.useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}

// Gate de permissão - renderiza children apenas se tiver permissão
interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showLocked?: boolean;
}

export function PermissionGate({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback,
  showLocked = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const allPermissions = permission ? [permission, ...permissions] : permissions;
  
  const hasAccess = requireAll
    ? hasAllPermissions(allPermissions)
    : allPermissions.length > 0
    ? hasAnyPermission(allPermissions)
    : true;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showLocked) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none blur-sm">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Lock className="h-6 w-6" />
            <span className="text-sm">Acesso restrito</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Botão com verificação de permissão
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission: Permission;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showTooltip?: boolean;
  tooltipMessage?: string;
}

export function PermissionButton({
  permission,
  variant = "default",
  size = "default",
  showTooltip = true,
  tooltipMessage = "Você não tem permissão para esta ação",
  children,
  className,
  ...props
}: PermissionButtonProps) {
  const { hasPermission } = usePermissions();
  const canAccess = hasPermission(permission);

  const button = (
    <Button
      variant={variant}
      size={size}
      disabled={!canAccess || props.disabled}
      className={cn(!canAccess && "opacity-50 cursor-not-allowed", className)}
      {...props}
    >
      {children}
    </Button>
  );

  if (!canAccess && showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3" />
              <span>{tooltipMessage}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

// Badge de role
interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function RoleBadge({
  role,
  size = "md",
  showIcon = true,
  className,
}: RoleBadgeProps) {
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        roleColors[role],
        sizes[size],
        className
      )}
    >
      {showIcon && roleIcons[role]}
      {roleLabels[role]}
    </span>
  );
}

// Lista de permissões do usuário
interface PermissionListProps {
  showAll?: boolean;
  className?: string;
}

export function PermissionList({ showAll = false, className }: PermissionListProps) {
  const { role, permissions } = usePermissions();
  const allPermissions = Object.values(rolePermissions).flat();
  const uniquePermissions = [...new Set(allPermissions)];

  const displayPermissions = showAll ? uniquePermissions : permissions;

  const groupedPermissions = displayPermissions.reduce((acc, perm) => {
    const [group] = perm.split(".");
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <RoleBadge role={role} />
        <span className="text-sm text-muted-foreground">
          {permissions.length} permissões
        </span>
      </div>

      <div className="space-y-3">
        {Object.entries(groupedPermissions).map(([group, perms]) => (
          <div key={group}>
            <h4 className="text-sm font-medium capitalize mb-2">{group}</h4>
            <div className="flex flex-wrap gap-1">
              {perms.map((perm) => {
                const hasAccess = permissions.includes(perm);
                return (
                  <span
                    key={perm}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs",
                      hasAccess
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {hasAccess ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {perm.split(".")[1]}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Indicador de acesso restrito
interface RestrictedIndicatorProps {
  message?: string;
  requiredRole?: UserRole;
  className?: string;
}

export function RestrictedIndicator({
  message = "Acesso restrito",
  requiredRole,
  className,
}: RestrictedIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border",
        "bg-amber-500/5 border-amber-500/20",
        className
      )}
    >
      <div className="p-2 rounded-full bg-amber-500/10">
        <ShieldAlert className="h-5 w-5 text-amber-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
          {message}
        </p>
        {requiredRole && (
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
            Requer: <RoleBadge role={requiredRole} size="sm" />
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Hook para verificar permissão específica
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

// Hook para verificar role
export function useRole(): UserRole {
  const { role } = usePermissions();
  return role;
}

// Wrapper para elementos que precisam de permissão
interface WithPermissionProps {
  children: React.ReactElement;
  permission: Permission;
  hide?: boolean;
  disable?: boolean;
}

export function WithPermission({
  children,
  permission,
  hide = false,
  disable = true,
}: WithPermissionProps) {
  const { hasPermission } = usePermissions();
  const canAccess = hasPermission(permission);

  if (!canAccess && hide) {
    return null;
  }

  if (!canAccess && disable) {
    return React.cloneElement(children, {
      disabled: true,
      className: cn(children.props.className, "opacity-50 cursor-not-allowed"),
    });
  }

  return children;
}

// Exports
export { rolePermissions, roleLabels, roleColors, roleIcons };
