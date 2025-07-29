import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'owner';
  restaurantId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!user;

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkAuth();
  }, []);

  // Handle redirect after authentication
  useEffect(() => {
    if (initialized && !loading) {
      if (isAuthenticated && location.pathname === '/login') {
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else if (!isAuthenticated && location.pathname.startsWith('/admin')) {
        navigate('/login', { state: { from: location }, replace: true });
      }
    }
  }, [initialized, loading, isAuthenticated, location, navigate]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      // Mock authentication
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        email: email,
        name: 'Admin User',
        role: 'admin',
        restaurantId: 'restaurant-1',
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }, [navigate, location]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
