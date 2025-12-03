# YaVoy - Rural Ride-Sharing Platform

## Overview

YaVoy is a simple, ultra-local ride-sharing MVP designed for short trips between villages in rural Spain. The platform connects neighbors who need transportation (to doctors, markets, or the city) with those already traveling by car. The focus is on quick publishing and discovery of rides, with direct contact via WhatsApp, no online payments, and minimal complexity to serve rural users aged 40+.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend:**
- React with TypeScript
- Vite as build tool and dev server
- Wouter for client-side routing
- TanStack Query for server state management
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom rural theme (green and warm beige palette)
- Custom fonts: Inter (sans-serif) for readability, Merriweather (serif) for rural aesthetic

**Backend:**
- Express.js server
- TypeScript throughout
- RESTful API architecture
- Built with esbuild for production

**Data Layer:**
- Drizzle ORM with PostgreSQL dialect
- Neon serverless PostgreSQL (via `@neondatabase/serverless`)
- Schema-first approach with shared type definitions

### Application Structure

**Monorepo Layout:**
- `/client` - React frontend application
- `/server` - Express backend server
- `/shared` - Shared TypeScript schemas and types
- `/migrations` - Database migration files

**Key Design Decisions:**

1. **Full-stack TypeScript:** End-to-end type safety using shared schemas between client and server via Drizzle-Zod integration. This reduces bugs and improves developer experience.

2. **Mobile-First, Accessible Design:** Large fonts (base text size increased), high contrast colors, and simple navigation designed for rural users 40+ years old who may not be tech-savvy.

3. **Spanish Language Interface:** All UI text in Spanish (Spain) with friendly, clear language addressing rural users directly.

4. **User Authentication via Replit Auth:** Users can optionally log in via Replit Auth (supports Google, GitHub, Apple, email). Authentication enables ride contact tracking and review prompts. Viewing and publishing rides does not require login. Direct WhatsApp contact links for coordination. No payment processing built in - users handle compensation directly.

5. **Single-Page Application with Multi-Route Structure:** Uses Wouter for lightweight routing with pages for Home, View Rides, Publish Ride, and FAQ.

6. **Serverless-Ready Database:** Uses Neon serverless PostgreSQL with WebSocket connections for efficient scaling and cold-start performance.

7. **Storage Layer Abstraction:** The `IStorage` interface allows swapping storage implementations (currently `DatabaseStorage`) without changing business logic.

### Database Schema

**Tables:**

1. **sessions** - Session storage for authentication
   - sid (varchar, primary key)
   - sess (jsonb) - Session data
   - expire (timestamp)

2. **users** - User accounts from Replit Auth
   - id (varchar, primary key) - Replit user ID
   - email (varchar, unique)
   - firstName (varchar)
   - lastName (varchar)
   - phone (varchar) - Optional phone number
   - createdAt (timestamp)
   - updatedAt (timestamp)

3. **driver_profiles** - Driver identity for rating aggregation
   - id (serial, primary key)
   - name (text)
   - contactHash (text, unique) - SHA-256 hash of phone for privacy
   - createdAt (timestamp)

3. **rides** - Core ride-sharing data
   - id (serial, primary key)
   - driverName (text)
   - origin (text)
   - destination (text)
   - date (text - stored as ISO date string)
   - time (text)
   - seats (integer)
   - contact (text - phone number for WhatsApp)
   - notes (optional text)
   - driverProfileId (integer, nullable) - Links to driver_profiles
   - createdAt (timestamp)

4. **reviews** - Driver ratings and reviews
   - id (serial, primary key)
   - driverProfileId (integer) - Links to driver_profiles
   - stars (integer, 1-5)
   - comment (text, optional but required for <3 stars)
   - reviewerContactHash (text) - SHA-256 hash for duplicate prevention
   - createdAt (timestamp)

5. **ride_contacts** - Tracks when users contact drivers (for review prompts)
   - id (serial, primary key)
   - userId (varchar) - Links to users
   - rideId (integer) - Links to rides
   - driverProfileId (integer) - Links to driver_profiles
   - reviewSubmitted (integer, 0 or 1)
   - createdAt (timestamp)

### API Endpoints

**GET /api/rides** - Fetch all rides, ordered by creation date (newest first)

**POST /api/rides** - Create a new ride with validation via Zod schema. Automatically creates or links driver profile.

**GET /api/drivers/:id/rating** - Get average rating and review count for a driver

**GET /api/drivers/:id/reviews** - Get recent reviews for a driver (optional limit param)

**POST /api/reviews** - Submit a review (requires stars 1-5, comment if <3 stars, reviewer phone)

**GET /api/reviews/can-review** - Check if user can review (14-day limit per driver/reviewer pair)

**Authentication Endpoints:**

**GET /api/login** - Redirects to Replit Auth login page

**GET /api/callback** - OAuth callback handler

**GET /api/logout** - Logs out user and redirects to home

**GET /api/auth/user** - Returns current authenticated user or null

**GET /api/user/profile** - Returns full user profile (requires auth)

**PUT /api/user/phone** - Update user phone number (requires auth)

**POST /api/ride-contacts** - Record when user contacts a driver (requires auth)

**GET /api/pending-reviews** - Get ride contacts pending review (requires auth)

**PUT /api/ride-contacts/:id/reviewed** - Mark contact as reviewed (requires auth)

### Frontend Architecture

**State Management:**
- TanStack Query for server state (rides data)
- React hooks for local UI state
- Query invalidation on mutation success for immediate UI updates

**Routing Structure:**
- `/` - Home page with hero section and search
- `/viajes` - View all available rides with filtering
- `/publicar` - Publish a new ride form
- `/faq` - Frequently asked questions

**Component Organization:**
- `/components/ui` - shadcn/ui component library
- `/components/layout.tsx` - Main layout with header and navigation
- `/components/LocationAutocomplete.tsx` - Reusable location input with Spanish municipality autocomplete and geolocation
- `/components/ReviewDialog.tsx` - Modal dialog for submitting driver reviews with star rating
- `/components/PendingReviewPrompt.tsx` - Dialog that prompts users to review drivers they've contacted
- `/pages` - Route-specific page components
- `/lib` - Utilities, API client, query client configuration
- `/lib/auth-context.tsx` - React context for authentication state management
- `/data/municipios.json` - Static list of 8,124 Spanish municipalities from INE (CodeForSpain)

**Driver Rating System:**
- Drivers automatically get a profile when publishing their first ride (linked via phone hash)
- Ride cards show average rating (stars) and review count when available
- Users can click "Valorar" to submit a review with 1-5 stars
- Reviews with <3 stars require a comment explanation
- Phone number used to prevent duplicate reviews (14-day cooldown per driver/reviewer pair)
- Privacy: phone numbers are hashed using SHA-256 before storage

**Theming:**
- Custom CSS variables for modern rural aesthetic
- Primary color: Salvia green (#7dc891), darker shade (#70b681)
- Accent color: Orange (#f3b118), darker shade (#d9a535)
- Background: Urban gray (#F4F4F4) for cards
- Foreground: Petrol gray (#2F2F2F) for titles
- Large, readable fonts optimized for mobile and older users

**Location Autocomplete:**
- Spanish municipality autocomplete with 8,124+ towns from INE data
- Suggestions appear after typing 3+ characters
- First option: "Utilizar ubicación actual" with browser geolocation
- Uses Nominatim (OpenStreetMap) for reverse geocoding GPS coordinates to town names
- Keyboard navigation support (arrows, enter, escape)

## External Dependencies

### Third-Party Services

**Neon Database** - Serverless PostgreSQL hosting
- Connection via `@neondatabase/serverless` package
- WebSocket-based connections using `ws` library
- Requires `DATABASE_URL` environment variable

**Nominatim (OpenStreetMap)** - Reverse geocoding service
- Used for "Utilizar ubicación actual" feature
- Converts GPS coordinates to municipality names
- Free API with User-Agent identification requirement

**Replit Platform Services** (Development/Deployment)
- `@replit/vite-plugin-cartographer` - Development tooling
- `@replit/vite-plugin-dev-banner` - Development UI enhancements
- `@replit/vite-plugin-runtime-error-modal` - Error overlay
- Custom `vite-plugin-meta-images` for OpenGraph image URL injection

### Key NPM Packages

**UI Framework:**
- React 18+ with React DOM
- Radix UI primitives for accessible components
- Lucide React for icons
- date-fns for date formatting (with Spanish locale)

**Forms & Validation:**
- React Hook Form with `@hookform/resolvers`
- Zod for schema validation
- `zod-validation-error` for user-friendly error messages
- `drizzle-zod` for database schema to Zod schema conversion

**Styling:**
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- `class-variance-authority` for component variants
- `tailwind-merge` and `clsx` for className utilities

**Development:**
- TypeScript with strict mode enabled
- Vite for fast development and optimized builds
- esbuild for server bundling with selective dependency bundling

**Image Assets:**
- Hero image located at `/attached_assets/generated_images/`
- OpenGraph images in `/client/public/`

### Build & Deployment

**Build Process:**
1. Client build via Vite → outputs to `dist/public`
2. Server build via esbuild → outputs to `dist/index.cjs`
3. Selected dependencies bundled with server for faster cold starts

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to "production" or "development"
- `REPL_ID` - Optional, for Replit-specific features

**Scripts:**
- `dev` - Run development server with hot reload
- `dev:client` - Run Vite dev server standalone
- `build` - Build both client and server for production
- `start` - Run production server
- `db:push` - Push Drizzle schema changes to database