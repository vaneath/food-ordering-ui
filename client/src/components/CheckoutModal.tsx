import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { orderService } from '../services/orderService';
import { pricingService } from '../services/pricingService';
import { PaymentSplit, PaymentMethod } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign, Smartphone, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  
  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    tableNumber: ''
  });
  
  // Order preferences
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout'>('dine-in');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Payment info
  const [tipPercentage, setTipPercentage] = useState(18);
  const [customTip, setCustomTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'mobile_wallet' | 'cash'>('credit_card');

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const calculateTotals = () => {
    const subtotal = cart.subtotal;
    const tax = pricingService.calculateTax(subtotal);
    const tipAmount = customTip 
      ? parseFloat(customTip) || 0 
      : pricingService.calculateTip(subtotal, tipPercentage);
    const total = pricingService.calculateOrderTotal(subtotal, tax, tipAmount);
    
    return { subtotal, tax, tipAmount, total };
  };

  const handleTipChange = (percentage: number) => {
    setTipPercentage(percentage);
    setCustomTip('');
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    setTipPercentage(0);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!customerInfo.name.trim()) {
      errors.push('Name is required');
    }
    
    if (orderType === 'dine-in' && !customerInfo.tableNumber.trim()) {
      errors.push('Table number is required for dine-in orders');
    }
    
    if (cart.items.length === 0) {
      errors.push('Cart is empty');
    }
    
    return errors;
  };

  const handlePlaceOrder = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      const { subtotal, tax, tipAmount, total } = calculateTotals();
      
      // Create order
      const order = await orderService.createOrder(
        cart.items,
        orderType === 'dine-in' ? parseInt(customerInfo.tableNumber) : undefined,
        'guest-user'
      );

      // Prepare payment split
      const paymentSplit: PaymentSplit = {
        methods: [{
          id: 'payment-1',
          type: paymentMethod,
          details: paymentMethod === 'credit_card' ? '**** **** **** 1234' : 'Mobile Payment',
          amount: total
        }],
        tip: {
          amount: tipAmount,
          percentage: tipPercentage
        }
      };

      // Process payment
      await orderService.processPayment(order.id, paymentSplit);
      
      setOrderId(order.id);
      setOrderPlaced(true);
      clearCart();
      
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error('Order placement error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (orderPlaced) {
      setOrderPlaced(false);
      setOrderId('');
    }
    onClose();
  };

  const { subtotal, tax, tipAmount, total } = calculateTotals();

  if (orderPlaced) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Your order has been placed successfully.
            </p>
            
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="text-lg font-semibold">Order #{orderId}</div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  {formatPrice(total)}
                </div>
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Estimated prep time: {cart.estimatedPrepTime} minutes</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 text-sm text-gray-600">
              <p>You will receive updates about your order status.</p>
              {orderType === 'dine-in' && (
                <p>Your order will be delivered to Table #{customerInfo.tableNumber}</p>
              )}
            </div>

            <Button onClick={handleClose} className="w-full mt-6">
              Continue Browsing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Order Info</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Type</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={orderType} onValueChange={setOrderType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dine-in" id="dine-in" />
                    <Label htmlFor="dine-in">Dine In</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="takeout" id="takeout" />
                    <Label htmlFor="takeout">Takeout</Label>
                  </div>
                </RadioGroup>

                {orderType === 'dine-in' && (
                  <div className="mt-4">
                    <Label htmlFor="table">Table Number *</Label>
                    <Input
                      id="table"
                      value={customerInfo.tableNumber}
                      onChange={(e) => setCustomerInfo({...customerInfo, tableNumber: e.target.value})}
                      placeholder="Table number"
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests or dietary notes..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tip</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {[15, 18, 20, 25].map((percentage) => (
                    <Button
                      key={percentage}
                      variant={tipPercentage === percentage ? "default" : "outline"}
                      onClick={() => handleTipChange(percentage)}
                      className="h-12"
                    >
                      {percentage}%
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom-tip">Custom tip:</Label>
                  <Input
                    id="custom-tip"
                    type="number"
                    step="0.01"
                    value={customTip}
                    onChange={(e) => handleCustomTipChange(e.target.value)}
                    placeholder="0.00"
                    className="w-24"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <CreditCard className="w-5 h-5" />
                    <Label htmlFor="credit_card" className="flex-1">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="mobile_wallet" id="mobile_wallet" />
                    <Smartphone className="w-5 h-5" />
                    <Label htmlFor="mobile_wallet" className="flex-1">Mobile Wallet</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <DollarSign className="w-5 h-5" />
                    <Label htmlFor="cash" className="flex-1">Pay at Table</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{item.menuItem.name}</div>
                      <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-medium">{formatPrice(item.totalPrice)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tip ({tipPercentage > 0 ? `${tipPercentage}%` : 'Custom'})</span>
                  <span>{formatPrice(tipAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handlePlaceOrder} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};