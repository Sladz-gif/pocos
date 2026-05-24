# POCOS - Complete Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Configuration](#configuration)
5. [Navigation Structure](#navigation-structure)
6. [Screens](#screens)
7. [Components](#components)
8. [State Management](#state-management)
9. [Data Models](#data-models)
10. [Services](#services)
11. [Utilities](#utilities)
12. [Constants & Theme](#constants--theme)
13. [Database Schema](#database-schema)
14. [Seeded Data](#seeded-data)

---

## Overview

**POCOS** (Pastoral Operations & Cattle Organization System) is a comprehensive ranch management application built with React Native and Expo. The app is designed to help ranch owners manage their livestock, tasks, staff, marketplace operations, and communications in a single unified platform.

### Key Features
- **Livestock Management**: Track animals, health records, medications, pregnancy records, and ancestry trees
- **Task Management**: Create, assign, and track ranch operations with subtasks and comments
- **Team Communication**: Real-time chat for staff coordination
- **Marketplace**: Sell products (meat, milk, live cattle) and manage orders
- **Staff Management**: Onboard staff with access codes and track activity
- **Analytics**: Generate reports on various ranch operations

### Target Users
- **Ranch Owners/Staff**: Full management capabilities
- **Consumers/Buyers**: Browse and purchase products from marketplace

---

## Tech Stack

### Core Framework
- **React Native**: 0.83.6
- **Expo**: ~55.0.25
- **Expo Router**: ~55.0.15 (File-based routing)
- **React**: 19.2.0

### State Management
- **Zustand**: ^5.0.2 (Global state management)

### Database
- **Supabase**: PostgreSQL database with real-time sync, Authentication, and Storage.
- **@react-native-async-storage/async-storage**: 2.2.0 (Local persistence for auth sessions)

### Navigation
- **@react-navigation/native**: ^7.2.4
- **@react-navigation/stack**: ^7.9.2
- **@react-navigation/bottom-tabs**: ^7.16.1

### UI & Styling
- **NativeWind**: ^4.1.2 (Tailwind CSS for React Native)
- **TailwindCSS**: ^3.4.17
- **@expo/vector-icons**: ^15.0.2
- **expo-font**: ~55.0.8
- **@expo-google-fonts/dm-sans**: ^0.4.2
- **@expo-google-fonts/playfair-display**: ^0.4.2

### Utilities
- **date-fns**: ^4.1.0 (Date manipulation)
- **uuid**: ^11.0.5 (Unique ID generation)
- **zod**: ^3.24.1 (Schema validation)
- **react-hook-form**: ^7.54.2 (Form management)
- **@hookform/resolvers**: ^3.10.0

### Other Dependencies
- **@tanstack/react-query**: ^5.62.7 (Data fetching)
- **@shopify/flash-list**: ^1.7.1 (Performant lists)
- **react-native-reanimated**: 4.2.1 (Animations)
- **react-native-gesture-handler**: ~2.30.0
- **react-native-safe-area-context**: ~5.6.2
- **react-native-screens**: ^4.25.1
- **react-native-mmkv**: ^2.12.2 (Fast key-value storage)

---

## Project Structure

```
pocos/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Index redirect
│   ├── (auth)/                  # Auth group
│   ├── (tabs)/                  # Tab group
│   ├── (operations)/            # Operations group
│   └── (marketplace)/           # Marketplace group
├── src/                         # Main source code
│   ├── App.tsx                  # Root component
│   ├── index.ts                 # Entry point
│   ├── assets/                  # Images, fonts, etc.
│   ├── components/              # Reusable components
│   │   ├── forms/               # Form components
│   │   ├── layout/              # Layout components
│   │   └── ui/                  # UI components
│   ├── constants/               # App constants
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radius.ts
│   │   └── shadows.ts
│   ├── hooks/                   # Custom React hooks
│   ├── mocks/                   # Mock data for testing
│   ├── navigation/              # Navigation configuration
│   │   ├── stacks/              # Stack navigators
│   │   └── types.ts             # Navigation types
│   ├── providers/               # Context providers
│   ├── screens/                 # Screen components
│   │   ├── admin/               # Admin screens
│   │   ├── auth/                # Authentication screens
│   │   ├── chat/                # Chat screens
│   │   ├── herd/                # Livestock screens
│   │   ├── home/                # Home screens
│   │   ├── marketplace/         # Marketplace screens
│   │   ├── store/               # Store management screens
│   │   └── tasks/               # Task management screens
│   ├── services/                # Business logic services
│   │   ├── authService.ts
│   │   ├── database.ts
│   │   ├── notificationService.ts
│   │   ├── reportService.ts
│   │   └── storage.ts
│   ├── store/                   # Zustand stores
│   │   ├── analyticsStore.ts
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   ├── livestockStore.ts
│   │   ├── marketplaceStore.ts
│   │   ├── taskStore.ts
│   │   └── uiStore.ts
│   ├── theme/                   # Theme configuration
│   ├── types/                   # TypeScript type definitions
│   │   ├── analytics.ts
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── common.ts
│   │   ├── livestock.ts
│   │   ├── marketplace.ts
│   │   └── tasks.ts
│   └── utils/                   # Utility functions
│       ├── date.ts
│       ├── index.ts
│       └── uuid.ts
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── babel.config.js              # Babel config
└── metro.config.js              # Metro bundler config
```

---

## Configuration

### app.json
Expo application configuration with:
- **App Name**: POCOS
- **Bundle ID**: com.pocos.app
- **Orientation**: Portrait
- **UI Style**: Dark
- **Plugins**: expo-image, expo-secure-store, expo-font, expo-router

### package.json Scripts
- `npm start` - Start development server (offline mode)
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web

---

## Navigation Structure

The app uses a nested navigation structure with multiple stacks and tab navigators.

### Root Navigation
```
RootStack
├── AuthStack (Login/Signup flows)
├── RanchApp (Main ranch app with tabs)
│   ├── HomeStack
│   ├── HerdStack
│   ├── TasksStack
│   ├── ChatStack
│   └── StoreStack
├── Marketplace (Consumer marketplace)
│   ├── BrowseStack
│   ├── Saved
│   ├── Orders
│   └── Profile
└── AdminModal (Admin panel as modal)
```

### Navigation Type Definitions

#### AuthStackParamList
- `Welcome` - Welcome/onboarding screen
- `RanchLogin` - Staff login with access code
- `RanchOwnerLogin` - Owner login with email/password
- `ConsumerSignUp` - Consumer registration
- `ConsumerSignIn` - Consumer login

#### RanchTabParamList (Main Tabs)
- `HomeStack` - Dashboard and activity monitoring
- `HerdStack` - Livestock management
- `TasksStack` - Task management
- `ChatStack` - Team communication
- `StoreStack` - Store management

#### HomeStackParamList
- `Home` - Main dashboard
- `StaffActivityMonitor` - Staff activity tracking
- `AdminPanel` - Admin panel (modal)

#### HerdStackParamList
- `Herd` - List of all animals
- `AnimalDetail` - Individual animal details (params: id)
- `AddAnimal` - Add new animal form
- `AncestryTree` - Animal ancestry visualization (params: id)

#### TasksStackParamList
- `TaskBoard` - Task list with filters
- `TaskDetail` - Task details with subtasks/comments (params: id)
- `CreateTask` - Create new task form
- `Notes` - Ranch notes
- `TaskHistory` - Historical task view with calendar filters

#### ChatStackParamList
- `ChatHome` - List of chat channels
- `Conversation` - Chat conversation (params: id)

#### StoreStackParamList
- `StoreManage` - Store listings management
- `StoreListingDetail` - Listing details (params: id)
- `AddListing` - Add new product listing
- `Orders` - Order management
- `Discounts` - Discount management

#### AdminStackParamList
- `AdminPanelHome` - Admin dashboard
- `OnboardStaff` - Staff onboarding
- `StaffActivity` - Staff activity reports

#### MarketplaceTabParamList (Consumer)
- `BrowseStack` - Browse products
- `Saved` - Saved items
- `Orders` - Consumer orders
- `Profile` - Consumer profile

#### BrowseStackParamList
- `BrowseHome` - Product listing
- `ProductDetail` - Product details (params: id)
- `RanchProfile` - Ranch profile (params: id)

---

## Screens

### Auth Screens (`src/screens/auth/`)

#### WelcomeScreen
- Purpose: Initial onboarding screen
- Features: Role selection (Ranch Staff vs Consumer)
- Navigation: Routes to appropriate login/signup flows

#### RanchLoginScreen
- Purpose: Staff login using access code
- Features: Access code input, validation
- Integration: Uses `authStore.loginAsRanch()`

#### RanchOwnerLoginScreen
- Purpose: Ranch owner login with email/password
- Features: Email and password inputs
- Integration: Uses `authStore.loginAsOwner()`

#### ConsumerSignInScreen
- Purpose: Consumer login
- Features: Email and password inputs
- Integration: Uses `authStore.loginAsConsumer()`

#### ConsumerSignUpScreen
- Purpose: Consumer registration
- Features: Name, email, password inputs
- Integration: Uses `authStore.signupAsConsumer()`

### Admin Screens (`src/screens/admin/`)

#### AdminPanelHomeScreen
- Purpose: Admin dashboard
- Features: Overview of ranch operations, quick actions
- Navigation: To staff onboarding, activity monitoring

#### OnboardStaffScreen
- Purpose: Create new staff accounts
- Features: Name, role, access code generation
- Integration: Uses `authStore.onboardStaff()`

#### StaffActivityScreen
- Purpose: View staff activity logs
- Features: Activity timeline, performance metrics

### Chat Screens (`src/screens/chat/`)

#### ChatHomeScreen
- Purpose: List of chat channels
- Features: Channel list, unread counts, last messages
- Integration: Uses `chatStore.fetchChannels()`

#### ConversationScreen
- Purpose: Chat conversation view
- Features: Message list, message input, send functionality
- Integration: Uses `chatStore.fetchMessages()`, `chatStore.sendMessage()`
- Recent Update: Send button now properly connected to store

### Herd Screens (`src/screens/herd/`)

#### HerdScreen
- Purpose: List all animals in the herd
- Features: Animal cards with basic info, search/filter
- Integration: Uses `livestockStore.fetchAnimals()`

#### AnimalDetailScreen
- Purpose: Detailed view of individual animal
- Features: Health status, medication records, pregnancy records, ancestry link
- Integration: Uses `livestockStore` for data

#### AddAnimalScreen
- Purpose: Add new animal to herd
- Features: Form with animal details (name, breed, sex, weight, parents)
- Integration: Uses `livestockStore.addAnimal()`

#### AncestryTreeScreen
- Purpose: Visualize animal ancestry
- Features: Tree view of parents and offspring
- Integration: Uses `livestockStore` for family data

### Home Screens (`src/screens/home/`)

#### HomeScreen
- Purpose: Main dashboard
- Features: Quick stats, recent tasks, activity feed, quick actions
- Integration: Multiple stores for data aggregation

#### StaffActivityMonitorScreen
- Purpose: Real-time staff activity monitoring
- Features: Active staff list, current tasks, status indicators

### Marketplace Screens (`src/screens/marketplace/`)

#### BrowseHomeScreen
- Purpose: Browse products from ranches
- Features: Product grid, filters, search
- Integration: Uses `marketplaceStore.fetchListings()`

#### ProductDetailScreen
- Purpose: Product details
- Features: Images, description, price, add to cart/buy
- Integration: Uses `marketplaceStore`

#### RanchProfileScreen
- Purpose: Ranch profile view
- Features: Ranch info, product listings, reviews

#### SavedScreen
- Purpose: Saved/favorite items
- Features: List of saved products
- Integration: Uses `marketplaceStore.savedListingIds`

#### ConsumerOrdersScreen
- Purpose: Consumer order history
- Features: Order list with status tracking
- Integration: Uses `marketplaceStore.fetchOrders()`

#### ConsumerProfileScreen
- Purpose: Consumer profile management
- Features: Profile info, settings, order history link

### Store Screens (`src/screens/store/`)

#### StoreManageScreen
- Purpose: Manage store listings
- Features: Product list, add/edit/delete, status management
- Integration: Uses `marketplaceStore.fetchListings()`, `addListing()`, `updateListing()`

#### StoreListingDetailScreen
- Purpose: View/edit listing details
- Features: Product info, stock, pricing, status toggle

#### AddListingScreen
- Purpose: Add new product listing
- Features: Product form (name, category, price, stock)
- Integration: Uses `marketplaceStore.addListing()`

#### OrdersScreen
- Purpose: Manage incoming orders
- Features: Order list, status updates (pending, confirmed, shipped, delivered)
- Integration: Uses `marketplaceStore.fetchOrders()`

#### DiscountsScreen
- Purpose: Manage discounts
- Features: Discount list, create/edit discounts

### Task Screens (`src/screens/tasks/`)

#### TaskBoardScreen
- Purpose: Task management board
- Features: Task list, filter chips (All, Pending, In Progress, Completed), add task button, notes button, history button
- Integration: Uses `taskStore.fetchTasks()`, filter state
- Recent Update: Added history button for TaskHistory navigation

#### TaskDetailScreen
- Purpose: Detailed task view
- Features: Task info, subtasks with toggle, comments with send, complete button with confirmation modal
- Integration: Uses `taskStore` for all operations
- Recent Updates:
  - Fixed TypeScript errors (time property removed, isCompleted → completed)
  - Added completion confirmation modal with PModal
  - Comment send button properly connected

#### CreateTaskScreen
- Purpose: Create new task
- Features: Title, description, priority chips, due date/time, assignee, recurrence chips
- Integration: Uses `taskStore.addTask()`
- All buttons and inputs functional

#### NotesScreen
- Purpose: Ranch notes
- Features: Note list, add/edit notes
- Integration: Database notes table

#### TaskHistoryScreen (NEW)
- Purpose: View historical tasks with calendar filters
- Features: Time filters (All Time, This Week, This Month, This Year), tasks grouped by month, completion status
- Integration: Uses `taskStore.fetchTasks()`, date-fns for filtering
- Navigation: Accessible from TaskBoard via calendar button

---

## Components

### UI Components (`src/components/ui/`)

#### PButton
- Purpose: Reusable button component
- Variants: primary, secondary, danger, ghost
- Sizes: small, medium, large
- Features: Loading state, disabled state, custom styling

#### PCard
- Purpose: Container card component
- Variants: default, elevated, outlined
- Features: Custom padding, elevation shadows

#### PInput
- Purpose: Text input component
- Features: Label, error message, keyboard types, multiline support
- Styling: Consistent with app theme

#### PBadge
- Purpose: Status badge component
- Variants: success, warning, error, info, neutral
- Features: Color-coded backgrounds and text

#### PChip
- Purpose: Selectable chip component
- Variants: default, filter, status
- Features: Selected state, onPress handler
- Used for: Priority selection, recurrence selection, filters

#### PModal
- Purpose: Modal dialog component
- Features: Overlay backdrop, content container, onClose handler
- Used for: Task completion confirmation, delete confirmations

#### DeleteModal
- Purpose: Specialized delete confirmation modal
- Features: Warning icon, message, confirm/cancel buttons

#### EmptyState
- Purpose: Empty state placeholder
- Features: Icon, message, action button

#### BuyerPreviewBanner
- Purpose: Banner for buyer preview mode
- Features: Preview indicator, exit button

---

## State Management

### Zustand Stores (`src/store/`)

#### authStore
**State:**
- `isAuthenticated`: boolean
- `userRole`: UserRole | null
- `user`: User | null
- `ranch`: Ranch | null
- `isLoading`: boolean

**Actions:**
- `loginAsRanch(accessCode)` - Staff login with access code
- `loginAsOwner(email, pass)` - Owner login
- `loginAsConsumer(email, pass)` - Consumer login
- `signupAsConsumer(data)` - Consumer registration
- `onboardStaff(name, role, code)` - Create staff account
- `logout()` - Clear auth state
- `setLoading(loading)` - Set loading state

**Database Integration:**
- Queries users table for authentication
- Queries ranch table for ranch info
- Inserts new users for onboarding

#### taskStore
**State:**
- `tasks`: Task[]
- `selectedTask`: Task | null
- `isLoading`: boolean
- `filter`: 'all' | 'pending' | 'in_progress' | 'completed'

**Actions:**
- `fetchTasks()` - Load all tasks from database
- `addTask(taskData)` - Create new task
- `updateTask(id, updates)` - Update task (status, etc.)
- `deleteTask(id)` - Delete task
- `setSelectedTask(task)` - Set currently selected task
- `setFilter(filter)` - Set task filter
- `toggleSubtask(taskId, subtaskId)` - Toggle subtask completion
- `addSubtask(taskId, title)` - Add subtask to task
- `addComment(taskId, content, userName)` - Add comment to task

**Database Integration:**
- tasks table (main task data)
- subtasks table (task subtasks)
- task_comments table (task comments)

#### chatStore
**State:**
- `channels`: Channel[]
- `selectedChannel`: Channel | null
- `messages`: Record<string, Message[]> (keyed by channel ID)
- `isLoading`: boolean

**Actions:**
- `fetchChannels()` - Load chat channels
- `fetchMessages(channelId)` - Load messages for channel
- `sendMessage(channelId, content, senderName)` - Send new message
- `setSelectedChannel(channel)` - Set active channel

**Database Integration:**
- chat_messages table (message storage)
- Channels are currently mocked (single "Asante Farms" channel)

#### livestockStore
**State:**
- `animals`: Animal[]
- `selectedAnimal`: Animal | null
- `medicationRecords`: MedicationRecord[]
- `pregnancyRecords`: PregnancyRecord[]
- `isLoading`: boolean

**Actions:**
- `fetchAnimals()` - Load all animals
- `fetchMedicationRecords()` - Load medication history
- `fetchPregnancyRecords()` - Load pregnancy records
- `addAnimal(animalData)` - Add new animal
- `updateAnimal(id, updates)` - Update animal info
- `deleteAnimal(id)` - Remove animal
- `addMedicationRecord(record)` - Log medication
- `addPregnancyRecord(record)` - Log pregnancy
- `setSelectedAnimal(animal)` - Set selected animal

**Database Integration:**
- animals table (animal data)
- medication_records table (medication history)
- pregnancy_records table (breeding records)

#### marketplaceStore
**State:**
- `listings`: StoreListing[]
- `savedListingIds`: string[] (saved items)
- `orders`: Order[]
- `isLoading`: boolean

**Actions:**
- `fetchListings()` - Load product listings
- `fetchOrders()` - Load orders
- `toggleSaved(id)` - Add/remove from saved
- `addListing(listingData)` - Create new listing
- `updateListing(id, updates)` - Update listing status
- `createOrder(orderData)` - Create new order

**Database Integration:**
- store_listings table (products)
- orders table (order data)

#### analyticsStore
**State:**
- `reports`: AnalyticsReport[]
- `selectedReport`: AnalyticsReport | null
- `isLoading`: boolean

**Actions:**
- `setReports(reports)` - Set reports
- `addReport(report)` - Add report
- `setSelectedReport(report)` - Set selected report
- `setLoading(loading)` - Set loading state

**Note:** Currently minimal implementation, reports are generated via reportService.

#### uiStore
**State:**
- `isBuyerPreview`: boolean (buyer preview mode)
- `toast`: { message, type, visible } | null

**Actions:**
- `setBuyerPreview(value)` - Toggle buyer preview
- `showToast(message, type)` - Show toast notification
- `hideToast()` - Hide toast

---

## Data Models

### Common Types (`src/types/common.ts`)

#### BaseEntity
```typescript
{
  id: string;
  createdAt: string;
  updatedAt: string;
}
```

#### UserRole
`'super_admin' | 'ranch_owner' | 'staff' | 'store_manager' | 'buyer'`

#### HealthStatus
`'healthy' | 'sick' | 'recovering' | 'quarantined' | 'quarantine' | 'deceased'`

#### TaskStatus
`'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked'`

#### TaskPriority
`'low' | 'medium' | 'high' | 'urgent'`

#### TaskRecurrence
`'none' | 'daily' | 'weekly' | 'monthly' | 'custom'`

#### OrderStatus
`'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'`

#### ProductCategory
`'cattle' | 'meat' | 'milk' | 'feed' | 'equipment' | 'other'`

### Auth Types (`src/types/auth.ts`)

#### Ranch
- id, name, code, description, location, logo, ownerId
- settings: { requireBiometric, requirePin, sessionTimeout, allowStaffCreation, allowMarketplace }
- createdAt, updatedAt

#### User
- id, name, email, phone, role, ranchId, accessCode, pin, profileImage
- isActive, permissions, lastLoginAt
- createdAt, updatedAt

#### Session
- userId, ranchId, token, expiresAt, deviceInfo

#### AccessCode
- code, userId, ranchId, role, expiresAt, isRevoked, createdAt

### Livestock Types (`src/types/livestock.ts`)

#### Animal
- id, animalId, tagNumber, internalCode, name, breed, gender, sex
- age, weight, color, dateOfBirth, datePurchased, originRanch, currentRanch
- photos, tags, notes, healthStatus
- motherId, fatherId, offspringIds
- ownershipHistory, lifecycleLogs, feedingPlan
- medicationRecords, pregnancyRecords, nursingRecords
- ownership, lifecycle, pregnancyStatus

#### MedicationRecord
- id, animalId, medicationName, type, dosage, administrationRoute, reason
- administeredDate, administeredBy, wearOffDate, nextTreatmentDate, notes

#### PregnancyRecord
- id, startDate, expectedBirthDate, actualBirthDate, sireId, outcome, offspringCount, notes

#### FeedingRecord
- id, animalId, feedType, quantity, unit, fedAt, fedBy, nutritionInfo, notes

### Task Types (`src/types/tasks.ts`)

#### Task
- id, title, description, status, priority, assignedTo, assignedBy, createdBy
- dueDate, completedAt, recurrence, recurrenceConfig
- subtasks: Subtask[]
- comments: Comment[]
- attachments: string[], tags: string[], category
- reminderEnabled, reminderTime
- createdAt, updatedAt

#### Subtask
- id, title, completed, completedAt

#### Comment
- id, userId, userName, content, attachments

### Marketplace Types (`src/types/marketplace.ts`)

#### Product
- id, name, description, category, price, originalPrice, discount
- images, ranchId, ranchName, storeName
- inStock, stock, quantity, sku, tags, specifications
- isPublished, publishedAt

#### Store
- id, ranchId, ranchName, description, logo, coverImage
- products, isPublished, rating, reviewCount

#### Order
- id, orderId, buyerId, buyerName, ranchId, ranchName
- items: OrderItem[], totalAmount, status
- shippingAddress, billingAddress, paymentMethod, paymentStatus
- orderDate, shippedDate, deliveredDate

#### OrderItem
- productId, productName, productImage, quantity, price, total

### Chat Types (`src/types/chat.ts`)

#### Channel
- id, name, type ('group' | 'direct' | 'announcement')
- description, ranchId, participants, createdBy
- isAnnouncement, lastMessage, unreadCount

#### Message
- id, channelId, senderId, senderName, content
- type ('text' | 'image' | 'file' | 'system')
- attachments, replyTo, isRead, readBy, sentAt

### Analytics Types (`src/types/analytics.ts`)

#### AnalyticsReport
- id, reportType, title, dateRange, data, generatedBy, format, fileUrl

#### DateRange
- startDate, endDate, type ('weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom')

#### AnalyticsData
- metrics: Metric[], charts: Chart[], summaries: Summary[]

---

## Services

### Database Service

**Purpose:** The application uses Supabase as its primary backend. Database schema is managed via [SUPABASE_SETUP.sql](file:///c:/Users/USER/Desktop/pocos/SUPABASE_SETUP.sql).

**Tables:**
1. **ranch** - Central ranch entity
2. **ranch_users** - Owner and staff profiles
3. **animals** - Livestock management
4. **medication_records** - Treatment tracking
5. **tasks** - Operational tasks
6. **subtasks** - Task breakdowns
7. **task_comments** - Task communication
8. **notes** - Ranch notes
9. **chat_channels** - Communication channels
10. **chat_messages** - Real-time messages
11. **store_listings** - Marketplace products
12. **orders** - Marketplace orders
13. **pregnancy_records** - Breeding tracking
14. **feed_records** - Feeding plans
15. **activity_logs** - Audit history
16. **discounts** - Product promotions
17. **analytics_snapshots** - Performance tracking

**Real-time:** Enabled for Chat and Tasks via Supabase Realtime.
**Storage:** Images are stored in Supabase Storage (`pocos-images` bucket).

### Auth Service (`src/services/authService.ts`)

**Purpose:** Authentication business logic

**Methods:**
- `login(accessCode)` - Validate access code and create session
- `logout()` - Clear session
- `checkSession()` - Validate existing session
- `createRanch(name, code, ownerId)` - Create new ranch
- `createStaffMember(ranchId, name, role, createdBy)` - Onboard staff
- `hasPermission(permission)` - Check user permissions

**Permission System:**
- super_admin: Full access (*)
- ranch_owner: livestock, tasks, staff, marketplace, analytics
- staff: livestock, tasks, chat
- store_manager: livestock (read), marketplace, analytics
- buyer: marketplace (read, purchase)

### Notification Service (`src/services/notificationService.ts`)

**Purpose:** Push notification management

**Methods:**
- Schedule notifications
- Send notifications
- Handle notification responses

### Report Service (`src/services/reportService.ts`)

**Purpose:** Generate analytics reports

**Methods:**
- Generate livestock reports
- Generate medication reports
- Generate feeding reports
- Generate breeding reports
- Generate task reports
- Generate staff reports
- Generate marketplace reports

### Storage Service (`src/services/storage.ts`)

**Purpose:** File storage management

**Methods:**
- Upload files
- Download files
- Delete files
- Get file URLs

---

## Utilities

### Date Utilities (`src/utils/date.ts`)

**Functions:**
- `formatDate(date)` - Format as "Jan 1, 2024"
- `formatDateTime(date)` - Format as "Jan 1, 2024, 12:00 PM"
- `formatTime(date)` - Format as "12:00 PM"
- `getRelativeTime(date)` - Relative time ("2 hours ago", "Just now")
- `isToday(date)` - Check if date is today
- `isYesterday(date)` - Check if date is yesterday
- `addDays(date, days)` - Add days to date
- `addHours(date, hours)` - Add hours to date

### UUID Utilities (`src/utils/uuid.ts`)

**Functions:**
- `generateId()` - Generate unique identifier

---

## Constants & Theme

### Colors (`src/constants/colors.ts`)

**Primary Palette:**
- `primaryRust`: #C1440E (Main accent color)
- `deepPlum`: #2B1349 (Secondary accent)
- `warmSand`: #F0E3C8 (Surface background)
- `antiqueGold`: #C78B2E (Highlight)
- `charcoalInk`: #1D1814 (Primary text)
- `mutedSienna`: #8C5C3E (Secondary text)
- `paleParchment`: #FAF6EF (Main background)
- `softAsh`: #E8E0D4 (Border/divider)

**Status Colors:**
- `successMoss`: #3A7D44 (Success)
- `alertAmber`: #D4821A (Warning)
- `dangerCrimson`: #B02020 (Error)

**Semantic Mapping (Legacy):**
- `background`: paleParchment
- `primarySurface`: warmSand
- `secondarySurface`: softAsh
- `textPrimary`: charcoalInk
- `textSecondary`: mutedSienna
- `primaryAccent`: primaryRust
- `border`: softAsh

### Typography (`src/constants/typography.ts`)

**Fonts:**
- Playfair Display (Headings)
- DM Sans (Body text)
- DM Mono (Code/numbers)

**Font Sizes:**
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px
- 2xl: 24px
- 3xl: 32px
- 4xl: 48px

### Spacing (`src/constants/spacing.ts`)

- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px
- 4xl: 64px

### Radius (`src/constants/radius.ts`)

- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px (circle)

### Shadows (`src/constants/shadows.ts`)

- sm: Small elevation shadow
- md: Medium elevation shadow
- lg: Large elevation shadow

---

## Database Schema

### ranch
```sql
CREATE TABLE ranch (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  currency TEXT,
  established TEXT,
  owner_id TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  access_code TEXT,
  email TEXT,
  status TEXT DEFAULT 'Active',
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);
```

### animals
```sql
CREATE TABLE animals (
  id TEXT PRIMARY KEY,
  animal_id TEXT UNIQUE,
  name TEXT,
  sex TEXT,
  acquired TEXT,
  date_acquired TEXT,
  color TEXT,
  weight REAL,
  dam_id TEXT,
  sire_id TEXT,
  breed TEXT,
  health_status TEXT DEFAULT 'healthy',
  created_at TEXT,
  updated_at TEXT
);
```

### medication_records
```sql
CREATE TABLE medication_records (
  id TEXT PRIMARY KEY,
  animal_id TEXT,
  medication TEXT,
  date_given TEXT,
  wear_off_date TEXT,
  logged_by TEXT,
  notes TEXT,
  FOREIGN KEY (animal_id) REFERENCES animals (id)
);
```

### tasks
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  assigned_to TEXT,
  recurring TEXT,
  time TEXT,
  status TEXT,
  due_date TEXT,
  priority TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

### subtasks
```sql
CREATE TABLE subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  title TEXT,
  is_completed INTEGER DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks (id)
);
```

### task_comments
```sql
CREATE TABLE task_comments (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  user_name TEXT,
  time TEXT,
  content TEXT,
  FOREIGN KEY (task_id) REFERENCES tasks (id)
);
```

### notes
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT,
  author TEXT,
  date TEXT,
  body TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

### chat_messages
```sql
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT,
  sender_name TEXT,
  time TEXT,
  content TEXT,
  created_at TEXT
);
```

### store_listings
```sql
CREATE TABLE store_listings (
  id TEXT PRIMARY KEY,
  product TEXT,
  category TEXT,
  price REAL,
  unit TEXT,
  stock TEXT,
  status TEXT,
  discount TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

### orders
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  buyer_name TEXT,
  item TEXT,
  qty INTEGER,
  total REAL,
  status TEXT,
  order_date TEXT
);
```

### pregnancy_records
```sql
CREATE TABLE pregnancy_records (
  id TEXT PRIMARY KEY,
  dam_id TEXT,
  sire_id TEXT,
  mating_date TEXT,
  expected_delivery TEXT,
  status TEXT,
  calves TEXT,
  FOREIGN KEY (dam_id) REFERENCES animals (id)
);
```

### feed_records
```sql
CREATE TABLE feed_records (
  id TEXT PRIMARY KEY,
  feed_type TEXT,
  purpose TEXT,
  special_purpose TEXT,
  applies_to TEXT
);
```

---

## Seeded Data

### Ranch
- **Name**: Asante Farms
- **Location**: Ejisu, Ashanti Region, Ghana
- **Currency**: GHS (₵)
- **Owner**: Kwame Asante

### Users
1. **Kwame Asante** (super_admin) - kwame@asante.com
2. **Abena Mensah** (store_manager) - Access: AM-5521
3. **Kofi Darko** (staff) - Access: KD-3847
4. **Akosua Boateng** (staff) - Access: AB-7762
5. **Yaw Owusu** (staff) - Access: YO-1193
6. **Ama Adomako** (staff) - Access: AA-6630 (Inactive)

### Animals (12 Brahman Cattle)
- AS-001 Abena (Female, Born 2020-03-12, 498kg)
- AS-002 Kofi (Male, Purchased 2019-06-04, 634kg)
- AS-003 Akua (Female, Born 2020-08-22, 441kg) - Child of AS-001 & AS-002
- AS-004 Kweku (Male, Born 2021-01-07, 589kg) - Child of AS-001 & AS-002
- AS-005 Adwoa (Female, Purchased 2020-11-15, 462kg)
- AS-006 Yaa (Female, Born 2022-04-30, 378kg) - Child of AS-003 & AS-002
- AS-007 Esi (Female, Born 2022-09-14, 355kg) - Child of AS-005 & AS-004
- AS-008 Kojo (Male, Purchased 2021-03-03, 601kg)
- AS-009 Araba (Female, Born 2023-02-19, 312kg) - Child of AS-003 & AS-008
- AS-010 Efua (Female, Born 2023-07-05, 298kg) - Child of AS-005 & AS-004
- AS-011 Nana (Female, Born 2023-10-27, 271kg) - Child of AS-006 & AS-002
- AS-012 Mensah (Male, Born 2024-03-11, 189kg) - Child of AS-007 & AS-008

### Tasks (7)
1. Morning feed (Kofi Darko, Daily, 06:00, High) - Completed with subtasks
2. Open grazing gates (Yaw Owusu, Daily, 07:30, Medium) - Pending
3. Evening head count (All staff, Daily, 18:00, Medium) - Pending
4. Close grazing gates (Yaw Owusu, Daily, 17:30, Medium) - Pending
5. Weigh animals — Pen B (Akosua Boateng, Weekly, 08:00, Medium) - Pending
6. Check water troughs (Kofi Darko, Daily, 07:00, Medium) - Completed
7. Vet visit follow-up (Akosua Boateng, None, —, High) - Pending

### Store Listings (6)
1. Grass-fed Beef - 85 GHS/kg - 45 kg stock
2. Fresh Whole Milk - 18 GHS/litre - 30 litres/day
3. Live Cattle — AS-008 Kojo - 4800 GHS/head - 1 stock
4. Hay Bales - 45 GHS/bale - 60 bales (Unlisted)
5. Bulk Beef (10kg+) - 85 GHS/kg - 45 kg - 10% off
6. Fresh Milk — Weekly Sub - 110 GHS/week - Unlimited

### Orders (3)
1. Nana Adjei - Grass-fed Beef (3kg) - 255 GHS - Confirmed
2. Esi Quaye - Fresh Whole Milk (5L) - 90 GHS - Pending
3. Kwabena Asare - Grass-fed Beef (10kg) - 765 GHS - Pending

### Chat Messages (8)
Team channel "Asante Farms" with messages about:
- Morning feed completion
- Water trough repair needed
- Animal health concerns (Esi coughing)
- New store orders
- Grazing gate status
- Animal weight progress

---

## Recent Updates & Improvements

### Task Management Enhancements
1. **Task Completion Modal**: Added confirmation popup when marking tasks complete
   - Shows task title in confirmation
   - Cancel/Complete buttons
   - Uses PModal component

2. **Task History Screen**: New screen for viewing historical tasks
   - Time filters: All Time, This Week, This Month, This Year
   - Tasks grouped by month
   - Shows completion status and dates
   - Accessible via calendar button on TaskBoard

3. **TypeScript Fixes**: Fixed type errors in TaskDetailScreen
   - Removed non-existent `time` property from Task
   - Changed `isCompleted` to `completed` for Subtask
   - Changed `time` to `createdAt` for Comment timestamps

### Chat Functionality
1. **Send Button Connection**: Connected send button to chatStore.sendMessage
   - Messages now persist to database
   - Proper sender name from authStore
   - Auto-scroll to latest message

### UI Components
1. **History Button**: Added calendar icon button to TaskBoard header
   - Navigates to TaskHistory screen
   - Consistent styling with other header buttons

---

## Development Notes

### Online Mode
The application is configured to connect to the Supabase production backend. Ensure your `.env` file contains valid `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### Web Compatibility
The application is fully compatible with web platforms. Supabase features (Auth, Database, Storage) work across iOS, Android, and Web.

### Font Loading
Custom fonts (Playfair Display, DM Sans, DM Mono) are loaded via expo-font and expo-google-fonts.

### Typed Routes
Expo Router's typed routes experiment is enabled for type-safe navigation.

### Database Seeding
Database is seeded only once using AsyncStorage flag. To reseed, clear app data or AsyncStorage.

---

## Future Enhancements

### Potential Features
- [ ] Real-time sync with cloud backend
- [ ] Push notifications for task reminders
- [ ] Photo upload for animals and products
- [ ] Advanced analytics with charts
- [ ] Multi-ranch support
- [ ] Offline-first with sync capabilities
- [ ] Barcode/QR scanning for animal tags
- [ ] GPS tracking for animals
- [ ] Weather integration for ranch operations
- [ ] Financial reporting and invoicing

---

## Support & Contact

For questions or issues related to this application, please refer to the project repository or contact the development team.

---

*Documentation generated on May 23, 2026*
