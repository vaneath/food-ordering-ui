import { Restaurant, Owner, LocationQRCode, InventoryItem, SalesReport } from '../types';

class RestaurantService {
  private getStorageKey(type: string, restaurantId?: string) {
    return restaurantId ? `${type}_${restaurantId}` : type;
  }

  // Restaurant Management
  getRestaurants(): Restaurant[] {
    const data = localStorage.getItem('restaurants');
    return data ? JSON.parse(data) : this.getDefaultRestaurants();
  }

  getRestaurant(id: string): Restaurant | null {
    const restaurants = this.getRestaurants();
    return restaurants.find(r => r.id === id) || null;
  }

  createRestaurant(restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Restaurant {
    const restaurants = this.getRestaurants();
    const newRestaurant: Restaurant = {
      ...restaurant,
      id: `restaurant_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    restaurants.push(newRestaurant);
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
    return newRestaurant;
  }

  updateRestaurant(id: string, updates: Partial<Restaurant>): Restaurant | null {
    const restaurants = this.getRestaurants();
    const index = restaurants.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    restaurants[index] = {
      ...restaurants[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
    return restaurants[index];
  }

  deleteRestaurant(id: string): boolean {
    const restaurants = this.getRestaurants();
    const filtered = restaurants.filter(r => r.id !== id);
    
    if (filtered.length === restaurants.length) return false;
    
    localStorage.setItem('restaurants', JSON.stringify(filtered));
    return true;
  }

  // Owner Management
  getOwners(): Owner[] {
    const data = localStorage.getItem('owners');
    return data ? JSON.parse(data) : this.getDefaultOwners();
  }

  getOwner(id: string): Owner | null {
    const owners = this.getOwners();
    return owners.find(o => o.id === id) || null;
  }

  getRestaurantsByOwner(ownerId: string): Restaurant[] {
    const restaurants = this.getRestaurants();
    return restaurants.filter(r => r.ownerId === ownerId);
  }

  // QR Code Management
  getQRCodes(restaurantId: string): LocationQRCode[] {
    const data = localStorage.getItem(this.getStorageKey('qr_codes', restaurantId));
    return data ? JSON.parse(data) : [];
  }

  generateQRCode(restaurantId: string, tableNumber?: number): LocationQRCode {
    const qrCodes = this.getQRCodes(restaurantId);
    const restaurant = this.getRestaurant(restaurantId);
    
    if (!restaurant) throw new Error('Restaurant not found');
    
    const qrCode: LocationQRCode = {
      id: `qr_${Date.now()}`,
      restaurantId,
      tableNumber,
      qrCode: `QR_${restaurantId}_${tableNumber || 'general'}_${Date.now()}`,
      url: `${window.location.origin}/${restaurantId}${tableNumber ? `?table=${tableNumber}` : ''}`,
      active: true,
      createdAt: new Date(),
    };
    
    qrCodes.push(qrCode);
    localStorage.setItem(this.getStorageKey('qr_codes', restaurantId), JSON.stringify(qrCodes));
    return qrCode;
  }

  // Inventory Management
  getInventory(restaurantId: string): InventoryItem[] {
    const data = localStorage.getItem(this.getStorageKey('inventory', restaurantId));
    return data ? JSON.parse(data) : [];
  }

  updateInventoryItem(restaurantId: string, itemId: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const inventory = this.getInventory(restaurantId);
    const index = inventory.findIndex(i => i.id === itemId);
    
    if (index === -1) return null;
    
    inventory[index] = { ...inventory[index], ...updates };
    
    // Update status based on stock levels
    const item = inventory[index];
    if (item.currentStock <= 0) {
      item.status = 'out_of_stock';
    } else if (item.currentStock <= item.minStockLevel) {
      item.status = 'low_stock';
    } else {
      item.status = 'in_stock';
    }
    
    localStorage.setItem(this.getStorageKey('inventory', restaurantId), JSON.stringify(inventory));
    return item;
  }

  // Analytics
  getSalesReport(restaurantId: string, startDate: Date, endDate: Date): SalesReport {
    // In a real app, this would query actual sales data
    const mockReport: SalesReport = {
      restaurantId,
      period: { start: startDate, end: endDate },
      totalRevenue: 12450.75,
      totalOrders: 156,
      avgOrderValue: 79.81,
      topSellingItems: [
        { menuItemId: 'pizza-margherita', name: 'Margherita Pizza', quantity: 45, revenue: 764.55 },
        { menuItemId: 'caesar-salad', name: 'Caesar Salad', quantity: 32, revenue: 415.68 },
      ],
      ordersByHour: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: Math.floor(Math.random() * 20),
        revenue: Math.floor(Math.random() * 1000),
      })),
      ordersByChannel: [
        { channel: 'qr-code', count: 89, revenue: 7123.45 },
        { channel: 'tablet', count: 45, revenue: 3589.12 },
        { channel: 'mobile-app', count: 22, revenue: 1738.18 },
      ],
    };
    
    return mockReport;
  }

  // Default data for demo
  private getDefaultRestaurants(): Restaurant[] {
    const defaultRestaurants: Restaurant[] = [
      {
        id: 'bistro-digital',
        name: 'Bistro Digital',
        description: 'Fine dining experience with digital ordering',
        address: '123 Main Street, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'contact@bistrodigital.com',
        ownerId: 'owner-1',
        settings: {
          currency: 'USD',
          taxRate: 0.0875,
          serviceChargeRate: 0.18,
          acceptsOnlineOrders: true,
          operatingHours: {
            monday: { open: '11:00', close: '22:00', closed: false },
            tuesday: { open: '11:00', close: '22:00', closed: false },
            wednesday: { open: '11:00', close: '22:00', closed: false },
            thursday: { open: '11:00', close: '22:00', closed: false },
            friday: { open: '11:00', close: '23:00', closed: false },
            saturday: { open: '10:00', close: '23:00', closed: false },
            sunday: { open: '10:00', close: '21:00', closed: false },
          },
          orderChannels: ['qr-code', 'tablet', 'mobile-app'],
          paymentMethods: ['credit_card', 'debit_card', 'mobile_wallet'],
          tableCount: 25,
          avgPrepTime: 18,
        },
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
      },
    ];
    
    localStorage.setItem('restaurants', JSON.stringify(defaultRestaurants));
    return defaultRestaurants;
  }

  private getDefaultOwners(): Owner[] {
    const defaultOwners: Owner[] = [
      {
        id: 'owner-1',
        email: 'owner@bistro.com',
        name: 'John Bistro',
        restaurants: ['bistro-digital'],
        subscription: {
          plan: 'premium',
          status: 'active',
          expiresAt: new Date('2025-12-31'),
        },
        createdAt: new Date('2024-01-15'),
      },
    ];
    
    localStorage.setItem('owners', JSON.stringify(defaultOwners));
    return defaultOwners;
  }
}

export const restaurantService = new RestaurantService();