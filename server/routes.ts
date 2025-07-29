import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { storage } from './storage';
import { testConnection } from './db';
import { 
  authenticateToken, 
  requireRole, 
  requirePermission, 
  requireRestaurantAccess,
  generateToken,
  verifyPassword,
  hashPassword,
  DEFAULT_PERMISSIONS,
  type AuthRequest 
} from './auth';
import { 
  insertUserSchema, 
  insertRestaurantSchema, 
  insertMenuItemSchema, 
  insertOrderSchema 
} from '@shared/schema';
import { z } from 'zod';

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Register schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['super_admin', 'restaurant_admin', 'staff', 'customer']).optional(),
  restaurantId: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Test database connection and seed if successful
  const isConnected = await testConnection().catch(() => false);
  
  if (isConnected) {
    // Import and run seeding
    import('./seed').then(({ seedDatabase }) => {
      seedDatabase();
    }).catch(() => {
      console.log('Seeding skipped - database may already be populated');
    });
  } else {
    console.warn("Database connection failed, running in demo mode with limited functionality");
  }

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'development' ? false : {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  }));

  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : true, // Allow all origins in development
    credentials: true,
  }));

  // Apply rate limiting
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter);

  // ===== AUTHENTICATION ROUTES =====
  
  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if database is available
      const isConnected = await testConnection().catch(() => false);
      
      if (!isConnected) {
        // Demo mode - create mock user
        const role = validatedData.role || 'customer';
        const permissions = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS] || [];
        const mockUser = {
          id: `demo-${Date.now()}`,
          email: validatedData.email,
          name: validatedData.name,
          role,
          restaurantId: validatedData.restaurantId,
          permissions,
        };

        const token = generateToken(mockUser);
        return res.json({ user: mockUser, token });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Set default role and permissions
      const role = validatedData.role || 'customer';
      const permissions = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS] || [];

      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        passwordHash: validatedData.password, // Will be hashed in storage
        name: validatedData.name,
        role,
        restaurantId: validatedData.restaurantId,
        permissions,
        isActive: true,
      });

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        restaurantId: user.restaurantId || undefined,
        permissions: user.permissions || [],
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
          permissions: user.permissions,
        },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Check if database is available
      const isConnected = await testConnection().catch(() => false);
      
      if (!isConnected) {
        // Demo mode - check against predefined demo users
        const demoUsers = [
          {
            id: 'admin-1',
            email: 'admin@restaurant.com',
            role: 'super_admin',
            name: 'System Administrator',
            permissions: DEFAULT_PERMISSIONS.super_admin,
          },
          {
            id: 'owner-1',
            email: 'owner@bistro.com',
            role: 'restaurant_admin',
            name: 'Restaurant Owner',
            restaurantId: 'bistro-digital',
            permissions: DEFAULT_PERMISSIONS.restaurant_admin,
          },
          {
            id: 'staff-1',
            email: 'staff@bistro.com',
            role: 'staff',
            name: 'Kitchen Staff',
            restaurantId: 'bistro-digital',
            permissions: DEFAULT_PERMISSIONS.staff,
          },
        ];

        const demoUser = demoUsers.find(u => u.email === email);
        if (!demoUser || password !== 'password123') {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(demoUser);
        return res.json({ user: demoUser, token });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        restaurantId: user.restaurantId || undefined,
        permissions: user.permissions || [],
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
          permissions: user.permissions,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Get current user
  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // Demo health check
  app.get('/api/demo/status', (req, res) => {
    res.json({ 
      message: 'Authentication system ready - database connection optional',
      demoMode: true,
      credentials: {
        'Super Admin': 'admin@restaurant.com / password123',
        'Restaurant Owner': 'owner@bistro.com / password123',
        'Kitchen Staff': 'staff@bistro.com / password123'
      }
    });
  });

  // ===== USER MANAGEMENT ROUTES =====
  
  // Get all users (Super admin only)
  app.get('/api/users', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
      // Implementation would go here - for now return empty array
      res.json([]);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // ===== RESTAURANT ROUTES =====
  
  // Get all restaurants
  app.get('/api/restaurants', async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
  });

  // Get restaurant by ID or slug
  app.get('/api/restaurants/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      
      // Try to find by ID first, then by slug
      let restaurant = await storage.getRestaurant(identifier);
      if (!restaurant) {
        restaurant = await storage.getRestaurantBySlug(identifier);
      }
      
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      
      res.json(restaurant);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      res.status(500).json({ error: 'Failed to fetch restaurant' });
    }
  });

  // Create restaurant (Admin only)
  app.post('/api/restaurants', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
      const validatedData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(validatedData);
      res.status(201).json(restaurant);
    } catch (error) {
      console.error('Error creating restaurant:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create restaurant' });
    }
  });

  // ===== MENU ROUTES =====
  
  // Get menu categories for a restaurant
  app.get('/api/restaurants/:restaurantId/menu/categories', async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const categories = await storage.getMenuCategories(restaurantId);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching menu categories:', error);
      res.status(500).json({ error: 'Failed to fetch menu categories' });
    }
  });

  // Get menu items for a restaurant
  app.get('/api/restaurants/:restaurantId/menu/items', async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const { categoryId } = req.query;
      const items = await storage.getMenuItems(restaurantId, categoryId as string);
      res.json(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({ error: 'Failed to fetch menu items' });
    }
  });

  // Create menu item (Restaurant admin and above)
  app.post('/api/restaurants/:restaurantId/menu/items', 
    authenticateToken, 
    requirePermission('menu_manage'),
    requireRestaurantAccess,
    async (req, res) => {
      try {
        const { restaurantId } = req.params;
        const validatedData = insertMenuItemSchema.parse(req.body);
        
        const item = await storage.createMenuItem({
          ...validatedData,
          restaurantId,
        });
        
        res.status(201).json(item);
      } catch (error) {
        console.error('Error creating menu item:', error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: 'Invalid input data', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to create menu item' });
      }
    }
  );

  // ===== ORDER ROUTES =====
  
  // Get orders
  app.get('/api/orders', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { restaurantId } = req.query;
      const limit = parseInt(req.query.limit as string) || 50;
      
      // If user is not super admin, restrict to their restaurant
      const targetRestaurantId = req.user!.role === 'super_admin' 
        ? (restaurantId as string) 
        : req.user!.restaurantId;
      
      const orders = await storage.getOrders(targetRestaurantId, limit);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Create order
  app.post('/api/orders', async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Update order status (Staff and above)
  app.patch('/api/orders/:orderId', 
    authenticateToken, 
    requirePermission('orders_view'),
    async (req, res) => {
      try {
        const { orderId } = req.params;
        const updates = req.body;
        
        const order = await storage.updateOrder(orderId, updates);
        res.json(order);
      } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
      }
    }
  );

  // ===== ANALYTICS ROUTES =====
  
  // Get analytics (Restaurant admin and above)
  app.get('/api/restaurants/:restaurantId/analytics', 
    authenticateToken, 
    requirePermission('analytics_view'),
    requireRestaurantAccess,
    async (req, res) => {
      try {
        const { restaurantId } = req.params;
        const { startDate, endDate } = req.query;
        
        const analytics = await storage.getAnalytics(
          restaurantId,
          startDate ? new Date(startDate as string) : undefined,
          endDate ? new Date(endDate as string) : undefined
        );
        
        res.json(analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
      }
    }
  );

  // Health check
  app.get('/api/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.json({ 
      status: 'ok', 
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}