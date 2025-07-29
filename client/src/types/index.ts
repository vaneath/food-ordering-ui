// Core Types for Restaurant Ordering System

export interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  preferences?: DietaryRestrictions;
}

export interface DietaryRestrictions {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  nutFree?: boolean;
  halal?: boolean;
  kosher?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  basePrice: number;
  image?: string;
  available: boolean;
  preparationTime: number; // in minutes
  ingredients: string[];
  allergens: string[];
  nutritionalInfo?: NutritionalInfo;
  customizations: Customization[];
  dietaryTags: DietaryRestrictions;
}

export interface Customization {
  id: string;
  name: string;
  type: 'size' | 'addon' | 'preparation' | 'removal' | 'substitution';
  required: boolean;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  priceModifier: number;
  available: boolean;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sodium?: number;
}

export type MenuCategory = 
  | 'appetizers'
  | 'salads'
  | 'pizzas'
  | 'pasta'
  | 'burgers'
  | 'sandwiches'
  | 'mains'
  | 'desserts'
  | 'beverages';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: { [customizationId: string]: string[] };
  specialInstructions?: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  tableNumber?: number;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  specialInstructions?: string;
  estimatedPrepTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export type OrderType = 
  | 'dine-in'
  | 'takeout'
  | 'delivery';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'mobile_wallet' | 'cash';
  details: string; // Last 4 digits for cards
  amount: number;
}

export interface PaymentSplit {
  methods: PaymentMethod[];
  tip: {
    percentage?: number;
    amount?: number;
  };
}

export interface TableSession {
  id: string;
  tableNumber: number;
  qrCode: string;
  active: boolean;
  orders: string[]; // Order IDs
  createdAt: Date;
}

export interface FilterOptions {
  categories: MenuCategory[];
  dietaryRestrictions: DietaryRestrictions;
  priceRange: {
    min: number;
    max: number;
  };
  searchTerm: string;
}

export interface CartItem extends OrderItem {
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  estimatedPrepTime: number;
}

// Validation and Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

// App State Types
export type OrderChannel = 'qr-code' | 'tablet' | 'mobile-app';

export interface AppState {
  currentChannel: OrderChannel;
  tableNumber?: number;
  user?: User;
  cart: Cart;
  currentOrder?: Order;
  filters: FilterOptions;
  loading: boolean;
  error?: string;
}

// Authentication & User Management Types
export type UserRole = 'super_admin' | 'restaurant_admin' | 'staff' | 'customer';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  restaurantId?: string;
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;
}

// Restaurant & Location Types
export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  ownerId: string;
  settings: RestaurantSettings;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantSettings {
  currency: string;
  taxRate: number;
  serviceChargeRate: number;
  acceptsOnlineOrders: boolean;
  operatingHours: OperatingHours;
  orderChannels: OrderChannel[];
  paymentMethods: string[];
  tableCount: number;
  avgPrepTime: number;
}

export interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

// Inventory Management Types
export interface InventoryItem {
  id: string;
  menuItemId: string;
  restaurantId: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  lastRestocked: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

// Admin & Analytics Types
export interface SalesReport {
  restaurantId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topSellingItems: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  ordersByHour: Array<{
    hour: number;
    count: number;
    revenue: number;
  }>;
  ordersByChannel: Array<{
    channel: OrderChannel;
    count: number;
    revenue: number;
  }>;
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  orderTime: Date;
  estimatedCompletionTime: Date;
  tableNumber?: number;
  specialInstructions?: string;
  priority: 'low' | 'normal' | 'high';
}

// Multi-Vendor Types
export interface Owner {
  id: string;
  email: string;
  name: string;
  restaurants: string[]; // Restaurant IDs
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'expired' | 'cancelled';
    expiresAt: Date;
  };
  createdAt: Date;
}

export interface LocationQRCode {
  id: string;
  restaurantId: string;
  tableNumber?: number;
  qrCode: string;
  url: string;
  active: boolean;
  createdAt: Date;
}

// System Configuration Types
export interface SystemSettings {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  maxRestaurantsPerOwner: number;
  features: {
    multiVendor: boolean;
    analytics: boolean;
    inventory: boolean;
    kitchenDisplay: boolean;
  };
}