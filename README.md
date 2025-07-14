# Restaurant Ordering System

A comprehensive digital restaurant ordering system built with React, TypeScript, and Shadcn/UI. This system provides a seamless ordering experience with QR code support, customizable menu items, real-time order tracking, and flexible payment options.

## 🚀 Features

### Core Functionality
- **Digital Menu Browsing** - Interactive menu with categories, search, and filtering
- **Customizable Orders** - Full customization support for menu items with pricing calculations
- **Shopping Cart** - Persistent cart with item management and order summary
- **Order Processing** - Complete order lifecycle from placement to delivery
- **Payment Integration** - Multiple payment methods with tip calculation and split payment support
- **Real-time Updates** - Order status tracking and notifications

### Menu Management
- **Categories** - Organized menu with appetizers, mains, desserts, beverages, etc.
- **Dietary Filters** - Vegetarian, vegan, gluten-free, allergen information
- **Nutritional Info** - Detailed nutritional information for each item
- **Availability Tracking** - Real-time inventory management
- **Dynamic Pricing** - Time-based and demand-based pricing adjustments

### Order Customization
- **Multiple Customization Types**:
  - Size selection (Small, Medium, Large, etc.)
  - Add-ons and extras
  - Preparation preferences (cooking level, crust type, etc.)
  - Ingredient substitutions and removals
- **Special Instructions** - Custom notes for each item
- **Pricing Calculator** - Real-time price updates with customizations

### Customer Experience
- **Multi-Channel Support** - QR code, tablet, and mobile app ordering
- **Table Service** - Table number assignment for dine-in orders
- **Order Types** - Dine-in, takeout, and delivery options
- **Order History** - Track previous orders and reorder favorites
- **Estimated Wait Times** - Real-time preparation time calculations

### Payment & Checkout
- **Multiple Payment Methods** - Credit/debit cards, mobile wallets, cash
- **Flexible Tipping** - Preset percentages or custom tip amounts
- **Split Payments** - Support for multiple payment methods per order
- **Order Confirmation** - Detailed receipts and order summaries

## 🛠 Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Components**: Shadcn/UI with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React hooks with local storage persistence
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: Sonner toast library
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── MenuCard.tsx     # Individual menu item display
│   ├── MenuBrowser.tsx  # Main menu browsing interface
│   ├── MenuFilters.tsx  # Filtering and search functionality
│   ├── ItemDetailModal.tsx # Detailed item view with customizations
│   ├── CartSidebar.tsx  # Shopping cart interface
│   ├── CheckoutModal.tsx # Order checkout process
│   └── OrderSummary.tsx # Order confirmation and tracking
├── hooks/               # Custom React hooks
│   ├── useCart.ts      # Cart management
│   └── useMenu.ts      # Menu data and operations
├── services/           # Business logic and data services
│   ├── menuService.ts  # Menu data management
│   ├── cartService.ts  # Shopping cart operations
│   ├── orderService.ts # Order processing and management
│   └── pricingService.ts # Price calculations and promotions
├── types/              # TypeScript type definitions
│   └── index.ts        # All application types
└── pages/              # Page components
    ├── Index.tsx       # Main application page
    └── NotFound.tsx    # 404 error page
```

## 🎯 Key Features Implementation

### Menu System
The menu system supports comprehensive item management with:
- Dynamic category filtering
- Advanced search functionality
- Dietary restriction filtering
- Real-time availability updates
- Nutritional information display

### Customization Engine
Robust customization system supporting:
- Required and optional customizations
- Single-select (radio) and multi-select (checkbox) options
- Price modifiers for each option
- Validation for required selections
- Custom special instructions

### Cart Management
Intelligent cart system featuring:
- Item deduplication with similar configurations
- Quantity management
- Price recalculation on changes
- Persistent storage across sessions
- Estimated preparation time calculation

### Order Processing
Complete order lifecycle management:
- Order creation and validation
- Payment processing simulation
- Status tracking (pending → confirmed → preparing → ready → delivered)
- Real-time notifications
- Order history and tracking

### Pricing System
Sophisticated pricing engine with:
- Base price calculation
- Customization price modifiers
- Tax calculation (8.75% default)
- Tip calculation (percentage or custom amount)
- Promotional discount support
- Dynamic pricing based on time and demand

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant_ordering_system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm run dev
   ```

4. **Build for production**
   ```bash
   pnpm run build
   ```

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first responsive layout
- Touch-friendly interface for tablet ordering
- Optimized for various screen sizes

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

### Visual Design
- Modern, clean interface
- Consistent color scheme and typography
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications for user feedback

## 📊 Data Models

### Menu Item
```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  basePrice: number;
  available: boolean;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
  nutritionalInfo?: NutritionalInfo;
  customizations: Customization[];
  dietaryTags: DietaryRestrictions;
}
```

### Order
```typescript
interface Order {
  id: string;
  tableNumber?: number;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  estimatedPrepTime: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Configuration

### Environment Variables
The application uses localStorage for data persistence in demo mode. For production deployment, you would configure:

- Database connection strings
- Payment gateway API keys
- Restaurant-specific settings
- Menu management system integration

### Customization Options
- Tax rates and calculation methods
- Tip percentage presets
- Menu categories and organization
- Pricing rules and promotions
- Order workflow customization

## 🚀 Deployment

The application is built as a static single-page application and can be deployed to:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Traditional web servers

### Production Considerations
- Implement proper backend API
- Set up database (PostgreSQL/MySQL recommended)
- Configure payment gateway integration
- Set up real-time notifications (WebSocket/Server-Sent Events)
- Implement user authentication and authorization
- Add order management dashboard for restaurant staff
- Set up monitoring and analytics

## 🔮 Future Enhancements

### Technical Improvements
- Progressive Web App (PWA) support
- Offline functionality
- Real-time order synchronization
- Advanced caching strategies
- Performance optimizations

### Business Features
- Loyalty program integration
- Advanced promotional systems
- Multi-location support
- Staff management interface
- Advanced analytics and reporting
- Integration with POS systems
- Social media integration

### Customer Experience
- Voice ordering support
- AR menu visualization
- Personalized recommendations
- Group ordering functionality
- Advanced dietary preference management

## 📝 License

This project is part of the MGX platform demonstration and is available for educational and evaluation purposes.

## 🤝 Contributing

This is a demonstration project showcasing the capabilities of the MGX platform for rapid application development. The codebase serves as an example of best practices in modern web application development.

---

Built with ❤️ using the MGX Platform - Transforming ideas into production-ready applications.