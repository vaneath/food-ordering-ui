import React from 'react';
import { FilterOptions, MenuCategory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MenuFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
}

export const MenuFilters: React.FC<MenuFiltersProps> = ({ filters, onFiltersChange, onClose }) => {
  const categories: MenuCategory[] = [
    'appetizers', 'salads', 'pizzas', 'pasta', 'burgers', 
    'sandwiches', 'mains', 'desserts', 'beverages'
  ];

  const dietaryOptions = [
    { key: 'vegetarian', label: 'Vegetarian' },
    { key: 'vegan', label: 'Vegan' },
    { key: 'glutenFree', label: 'Gluten-Free' },
    { key: 'dairyFree', label: 'Dairy-Free' },
    { key: 'nutFree', label: 'Nut-Free' },
    { key: 'halal', label: 'Halal' },
    { key: 'kosher', label: 'Kosher' }
  ];

  const handleCategoryChange = (category: MenuCategory, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleDietaryChange = (key: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      dietaryRestrictions: {
        ...filters.dietaryRestrictions,
        [key]: checked
      }
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        min: values[0],
        max: values[1]
      }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      dietaryRestrictions: {},
      priceRange: { min: 0, max: 100 },
      searchTerm: filters.searchTerm // Keep search term
    });
  };

  const getCategoryLabel = (category: MenuCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Filter Menu</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="font-medium mb-3">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                />
                <Label
                  htmlFor={category}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getCategoryLabel(category)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <h3 className="font-medium mb-3">Dietary Preferences</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dietaryOptions.map((option) => (
              <div key={option.key} className="flex items-center space-x-2">
                <Checkbox
                  id={option.key}
                  checked={!!filters.dietaryRestrictions[option.key as keyof typeof filters.dietaryRestrictions]}
                  onCheckedChange={(checked) => handleDietaryChange(option.key, checked as boolean)}
                />
                <Label
                  htmlFor={option.key}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="font-medium mb-3">Price Range</h3>
          <div className="px-2">
            <Slider
              value={[filters.priceRange.min, filters.priceRange.max]}
              onValueChange={handlePriceRangeChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>${filters.priceRange.min}</span>
              <span>${filters.priceRange.max}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={clearFilters} className="flex-1">
            Clear All
          </Button>
          <Button onClick={onClose} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};