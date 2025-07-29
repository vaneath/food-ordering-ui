import React from 'react';
import { Order } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, CreditCard, CheckCircle, AlertCircle, Truck } from 'lucide-react';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatDate = (date: Date) => new Date(date).toLocaleString();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'preparing':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'delivered':
        return <Truck className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Order #{order.id}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(order.status)} variant="secondary">
              <span className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </Badge>
            <Badge className={`${getPaymentStatusColor(order.paymentStatus)} mt-1`} variant="secondary">
              <CreditCard className="w-3 h-3 mr-1" />
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Type and Table */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="capitalize">{order.orderType}</span>
          </div>
          {order.tableNumber && (
            <span>Table #{order.tableNumber}</span>
          )}
          {order.estimatedPrepTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{order.estimatedPrepTime} min</span>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-medium mb-3">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.menuItem.name}</h4>
                  
                  {/* Customizations */}
                  {Object.keys(item.selectedCustomizations).length > 0 && (
                    <div className="mt-1 space-y-1">
                      {Object.entries(item.selectedCustomizations).map(([customizationId, optionIds]) => (
                        <div key={customizationId} className="text-sm text-gray-600">
                          {optionIds.map(optionId => (
                            <Badge key={optionId} variant="outline" className="text-xs mr-1">
                              {optionId.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Instructions */}
                  {item.specialInstructions && (
                    <p className="text-sm text-gray-600 mt-1 italic">
                      Note: {item.specialInstructions}
                    </p>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <div className="font-medium">{formatPrice(item.totalPrice)}</div>
                  <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div>
            <h3 className="font-medium mb-2">Special Instructions</h3>
            <p className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
              {order.specialInstructions}
            </p>
          </div>
        )}

        {/* Order Totals */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          {order.tip > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tip</span>
              <span>{formatPrice(order.tip)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-3">Order Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Order Placed</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span>{formatDate(order.updatedAt)}</span>
            </div>
            {order.status === 'preparing' && order.estimatedPrepTime > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Estimated Ready Time</span>
                <span>
                  {new Date(new Date(order.updatedAt).getTime() + order.estimatedPrepTime * 60000).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};