import React, { useState } from 'react';
import { MenuItem, Customization, CustomizationOption } from '../types';
import { useCart } from '../hooks/useCart';
import { pricingService } from '../services/pricingService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Clock, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ItemDetailModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ 
  item, 
  isOpen, 
  onClose, 
  onAddToCart 
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<{ [key: string]: string[] }>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCustomizationChange = (customizationId: string, optionId: string, isMultiple: boolean) => {
    setSelectedCustomizations(prev => {
      const current = prev[customizationId] || [];
      
      if (isMultiple) {
        // For multiple selection (checkboxes)
        const exists = current.includes(optionId);
        return {
          ...prev,
          [customizationId]: exists 
            ? current.filter(id => id !== optionId)
            : [...current, optionId]
        };
      } else {
        // For single selection (radio buttons)
        return {
          ...prev,
          [customizationId]: [optionId]
        };
      }
    });
  };

  const calculateTotalPrice = () => {
    return pricingService.calculateItemPrice(item, selectedCustomizations, quantity);
  };

  const validateSelections = () => {
    const errors: string[] = [];
    
    item.customizations.forEach(customization => {
      if (customization.required) {
        const selected = selectedCustomizations[customization.id] || [];
        if (selected.length === 0) {
          errors.push(`Please select ${customization.name.toLowerCase()}`);
        }
      }
    });
    
    return errors;
  };

  const handleAddToCart = async () => {
    const errors = validateSelections();
    if (errors.length > 0) {
      toast.error(errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      await addToCart(item, quantity, selectedCustomizations, specialInstructions);
      onAddToCart();
    } catch (error) {
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const getCustomizationPrice = (option: CustomizationOption) => {
    if (option.priceModifier === 0) return '';
    return option.priceModifier > 0 
      ? `+${formatPrice(option.priceModifier)}`
      : formatPrice(option.priceModifier);
  };

  const renderCustomization = (customization: Customization) => {
    const isMultiple = customization.type === 'addon';
    const selectedOptions = selectedCustomizations[customization.id] || [];

    return (
      <Card key={customization.id} className="mb-4">
        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-medium flex items-center gap-2">
              {customization.name}
              {customization.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isMultiple ? 'Select all that apply' : 'Select one option'}
            </p>
          </div>

          {isMultiple ? (
            <div className="space-y-2">
              {customization.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`${customization.id}-${option.id}`}
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={(checked) => 
                      handleCustomizationChange(customization.id, option.id, true)
                    }
                    disabled={!option.available}
                  />
                  <Label 
                    htmlFor={`${customization.id}-${option.id}`}
                    className="flex-1 cursor-pointer flex justify-between items-center"
                  >
                    <span className={!option.available ? 'text-gray-400' : ''}>
                      {option.name}
                    </span>
                    {getCustomizationPrice(option) && (
                      <span className="text-sm font-medium text-green-600">
                        {getCustomizationPrice(option)}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup
              value={selectedOptions[0] || ''}
              onValueChange={(value) => handleCustomizationChange(customization.id, value, false)}
            >
              {customization.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={option.id} 
                    id={`${customization.id}-${option.id}`}
                    disabled={!option.available}
                  />
                  <Label 
                    htmlFor={`${customization.id}-${option.id}`}
                    className="flex-1 cursor-pointer flex justify-between items-center"
                  >
                    <span className={!option.available ? 'text-gray-400' : ''}>
                      {option.name}
                    </span>
                    {getCustomizationPrice(option) && (
                      <span className="text-sm font-medium text-green-600">
                        {getCustomizationPrice(option)}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Description and Details */}
          <div>
            <p className="text-gray-600 mb-4">{item.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.preparationTime} min
              </Badge>
              <Badge variant="outline">
                {item.category}
              </Badge>
              {Object.entries(item.dietaryTags).map(([key, value]) => 
                value && (
                  <Badge key={key} variant="secondary">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Badge>
                )
              )}
            </div>

            {/* Allergen Information */}
            {item.allergens.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-md mb-4">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <span className="font-medium">Allergen Information: </span>
                  Contains {item.allergens.join(', ')}
                </div>
              </div>
            )}

            {/* Nutritional Information */}
            {item.nutritionalInfo && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Nutritional Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Calories:</span>
                      <div>{item.nutritionalInfo.calories}</div>
                    </div>
                    <div>
                      <span className="font-medium">Protein:</span>
                      <div>{item.nutritionalInfo.protein}g</div>
                    </div>
                    <div>
                      <span className="font-medium">Carbs:</span>
                      <div>{item.nutritionalInfo.carbohydrates}g</div>
                    </div>
                    <div>
                      <span className="font-medium">Fat:</span>
                      <div>{item.nutritionalInfo.fat}g</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Customizations */}
          {item.customizations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Customize Your Order</h2>
              {item.customizations.map(renderCustomization)}
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <Label htmlFor="instructions" className="text-sm font-medium">
              Special Instructions (Optional)
            </Label>
            <Textarea
              id="instructions"
              placeholder="Any special requests or dietary notes..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Quantity and Price */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <Label className="font-medium">Quantity:</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Price</div>
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(calculateTotalPrice())}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleAddToCart} 
              disabled={loading || !item.available}
              className="flex-1"
            >
              {loading ? 'Adding...' : `Add to Cart - ${formatPrice(calculateTotalPrice())}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};