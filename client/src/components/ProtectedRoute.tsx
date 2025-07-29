import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuthContext';
import { useLocation } from 'wouter';
import type { ReactNode } from 'react';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { authState } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authState.loading) {
      if (!authState.isAuthenticated) {
        setLocation('/login');
        return;
      }

      if (requiredRole && authState.user?.role !== requiredRole) {
        // Redirect based on user role
        switch (authState.user?.role) {
          case 'super_admin':
            setLocation('/admin');
            break;
          case 'restaurant_admin':
            setLocation('/owner');
            break;
          case 'staff':
            setLocation('/kitchen');
            break;
          default:
            setLocation('/login');
        }
        return;
      }

      if (requiredPermission && !authState.user?.permissions.includes(requiredPermission) && !authState.user?.permissions.includes('all')) {
        setLocation('/login');
        return;
      }
    }
  }, [authState, requiredRole, requiredPermission, setLocation]);

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return null; // Will redirect to login
  }

  if (requiredRole && authState.user?.role !== requiredRole) {
    return null; // Will redirect to appropriate dashboard
  }

  if (requiredPermission && !authState.user?.permissions.includes(requiredPermission) && !authState.user?.permissions.includes('all')) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}