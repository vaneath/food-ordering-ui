import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  decimal,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'restaurant_admin', 'staff', 'customer']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']);
export const orderChannelEnum = pgEnum('order_channel', ['qr-code', 'tablet', 'mobile-app', 'pos']);

// Session storage table for express-session
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default('customer'),
  name: varchar("name", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  restaurantId: varchar("restaurant_id", { length: 255 }),
  permissions: text("permissions").array().default(sql`'{}'::text[]`),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Restaurants table
export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  coverImageUrl: varchar("cover_image_url", { length: 500 }),
  settings: jsonb("settings").default({}),
  isActive: boolean("is_active").default(true),
  ownerId: varchar("owner_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Menu categories table
export const menuCategories = pgTable("menu_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Menu items table
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id", { length: 255 }).notNull(),
  categoryId: varchar("category_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  ingredients: text("ingredients").array().default(sql`'{}'::text[]`),
  allergens: text("allergens").array().default(sql`'{}'::text[]`),
  dietaryInfo: text("dietary_info").array().default(sql`'{}'::text[]`),
  preparationTime: integer("preparation_time").default(15),
  calories: integer("calories"),
  isAvailable: boolean("is_available").default(true),
  isPopular: boolean("is_popular").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id", { length: 255 }).notNull(),
  customerId: varchar("customer_id", { length: 255 }),
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 50 }),
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
  status: orderStatusEnum("status").notNull().default('pending'),
  channel: orderChannelEnum("channel").notNull(),
  tableNumber: varchar("table_number", { length: 20 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default('0'),
  tip: decimal("tip", { precision: 10, scale: 2 }).default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  specialInstructions: text("special_instructions"),
  estimatedReadyTime: timestamp("estimated_ready_time"),
  actualReadyTime: timestamp("actual_ready_time"),
  items: jsonb("items").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics table for tracking key metrics
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  restaurantId: varchar("restaurant_id", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  totalOrders: integer("total_orders").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default('0'),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).default('0'),
  customerCount: integer("customer_count").default(0),
  channelBreakdown: jsonb("channel_breakdown").default({}),
  popularItems: jsonb("popular_items").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for better type safety
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Restaurant = typeof restaurants.$inferSelect;
export type UpsertRestaurant = typeof restaurants.$inferInsert;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type UpsertMenuCategory = typeof menuCategories.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type UpsertMenuItem = typeof menuItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type UpsertOrder = typeof orders.$inferInsert;
export type Analytics = typeof analytics.$inferSelect;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  passwordHash: z.string().min(6),
  name: z.string().min(1),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants, {
  name: z.string().min(1),
  slug: z.string().min(1),
  email: z.string().email().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems, {
  name: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders, {
  customerEmail: z.string().email().optional(),
  subtotal: z.string().regex(/^\d+(\.\d{1,2})?$/),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;