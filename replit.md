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
- External Supabase PostgreSQL database (SUPABASE_DB_URL)
- Schema-first approach with shared type definitions

**Authentication:**
- Supabase Auth with custom branded UI
- Supports Google OAuth and email/password authentication
- JWT-based session management with server-side verification
- Spanish language interface with YaVoy corporate branding

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

4. **User Authentication via Supabase Auth:** Users log in via Supabase Auth with a custom branded login page at `/entrar`. Supports Google OAuth and email/password authentication with Spanish language UI and YaVoy corporate colors (green/orange). Authentication is required for publishing rides (enables ownership and management). Viewing rides is public. Authentication enables ride contact tracking and review prompts. Direct WhatsApp contact links for coordination. No payment processing built in - users handle compensation directly.

5. **Single-Page Application with Multi-Route Structure:** Uses Wouter for lightweight routing with pages for Home, View Rides, Publish Ride, and FAQ.

6. **External Supabase Database:** Uses external Supabase PostgreSQL database for data persistence, separate from Replit's built-in database.

7. **Storage Layer Abstraction:** The `IStorage` interface allows swapping storage implementations (currently `DatabaseStorage`) without changing business logic.

### Database Schema

**Tables:**

1. **users** - User accounts from Supabase Auth
   - id (varchar, primary key) - Supabase user ID
   - email (varchar, unique)
   - firstName (varchar)
   - lastName (varchar)
   - phone (varchar) - Optional phone number
   - createdAt (timestamp)
   - updatedAt (timestamp)

2. **driver_profiles** - Driver identity for rating aggregation
   - id (serial, primary key)
   - userId (varchar, unique) - Links directly to users.id
   - name (text)
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
   - userId (varchar, nullable) - Links to users for ownership
   - createdAt (timestamp)

4. **reviews** - Driver ratings and reviews
   - id (serial, primary key)
   - driverProfileId (integer) - Links to driver_profiles
   - stars (integer, 1-5)
   - comment (text, optional but required for <3 stars)
   - reviewerUserId (varchar) - Links to users.id for duplicate prevention
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

**POST /api/rides** - Create a new ride (requires auth). Automatically creates or links driver profile.

**GET /api/my-rides** - Get current user's published rides (requires auth)

**PUT /api/rides/:id** - Update a ride (requires auth, must own the ride)

**DELETE /api/rides/:id** - Delete a ride (requires auth, must own the ride)

**GET /api/drivers/:id/rating** - Get average rating and review count for a driver

**GET /api/drivers/:id/reviews** - Get recent reviews for a driver (optional limit param)

**POST /api/reviews** - Submit a review (requires auth, stars 1-5, comment if <3 stars)

**GET /api/reviews/can-review** - Check if user can review (requires auth, 14-day limit per driver)

**Authentication Endpoints:**

**GET /api/config/supabase** - Returns Supabase URL and anon key for client initialization

**GET /api/auth/user** - Returns current authenticated user or null (requires Bearer token)

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
- `/publicar` - Publish a new ride form (requires auth)
- `/mis-viajes` - Manage user's own published rides (edit/delete)
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
- Drivers automatically get a profile when publishing their first ride (linked directly via userId)
- Ride cards show average rating (stars) and review count when available
- Authenticated users can click "Valorar" to submit a review with 1-5 stars
- Reviews with <3 stars require a comment explanation
- Reviews require authentication (uses reviewerUserId for duplicate prevention, 14-day cooldown per driver)

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

**Supabase Database** - External PostgreSQL hosting
- Connection via `pg` package with Drizzle ORM
- Uses standard PostgreSQL connections with SSL
- Requires `SUPABASE_DB_URL` environment variable
- RLS enabled on all tables (no policies defined - access is via service-role connection only)

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