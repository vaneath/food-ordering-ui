import { MenuItem, MenuCategory, FilterOptions, DietaryRestrictions } from '../types';

// Mock menu data based on PRD example
const mockMenuItems: MenuItem[] = [
  {
    id: 'pizza-margherita',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
    category: 'pizzas',
    basePrice: 16.99,
    available: true,
    preparationTime: 15,
    ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'fresh basil', 'olive oil'],
    allergens: ['gluten', 'dairy'],
    dietaryTags: { vegetarian: true },
    customizations: [
      {
        id: 'pizza-size',
        name: 'Size',
        type: 'size',
        required: true,
        options: [
          { id: 'small', name: 'Small (10")', priceModifier: -3.00, available: true },
          { id: 'medium', name: 'Medium (12")', priceModifier: 0, available: true },
          { id: 'large', name: 'Large (14")', priceModifier: 4.00, available: true },
          { id: 'xlarge', name: 'X-Large (16")', priceModifier: 7.00, available: true },
        ]
      },
      {
        id: 'pizza-crust',
        name: 'Crust Type',
        type: 'preparation',
        required: true,
        options: [
          { id: 'thin', name: 'Thin Crust', priceModifier: 0, available: true },
          { id: 'thick', name: 'Thick Crust', priceModifier: 1.50, available: true },
          { id: 'gluten-free', name: 'Gluten-Free Crust', priceModifier: 3.00, available: true },
        ]
      },
      {
        id: 'pizza-toppings',
        name: 'Additional Toppings',
        type: 'addon',
        required: false,
        options: [
          { id: 'pepperoni', name: 'Pepperoni', priceModifier: 2.50, available: true },
          { id: 'mushrooms', name: 'Mushrooms', priceModifier: 1.50, available: true },
          { id: 'olives', name: 'Black Olives', priceModifier: 1.50, available: true },
          { id: 'peppers', name: 'Bell Peppers', priceModifier: 1.50, available: true },
          { id: 'sausage', name: 'Italian Sausage', priceModifier: 2.50, available: true },
          { id: 'extra-cheese', name: 'Extra Cheese', priceModifier: 2.00, available: true },
        ]
      }
    ],
    nutritionalInfo: {
      calories: 280,
      protein: 12,
      carbohydrates: 36,
      fat: 10,
      fiber: 2,
      sodium: 640
    }
  },
  {
    id: 'caesar-salad',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons, and caesar dressing',
    category: 'salads',
    basePrice: 12.99,
    available: true,
    preparationTime: 5,
    ingredients: ['romaine lettuce', 'parmesan cheese', 'croutons', 'caesar dressing'],
    allergens: ['dairy', 'gluten'],
    dietaryTags: { vegetarian: true },
    customizations: [
      {
        id: 'salad-protein',
        name: 'Add Protein',
        type: 'addon',
        required: false,
        options: [
          { id: 'grilled-chicken', name: 'Grilled Chicken', priceModifier: 5.00, available: true },
          { id: 'grilled-shrimp', name: 'Grilled Shrimp', priceModifier: 6.00, available: true },
          { id: 'salmon', name: 'Grilled Salmon', priceModifier: 8.00, available: true },
        ]
      },
      {
        id: 'salad-dressing',
        name: 'Dressing',
        type: 'substitution',
        required: false,
        options: [
          { id: 'caesar', name: 'Caesar (Default)', priceModifier: 0, available: true },
          { id: 'ranch', name: 'Ranch', priceModifier: 0, available: true },
          { id: 'vinaigrette', name: 'Balsamic Vinaigrette', priceModifier: 0, available: true },
        ]
      }
    ],
    nutritionalInfo: {
      calories: 180,
      protein: 8,
      carbohydrates: 12,
      fat: 12,
      fiber: 4,
      sodium: 480
    }
  },
  {
    id: 'classic-burger',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
    category: 'burgers',
    basePrice: 15.99,
    available: true,
    preparationTime: 12,
    ingredients: ['beef patty', 'brioche bun', 'lettuce', 'tomato', 'onion', 'special sauce'],
    allergens: ['gluten', 'dairy'],
    dietaryTags: {},
    customizations: [
      {
        id: 'burger-cooking',
        name: 'How would you like it cooked?',
        type: 'preparation',
        required: true,
        options: [
          { id: 'rare', name: 'Rare', priceModifier: 0, available: true },
          { id: 'medium-rare', name: 'Medium Rare', priceModifier: 0, available: true },
          { id: 'medium', name: 'Medium', priceModifier: 0, available: true },
          { id: 'medium-well', name: 'Medium Well', priceModifier: 0, available: true },
          { id: 'well-done', name: 'Well Done', priceModifier: 0, available: true },
        ]
      },
      {
        id: 'burger-cheese',
        name: 'Add Cheese',
        type: 'addon',
        required: false,
        options: [
          { id: 'american', name: 'American Cheese', priceModifier: 1.50, available: true },
          { id: 'cheddar', name: 'Cheddar', priceModifier: 1.50, available: true },
          { id: 'swiss', name: 'Swiss', priceModifier: 1.50, available: true },
          { id: 'blue-cheese', name: 'Blue Cheese', priceModifier: 2.00, available: true },
        ]
      }
    ],
    nutritionalInfo: {
      calories: 520,
      protein: 28,
      carbohydrates: 35,
      fat: 28,
      fiber: 3,
      sodium: 890
    }
  },
  {
    id: 'veggie-wrap',
    name: 'Mediterranean Veggie Wrap',
    description: 'Fresh vegetables, hummus, and feta in a whole wheat tortilla',
    category: 'sandwiches',
    basePrice: 11.99,
    available: true,
    preparationTime: 8,
    ingredients: ['whole wheat tortilla', 'hummus', 'cucumber', 'tomatoes', 'red onion', 'feta cheese', 'lettuce'],
    allergens: ['gluten', 'dairy'],
    dietaryTags: { vegetarian: true },
    customizations: [
      {
        id: 'wrap-extras',
        name: 'Add Extras',
        type: 'addon',
        required: false,
        options: [
          { id: 'avocado', name: 'Avocado', priceModifier: 2.00, available: true },
          { id: 'olives', name: 'Kalamata Olives', priceModifier: 1.50, available: true },
          { id: 'sprouts', name: 'Alfalfa Sprouts', priceModifier: 1.00, available: true },
        ]
      }
    ],
    nutritionalInfo: {
      calories: 320,
      protein: 14,
      carbohydrates: 42,
      fat: 12,
      fiber: 8,
      sodium: 720
    }
  },
  {
    id: 'chocolate-cake',
    name: 'Chocolate Fudge Cake',
    description: 'Rich chocolate cake with fudge frosting',
    category: 'desserts',
    basePrice: 7.99,
    available: true,
    preparationTime: 3,
    ingredients: ['chocolate cake', 'fudge frosting', 'chocolate chips'],
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: { vegetarian: true },
    customizations: [
      {
        id: 'cake-extras',
        name: 'Add Extras',
        type: 'addon',
        required: false,
        options: [
          { id: 'ice-cream', name: 'Vanilla Ice Cream', priceModifier: 2.50, available: true },
          { id: 'whipped-cream', name: 'Whipped Cream', priceModifier: 1.00, available: true },
          { id: 'berries', name: 'Fresh Berries', priceModifier: 2.00, available: true },
        ]
      }
    ],
    nutritionalInfo: {
      calories: 450,
      protein: 6,
      carbohydrates: 65,
      fat: 18,
      fiber: 3,
      sodium: 320
    }
  }
];

class MenuService {
  private items: MenuItem[] = mockMenuItems;

  async getAllItems(): Promise<MenuItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.items.filter(item => item.available);
  }

  async getItemById(id: string): Promise<MenuItem | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.items.find(item => item.id === id) || null;
  }

  async getItemsByCategory(category: MenuCategory): Promise<MenuItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.items.filter(item => item.category === category && item.available);
  }

  async searchItems(query: string): Promise<MenuItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const lowercaseQuery = query.toLowerCase();
    return this.items.filter(item => 
      item.available && (
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.ingredients.some(ingredient => ingredient.toLowerCase().includes(lowercaseQuery))
      )
    );
  }

  async filterItems(filters: FilterOptions): Promise<MenuItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    let filteredItems = this.items.filter(item => item.available);

    // Filter by categories
    if (filters.categories.length > 0) {
      filteredItems = filteredItems.filter(item => 
        filters.categories.includes(item.category)
      );
    }

    // Filter by price range
    filteredItems = filteredItems.filter(item => 
      item.basePrice >= filters.priceRange.min && 
      item.basePrice <= filters.priceRange.max
    );

    // Filter by dietary restrictions
    filteredItems = filteredItems.filter(item => {
      if (filters.dietaryRestrictions.vegetarian && !item.dietaryTags.vegetarian) return false;
      if (filters.dietaryRestrictions.vegan && !item.dietaryTags.vegan) return false;
      if (filters.dietaryRestrictions.glutenFree && item.allergens.includes('gluten')) return false;
      if (filters.dietaryRestrictions.dairyFree && item.allergens.includes('dairy')) return false;
      if (filters.dietaryRestrictions.nutFree && item.allergens.some(allergen => 
        allergen.includes('nut') || allergen.includes('peanut'))) return false;
      return true;
    });

    // Filter by search term
    if (filters.searchTerm) {
      const lowercaseQuery = filters.searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.ingredients.some(ingredient => ingredient.toLowerCase().includes(lowercaseQuery))
      );
    }

    return filteredItems;
  }

  async getCategories(): Promise<MenuCategory[]> {
    const categories: MenuCategory[] = [
      'appetizers', 'salads', 'pizzas', 'pasta', 'burgers', 
      'sandwiches', 'mains', 'desserts', 'beverages'
    ];
    return categories;
  }

  // Inventory management
  async checkAvailability(itemId: string): Promise<boolean> {
    const item = await this.getItemById(itemId);
    return item?.available || false;
  }

  async updateAvailability(itemId: string, available: boolean): Promise<void> {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      this.items[itemIndex].available = available;
      // In real app, this would sync with backend
      localStorage.setItem('menuItems', JSON.stringify(this.items));
    }
  }
}

export const menuService = new MenuService();