import { db } from './db';
import { 
  users, 
  restaurants, 
  menuCategories, 
  menuItems, 
  orders, 
  analytics,
  type User,
  type UpsertUser,
  type Restaurant,
  type UpsertRestaurant,
  type MenuCategory,
  type UpsertMenuCategory,
  type MenuItem,
  type UpsertMenuItem,
  type Order,
  type UpsertOrder,
  type Analytics
} from '@shared/schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import { hashPassword } from './auth';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Restaurant operations
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurantBySlug(slug: string): Promise<Restaurant | undefined>;
  getRestaurants(): Promise<Restaurant[]>;
  createRestaurant(restaurant: UpsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, updates: Partial<UpsertRestaurant>): Promise<Restaurant>;
  deleteRestaurant(id: string): Promise<void>;

  // Menu operations
  getMenuCategories(restaurantId: string): Promise<MenuCategory[]>;
  getMenuItems(restaurantId: string, categoryId?: string): Promise<MenuItem[]>;
  createMenuCategory(category: UpsertMenuCategory): Promise<MenuCategory>;
  createMenuItem(item: UpsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, updates: Partial<UpsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;

  // Order operations
  getOrders(restaurantId?: string, limit?: number): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: UpsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<UpsertOrder>): Promise<Order>;
  deleteOrder(id: string): Promise<void>;

  // Analytics operations
  getAnalytics(restaurantId: string, startDate?: Date, endDate?: Date): Promise<Analytics[]>;
  createAnalytics(analytics: Partial<Analytics>): Promise<Analytics>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    // Hash password if provided
    if (userData.passwordHash) {
      userData.passwordHash = await hashPassword(userData.passwordHash);
    }

    const [user] = await db.insert(users).values({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    // Hash password if being updated
    if (updates.passwordHash) {
      updates.passwordHash = await hashPassword(updates.passwordHash);
    }

    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Restaurant operations
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
    return restaurant;
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, slug)).limit(1);
    return restaurant;
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return db.select().from(restaurants).where(eq(restaurants.isActive, true)).orderBy(desc(restaurants.createdAt));
  }

  async createRestaurant(restaurantData: UpsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await db.insert(restaurants).values({
      ...restaurantData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return restaurant;
  }

  async updateRestaurant(id: string, updates: Partial<UpsertRestaurant>): Promise<Restaurant> {
    const [restaurant] = await db
      .update(restaurants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(restaurants.id, id))
      .returning();
    
    return restaurant;
  }

  async deleteRestaurant(id: string): Promise<void> {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }

  // Menu operations
  async getMenuCategories(restaurantId: string): Promise<MenuCategory[]> {
    return db
      .select()
      .from(menuCategories)
      .where(and(eq(menuCategories.restaurantId, restaurantId), eq(menuCategories.isActive, true)))
      .orderBy(menuCategories.displayOrder);
  }

  async getMenuItems(restaurantId: string, categoryId?: string): Promise<MenuItem[]> {
    const conditions = [eq(menuItems.restaurantId, restaurantId), eq(menuItems.isAvailable, true)];
    
    if (categoryId) {
      conditions.push(eq(menuItems.categoryId, categoryId));
    }

    return db
      .select()
      .from(menuItems)
      .where(and(...conditions))
      .orderBy(menuItems.displayOrder);
  }

  async createMenuCategory(categoryData: UpsertMenuCategory): Promise<MenuCategory> {
    const [category] = await db.insert(menuCategories).values({
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return category;
  }

  async createMenuItem(itemData: UpsertMenuItem): Promise<MenuItem> {
    const [item] = await db.insert(menuItems).values({
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return item;
  }

  async updateMenuItem(id: string, updates: Partial<UpsertMenuItem>): Promise<MenuItem> {
    const [item] = await db
      .update(menuItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    
    return item;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Order operations
  async getOrders(restaurantId?: string, limit: number = 50): Promise<Order[]> {
    const conditions = restaurantId ? [eq(orders.restaurantId, restaurantId)] : [];
    
    return db
      .select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return order;
  }

  async createOrder(orderData: UpsertOrder): Promise<Order> {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const [order] = await db.insert(orders).values({
      ...orderData,
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return order;
  }

  async updateOrder(id: string, updates: Partial<UpsertOrder>): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    
    return order;
  }

  async deleteOrder(id: string): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  // Analytics operations
  async getAnalytics(restaurantId: string, startDate?: Date, endDate?: Date): Promise<Analytics[]> {
    const conditions = [eq(analytics.restaurantId, restaurantId)];
    
    if (startDate) {
      conditions.push(sql`${analytics.date} >= ${startDate}`);
    }
    
    if (endDate) {
      conditions.push(sql`${analytics.date} <= ${endDate}`);
    }

    return db
      .select()
      .from(analytics)
      .where(and(...conditions))
      .orderBy(desc(analytics.date));
  }

  async createAnalytics(analyticsData: Partial<Analytics>): Promise<Analytics> {
    const [analytic] = await db.insert(analytics).values({
      ...analyticsData,
      createdAt: new Date(),
    } as any).returning();
    
    return analytic;
  }
}

export const storage = new DatabaseStorage();