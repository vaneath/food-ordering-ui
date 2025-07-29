import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { getAuthToken, setAuthToken, removeAuthToken } from '../lib/authUtils';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId?: string;
  permissions: string[];
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: undefined,
  });

  // Check for existing token and get user data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!getAuthToken(),
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    } else if (user && user.user) {
      setAuthState({
        user: user.user,
        isAuthenticated: true,
        loading: false,
      });
    } else if (!isLoading && error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Session expired',
      });
      removeAuthToken();
    } else {
      setAuthState(prev => ({ ...prev, loading: isLoading }));
    }
  }, [user, isLoading, error]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: Error) => {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      name: string;
      role?: string;
      restaurantId?: string;
    }) => {
      return apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: Error) => {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    },
  });

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: undefined }));
    return loginMutation.mutateAsync({ email, password });
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
    restaurantId?: string;
  }) => {
    setAuthState(prev => ({ ...prev, loading: true, error: undefined }));
    return registerMutation.mutateAsync(userData);
  };

  const logout = () => {
    removeAuthToken();
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    queryClient.clear();
    window.location.href = '/';
  };

  const updateUser = (userData: Partial<AuthUser>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  return { 
    authState, 
    login, 
    register, 
    logout, 
    updateUser,
    isLoading: authState.loading || loginMutation.isPending || registerMutation.isPending,
  };
}

export function usePermissions() {
  const { authState } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false;
    if (authState.user.permissions.includes('all')) return true;
    return authState.user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return authState.user?.role === role;
  };

  return { hasPermission, hasRole };
}