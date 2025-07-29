import { db } from './db';
import { storage } from './storage';
import { DEFAULT_PERMISSIONS } from './auth';

// Seed data for demo purposes
export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create demo users
    const superAdmin = await storage.createUser({
      email: 'admin@restaurant.com',
      passwordHash: 'password123',
      name: 'System Administrator',
      role: 'super_admin',
      permissions: DEFAULT_PERMISSIONS.super_admin,
      isActive: true,
    }).catch(() => null); // Ignore if already exists

    // Create a demo restaurant
    const restaurant = await storage.createRestaurant({
      name: 'Bistro Digital',
      slug: 'bistro-digital',
      description: 'A modern digital dining experience',
      address: '123 Restaurant Street, Food City, FC 12345',
      phone: '(555) 123-4567',
      email: 'info@bistrodigital.com',
      settings: {
        theme: 'modern',
        orderingEnabled: true,
        takeoutEnabled: true,
        deliveryEnabled: false,
      },
      isActive: true,
      ownerId: superAdmin?.id,
    }).catch(() => null);

    if (restaurant) {
      // Create restaurant owner
      const owner = await storage.createUser({
        email: 'owner@bistro.com',
        passwordHash: 'password123',
        name: 'Restaurant Owner',
        role: 'restaurant_admin',
        restaurantId: restaurant.id,
        permissions: DEFAULT_PERMISSIONS.restaurant_admin,
        isActive: true,
      }).catch(() => null);

      // Create kitchen staff
      const staff = await storage.createUser({
        email: 'staff@bistro.com',
        passwordHash: 'password123',
        name: 'Kitchen Staff',
        role: 'staff',
        restaurantId: restaurant.id,
        permissions: DEFAULT_PERMISSIONS.staff,
        isActive: true,
      }).catch(() => null);

      // Create menu categories
      const appetizers = await storage.createMenuCategory({
        restaurantId: restaurant.id,
        name: 'Appetizers',
        description: 'Start your meal with our delicious appetizers',
        displayOrder: 1,
        isActive: true,
      }).catch(() => null);

      const mains = await storage.createMenuCategory({
        restaurantId: restaurant.id,
        name: 'Main Courses',
        description: 'Hearty and satisfying main dishes',
        displayOrder: 2,
        isActive: true,
      }).catch(() => null);

      const desserts = await storage.createMenuCategory({
        restaurantId: restaurant.id,
        name: 'Desserts',
        description: 'Sweet endings to your meal',
        displayOrder: 3,
        isActive: true,
      }).catch(() => null);

      // Create menu items
      if (appetizers) {
        await storage.createMenuItem({
          restaurantId: restaurant.id,
          categoryId: appetizers.id,
          name: 'Crispy Calamari',
          description: 'Fresh squid rings with marinara sauce',
          price: '12.99',
          ingredients: ['squid', 'flour', 'herbs', 'marinara sauce'],
          allergens: ['gluten', 'seafood'],
          preparationTime: 15,
          calories: 320,
          isAvailable: true,
          isPopular: true,
          displayOrder: 1,
        }).catch(() => null);

        await storage.createMenuItem({
          restaurantId: restaurant.id,
          categoryId: appetizers.id,
          name: 'Bruschetta Trio',
          description: 'Three styles of toasted bread with toppings',
          price: '9.99',
          ingredients: ['bread', 'tomatoes', 'basil', 'mozzarella', 'balsamic'],
          allergens: ['gluten', 'dairy'],
          preparationTime: 10,
          calories: 280,
          isAvailable: true,
          displayOrder: 2,
        }).catch(() => null);
      }

      if (mains) {
        await storage.createMenuItem({
          restaurantId: restaurant.id,
          categoryId: mains.id,
          name: 'Grilled Salmon',
          description: 'Atlantic salmon with herbs and vegetables',
          price: '24.99',
          ingredients: ['salmon', 'herbs', 'vegetables', 'lemon'],
          allergens: ['fish'],
          preparationTime: 25,
          calories: 450,
          isAvailable: true,
          isPopular: true,
          displayOrder: 1,
        }).catch(() => null);

        await storage.createMenuItem({
          restaurantId: restaurant.id,
          categoryId: mains.id,
          name: 'Ribeye Steak',
          description: '12oz prime ribeye with garlic mashed potatoes',
          price: '32.99',
          ingredients: ['ribeye steak', 'potatoes', 'garlic', 'butter'],
          allergens: ['dairy'],
          preparationTime: 30,
          calories: 720,
          isAvailable: true,
          displayOrder: 2,
        }).catch(() => null);
      }

      if (desserts) {
        await storage.createMenuItem({
          restaurantId: restaurant.id,
          categoryId: desserts.id,
          name: 'Chocolate Lava Cake',
          description: 'Warm chocolate cake with molten center',
          price: '8.99',
          ingredients: ['chocolate', 'flour', 'eggs', 'vanilla ice cream'],
          allergens: ['gluten', 'dairy', 'eggs'],
          preparationTime: 12,
          calories: 520,
          isAvailable: true,
          isPopular: true,
          displayOrder: 1,
        }).catch(() => null);
      }

      console.log('✅ Database seeded successfully');
      console.log('\n🔐 Demo Credentials:');
      console.log('Super Admin: admin@restaurant.com / password123');
      console.log('Restaurant Owner: owner@bistro.com / password123');
      console.log('Kitchen Staff: staff@bistro.com / password123');
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}