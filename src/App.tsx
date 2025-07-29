import React, { Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, useLocation, useRoutes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { adminRoutes } from './routes/admin';

// Lazy load public components
const Index = React.lazy(() => import('@/pages/Index'));
const Login = React.lazy(() => import('@/pages/Login'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Admin routes component
const AdminRoutes = () => {
  const routes = useRoutes(adminRoutes);
  return routes;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();

  if (loading || !initialized) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Main routing component
const AppContent = () => {
  const { isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();
  
  // Create routes configuration
  const getRoutes = () => {
    return [
      {
        path: "/",
        element: isAuthenticated ? <Navigate to="/admin" replace /> : <Index />,
      },
      {
        path: "/login",
        element: isAuthenticated ? (
          <Navigate to="/admin" state={{ from: location.state?.from || '/' }} replace />
        ) : (
          <Login />
        ),
      },
      ...(isAuthenticated ? [
        {
          path: "/admin/*",
          element: (
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          ),
        },
      ] : []),
      {
        path: "/404",
        element: <NotFound />,
      },
      {
        path: "*",
        element: <Navigate to="/404" replace />,
      },
    ];
  };

  // Get routes based on auth state
  const routes = getRoutes();
  const routeElement = useRoutes(routes);

  // Show loading spinner while auth state is being determined
  if (loading || !initialized) {
    return <LoadingSpinner />;
  }

  return routeElement;
};

// Main App component with all providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <AppContent />
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;