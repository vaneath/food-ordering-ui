import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, Tablet, Utensils, LogIn } from 'lucide-react';

export default function Index() {
  const [orderChannel] = useState<'qr-code' | 'tablet' | 'mobile-app'>('qr-code');
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to admin if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getChannelInfo = () => {
    switch (orderChannel) {
      case 'qr-code':
        return {
          icon: <QrCode className="w-5 h-5" />,
          title: 'QR Code Ordering',
          description: 'Scan and order from your table'
        };
      case 'tablet':
        return {
          icon: <Tablet className="w-5 h-5" />,
          title: 'Table Tablet',
          description: 'Order directly from the table'
        };
      case 'mobile-app':
        return {
          icon: <Smartphone className="w-5 h-5" />,
          title: 'Mobile App',
          description: 'Order from your mobile device'
        };
    }
  };

  const channelInfo = getChannelInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Restaurant Branding */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Restaurant Name</h1>
                <p className="text-xs text-gray-500">Delicious food served with love</p>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/login')}
                className="flex items-center gap-1"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
              <Button size="sm" onClick={() => navigate('/menu')}>
                View Menu
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome to Our Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Discover our delicious menu and place your order. Sign in to access the admin dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/login')} className="flex-1">
                Sign In to Admin
              </Button>
              <Button variant="outline" onClick={() => navigate('/menu')} className="flex-1">
                View Menu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-medium">Easy Ordering</h3>
              </div>
              <p className="text-sm text-gray-600">
                Order your favorite dishes with just a few taps using our convenient QR code system.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <Tablet className="w-6 h-6" />
                </div>
                <h3 className="font-medium">Table Service</h3>
              </div>
              <p className="text-sm text-gray-600">
                Enjoy table service with our digital menu and ordering system.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-medium">Mobile App</h3>
              </div>
              <p className="text-sm text-gray-600">
                Download our mobile app for faster ordering and exclusive offers.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}