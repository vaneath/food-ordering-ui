import { Order, OrderItem, MenuItem, OrderStatus, PaymentStatus, PaymentSplit } from '../types';
import { pricingService } from './pricingService';

class OrderService {
  private orders: Order[] = [];
  private currentOrderId: number = 1;

  constructor() {
    this.loadFromStorage();
  }

  async createOrder(items: OrderItem[], tableNumber?: number, userId?: string): Promise<Order> {
    const orderId = `ORD-${String(this.currentOrderId).padStart(6, '0')}`;
    this.currentOrderId++;

    const subtotal = pricingService.calculateOrderSubtotal(items);
    const tax = pricingService.calculateTax(subtotal);
    const tip = 0; // Will be set during payment
    const total = pricingService.calculateOrderTotal(subtotal, tax, tip);

    // Calculate estimated prep time
    const estimatedPrepTime = this.calculateEstimatedPrepTime(items);

    const order: Order = {
      id: orderId,
      tableNumber,
      userId,
      items,
      subtotal,
      tax,
      tip,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      orderType: tableNumber ? 'dine-in' : 'takeout',
      estimatedPrepTime,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.push(order);
    this.saveToStorage();

    // Simulate order processing delay
    setTimeout(() => {
      this.updateOrderStatus(orderId, 'confirmed');
    }, 2000);

    return order;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.orders.find(order => order.id === orderId) || null;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orders.filter(order => order.userId === userId);
  }

  async getTableOrders(tableNumber: number): Promise<Order[]> {
    return this.orders.filter(order => order.tableNumber === tableNumber);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    const orderIndex = this.orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;

    this.orders[orderIndex].status = status;
    this.orders[orderIndex].updatedAt = new Date();
    
    this.saveToStorage();
    this.notifyOrderUpdate(this.orders[orderIndex]);
    
    return true;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, tip?: number): Promise<boolean> {
    const orderIndex = this.orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;

    const order = this.orders[orderIndex];
    order.paymentStatus = paymentStatus;
    
    if (tip !== undefined) {
      order.tip = tip;
      order.total = pricingService.calculateOrderTotal(order.subtotal, order.tax, order.tip);
    }
    
    order.updatedAt = new Date();
    
    this.saveToStorage();
    this.notifyOrderUpdate(order);
    
    return true;
  }

  async processPayment(orderId: string, paymentSplit: PaymentSplit): Promise<boolean> {
    const order = await this.getOrder(orderId);
    if (!order) return false;

    try {
      // Update payment status to processing
      await this.updatePaymentStatus(orderId, 'processing');

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate tip
      const tipAmount = paymentSplit.tip.amount || 
        pricingService.calculateTip(order.subtotal, paymentSplit.tip.percentage || 0);

      // Validate payment amounts
      const expectedTotal = pricingService.calculateOrderTotal(order.subtotal, order.tax, tipAmount);
      const providedTotal = paymentSplit.methods.reduce((sum, method) => sum + method.amount, 0);

      if (Math.abs(expectedTotal - providedTotal) > 0.01) {
        await this.updatePaymentStatus(orderId, 'failed');
        throw new Error('Payment amount mismatch');
      }

      // Process successful payment
      await this.updatePaymentStatus(orderId, 'completed', tipAmount);
      await this.updateOrderStatus(orderId, 'confirmed');

      return true;
    } catch (error) {
      await this.updatePaymentStatus(orderId, 'failed');
      throw error;
    }
  }

  private calculateEstimatedPrepTime(items: OrderItem[]): number {
    let maxPrepTime = 0;
    let totalComplexity = 0;

    items.forEach(item => {
      maxPrepTime = Math.max(maxPrepTime, item.menuItem.preparationTime);
      totalComplexity += item.quantity * this.getItemComplexity(item);
    });

    let estimatedTime = maxPrepTime;
    estimatedTime += Math.ceil(totalComplexity / 5) * 2;

    // Add buffer time during peak hours
    const hour = new Date().getHours();
    if ((hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20)) {
      estimatedTime *= 1.3;
    }

    return Math.round(estimatedTime);
  }

  private getItemComplexity(item: OrderItem): number {
    let complexity = 1;
    
    Object.keys(item.selectedCustomizations).forEach(customizationId => {
      complexity += item.selectedCustomizations[customizationId].length * 0.5;
    });

    if (item.specialInstructions) {
      complexity += 1;
    }

    return complexity;
  }

  private notifyOrderUpdate(order: Order): void {
    console.log(`Order ${order.id} updated: ${order.status} - ${order.paymentStatus}`);
    
    if (order.status === 'confirmed' && order.paymentStatus === 'completed') {
      setTimeout(() => this.updateOrderStatus(order.id, 'preparing'), 1000);
    }
    
    if (order.status === 'preparing') {
      setTimeout(() => this.updateOrderStatus(order.id, 'ready'), order.estimatedPrepTime * 60000);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('orders', JSON.stringify(this.orders));
    localStorage.setItem('currentOrderId', this.currentOrderId.toString());
  }

  private loadFromStorage(): void {
    const savedOrders = localStorage.getItem('orders');
    const savedOrderId = localStorage.getItem('currentOrderId');
    
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders).map((order: Order & { createdAt: string; updatedAt: string }) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt)
      }));
    }
    
    if (savedOrderId) {
      this.currentOrderId = parseInt(savedOrderId);
    }
  }
}

export const orderService = new OrderService();