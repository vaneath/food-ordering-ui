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