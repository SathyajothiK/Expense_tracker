# Expense Tracker

A full-stack MERN app for tracking income, expenses, and spending habits.

## Day 1 setup
- Created the React + Vite frontend in `client`
- Created the Express backend in `server`
- Installed frontend dependencies: React, Vite, Axios, React Router
- Installed backend dependencies: Express, Mongoose, dotenv, CORS, JWT, bcryptjs, nodemon
- Added environment configuration in `server/.env` and sample values in `server/.env.example`
- Set up MongoDB connection logic in `server/config/db.js`
- Configured backend scripts in `server/package.json`
- Added project ignore rules in `.gitignore`
- Set up the server startup and health route in `server/server.js`
- Initialized Git and created the initial project commit

## Day 2 Backend API
- Implemented complete authentication module with JWT tokens
  - User registration with bcryptjs password hashing
  - User login with 30-day JWT token generation
  - Protected profile endpoint with auth middleware
- Created User and Transaction database models with validation
- Built Transaction CRUD operations with filtering
  - POST /api/transactions - Create transactions
  - GET /api/transactions - List with search, category, limit filters
  - PUT /api/transactions/:id - Update transactions
  - DELETE /api/transactions/:id - Delete transactions
  - Full user ownership verification
- Implemented analytics aggregation pipelines
  - Account balance aggregation across account types
  - Monthly/weekly timeline data for balance charts
  - Category-wise expense breakdown for radar charts
  - Financial insights with spending scores & advice
- Created middleware layer for JWT verification
- Set up all API route handlers with proper error handling
- Added comprehensive test suite for endpoint validation
- Mounted all routes in main server.js

## Day 3 Landing & Authentication UI Overhaul (SpendWise)
- Overhauled frontend with a Luxury Cinematic Dark & Gold aesthetic inspired by premium wealth management protocols
- Configured styling foundation with Tailwind CSS v4, custom theme tokens, and Google Fonts (`Playfair Display` + `Inter`)
- Implemented **Step 1: Background & Arches**:
  - Fullscreen dark radial gradient (`radial-gradient(ellipse at center, #14110F 0%, #080706 100%)`)
  - Curved glowing arch background vectors and soft gold radial ambient spotlights (`#D4AF37`)
  - Floating golden bokeh particle micro-animations
- Implemented **Step 2: Luxury Glassmorphism Card**:
  - Layered glassmorphic container (`#12100E/85` with `backdrop-blur-2xl` and gold border glow)
  - Geometric luxury corner accents and animated diamond crest emblem
- Implemented **Step 3: Brand Typography**:
  - Sub-headline: `PERSONAL FINANCE • MANAGEMENT` with wide tracking
  - Brand title: `SpendWise` using `Playfair Display` serif typography with gold metallic sheen
  - Subtext: `Track your wealth with precision`
- Implemented **Step 4: Dark Form Controls & Gold Action Buttons**:
  - Luxury dark input fields with gold focus rings and standard autocomplete tags
  - Gold-outlined pill action button with metallic glow (`Access Private Vault` / `Initialize Portfolio`)
  - Mode toggle between Sign In and Create Account (Registration)
  - Password visibility toggle (Eye/EyeOff) and Remember Session option
  - Demo credentials quick-fill buttons for instant testing
  - Full API integration with backend auth endpoints (`/api/auth/login` & `/api/auth/register`)
- Optimized card proportions and margins for 100% viewport fit across all laptop and desktop resolutions

## Current status
- ✅ Complete backend API layer ready & tested (13 endpoints)
- ✅ Database models and schemas validated
- ✅ Authentication and authorization working (JWT 30-day tokens)
- ✅ Day 3 Luxury Landing & Login UI complete and verified in browser
- 🚀 Ready for Day 4 Dashboard & Transaction management integration

## Next steps
1. Build React frontend components for dashboard
2. Integrate frontend with backend API (axios client)
3. Add data visualization charts (balance timeline, radar budget)
4. Create transaction management interface
5. Add responsive design and styling
6. Deploy to production

