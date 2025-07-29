import { useState, useEffect } from 'react';
import { useAuth, usePermissions } from '../hooks/useAuth';
import { restaurantService } from '../services/restaurantService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Store, 
  ShoppingCart, 
  TrendingUp, 
  Settings,
  Plus,
  LogOut,
  Eye,
  Edit
} from 'lucide-react';
import type { Restaurant, SalesReport } from '../types';

export default function AdminDashboard() {
  const { authState, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [salesData, setSalesData] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const restaurantData = restaurantService.getRestaurants();
      setRestaurants(restaurantData);

      // Load sales data for the first restaurant (demo)
      if (restaurantData.length > 0) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30); // Last 30 days
        
        const sales = restaurantService.getSalesReport(restaurantData[0].id, startDate, endDate);
        setSalesData(sales);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">System Administration</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
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
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restaurants.length}</div>
              <p className="text-xs text-muted-foreground">
                {restaurants.filter(r => r.status === 'active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${salesData?.totalRevenue.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
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
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${salesData?.avgOrderValue.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="restaurants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Restaurants</h2>
                <p className="text-muted-foreground">Manage restaurant locations and settings</p>
              </div>
              {hasPermission('restaurant_manage') && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Restaurant
                </Button>
              )}
            </div>

            <div className="grid gap-6">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                        <CardDescription>{restaurant.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{restaurant.address}</span>
                          <span>{restaurant.phone}</span>
                          <span>{restaurant.email}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(restaurant.status)}>
                        {restaurant.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Tables:</span>
                          <span className="ml-1">{restaurant.settings.tableCount}</span>
                        </div>
                        <div>
                          <span className="font-medium">Avg Prep:</span>
                          <span className="ml-1">{restaurant.settings.avgPrepTime}min</span>
                        </div>
                        <div>
                          <span className="font-medium">Tax Rate:</span>
                          <span className="ml-1">{(restaurant.settings.taxRate * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {hasPermission('restaurant_manage') && (
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Analytics</h2>
              <p className="text-muted-foreground">System-wide performance metrics</p>
            </div>

            {salesData && (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>Last 30 days performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${salesData.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {salesData.totalOrders}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
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
                            <div className="text-sm text-muted-foreground">
                              ${item.revenue.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">User Management</h2>
              <p className="text-muted-foreground">Manage system users and permissions</p>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  User management features will be implemented here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">System Settings</h2>
              <p className="text-muted-foreground">Configure system-wide settings</p>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  System settings will be implemented here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}