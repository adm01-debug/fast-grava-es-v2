import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Rendering path:', location.pathname, { 
    hasUser: !!user, 
    role, 
    isLoading, 
    allowedRoles 
  });

  if (isLoading) {
    console.log('[ProtectedRoute] Showing general loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] No user found, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Wait for role to load before checking permissions
  // role is fetched async after auth, so it may be null briefly
  if (allowedRoles && role === null) {
    console.log('[ProtectedRoute] User exists but role is still null, showing permission check spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    console.log('[ProtectedRoute] Access denied for role:', role, 'Required roles:', allowedRoles);
    // Redirect to appropriate page based on role
    if (role === 'operator') {
      return <Navigate to="/operator" replace />;
    }
    return <Navigate to="/" replace />;
  }

  console.log('[ProtectedRoute] Access granted');
  return <>{children}</>;
}
