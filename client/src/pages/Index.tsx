import React, { useState } from 'react';
import { MenuBrowser } from '../components/MenuBrowser';
import { CartSidebar } from '../components/CartSidebar';
import { CheckoutModal } from '../components/CheckoutModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, Tablet, Utensils } from 'lucide-react';

export default function Index() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderChannel] = useState<'qr-code' | 'tablet' | 'mobile-app'>('qr-code');

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
                <h1 className="text-xl font-bold text-gray-900">Bistro Digital</h1>
                <p className="text-sm text-gray-600">Fine dining experience</p>
              </div>
            </div>

            {/* Channel Info and Cart */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                {channelInfo.icon}
                <div className="text-right">
                  <div className="text-sm font-medium">{channelInfo.title}</div>
                  <div className="text-xs text-gray-600">{channelInfo.description}</div>
                </div>
              </div>
              
              <CartSidebar onCheckout={() => setShowCheckout(true)} />
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome to Bistro Digital</h2>
            <p className="text-blue-100 text-lg mb-4">
              Discover our carefully crafted menu and place your order seamlessly
            </p>
            
            <div className="flex justify-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Fresh Ingredients
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Made to Order
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Contactless Ordering
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">15-20</div>
              <div className="text-sm text-gray-600">Average prep time (min)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">50+</div>
              <div className="text-sm text-gray-600">Menu items available</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">4.8★</div>
              <div className="text-sm text-gray-600">Customer rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Browser */}
        <MenuBrowser />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Bistro Digital</h3>
              <p className="text-gray-300 text-sm">
                Experience the future of dining with our digital ordering platform. 
                Fresh ingredients, exceptional taste, seamless service.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">Menu</div>
                <div className="text-gray-300">About Us</div>
                <div className="text-gray-300">Contact</div>
                <div className="text-gray-300">Privacy Policy</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div>📍 123 Restaurant Street</div>
                <div>📞 (555) 123-4567</div>
                <div>✉️ info@bistrodigital.com</div>
                <div>🕒 Open 11am - 10pm daily</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Bistro Digital. All rights reserved. Powered by MGX Platform.</p>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}