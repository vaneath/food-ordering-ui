import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserCheck, Users, Shield } from 'lucide-react';

export default function Login() {
  const { login, authState } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      
      // Redirect based on user role
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      switch (user.role) {
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
          setLocation('/admin');
      }
    } catch (error) {
      // Error is handled by the auth state
    }
  };

  const quickLogin = (userType: 'admin' | 'owner' | 'staff') => {
    const credentials = {
      admin: { email: 'admin@restaurant.com', password: 'password123' },
      owner: { email: 'owner@bistro.com', password: 'password123' },
      staff: { email: 'staff@bistro.com', password: 'password123' },
    };
    
    const creds = credentials[userType];
    setEmail(creds.email);
    setPassword(creds.password);
    setActiveTab(userType);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Restaurant Management</CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quick Login Demo Buttons */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Demo Login:</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('admin')}
                className="justify-start"
              >
                <Shield className="w-4 h-4 mr-2" />
                System Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('owner')}
                className="justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                Restaurant Owner
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('staff')}
                className="justify-start"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Kitchen Staff
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {authState.error && (
              <Alert variant="destructive">
                <AlertDescription>{authState.error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={authState.loading}
            >
              {authState.loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>Demo Credentials:</p>
            <p>Email: admin@restaurant.com</p>
            <p>Password: password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}