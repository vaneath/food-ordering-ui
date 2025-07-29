import { useState, useEffect, useContext, createContext } from 'react';
import type { ReactNode } from 'react';
import { AuthUser, AuthState } from '../types';

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: undefined,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        localStorage.removeItem('auth_user');
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const mockUsers: AuthUser[] = [
        {
          id: 'admin-1',
          email: 'admin@restaurant.com',
          role: 'super_admin',
          name: 'System Admin',
          permissions: ['all'],
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        {
          id: 'owner-1',
          email: 'owner@bistro.com',
          role: 'restaurant_admin',
          name: 'Restaurant Owner',
          restaurantId: 'bistro-digital',
          permissions: ['restaurant_manage', 'menu_manage', 'orders_view', 'analytics_view'],
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        {
          id: 'staff-1',
          email: 'staff@bistro.com',
          role: 'staff',
          name: 'Kitchen Staff',
          restaurantId: 'bistro-digital',
          permissions: ['orders_view', 'kitchen_manage'],
          createdAt: new Date(),
          lastLogin: new Date(),
        },
      ];

      const user = mockUsers.find(u => u.email === email);
      if (!user || password !== 'password123') {
        throw new Error('Invalid credentials');
      }

      user.lastLogin = new Date();
      
      localStorage.setItem('auth_user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const updateUser = (userData: Partial<AuthUser>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  const contextValue = {
    authState,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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