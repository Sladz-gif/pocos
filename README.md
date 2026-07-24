# POCOS - Ranch Operations & Livestock Intelligence Platform

A premium, offline-first mobile application for modern ranch operations, livestock management, and marketplace ecosystem.

## 🎯 Product Vision

POCOS **IS**:
- A luxury ranch operations platform
- A livestock intelligence ecosystem
- A poultry/cattle ancestry engine
- A ranch collaboration workspace
- A commerce + operational platform
- A long-term livestock intelligence archive

## 🛠 Tech Stack

- **Framework**: React Native + Expo SDK 52
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Local Persistence**: AsyncStorage (for session)
- **Forms**: React Hook Form + Zod validation
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Animations**: React Native Reanimated + Gesture Handler
- **Lists**: FlashList (optimized flat list)
- **Date Utilities**: date-fns
- **ID Generation**: uuid

## 🏗 Architecture

### Project Structure

```
pocos/
├── src/
│   ├── assets/             # Images, icons, and assets
│   ├── components/
│   │   └── ui/            # Reusable UI components (Button, Input, Card, etc.)
│   ├── config/            # Configuration files (Supabase)
│   ├── constants/         # Design system constants (colors, typography, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── navigation/
│   │   ├── stacks/        # Feature-specific stack navigators
│   │   └── *.tsx          # Root and tab navigators
│   ├── providers/         # React context providers
│   ├── screens/
│   │   ├── admin/         # Admin dashboard screens
│   │   ├── auth/          # Authentication screens
│   │   ├── chat/          # Chat/messaging screens
│   │   ├── herd/          # Livestock/herd management screens
│   │   ├── home/          # Home dashboard screens
│   │   ├── marketplace/   # Marketplace/buyer screens
│   │   ├── profile/       # User profile screens
│   │   ├── store/         # Ranch store management screens
│   │   └── tasks/         # Task management screens
│   ├── services/          # Business logic services
│   ├── store/             # Zustand state management stores
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root app component
│   ├── global.css         # Global styles
│   └── index.ts           # App entry point
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind/NativeWind config
└── SUPABASE_*.sql         # Database migration files
```

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

### 3. Task Management (Asana-like)
- Main tasks & subtasks
- Recurring tasks
- Task history (permanent)
- Comments & attachments
- Priority management

### 4. Internal Chat System
- Group channels
- Team communication
- Announcements
- Media support

### 5. Marketplace Ecosystem
- Ranch storefronts
- Product listings
- Order management
- Buyer-seller communication

### 6. Staff Management
- Staff onboarding
- Role assignment
- Activity monitoring
- Productivity analytics

### 7. Advanced Analytics
- Executive intelligence dashboard
- Weekly/Monthly/Quarterly/Yearly reports
- Historical data retention

## 🎨 Design System

### Color Palette
- Background: #0D0D0D
- Primary Surface: #151515
- Secondary Surface: #1C1C1C
- Primary Accent: #B87333 (burnt copper)
- Secondary Accent: #D4A373 (warm sand)
- Text Primary: #FFFFFF
- Text Secondary: #B0B0B0

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Expo CLI

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web
```

### Environment Setup
Create a `.env` file in the project root:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Cloud-Native Architecture

- **Supabase Backend**: Managed PostgreSQL and Auth
- **Local Persistence**: AsyncStorage for fast session recovery
- **Image Storage**: Supabase Storage
- **Real-time Sync**: Automatic updates for team chat and operational tasks

## 📱 Platform Support

- **iOS**: iOS 13+
- **Android**: Android 6.0+
- **Web**: Modern browsers (via Expo web)

## 🏷 Brand

**Taglines:**
- Primary: "Built for modern ranch operations."
- Secondary: "Trace every animal. Manage every operation."

## 📄 License

Proprietary - All rights reserved
