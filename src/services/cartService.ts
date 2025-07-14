import { Cart, CartItem, MenuItem, OrderItem } from '../types';
import { pricingService } from './pricingService';

class CartService {
  private cart: Cart = {
    items: [],
    subtotal: 0,
    estimatedPrepTime: 0
  };

  constructor() {
    this.loadFromStorage();
  }

  addItem(
    menuItem: MenuItem, 
    quantity: number, 
    selectedCustomizations: { [customizationId: string]: string[] },
    specialInstructions?: string
  ): CartItem {
    const itemId = this.generateItemId();
    const totalPrice = pricingService.calculateItemPrice(menuItem, selectedCustomizations, quantity);
    
    const cartItem: CartItem = {
      id: itemId,
      menuItemId: menuItem.id,
      menuItem,
      quantity,
      selectedCustomizations,
      specialInstructions,
      totalPrice,
      addedAt: new Date()
    };

    this.cart.items.push(cartItem);
    this.updateCartTotals();
    this.saveToStorage();
    
    return cartItem;
  }

  updateItemQuantity(itemId: string, quantity: number): boolean {
    const itemIndex = this.cart.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    const item = this.cart.items[itemIndex];
    item.quantity = quantity;
    item.totalPrice = pricingService.calculateItemPrice(
      item.menuItem, 
      item.selectedCustomizations, 
      quantity
    );

    this.updateCartTotals();
    this.saveToStorage();
    return true;
  }

  removeItem(itemId: string): boolean {
    const itemIndex = this.cart.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    this.cart.items.splice(itemIndex, 1);
    this.updateCartTotals();
    this.saveToStorage();
    return true;
  }

  updateItemCustomizations(
    itemId: string, 
    selectedCustomizations: { [customizationId: string]: string[] }
  ): boolean {
    const itemIndex = this.cart.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    const item = this.cart.items[itemIndex];
    item.selectedCustomizations = selectedCustomizations;
    item.totalPrice = pricingService.calculateItemPrice(
      item.menuItem, 
      selectedCustomizations, 
      item.quantity
    );

    this.updateCartTotals();
    this.saveToStorage();
    return true;
  }

  updateItemInstructions(itemId: string, specialInstructions: string): boolean {
    const itemIndex = this.cart.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    this.cart.items[itemIndex].specialInstructions = specialInstructions;
    this.saveToStorage();
    return true;
  }

  getCart(): Cart {
    return { ...this.cart };
  }

  getItemCount(): number {
    return this.cart.items.reduce((count, item) => count + item.quantity, 0);
  }

  clearCart(): void {
    this.cart = {
      items: [],
      subtotal: 0,
      estimatedPrepTime: 0
    };
    this.saveToStorage();
  }

  // Convert cart items to order items
  getOrderItems(): OrderItem[] {
    return this.cart.items.map(cartItem => ({
      id: cartItem.id,
      menuItemId: cartItem.menuItemId,
      menuItem: cartItem.menuItem,
      quantity: cartItem.quantity,
      selectedCustomizations: cartItem.selectedCustomizations,
      specialInstructions: cartItem.specialInstructions,
      totalPrice: cartItem.totalPrice
    }));
  }

  // Check if item with same configuration already exists
  findSimilarItem(
    menuItemId: string, 
    selectedCustomizations: { [customizationId: string]: string[] },
    specialInstructions?: string
  ): CartItem | null {
    return this.cart.items.find(item => 
      item.menuItemId === menuItemId &&
      this.areCustomizationsEqual(item.selectedCustomizations, selectedCustomizations) &&
      item.specialInstructions === specialInstructions
    ) || null;
  }

  // Merge similar items or add new
  addOrMergeItem(
    menuItem: MenuItem, 
    quantity: number, 
    selectedCustomizations: { [customizationId: string]: string[] },
    specialInstructions?: string
  ): CartItem {
    const existingItem = this.findSimilarItem(menuItem.id, selectedCustomizations, specialInstructions);
    
    if (existingItem) {
      this.updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
      return existingItem;
    } else {
      return this.addItem(menuItem, quantity, selectedCustomizations, specialInstructions);
    }
  }

  private updateCartTotals(): void {
    this.cart.subtotal = pricingService.calculateOrderSubtotal(this.cart.items);
    this.cart.estimatedPrepTime = this.calculateEstimatedPrepTime();
  }

  private calculateEstimatedPrepTime(): number {
    if (this.cart.items.length === 0) return 0;

    let maxPrepTime = 0;
    let totalComplexity = 0;

    this.cart.items.forEach(item => {
      maxPrepTime = Math.max(maxPrepTime, item.menuItem.preparationTime);
      totalComplexity += item.quantity * this.getItemComplexity(item);
    });

    let estimatedTime = maxPrepTime;
    estimatedTime += Math.ceil(totalComplexity / 5) * 2;

    // Peak hour adjustment
    const hour = new Date().getHours();
    if ((hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20)) {
      estimatedTime *= 1.3;
    }

    return Math.round(estimatedTime);
  }

  private getItemComplexity(item: CartItem): number {
    let complexity = 1;
    
    Object.keys(item.selectedCustomizations).forEach(customizationId => {
      complexity += item.selectedCustomizations[customizationId].length * 0.5;
    });

    if (item.specialInstructions) {
      complexity += 1;
    }

    return complexity;
  }

  private areCustomizationsEqual(
    customizations1: { [key: string]: string[] },
    customizations2: { [key: string]: string[] }
  ): boolean {
    const keys1 = Object.keys(customizations1).sort();
    const keys2 = Object.keys(customizations2).sort();
    
    if (keys1.length !== keys2.length) return false;
    
    for (let i = 0; i < keys1.length; i++) {
      if (keys1[i] !== keys2[i]) return false;
      
      const values1 = customizations1[keys1[i]].sort();
      const values2 = customizations2[keys2[i]].sort();
      
      if (values1.length !== values2.length) return false;
      
      for (let j = 0; j < values1.length; j++) {
        if (values1[j] !== values2[j]) return false;
      }
    }
    
    return true;
  }

  private generateItemId(): string {
    return `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  private loadFromStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      this.cart = {
        ...parsedCart,
        items: parsedCart.items.map((item: CartItem & { addedAt: string }) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }))
      };
    }
  }
}

export const cartService = new CartService();