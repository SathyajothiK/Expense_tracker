# SpendWise — Personal Finance Tracker

> A luxury-grade, full-stack MERN personal finance tracker with cinematic dark/gold UI, live analytics, multi-currency support, and production-grade security hardening.

---

## 🏛️ Project Overview

**SpendWise** is a premium personal wealth management web application built across a 7-day intensive development sprint (LiveWires Round 2). It features a fully authenticated transaction ledger, interactive analytics visualizations, dynamic budget tracking, vault health scoring, and a production-hardened Express/MongoDB backend.

---

## 🚀 Live Demo

> Start locally (see setup below) — production deployment ready via `npm run build`.

---

## 🗂️ Project Structure

```
Expense_tracker/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── CurrencyContext.jsx     # Global multi-currency engine
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation + currency switcher + profile
│   │   │   ├── ProfileModal.jsx        # Profile setup & edit modal
│   │   │   └── NotificationsModal.jsx  # Notifications/alert drawer
│   │   ├── pages/
│   │   │   ├── Login.jsx               # Auth UI: sign in / register + vault key recovery
│   │   │   ├── Dashboard.jsx           # Full single-page dashboard (all sections)
│   │   │   └── Contact.jsx             # Contact & support page
│   │   ├── App.jsx                     # Router + ProtectedRoute guard
│   │   └── main.jsx                    # App entry point
│   ├── index.html
│   └── vite.config.js                  # Vendor code-splitting config
│
└── server/                  # Node.js + Express backend
    ├── config/
    │   └── db.js                       # Mongoose connection
    ├── controllers/
    │   ├── authController.js           # Register / Login / Profile
    │   ├── transactionController.js    # Full CRUD
    │   └── analyticsController.js      # Aggregation pipelines
    ├── middleware/
    │   └── authMiddleware.js           # JWT verification
    ├── models/
    │   ├── User.js                     # User schema + savingsTarget
    │   └── Transaction.js              # Transaction schema + indexes
    ├── routes/
    │   ├── authRoutes.js
    │   ├── transactionRoutes.js
    │   └── analyticsRoutes.js
    ├── test-api.js                     # API smoke test script
    └── server.js                       # Helmet + CORS + Rate-limiting
```

---

## ✅ Feature Completion (Days 1–7)

### Day 1 — Project Scaffold
- React + Vite frontend, Express backend initialized
- MongoDB connection via Mongoose (`server/config/db.js`)
- `.env` / `.gitignore` / `package.json` configured

### Day 2 — Backend API
- JWT authentication (register / login / profile) — 30-day tokens
- Full Transaction CRUD with ownership verification
- Analytics aggregation pipelines (monthly timeline, category radar, insights)
- Compound indexes: `{ user: 1, date: -1 }`, `{ user: 1, category: 1 }`

### Day 3 — Luxury Landing & Auth UI
- Cinematic Dark + Gold aesthetic (Playfair Display + Inter)
- Glassmorphic login card with animated diamond crest and floating bokeh particles
- "Access Private Vault" / "Initialize Portfolio" auth flow
- Vault Key Recovery modal with generated reset key display

### Day 4 — Dashboard, CRUD & Live Data
- Axios service with dynamic JWT Bearer token interceptors
- Glassmorphic Add / Edit Transaction modals (POST / PUT)
- Live account balance sync across Checking, Savings, Investment, Cash
- Full searchable transaction ledger with category tag filters + CSV export

### Day 5 — Analytics, Visualizations & Vault Health
- Consolidated Valuation Chart (custom SVG spline with gold gradients & hover tooltips)
- Radar Budget polygon chart (category allocation, 8-axis)
- Soundwave equalizer bars for spending score visualization
- Vault Health / Spending Score (0–100 dynamic algorithm + advice chips)
- `ProtectedRoute` client-side auth guard
- Express static asset serving for production builds

### Day 6 — Multi-Currency Engine & Hardening
- **Global CurrencyContext** — ₹ INR / \$ USD / € EUR / £ GBP with `localStorage` persistence
- Currency switcher dropdown in Navbar (live display updates across the app)
- CSV export of full transaction ledger (`SpendWise_Ledger_YYYY-MM-DD.csv`)
- Route authorization guards with 401 session clearing

### Day 7 — Security Hardening, Performance & Docs
- **Helmet** security headers (XSS, HSTS, referrer policy, etc.)
- **Strict CORS** whitelist (dev + production origins via `.env`)
- **Rate Limiting** — auth endpoints: 20 req / 15 min; API: 120 req / min
- **Vite `manualChunks`** — react-core / router / icons / network / vendor chunks
- MongoDB compound indexing for sub-millisecond query performance
- Contact page (`/contact`) with support request form
- Scroll-spy navigation: URL path syncs with scroll position automatically
- Professional repository documentation (this file)

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB (local instance or MongoDB Atlas)

### Backend

```bash
cd server
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
npm install
npm run dev                 # nodemon — runs on :5000
```

### Frontend

```bash
cd client
npm install
npm run dev                 # Vite HMR — runs on :5173
```

---

## 🔐 Environment Variables

### `server/.env`

| Variable        | Description                             |
|-----------------|-----------------------------------------|
| `MONGO_URI`     | MongoDB connection string               |
| `JWT_SECRET`    | Secret key for signing JWT tokens       |
| `PORT`          | Server port (default: 5000)             |
| `NODE_ENV`      | `development` or `production`           |
| `CLIENT_ORIGIN` | Production frontend URL (for CORS)      |

### `client/.env`

| Variable       | Description                    |
|----------------|--------------------------------|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |

---

## 📡 API Endpoints

| Method | Endpoint                     | Auth | Description                        |
|--------|------------------------------|------|------------------------------------|
| POST   | `/api/auth/register`         | ✗    | Create account                     |
| POST   | `/api/auth/login`            | ✗    | Sign in, get JWT                   |
| GET    | `/api/auth/me`               | ✓    | Get current user profile           |
| PUT    | `/api/auth/profile`          | ✓    | Update profile                     |
| GET    | `/api/transactions`          | ✓    | List transactions (search/filter)  |
| POST   | `/api/transactions`          | ✓    | Create transaction                 |
| PUT    | `/api/transactions/:id`      | ✓    | Update transaction                 |
| DELETE | `/api/transactions/:id`      | ✓    | Delete transaction                 |
| GET    | `/api/analytics/insights`    | ✓    | Financial insights & spending score|
| GET    | `/api/analytics/timeline`    | ✓    | Monthly/weekly balance timeline    |
| GET    | `/api/analytics/accounts`    | ✓    | Account balance breakdown          |
| GET    | `/api/health`                | ✗    | Server health check                |

---

## 🗺️ Frontend Routes

| Path             | Component          | Protected | Description                             |
|------------------|--------------------|-----------|-----------------------------------------|
| `/`              | `Login`            | ✗         | Root → auth page                        |
| `/login`         | `Login`            | ✗         | Sign in / Register                      |
| `/register`      | `Login`            | ✗         | Alias for `/login`                      |
| `/contact`       | `Contact`          | ✗         | Support & contact form                  |
| `/dashboard`     | `Dashboard`        | ✓         | Home section (portfolio overview)       |
| `/analytics`     | `Dashboard`        | ✓         | Analytics section (scroll-spy)          |
| `/budget`        | `Dashboard`        | ✓         | Budget section (scroll-spy)             |
| `/transactions`  | `Dashboard`        | ✓         | Transactions ledger (scroll-spy)        |

> All four dashboard routes render the same `Dashboard` component — the URL is synced automatically via scroll-spy. Direct navigation to `/analytics`, `/budget`, or `/transactions` auto-scrolls to the matching section.

---

## 🏆 Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | React 18, Vite 5, Tailwind CSS v4                 |
| Icons       | Lucide React                                      |
| Charts      | Custom SVG spline chart, SVG radar polygon chart  |
| Auth        | JWT (30-day expiry), bcryptjs                     |
| Backend     | Node.js, Express 5                                |
| Database    | MongoDB Atlas / local, Mongoose 9                 |
| Security    | Helmet 8, express-rate-limit 8, strict CORS       |
| State       | React Context (Auth, Currency)                    |
| HTTP Client | Axios with Bearer token interceptors              |

---

## 🎨 UI / Design Highlights

- **Color palette**: Deep obsidian (`#080706`) background with gold (`#D4AF37`, `#E6C667`) accents
- **Typography**: Playfair Display (serif headings) + Inter (UI text)
- **Glassmorphism**: Backdrop-blur cards with gold-tinted borders throughout
- **Animations**: Animated crest logo, floating bokeh particles, pulsing balance indicators, spinning loader
- **Charts**:
  - *Valuation Chart* — 12-month SVG cubic spline with area fill, hover tooltip, dashed active line
  - *Radar Chart* — 8-axis category polygon with concentric rings, hover node enlargement
  - *Soundwave Bars* — equalizer-style spending score visualization
- **Account cards**: 4 account types (Current, Savings, Portfolio, Cash) with mini sparklines
- **Responsive**: Mobile-first grid with `xl:` breakpoints, hidden nav labels on small screens

---

## 👩‍💻 Author

Built for **LiveWires Round 2** — 7-Day Full-Stack Sprint
