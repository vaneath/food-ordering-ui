import { MenuItem, OrderItem, CustomizationOption } from '../types';

class PricingService {
  calculateItemPrice(
    menuItem: MenuItem, 
    selectedCustomizations: { [customizationId: string]: string[] },
    quantity: number = 1
  ): number {
    let totalPrice = menuItem.basePrice;

    // Calculate customization costs
    for (const [customizationId, optionIds] of Object.entries(selectedCustomizations)) {
      const customization = menuItem.customizations.find(c => c.id === customizationId);
      if (customization) {
        for (const optionId of optionIds) {
          const option = customization.options.find(o => o.id === optionId);
          if (option) {
            totalPrice += option.priceModifier;
          }
        }
      }
    }

    return Math.round(totalPrice * quantity * 100) / 100; // Round to 2 decimal places
  }

  calculateOrderSubtotal(items: OrderItem[]): number {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    return Math.round(subtotal * 100) / 100;
  }

  calculateTax(subtotal: number, taxRate: number = 0.0875): number {
    const tax = subtotal * taxRate;
    return Math.round(tax * 100) / 100;
  }

  calculateTip(subtotal: number, tipPercentage: number): number {
    const tip = subtotal * (tipPercentage / 100);
    return Math.round(tip * 100) / 100;
  }

  calculateOrderTotal(subtotal: number, tax: number, tip: number): number {
    const total = subtotal + tax + tip;
    return Math.round(total * 100) / 100;
  }

  // Complex pricing scenarios
  applyPromotions(subtotal: number, promoCode?: string): { discount: number; newSubtotal: number } {
    let discount = 0;
    
    // Mock promotion logic
    switch (promoCode?.toUpperCase()) {
      case 'SAVE10':
        discount = Math.min(subtotal * 0.1, 10); // 10% off, max $10
        break;
      case 'NEWUSER':
        discount = Math.min(subtotal * 0.15, 15); // 15% off, max $15
        break;
      case 'FAMILY20':
        if (subtotal >= 50) {
          discount = subtotal * 0.2; // 20% off orders over $50
        }
        break;
      default:
        discount = 0;
    }

    discount = Math.round(discount * 100) / 100;
    const newSubtotal = Math.round((subtotal - discount) * 100) / 100;
    
    return { discount, newSubtotal };
  }

  // Dynamic pricing based on time/demand
  applyDynamicPricing(basePrice: number, demandMultiplier: number = 1): number {
    const hour = new Date().getHours();
    let timeMultiplier = 1;

    // Peak hours (11am-2pm, 5pm-8pm) - slight increase
    if ((hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20)) {
      timeMultiplier = 1.05; // 5% increase during peak hours
    }

    // Late night discount (after 9pm)
    if (hour >= 21 || hour <= 6) {
      timeMultiplier = 0.9; // 10% discount late night
    }

    const adjustedPrice = basePrice * timeMultiplier * demandMultiplier;
    return Math.round(adjustedPrice * 100) / 100;
  }

  // Split payment calculations
  calculateSplitPayment(total: number, splitCount: number): number[] {
    const baseAmount = Math.floor((total * 100) / splitCount) / 100;
    const remainder = Math.round((total - (baseAmount * splitCount)) * 100) / 100;
    
    const splits = new Array(splitCount).fill(baseAmount);
    if (remainder > 0) {
      splits[0] += remainder; // Add remainder to first payment
    }
    
    return splits;
  }

  // Validate pricing calculations
  validatePricing(orderItem: OrderItem, menuItem: MenuItem): boolean {
    const calculatedPrice = this.calculateItemPrice(
      menuItem, 
      orderItem.selectedCustomizations, 
      orderItem.quantity
    );
    
    // Allow for small rounding differences
    return Math.abs(calculatedPrice - orderItem.totalPrice) < 0.01;
  }
}

export const pricingService = new PricingService();