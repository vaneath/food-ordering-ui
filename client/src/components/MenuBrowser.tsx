import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory, FilterOptions } from '../types';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../hooks/useCart';
import { MenuCard } from './MenuCard';
import { MenuFilters } from './MenuFilters';
import { ItemDetailModal } from './ItemDetailModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List } from 'lucide-react';
import { toast } from 'sonner';

export const MenuBrowser: React.FC = () => {
  const { items, categories, loading, error, searchItems, filterItems, getItemsByCategory, loadAllItems } = useMenu();
  const { addToCart } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    dietaryRestrictions: {},
    priceRange: { min: 0, max: 100 },
    searchTerm: ''
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchItems(query);
    } else {
      loadAllItems();
    }
  };

  const handleCategoryChange = (category: MenuCategory | 'all') => {
    setSelectedCategory(category);
    if (category === 'all') {
      loadAllItems();
    } else {
      getItemsByCategory(category);
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    filterItems(newFilters);
  };

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const handleItemAddedToCart = () => {
    toast.success('Item added to cart!');
    setSelectedItem(null);
  };

  const getCategoryLabel = (category: MenuCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading menu: {error}</p>
        <Button onClick={loadAllItems} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          
          <div className="flex border border-gray-200 rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <MenuFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {getCategoryLabel(category)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Active Filters Display */}
      {(searchQuery || filters.categories.length > 0 || Object.keys(filters.dietaryRestrictions).length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <button onClick={() => handleSearch('')} className="ml-1 hover:text-red-600">×</button>
            </Badge>
          )}
          {filters.categories.map((category) => (
            <Badge key={category} variant="secondary">
              {getCategoryLabel(category)}
            </Badge>
          ))}
          {Object.entries(filters.dietaryRestrictions).map(([key, value]) => 
            value && (
              <Badge key={key} variant="secondary">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            )
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading menu items...</p>
        </div>
      )}

      {/* Menu Items */}
      {!loading && (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }
        `}>
          {items.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">No items found matching your criteria.</p>
            </div>
          ) : (
            items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
                onViewDetails={setSelectedItem}
              />
            ))
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleItemAddedToCart}
        />
      )}
    </div>
  );
};