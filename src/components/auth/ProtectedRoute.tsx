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
    logger.info('No user session, redirecting to /auth', { path: location.pathname }, 'ProtectedRoute');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Admin always has bypass - check this BEFORE checking loading roles
  // and BEFORE checking allowedRoles to prevent any flickering or extra loaders
  if (role === 'admin') {
    return <>{children}</>;
  }

  // If role verification finished without a valid role, do not keep users stuck
  // on the permission loader. Redirect to the safest available authenticated route.
  if (allowedRoles && role === null) {
    logger.warn('Role unavailable after auth loading completed', {
      path: location.pathname,
      allowedRoles,
    }, 'ProtectedRoute');
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    logger.warn('Access denied: role not allowed', { 
      role, 
      allowedRoles, 
      path: location.pathname 
    }, 'ProtectedRoute');

    // Redirect to appropriate page based on role
    if (role === 'operator') {
      return <Navigate to="/operator" replace />;
    }
    return <Navigate to="/" replace />;
  }


  return <>{children}</>;
}
