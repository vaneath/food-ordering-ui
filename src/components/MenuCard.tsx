import React from 'react';
import { MenuItem } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, AlertCircle } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onViewDetails: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart, onViewDetails }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const getDietaryBadges = () => {
    const badges = [];
    if (item.dietaryTags.vegetarian) badges.push('Vegetarian');
    if (item.dietaryTags.vegan) badges.push('Vegan');
    if (item.dietaryTags.glutenFree) badges.push('Gluten-Free');
    if (item.dietaryTags.dairyFree) badges.push('Dairy-Free');
    if (item.dietaryTags.nutFree) badges.push('Nut-Free');
    if (item.dietaryTags.halal) badges.push('Halal');
    if (item.dietaryTags.kosher) badges.push('Kosher');
    return badges;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      appetizers: 'bg-orange-100 text-orange-800',
      salads: 'bg-green-100 text-green-800',
      pizzas: 'bg-red-100 text-red-800',
      pasta: 'bg-yellow-100 text-yellow-800',
      burgers: 'bg-blue-100 text-blue-800',
      sandwiches: 'bg-purple-100 text-purple-800',
      mains: 'bg-indigo-100 text-indigo-800',
      desserts: 'bg-pink-100 text-pink-800',
      beverages: 'bg-cyan-100 text-cyan-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-lg ${!item.available ? 'opacity-60' : 'hover:scale-105'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-1">{item.name}</CardTitle>
            <CardDescription className="text-sm text-gray-600 line-clamp-2">
              {item.description}
            </CardDescription>
          </div>
          <div className="ml-3 text-right">
            <div className="text-xl font-bold text-green-600">
              {formatPrice(item.basePrice)}
              {item.customizations.some(c => c.options.some(o => o.priceModifier !== 0)) && '+'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className={getCategoryColor(item.category)}>
            {item.category}
          </Badge>
          {getDietaryBadges().map((badge, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Prep time and customization info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{item.preparationTime} min</span>
            </div>
            {item.customizations.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Customizable</span>
              </div>
            )}
          </div>

          {/* Allergen warning */}
          {item.allergens.length > 0 && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-md">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <span className="font-medium">Contains: </span>
                {item.allergens.join(', ')}
              </div>
            </div>
          )}

          {/* Nutritional info preview */}
          {item.nutritionalInfo && (
            <div className="text-xs text-gray-500 border-t pt-2">
              <div className="grid grid-cols-2 gap-1">
                <span>{item.nutritionalInfo.calories} cal</span>
                <span>{item.nutritionalInfo.protein}g protein</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(item)}
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              onClick={() => onAddToCart(item)}
              disabled={!item.available}
              size="sm"
              className="flex-1"
            >
              {item.available ? 'Add to Cart' : 'Unavailable'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};