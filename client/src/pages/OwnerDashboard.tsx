import { useState, useEffect } from 'react';
import { useAuth, usePermissions } from '../hooks/useAuth';
import { restaurantService } from '../services/restaurantService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Store, 
  BarChart3,
  ShoppingCart, 
  TrendingUp, 
  Settings,
  Plus,
  LogOut,
  Eye,
  Edit,
  QrCode,
  Users,
  Clock
} from 'lucide-react';
import type { Restaurant, SalesReport } from '../types';

export default function OwnerDashboard() {
  const { authState, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOwnerData();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      loadRestaurantData(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const loadOwnerData = async () => {
    try {
      // Load restaurants owned by current user
      const allRestaurants = restaurantService.getRestaurants();
      const userRestaurants = allRestaurants.filter(r => 
        authState.user?.role === 'super_admin' || r.ownerId === authState.user?.id
      );
      
      setRestaurants(userRestaurants);
      
      // Auto-select first restaurant
      if (userRestaurants.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(userRestaurants[0].id);
      }
    } catch (error) {
      console.error('Failed to load owner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurantData = async (restaurantId: string) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // Last 30 days
      
      const sales = restaurantService.getSalesReport(restaurantId, startDate, endDate);
      setSalesData(sales);
    } catch (error) {
      console.error('Failed to load restaurant data:', error);
    }
  };

  const getCurrentRestaurant = () => {
    return restaurants.find(r => r.id === selectedRestaurant);
  };

  const generateQRCode = async () => {
    if (!selectedRestaurant) return;
    
    try {
      const qrCode = restaurantService.generateQRCode(selectedRestaurant);
      alert(`QR Code generated: ${qrCode.url}`);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const currentRestaurant = getCurrentRestaurant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Owner Dashboard</h1>
                <p className="text-sm text-gray-600">Multi-Location Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Restaurant Selector */}
              {restaurants.length > 1 && (
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="text-right">
                <div className="text-sm font-medium">{authState.user?.name}</div>
                <div className="text-xs text-gray-600">{authState.user?.role}</div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Restaurants Found</h2>
            <p className="text-gray-600 mb-6">Get started by creating your first restaurant location.</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Restaurant
            </Button>
          </div>
        ) : (
          <>
            {/* Current Restaurant Info */}
            {currentRestaurant && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{currentRestaurant.name}</CardTitle>
                      <CardDescription className="text-lg">{currentRestaurant.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{currentRestaurant.address}</span>
                        <span>{currentRestaurant.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={currentRestaurant.status === 'active' ? 'default' : 'secondary'}>
                        {currentRestaurant.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={generateQRCode}>
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(salesData?.totalRevenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${salesData?.avgOrderValue.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentRestaurant?.settings.tableCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Total tables</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6">
                  {salesData && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Performance</CardTitle>
                          <CardDescription>Key metrics for the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600">
                                ${salesData.totalRevenue.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">Total Revenue</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600">
                                {salesData.totalOrders}
                              </div>
                              <div className="text-sm text-muted-foreground">Total Orders</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-purple-600">
                                ${salesData.avgOrderValue.toFixed(2)}
                              </div>
                              <div className="text-sm text-muted-foreground">Avg Order Value</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Top Selling Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {salesData.topSellingItems.map((item, index) => (
                              <div key={item.menuItemId} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <span className="font-medium">{item.name}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{item.quantity} sold</div>
                                  <div className="text-sm text-muted-foreground">${item.revenue.toFixed(2)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Menu Tab */}
              <TabsContent value="menu" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Menu Management</h2>
                    <p className="text-muted-foreground">Manage your restaurant's menu items and categories</p>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Menu management interface will be implemented here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Order Management</h2>
                    <p className="text-muted-foreground">View and manage incoming orders</p>
                  </div>
                  <Button variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Kitchen Display
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Order management interface will be implemented here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Analytics</h2>
                  <p className="text-muted-foreground">Detailed performance analytics for your restaurant</p>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Advanced analytics dashboard will be implemented here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Restaurant Settings</h2>
                  <p className="text-muted-foreground">Configure your restaurant settings and preferences</p>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Settings configuration will be implemented here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}