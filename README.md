# POCOS - Ranch Operations & Livestock Intelligence Platform

A premium, offline-first mobile application for modern ranch operations, livestock management, and marketplace ecosystem.

## 🎯 Product Vision

POCOS is **NOT**:
- A generic farm app
- A green-and-white agriculture dashboard
- A student CRUD application
- A livestock spreadsheet

POCOS **IS**:
- A luxury ranch operations platform
- A livestock intelligence ecosystem
- A cattle ancestry engine
- A ranch collaboration workspace
- A commerce + operational platform
- A long-term livestock intelligence archive

## 🎨 Design Philosophy

The application feels:
- Calm
- Premium
- Intelligent
- Operational
- Structured
- Elegant
- Trustworthy
- Modern

Inspired by: Linear, Notion, Asana Mobile, Ramp, Premium ERP systems

## 🛠 Tech Stack

- **Framework**: React Native + Expo SDK 55
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Navigation**: Expo Router (File-based routing)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Local Persistence**: AsyncStorage (for session)
- **Forms**: React Hook Form + Zod validation
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Animations**: React Native Reanimated + Gesture Handler
- **Lists**: FlashList (optimized flat list)
- **Notifications**: Expo Notifications
- **File System**: Expo FileSystem + Expo Image
- **Date Utilities**: date-fns
- **ID Generation**: uuid

## 🏗 Architecture

### Feature-First Structure

```
pocos/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   ├── (operations)/      # Operations ecosystem tabs
│   ├── (marketplace)/     # Marketplace ecosystem tabs
│   └── (tabs)/           # Main tab navigation
├── features/             # Feature modules
│   ├── auth/
│   ├── livestock/
│   ├── breeding/
│   ├── medication/
│   ├── feeding/
│   ├── tasks/
│   ├── chat/
│   ├── marketplace/
│   ├── staff/
│   ├── analytics/
│   ├── reports/
│   └── settings/
├── components/           # Reusable UI components
│   ├── ui/
│   ├── layout/
│   └── forms/
├── hooks/               # Custom React hooks
├── services/            # Business logic services
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── repositories/       # Data access layer (offline-first)
├── constants/          # Design system constants
├── utils/              # Utility functions
└── offline/            # Offline-first infrastructure
```

## 🔐 Authentication System

### Supabase Architecture

POCOS uses **Supabase Auth** integrated with custom user profiles:

1. **Ranch Creation** - Super Admin registers a ranch and owner account.
2. **Access Codes** - Staff members sign in via unique access codes mapped to their ranch.
3. **Session Persistence** - Sessions managed via AsyncStorage.
4. **Role-Based Access Control (RBAC)** - Granular permissions enforced via Supabase RLS policies and Zustand store logic.

### User Roles

- **Super Admin** - Full access to all features
- **Ranch Owner** - Manage ranch, livestock, staff, analytics
- **Staff** - Daily operations, task management, chat
- **Store Manager** - Manage storefront, products, orders
- **Buyer** - Browse marketplace, place orders

## 📱 Core Features

### 1. Livestock Management
- Digital identity for each animal
- Complete lifecycle tracking
- Genetic ancestry & family tree
- Health status monitoring
- Photo & tag management

### 2. Breeding & Ancestry System
- Multi-generation family tree
- Bloodline mapping
- Offspring tracking
- Breeding analytics

### 3. Medication Management
- Treatment history
- Dosage tracking
- Wear-off alerts
- Recovery monitoring

### 4. Feeding Management
- Feed schedules
- Nutrition plans
- Bulk assignment
- Feeding analytics

### 5. Task Management (Asana-like)
- Main tasks & subtasks
- Recurring tasks
- Task history (permanent)
- Comments & attachments
- Priority management

### 6. Internal Chat System
- Group channels
- Team communication
- Announcements
- Media support

### 7. Marketplace Ecosystem
- Ranch storefronts
- Product listings (cattle, meat, milk, feed)
- Order management
- Buyer-seller communication

### 8. Staff Management
- Staff onboarding
- Role assignment
- Activity monitoring
- Productivity analytics

### 9. Advanced Analytics
- Executive intelligence dashboard
- Weekly/Monthly/Quarterly/Yearly reports
- Downloadable reports (PDF, CSV, Excel)
- Historical data retention
- Multi-category analytics

## 🎨 Design System

### Color Palette

```typescript
Background: #0D0D0D
Primary Surface: #151515
Secondary Surface: #1C1C1C
Primary Accent: #B87333 (burnt copper)
Secondary Accent: #D4A373 (warm sand)
Text Primary: #FFFFFF
Text Secondary: #B0B0B0
```

### Typography

- **Headings**: Satoshi / Clash Display
- **Body**: Inter / Manrope
- **Numbers**: Inter (semi-bold, tight spacing)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

### Setup Notes

Due to network issues during initial setup, you may need to:

1. Run `npm install` to install all dependencies
2. The app is configured for offline-first operation
3. TypeScript errors will resolve once dependencies are installed

## 📊 Cloud-Native Architecture

The app is built for production reliability:

- **Supabase Backend**: Managed PostgreSQL and Auth.
- **Local Persistence**: AsyncStorage for fast session recovery.
- **Image Storage**: Supabase Storage with public URLs.
- **Real-time Sync**: Automatic updates for team chat and operational tasks.

## 🔒 Security

- Role-based permissions
- Local encryption for sensitive data
- Secure session management
- Activity logging
- Audit history

## 📱 Platform Support

- **iOS**: iOS 13+
- **Android**: Android 6.0+
- **Web**: Modern browsers (via Expo web)

## 🏷 Brand

**Taglines:**
- Primary: "Built for modern ranch operations."
- Secondary: "Trace every animal. Manage every operation."
- Alternative: "Operational intelligence for livestock ecosystems."

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

For support, contact the POCOS team.
