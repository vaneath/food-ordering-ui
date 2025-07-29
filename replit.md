# Restaurant Ordering System

## Overview
A comprehensive restaurant ordering system with customer ordering interface, admin dashboard, and multi-vendor support. Successfully migrated from Lovable to Replit.

## Current Features
- Customer ordering interface with menu browsing and cart functionality
- QR code, tablet, and mobile ordering channels
- Restaurant branding and menu display
- Shopping cart with customizations
- Responsive design with shadcn/ui components

## Recent Changes
- 2025-07-29: Migrated from Lovable to Replit
- Fixed routing to use wouter instead of react-router-dom
- Created query client setup for API calls
- Fixed TypeScript errors in components
- Application successfully running on port 5000
- Extended with admin dashboard, multi-vendor support, and authentication system
- Added role-based access control (Super Admin, Restaurant Admin, Staff)
- Created owner dashboard for multi-location management
- Implemented kitchen display system for order management
- Added restaurant management service with localStorage simulation

## Project Architecture
- Frontend: React with TypeScript, wouter for routing, shadcn/ui components
- Backend: Express.js with in-memory storage
- Build: Vite for development and production builds
- State: TanStack Query for API state management
- Storage: Local storage for cart persistence, in-memory for menu data

## User Preferences
- Using shadcn/ui component library
- Wouter for client-side routing
- TypeScript for type safety
- Responsive design approach