import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/features/auth';
import { logger } from '@/lib/logger';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  // Log rendering path in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Rendering path:', {
      path: location.pathname,
      hasUser: !!user,
      role,
      isLoading,
      allowedRoles
    }, 'ProtectedRoute');
  }

  if (isLoading) {

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

    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Wait for role to load before checking permissions
  // role is fetched async after auth, so it may be null briefly
  if (allowedRoles && role === null) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Admin always has bypass
  if (role === 'admin') {
    return <>{children}</>;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate page based on role
    if (role === 'operator') {
      return <Navigate to="/operator" replace />;
    }
    return <Navigate to="/" replace />;
  }


  return <>{children}</>;
}
