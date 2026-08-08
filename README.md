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
- **Date Picker**: @react-native-community/datetimepicker

## 🏗 Architecture

### Project Structure

```
pocos/
├── src/
│   ├── assets/             # Images, icons, and assets
│   ├── components/
│   │   └── ui/            # Reusable UI components (Button, Input, Card, etc.)
│   ├── config/            # Configuration files (Supabase, LiveView)
│   ├── constants/         # Design system constants (colors, typography, etc.)
│   ├── hooks/             # Custom React hooks (useCoops, usePoultry, useLiveView)
│   ├── navigation/
│   │   ├── stacks/        # Feature-specific stack navigators
│   │   ├── AdminNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MarketplaceNavigator.tsx
│   │   ├── RanchNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── providers/         # React context providers
│   ├── screens/
│   │   ├── admin/         # Admin dashboard screens
│   │   ├── auth/          # Authentication screens
│   │   ├── chat/          # Chat/messaging screens
│   │   ├── coops/         # Coop/timeline screens
│   │   ├── herd/          # Livestock/herd management screens
│   │   ├── home/          # Home dashboard screens
│   │   ├── marketplace/   # Marketplace/buyer screens
│   │   ├── profile/       # User profile screens
│   │   ├── store/         # Ranch store management screens
│   │   └── tasks/         # Task management screens
│   ├── services/          # Business logic services
│   │   ├── liveViewService.ts
│   │   ├── poultryService.ts
│   │   ├── imageUpload.ts
│   │   ├── notificationService.ts
│   │   ├── reportService.ts
│   │   └── storage.ts
│   ├── store/             # Zustand state management stores
│   │   ├── authStore.ts
│   │   ├── poultryStore.ts
│   │   ├── liveViewStore.ts
│   │   ├── chatStore.ts
│   │   ├── taskStore.ts
│   │   ├── marketplaceStore.ts
│   │   ├── livestockStore.ts
│   │   ├── profileStore.ts
│   │   ├── analyticsStore.ts
│   │   ├── activityLogStore.ts
│   │   ├── discountStore.ts
│   │   ├── jetsonStore.ts
│   │   └── uiStore.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── common.ts
│   │   ├── coop.ts
│   │   ├── livestock.ts
│   │   ├── poultry.ts
│   │   ├── marketplace.ts
│   │   ├── tasks.ts
│   │   ├── chat.ts
│   │   └── analytics.ts
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root app component
│   ├── global.css         # Global styles
│   └── index.ts           # App entry point
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind/NativeWind config
├── app.json               # Expo configuration
├── eas.json               # EAS build configuration
└── SUPABASE_JETSON_INTEGRATION.sql  # Database migration for Jetson integration
```

## 🗄 Database Schema & ID Connections

### Core Tables and Relationships

#### 1. **auth.users** (Supabase Auth)
- `id` (UUID) - Primary key, user authentication ID
- `email` (TEXT) - User email
- Connected to `ranch_users.auth_id` via foreign key

#### 2. **ranch** Table
- `id` (UUID) - Primary key, ranch identifier
- `name` (TEXT) - Ranch name
- `code` (TEXT) - Unique ranch code (e.g., "RANCH-ABC123XYZ")
- `location` (TEXT) - Ranch location
- `description` (TEXT) - Ranch description
- `logo_url` (TEXT) - Ranch logo image URL
- `cover_url` (TEXT) - Ranch cover image URL
- `contact_email` (TEXT) - Contact email
- `contact_phone` (TEXT) - Contact phone
- `website` (TEXT) - Ranch website
- `notes` (TEXT) - Additional notes
- `currency` (TEXT) - Ranch currency
- `owner_id` (UUID) - References `ranch_users.id`
- `settings` (JSONB) - Ranch settings (biometric, PIN, session timeout, etc.)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Relationships:**
- One-to-many with `ranch_users` (via `owner_id`)
- One-to-many with `profiles` (via `ranch_id`)

#### 3. **ranch_users** Table
- `id` (UUID) - Primary key, user profile ID
- `auth_id` (UUID) - References `auth.users.id`
- `ranch_id` (UUID) - References `ranch.id`
- `name` (TEXT) - User display name
- `email` (TEXT) - User email
- `role` (TEXT) - User role: 'super_admin', 'ranch_owner', 'staff', 'store_manager', 'buyer'
- `access_code` (TEXT) - Access code for staff login (e.g., "STAFF-ABC123")
- `pin` (TEXT) - Optional PIN for biometric fallback
- `is_active` (BOOLEAN) - User active status
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Relationships:**
- Many-to-one with `auth.users` (via `auth_id`)
- Many-to-one with `ranch` (via `ranch_id`)
- One-to-many with `profiles` (as owner/manager)

#### 4. **profiles** Table (Livestock Profiles/Coops)
- `id` (UUID) - Primary key, profile/coop identifier
- `ranch_id` (UUID) - References `ranch.id`
- `name` (TEXT) - Profile/coop name
- `animal_type` (TEXT) - Animal type: 'cattle', 'sheep', 'goat', 'horse', 'donkey', 'bird'
- `device_address` (TEXT) - References `assets.asset_id` (for Jetson Nano integration)
- `custom_fields` (JSONB) - Custom profile fields
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Relationships:**
- Many-to-one with `ranch` (via `ranch_id`)
- One-to-one with `assets` (via `device_address`)
- One-to-many with `animals` (via `profile_id`)

#### 5. **assets** Table (Jetson Nano Devices)
- `asset_id` (TEXT, PRIMARY KEY) - Device address (e.g., "989347d6c29e5e8b")
- `owner_user_id` (UUID) - References `auth.users.id`
- `status` (TEXT) - Device status: 'active', 'inactive'
- `last_seen_at` (TIMESTAMP) - Last device heartbeat
- `pending_test_snapshot` (BOOLEAN) - Flag for test snapshot request
- `unsynced_detections` (INTEGER) - Count of unsynced bird detections
- `unsynced_daily_counts` (INTEGER) - Count of unsynced daily counts
- `pending_images_on_disk` (INTEGER) - Count of pending images on device
- `device_secret_hash` (TEXT) - Hash of device secret for authentication
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Relationships:**
- Many-to-one with `auth.users` (via `owner_user_id`)
- One-to-one with `profiles` (via `device_address`)
- One-to-many with `bird_detections` (via `asset_id`)
- One-to-many with `device_test_snapshots` (via `asset_id`)

**Hardcoded Device:**
- Jetson Nano device address: `989347d6c29e5e8b`
- Device secret: `xwguiyFjxzKfEXLs9MYPVdgIh4GDCqw3NK-6VrHpaXQ`

#### 6. **bird_detections** Table
- `id` (UUID, PRIMARY KEY) - Detection record ID
- `asset_id` (TEXT) - References `assets.asset_id`
- `detected_at` (TIMESTAMP) - Detection timestamp
- `image_url` (TEXT) - Image URL in Supabase Storage
- `confidence` (NUMERIC) - Detection confidence score (0-100)
- `track_id` (TEXT) - Tracking ID for individual birds
- `count` (INTEGER) - Bird count in this detection
- `interval_count` (INTEGER) - 15-minute interval count
- `created_at` (TIMESTAMP)

**Relationships:**
- Many-to-one with `assets` (via `asset_id`)

**Storage Path:**
- Images stored in `poultry-images` bucket
- Path format: `poultry-images/{device_address}_detection_{timestamp}.jpg`
- Example: `poultry-images/989347d6c29e5e8b_detection_20260806_105946_940045.jpg`

#### 7. **device_test_snapshots** Table
- `id` (UUID, PRIMARY KEY) - Snapshot record ID
- `asset_id` (TEXT) - References `assets.asset_id`
- `image_url` (TEXT) - Snapshot image URL
- `captured_at` (TIMESTAMP) - Capture timestamp
- `cpu_temp_c` (NUMERIC) - CPU temperature in Celsius
- `uptime_seconds` (BIGINT) - Device uptime in seconds
- `fps` (NUMERIC) - Frames per second
- `created_at` (TIMESTAMP)

**Relationships:**
- Many-to-one with `assets` (via `asset_id`)

#### 8. **animals** Table
- `id` (UUID) - Primary key
- `animal_id` (TEXT) - External animal ID
- `tag_number` (TEXT) - Physical tag number
- `internal_code` (TEXT) - Internal ranch code
- `breed` (TEXT) - Animal breed
- `gender` (TEXT) - 'male', 'female'
- `age` (INTEGER) - Age in years
- `weight` (NUMERIC) - Weight in kg
- `color` (TEXT) - Animal color
- `date_of_birth` (DATE) - Birth date
- `date_purchased` (DATE) - Purchase date
- `origin_ranch` (TEXT) - Origin ranch
- `current_ranch` (TEXT) - Current ranch
- `ranch_id` (UUID) - References `ranch.id`
- `profile_id` (UUID) - References `profiles.id`
- `animal_type` (TEXT) - Animal type
- `photos` (JSONB) - Array of photo URLs
- `image_url` (TEXT) - Primary image URL
- `tags` (JSONB) - Array of tags
- `notes` (TEXT) - Notes
- `health_status` (TEXT) - 'healthy', 'sick', 'recovering', 'quarantined', 'deceased', 'pregnant', 'lactating', 'dry'
- `mother_id` (UUID) - References `animals.id` (self-referential)
- `father_id` (UUID) - References `animals.id` (self-referential)
- `offspring_ids` (JSONB) - Array of offspring IDs
- `ownership_history` (JSONB) - Ownership records
- `lifecycle_logs` (JSONB) - Lifecycle event logs
- `feeding_plan` (JSONB) - Feeding plan details
- `medication_records` (JSONB) - Medication records
- `pregnancy_records` (JSONB) - Pregnancy records
- `nursing_records` (JSONB) - Nursing records
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Relationships:**
- Many-to-one with `ranch` (via `ranch_id`)
- Many-to-one with `profiles` (via `profile_id`)
- Self-referential for parent-child relationships (mother_id, father_id)

#### 9. **tasks** Table
- `id` (UUID) - Primary key
- `title` (TEXT) - Task title
- `description` (TEXT) - Task description
- `status` (TEXT) - 'pending', 'in_progress', 'completed', 'cancelled', 'blocked'
- `priority` (TEXT) - 'low', 'medium', 'high', 'urgent'
- `recurrence` (TEXT) - 'none', 'daily', 'weekly', 'monthly', 'custom'
- `assigned_to` (UUID) - References `ranch_users.id`
- `created_by` (UUID) - References `ranch_users.id`
- `ranch_id` (UUID) - References `ranch.id`
- `due_date` (TIMESTAMP) - Due date
- `completed_at` (TIMESTAMP) - Completion timestamp
- `attachments` (JSONB) - Array of attachment URLs
- `comments` (JSONB) - Array of comments
- `subtasks` (JSONB) - Array of subtasks
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Relationships:**
- Many-to-one with `ranch_users` (via `assigned_to`, `created_by`)
- Many-to-one with `ranch` (via `ranch_id`)

#### 10. **chat_channels** Table
- `id` (UUID) - Primary key
- `name` (TEXT) - Channel name
- `type` (TEXT) - 'group', 'direct', 'announcement'
- `ranch_id` (UUID) - References `ranch.id`
- `created_by` (UUID) - References `ranch_users.id`
- `members` (JSONB) - Array of member user IDs
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Relationships:**
- Many-to-one with `ranch` (via `ranch_id`)
- Many-to-one with `ranch_users` (via `created_by`)

#### 11. **chat_messages** Table
- `id` (UUID) - Primary key
- `channel_id` (UUID) - References `chat_channels.id`
- `sender_id` (UUID) - References `ranch_users.id`
- `content` (TEXT) - Message content
- `attachments` (JSONB) - Array of attachment URLs
- `read_by` (JSONB) - Array of user IDs who read the message
- `created_at` (TIMESTAMP)

**Relationships:**
- Many-to-one with `chat_channels` (via `channel_id`)
- Many-to-one with `ranch_users` (via `sender_id`)

### Supabase Storage Buckets

#### **poultry-images** Bucket
- **Public**: `true` (required for image access)
- **Purpose**: Store bird detection images and live view frames
- **File Naming Convention**:
  - Detections: `{device_address}_detection_{timestamp}.jpg`
  - Live View: `live_view_{device_address}.jpg`
  - Example: `989347d6c29e5e8b_detection_20260806_105946_940045.jpg`
  - Example: `live_view_989347d6c29e5e8b.jpg`

### RPC Functions

#### **request_live_view(p_asset_id TEXT)**
- **Purpose**: Request a live view lease for a device
- **Parameters**: 
  - `p_asset_id` (TEXT) - Device asset ID
- **Returns**: BOOLEAN - Success status
- **Usage**: Called by `liveViewService` to start live streaming

#### **link_coop_device(p_coop_id TEXT, p_device_address TEXT)**
- **Purpose**: Link a device to a coop/profile
- **Parameters**:
  - `p_coop_id` (TEXT) - Profile/coop ID
  - `p_device_address` (TEXT) - Device asset ID
- **Returns**: BOOLEAN - Success status
- **Logic**:
  1. Verifies coop belongs to current user
  2. Checks device ownership
  3. Updates device owner if unclaimed or already owned by user
  4. Updates coop's device_address
  5. Returns FALSE if device owned by someone else

#### **request_test_snapshot(p_asset_id TEXT)**
- **Purpose**: Request a test snapshot from device
- **Parameters**:
  - `p_asset_id` (TEXT) - Device asset ID
- **Returns**: BOOLEAN - Success status
- **Logic**: Sets `pending_test_snapshot` to TRUE for the asset

## 🔐 Authentication Flow

### User Roles
- **super_admin**: Ranch owner with full access
- **ranch_owner**: Ranch owner with full access
- **staff**: Ranch staff with limited access
- **store_manager**: Store management access
- **buyer**: Marketplace buyer access

### Authentication Methods

#### 1. Ranch Owner Login (Email + Password)
```typescript
loginAsOwner(email: string, password?: string)
```
- Signs in with Supabase Auth
- Fetches user profile from `ranch_users` via `auth_id`
- Fetches ranch data from `ranch` table
- Sets session in Zustand store

**ID Flow:**
```
auth.users.id → ranch_users.auth_id → ranch_users.ranch_id → ranch.id
```

#### 2. Staff Login (Name + Access Code)
```typescript
loginAsRanch(name: string, accessCode: string)
```
- Queries `ranch_users` by name and access_code
- Fetches ranch data via `ranch_id`
- Sets session in Zustand store

**ID Flow:**
```
ranch_users.name + ranch_users.access_code → ranch_users.id → ranch_users.ranch_id → ranch.id
```

#### 3. Buyer Login (Email + Name)
```typescript
loginAsConsumer(email: string, name: string)
```
- Checks if buyer exists in `ranch_users` with role 'buyer'
- Creates new buyer profile if not exists
- Sets session with `ranch: null`

#### 4. Ranch Owner Signup
```typescript
signupAsRanchOwner(data: { name, email, password, ranchName, ranchLocation })
```
- Creates Supabase Auth user
- Generates unique ranch code
- Creates ranch record in `ranch` table
- Creates owner profile in `ranch_users` with `auth_id` and `ranch_id`
- Updates `ranch.owner_id` with user profile ID

**ID Flow:**
```
auth.users.id → ranch_users.auth_id
ranch.id → ranch_users.ranch_id
ranch_users.id → ranch.owner_id
```

### Session Persistence
- Supabase Auth handles token refresh automatically
- AsyncStorage persists session locally
- `restoreSession()` function recovers session on app launch

## 🧭 Navigation Structure

### Root Navigator
Routes based on authentication and role:
- **Not Authenticated** → `AuthNavigator`
- **Authenticated + Buyer Role** → `MarketplaceNavigator`
- **Authenticated + Ranch Role** → `RanchNavigator` + `AdminNavigator` (modal)

### Auth Navigator
- `WelcomeScreen` - Welcome/intro
- `RanchOwnerLoginScreen` - Ranch owner login
- `RanchOwnerSignUpScreen` - Ranch owner signup
- `RanchLoginScreen` - Staff login
- `ConsumerSignInScreen` - Buyer login
- `ConsumerSignUpScreen` - Buyer signup

### Ranch Navigator (Bottom Tabs)
- **HomeStack** - Dashboard and staff activity
- **HerdStack** - Livestock management
- **TasksStack** - Task management (with badge for unread)
- **ChatStack** - Internal chat (with badge for unread)
- **StoreStack** - Ranch store (only for super_admin, store_manager, ranch_owner)

### Home Stack
- `HomeScreen` - Main dashboard
- `StaffActivityMonitorScreen` - Staff activity monitoring

### Herd Stack
- `HerdScreen` - Herd list
- `AnimalDetailScreen` - Animal details
- `AddAnimalScreen` - Add new animal
- `AncestryTreeScreen` - Family tree
- `ProfileDetailScreen` - Profile details
- `BirdCountScreen` - Bird count display (real-time)
- `BirdCountHistoryScreen` - Bird count history
- `AddBirdProfileScreen` - Add bird profile
- `BirdProfileDetailScreen` - Bird profile details
- `CreateProfileScreen` - Create animal profile
- `SelectAnimalTypeScreen` - Select animal type

### Tasks Stack
- Task management screens with subtasks, comments, attachments

### Chat Stack
- `ChatHomeScreen` - Channel list
- `ConversationScreen` - Chat messages

### Store Stack
- Ranch store management screens

### Admin Navigator (Modal)
- `AdminPanelHomeScreen` - Admin dashboard
- `AnalyticsScreen` - Analytics and reports
- `DeviceHealthCheckScreen` - Jetson device health monitoring
- `ManageRanchProfileScreen` - Ranch profile management
- `ManageTeamScreen` - Team management
- `OnboardStaffScreen` - Staff onboarding
- `StaffActivityScreen` - Staff activity

### Marketplace Navigator
- Buyer-facing marketplace screens

## 🗃 State Management (Zustand Stores)

### authStore
**State:**
- `isAuthenticated` (boolean)
- `userRole` (UserRole | null)
- `user` (User | null)
- `ranch` (Ranch | null)
- `staff` (User[])
- `isLoading` (boolean)

**Actions:**
- `loginAsOwner(email, password)` - Owner login
- `loginAsRanch(name, accessCode)` - Staff login
- `loginAsConsumer(email, name)` - Buyer login
- `loginWithAccessToken(accessToken, refreshToken)` - Token-based login
- `signupAsConsumer(data)` - Buyer signup
- `signupAsRanchOwner(data)` - Owner signup
- `fetchStaff(ranchId)` - Fetch staff list
- `onboardStaff(name, role, accessCode)` - Add staff
- `updateStaff(staffId, updates)` - Update staff
- `deleteStaff(staffId)` - Delete staff (soft delete)
- `updateRanch(updates)` - Update ranch info
- `logout()` - Logout
- `restoreSession()` - Restore session from storage

### poultryStore
**State:**
- `liveStatus` (PoultryLiveStatus | null)
- `history` (BirdCount[])
- `isLoading` (boolean)
- `error` (string | null)

**Actions:**
- `setLiveStatus(status)` - Set live status
- `setHistory(history)` - Set history
- `addHistoryItem(item)` - Add history item (keeps last 100)
- `setLoading(loading)` - Set loading state
- `setError(error)` - Set error

### liveViewStore
**State:**
- `isWatching` (boolean)
- `frameUrl` (string | null)
- `lastUpdated` (Date | null)
- `isOffline` (boolean)
- `isLoading` (boolean)
- `error` (string | null)

**Actions:**
- `setIsWatching(watching)` - Set watching state
- `setFrameUrl(url)` - Set frame URL
- `setLastUpdated(date)` - Set last updated time
- `setIsOffline(offline)` - Set offline status
- `setLoading(loading)` - Set loading state
- `setError(error)` - Set error

### chatStore
**State:**
- `channels` (Channel[])
- `contacts` (User[])
- `totalUnreadCount` (number)
- `isLoading` (boolean)
- `error` (string | null)

**Actions:**
- `fetchChannels(ranchId, userId)` - Fetch channels
- `fetchContacts(ranchId)` - Fetch contacts
- `subscribeToAllChannels(ranchId, userId)` - Subscribe to channels
- `unsubscribeFromAllChannels()` - Unsubscribe from channels

### taskStore
**State:**
- `tasks` (Task[])
- `unreadTasksCount` (number)
- `isLoading` (boolean)
- `error` (string | null)

**Actions:**
- `fetchTasks(ranchId)` - Fetch tasks
- `subscribeToTasks(ranchId)` - Subscribe to tasks
- `unsubscribeFromTasks()` - Unsubscribe from tasks

### Other Stores
- `livestockStore` - Livestock data management
- `marketplaceStore` - Marketplace data
- `profileStore` - User profile data
- `analyticsStore` - Analytics data
- `activityLogStore` - Activity logs
- `discountStore` - Discount management
- `jetsonStore` - Jetson device data
- `uiStore` - UI state (modals, toasts, etc.)

## 🔧 Services

### liveViewService
**Purpose:** Manage live video streaming from Jetson Nano devices

**Methods:**
- `initialize()` - Start live view, request lease, setup polling and subscriptions
- `stop()` - Stop live view, cleanup intervals and subscriptions
- `refresh()` - Refresh live view

**Internal Logic:**
1. Calls `request_live_view` RPC with device asset ID
2. Starts frame polling (1 second interval) from Supabase Storage
3. Starts lease renewal (60 second interval)
4. Subscribes to `assets` table for device status updates
5. Fetches frames from `poultry-images/live_view_{device_address}.jpg`

**Hardcoded Values:**
- Device address: `989347d6c29e5e8b`
- Device secret: `xwguiyFjxzKfEXLs9MYPVdgIh4GDCqw3NK-6VrHpaXQ`

### poultryService
**Purpose:** Manage poultry counting data and real-time updates

**Methods:**
- `initialize()` - Fetch initial data and setup subscriptions
- `refresh()` - Refresh data
- `destroy()` - Cleanup subscriptions

**Internal Logic:**
1. Fetches live status from `poultry_live_status` table
2. Fetches history from `bird_counts` table (last 50 records)
3. Subscribes to `poultry_live_status` for real-time updates
4. Subscribes to `bird_counts` for new count inserts

### imageUploadService
**Purpose:** Handle image uploads to Supabase Storage

### notificationService
**Purpose:** Manage push notifications

### reportService
**Purpose:** Generate reports and analytics

### storageService
**Purpose:** Local storage operations

## 🪝 Custom Hooks

### useCoops(assetId, page)
**Purpose:** Fetch and manage coop timeline data

**Returns:**
- `detections` (BirdDetectionEvent[])
- `groupedEntries` (CoopTimelineEntry[])
- `currentIntervalCount` (number | null) - Latest 15-min count
- `isLoading` (boolean)
- `error` (string | null)
- `refresh()` - Refresh function

**Internal Logic:**
- Fetches from `bird_detections` table filtered by `asset_id`
- Groups detections by date
- Calculates current 15-minute interval count

### usePoultry()
**Purpose:** Initialize and manage poultry service

**Returns:**
- `liveStatus` (PoultryLiveStatus | null)
- `history` (BirdCount[])
- `isLoading` (boolean)
- `error` (string | null)
- `refresh()` - Refresh function

### useLiveView()
**Purpose:** Initialize and manage live view service

**Returns:**
- `start()` - Start live view
- `stop()` - Stop live view
- `refresh()` - Refresh live view

**Internal Logic:**
- Handles app state changes (background/foreground)
- Automatically stops live view when app goes to background

## 📱 Core Features

### 1. Livestock Management
- Digital identity for each animal (UUID-based)
- Complete lifecycle tracking
- Genetic ancestry & family tree (mother_id, father_id relationships)
- Health status monitoring
- Photo & tag management
- Profile-based organization (profiles table)

### 2. Breeding & Ancestry System
- Multi-generation family tree via self-referential animal relationships
- Bloodline mapping
- Offspring tracking (offspring_ids array)
- Breeding analytics

### 3. Task Management (Asana-like)
- Main tasks & subtasks
- Recurring tasks (daily, weekly, monthly, custom)
- Task history (permanent)
- Comments & attachments
- Priority management (low, medium, high, urgent)
- Real-time updates via Supabase Realtime

### 4. Internal Chat System
- Group channels
- Team communication
- Announcements
- Media support
- Real-time messaging via Supabase Realtime
- Unread message tracking

### 5. Marketplace Ecosystem
- Ranch storefronts
- Product listings
- Order management
- Buyer-seller communication
- Separate navigation flow for buyers

### 6. Staff Management
- Staff onboarding via access codes
- Role assignment (super_admin, ranch_owner, staff, store_manager)
- Activity monitoring
- Productivity analytics
- Soft delete for staff deactivation

### 7. Jetson Nano Integration
- Device health monitoring via `DeviceHealthCheckScreen`
- Live video streaming via `liveViewService`
- Bird detection tracking via `bird_detections` table
- Test snapshot requests via RPC functions
- Device linking to coops via `link_coop_device` RPC
- Real-time device status updates via Supabase Realtime

### 8. Coop Timeline
- Current 15-minute bird count display
- Historical detection images grouped by date
- Calendar date picker for viewing previous days
- Details toggle for showing/hiding history
- Image modal for viewing detection photos

### 9. Advanced Analytics
- Executive intelligence dashboard
- Weekly/Monthly/Quarterly/Yearly reports
- Historical data retention
- Staff activity monitoring

## 🎨 Design System

### Color Palette
- Background: #0D0D0D (charcoal ink)
- Primary Surface: #151515
- Secondary Surface: #1C1C1C
- Primary Accent: #B87333 (primary rust - burnt copper)
- Secondary Accent: #D4A373 (warm sand)
- Text Primary: #FFFFFF
- Text Secondary: #B0B0B0 (muted sienna)
- Soft Ash: #E8E0D4

### Typography
- **Playfair Display** - Headings (luxury feel)
- **DM Sans** - Body text
- **DM Mono** - Numbers and data

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Border Radius
- sm: 4px
- md: 8px
- lg: 16px
- full: 9999px

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Expo CLI
- Supabase account

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

# Run linting
npm run lint
```

### Environment Setup
Create a `.env` file in the project root:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
Run the Jetson integration migration:
```sql
-- Run SUPABASE_JETSON_INTEGRATION.sql in Supabase SQL Editor
-- This creates:
-- - assets table
-- - bird_detections table
-- - device_test_snapshots table
-- - RLS policies
-- - RPC functions (link_coop_device, request_test_snapshot, request_live_view)
```

### Linking Jetson Device
After running the migration, link the Jetson device to a coop:

```sql
-- 1. Get your user's auth_id from ranch_users
SELECT id, auth_id, name FROM ranch_users WHERE email = 'your_email@example.com';

-- 2. Get the coop/profile ID you want to link to
SELECT id, name FROM profiles WHERE ranch_id = 'your_ranch_id';

-- 3. Link the device using the RPC function
SELECT link_coop_device('coop_profile_id', '989347d6c29e5e8b');
```

### Storage Bucket Setup
Make the `poultry-images` bucket public:
```sql
UPDATE storage.buckets 
SET public = true 
WHERE name = 'poultry-images';
```

## 📦 Building APK with EAS

```bash
# Set EAS token
$env:EXPO_TOKEN="your_eas_token"

# Build Android APK
eas build --platform android --profile preview
```

The APK will be available at the provided Expo URL after build completion.

## 📊 Cloud-Native Architecture

- **Supabase Backend**: Managed PostgreSQL and Auth
- **Local Persistence**: AsyncStorage for fast session recovery
- **Image Storage**: Supabase Storage (poultry-images bucket)
- **Real-time Sync**: Automatic updates for team chat, tasks, and device status via Supabase Realtime
- **Row Level Security (RLS)**: Database-level security policies

## 📱 Platform Support

- **iOS**: iOS 13+
- **Android**: Android 6.0+ (API 24+)
- **Web**: Modern browsers (via Expo web)

## 🔒 Security

- Supabase Auth for user authentication
- Row Level Security (RLS) on all tables
- Device secret hash for Jetson authentication
- Access codes for staff login
- Session timeout configuration
- Biometric authentication support (configurable)

## 🏷 Brand

**Taglines:**
- Primary: "Built for modern ranch operations."
- Secondary: "Trace every animal. Manage every operation."

**App Name:** Animal
**Slug:** pocos-app
**Bundle ID:** com.pocos.app

## 📄 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a proprietary project. Contact the development team for access.
