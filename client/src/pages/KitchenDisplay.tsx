import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  AlertCircle, 
  LogOut,
  RefreshCw,
  Timer
} from 'lucide-react';
import type { KitchenOrder, OrderStatus } from '../types';

export default function KitchenDisplay() {
  const { authState, logout } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      loadOrders(); // Refresh orders every minute
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    // Mock kitchen orders - in real app this would come from API
    const mockOrders: KitchenOrder[] = [
      {
        id: 'order-1',
        orderNumber: 'ORD-001',
        items: [
          {
            id: 'item-1',
            menuItemId: 'pizza-margherita',
            menuItem: {
              id: 'pizza-margherita',
              name: 'Margherita Pizza',
              description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
              category: 'pizzas',
              basePrice: 16.99,
              available: true,
              preparationTime: 15,
              ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'fresh basil'],
              allergens: ['gluten', 'dairy'],
              dietaryTags: { vegetarian: true },
              customizations: [],
            },
            quantity: 2,
            selectedCustomizations: { 'pizza-size': ['large'] },
            totalPrice: 37.98,
          },
        ],
        status: 'confirmed',
        orderTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        estimatedCompletionTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        tableNumber: 7,
        specialInstructions: 'Extra crispy crust',
        priority: 'normal',
      },
      {
        id: 'order-2',
        orderNumber: 'ORD-002',
        items: [
          {
            id: 'item-2',
            menuItemId: 'caesar-salad',
            menuItem: {
              id: 'caesar-salad',
              name: 'Caesar Salad',
              description: 'Crisp romaine lettuce with parmesan, croutons, and caesar dressing',
              category: 'salads',
              basePrice: 12.99,
              available: true,
              preparationTime: 5,
              ingredients: ['romaine lettuce', 'parmesan cheese', 'croutons', 'caesar dressing'],
              allergens: ['dairy', 'gluten'],
              dietaryTags: { vegetarian: true },
              customizations: [],
            },
            quantity: 1,
            selectedCustomizations: {},
            totalPrice: 12.99,
          },
        ],
        status: 'preparing',
        orderTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        estimatedCompletionTime: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
        tableNumber: 12,
        priority: 'high',
      },
      {
        id: 'order-3',
        orderNumber: 'ORD-003',
        items: [
          {
            id: 'item-3',
            menuItemId: 'pizza-margherita',
            menuItem: {
              id: 'pizza-margherita',
              name: 'Margherita Pizza',
              description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
              category: 'pizzas',
              basePrice: 16.99,
              available: true,
              preparationTime: 15,
              ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'fresh basil'],
              allergens: ['gluten', 'dairy'],
              dietaryTags: { vegetarian: true },
              customizations: [],
            },
            quantity: 1,
            selectedCustomizations: { 'pizza-size': ['medium'] },
            totalPrice: 16.99,
          },
        ],
        status: 'ready',
        orderTime: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        estimatedCompletionTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago (overdue)
        tableNumber: 5,
        priority: 'normal',
      },
    ];

    setOrders(mockOrders);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'normal': return 'border-l-4 border-blue-500';
      case 'low': return 'border-l-4 border-gray-500';
      default: return 'border-l-4 border-gray-500';
    }
  };

  const getTimeElapsed = (orderTime: Date) => {
    const elapsed = Math.floor((currentTime.getTime() - orderTime.getTime()) / 60000);
    return elapsed;
  };

  const getTimeRemaining = (estimatedTime: Date) => {
    const remaining = Math.floor((estimatedTime.getTime() - currentTime.getTime()) / 60000);
    return remaining;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 text-white p-2 rounded-lg">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Kitchen Display</h1>
                <p className="text-sm text-gray-300">Live Order Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-mono">{formatTime(currentTime)}</div>
                <div className="text-xs text-gray-400">Current Time</div>
              </div>
              <Button variant="outline" size="sm" onClick={loadOrders}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <div className="text-right">
                <div className="text-sm font-medium">{authState.user?.name}</div>
                <div className="text-xs text-gray-400">{authState.user?.role}</div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-400">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">
                {orders.filter(o => o.status === 'preparing').length}
              </div>
              <div className="text-sm text-gray-400">Preparing</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {orders.filter(o => o.status === 'ready').length}
              </div>
              <div className="text-sm text-gray-400">Ready</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {activeOrders.length}
              </div>
              <div className="text-sm text-gray-400">Total Active</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map((order) => {
            const elapsed = getTimeElapsed(order.orderTime);
            const remaining = getTimeRemaining(order.estimatedCompletionTime);
            const isOverdue = remaining < 0;

            return (
              <Card 
                key={order.id} 
                className={`bg-gray-800 border-gray-700 ${getPriorityColor(order.priority)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-white">
                        {order.orderNumber}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Table {order.tableNumber}</span>
                        <span>•</span>
                        <span>{formatTime(order.orderTime)}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="bg-gray-700 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-white">
                              {item.quantity}x {item.menuItem.name}
                            </div>
                            {Object.keys(item.selectedCustomizations).length > 0 && (
                              <div className="text-sm text-gray-400 mt-1">
                                {Object.entries(item.selectedCustomizations).map(([key, values]) => 
                                  values.join(', ')
                                ).join(', ')}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {item.menuItem.preparationTime}min
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="bg-yellow-900/20 border border-yellow-600 rounded p-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-yellow-200">
                          {order.specialInstructions}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Timing */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{elapsed}min elapsed</span>
                    </div>
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
                      <Timer className="w-4 h-4" />
                      <span>
                        {isOverdue 
                          ? `${Math.abs(remaining)}min overdue` 
                          : `${remaining}min remaining`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {order.status === 'pending' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gray-600 hover:bg-gray-700"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {activeOrders.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">No Active Orders</h2>
            <p className="text-gray-500">All orders are completed. Great job!</p>
          </div>
        )}
      </main>
    </div>
  );
}