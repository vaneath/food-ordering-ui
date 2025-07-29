import React from 'react';
import { useCart } from '../hooks/useCart';
import { pricingService } from '../services/pricingService';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Minus, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface CartSidebarProps {
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onCheckout }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, itemCount } = useCart();

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
    toast.success('Item removed from cart');
  };

  const handleClearCart = async () => {
    await clearCart();
    toast.success('Cart cleared');
  };

  const getCustomizationSummary = (selectedCustomizations: { [key: string]: string[] }) => {
    const customizations: string[] = [];
    Object.entries(selectedCustomizations).forEach(([customizationId, optionIds]) => {
      optionIds.forEach(optionId => {
        customizations.push(optionId.replace('-', ' '));
      });
    });
    return customizations;
  };

  const tax = pricingService.calculateTax(cart.subtotal);
  const total = pricingService.calculateOrderTotal(cart.subtotal, tax, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Cart
          {itemCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Your Order</span>
            {cart.items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearCart}>
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">Add some delicious items to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{item.menuItem.name}</h3>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Customizations */}
                      {Object.keys(item.selectedCustomizations).length > 0 && (
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-1">
                            {getCustomizationSummary(item.selectedCustomizations).map((customization, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {customization}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Special Instructions */}
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-600 mb-2 italic">
                          Note: {item.specialInstructions}
                        </p>
                      )}

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          {formatPrice(item.totalPrice)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Estimated Prep Time */}
                {cart.estimatedPrepTime > 0 && (
                  <Card className="bg-blue-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Estimated prep time: {cart.estimatedPrepTime} minutes
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Order Summary and Checkout */}
          {cart.items.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button 
                onClick={onCheckout} 
                className="w-full" 
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};