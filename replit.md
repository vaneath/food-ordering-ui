# Restaurant Ordering System

## Overview
A production-ready restaurant ordering system with comprehensive authentication, role-based access control, and multi-vendor support. Successfully migrated from Lovable to Replit with full backend implementation.

## Current Features
- **Customer Ordering Interface**: Menu browsing, cart functionality, QR/tablet/mobile ordering
- **Authentication System**: JWT-based authentication with bcryptjs password hashing
- **Role-Based Access Control**: Super Admin, Restaurant Admin, Staff, Customer roles
- **Multi-Vendor Support**: Multiple restaurant locations with centralized management
- **Admin Dashboard**: Restaurant setup, menu/inventory management, analytics
- **Kitchen Display System**: Real-time order management for staff
- **Database Integration**: Supabase PostgreSQL with Drizzle ORM
- **Security Features**: Helmet, CORS, rate limiting, input validation

## Recent Changes
- 2025-07-29: Major backend overhaul with production-ready authentication
- Implemented comprehensive database schema with proper relationships
- Added JWT authentication system with role-based permissions
- Created Supabase database integration with graceful fallback
- Implemented secure API routes with proper middleware
- Added bcryptjs password hashing and security measures
- Created database seeding system with demo data
- Updated client-side authentication with TanStack Query integration
- Added production-grade security packages (helmet, cors, rate limiting)

## Project Architecture
- **Frontend**: React with TypeScript, wouter routing, shadcn/ui components
- **Backend**: Express.js with JWT authentication, role-based middleware
- **Database**: Supabase PostgreSQL with Drizzle ORM and migrations
- **Authentication**: JWT tokens with bcryptjs password hashing
- **Security**: Helmet, CORS, rate limiting, input validation
- **State Management**: TanStack Query for API state management
- **Build System**: Vite for development and production builds

## Demo Credentials
- **Super Admin**: admin@restaurant.com / password123
- **Restaurant Owner**: owner@bistro.com / password123  
- **Kitchen Staff**: staff@bistro.com / password123

## User Preferences
- Production-ready implementation over demo features
- JWT authentication with role-based access control
- Supabase database integration with proper relationships
- Security-first approach with proper middleware
- Using shadcn/ui component library with TypeScript