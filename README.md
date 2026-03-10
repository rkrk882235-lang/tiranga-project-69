# Tiranga E-Commerce User Panel

A comprehensive user account management panel for an Amazon/Flipkart-style e-commerce marketplace, built with React, TypeScript, Vite, and Supabase.

## Features Implemented

### Core Infrastructure
- ✅ **Complete Database Schema** with 15+ tables covering all user-facing operations
- ✅ **Row Level Security (RLS)** on all tables with restrictive policies
- ✅ **Authentication System** with email/password (passkey-ready architecture)
- ✅ **Responsive Navigation** with desktop sidebar and mobile bottom navigation
- ✅ **Reusable UI Components** (Cards, Buttons, Inputs, Status Chips, Timeline)

### User-Facing Features

#### Account Home Dashboard
- Recent orders display with status tracking
- Open returns and refunds overview
- Unread notifications preview
- Quick links to key account sections
- Security reminders for unverified accounts

#### Orders Management
- Complete order history with search and filtering
- Status tracking (Pending → Confirmed → Shipped → Delivered)
- Order details view with item breakdown
- Cancel and return eligibility indicators

#### Address Book
- Add, edit, and delete delivery addresses
- International address format support
- Default shipping address management
- Delivery instructions field

#### Authentication
- Secure sign-in and sign-up flows
- Password requirements per NIST guidelines (≥8 characters)
- Email verification status tracking

## Database Schema

Complete schema with 15+ tables including:
- User profiles, credentials, sessions, and WebAuthn passkeys
- Orders, items, shipments, and status history
- Returns, refunds, and reviews
- Addresses, payment methods, and refund instruments
- Notifications, messages, wishlists, and saved items

All tables have RLS policies ensuring users can only access their own data.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Styling**: Responsive inline CSS

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Database migrations are already applied to your Supabase project

4. Build the project:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Navigation, Layout
│   └── ui/              # Reusable components
├── contexts/            # Auth context
├── lib/                 # Supabase client and types
├── pages/               # All page components
├── App.tsx              # Main app with routing
└── index.css            # Global styles
```

## Security Features

- Row Level Security on all database tables
- CSRF-safe authentication patterns
- Secure session management
- Password hashing via Supabase Auth
- Input validation and WCAG-compliant error handling
- Ready for passkey implementation (WebAuthn schema in place)

## Performance

- Bundle size: 372KB JS (106KB gzipped)
- Optimized database queries with indexes
- Efficient component loading

## Next Steps

Placeholder pages are ready for implementation:
- Returns & Refunds workflow
- Payment Methods management
- Wishlist & Saved Items
- Reviews & Ratings
- Notifications Center
- Messages & Support
- Account Settings

All features have complete database schemas, RLS policies, and specifications ready.
