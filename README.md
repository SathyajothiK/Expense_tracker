# SpendWise Privé — Sovereign Wealth Management Protocol

> A luxury-grade, full-stack MERN personal finance tracker with cinematic dark/gold UI, live analytics, multi-currency support, and production-grade security hardening.

---

## 🏛️ Project Overview

**SpendWise Privé** is a premium personal wealth management web application built across a 7-day intensive development sprint (LiveWires Round 2). It features a fully authenticated transaction ledger, interactive analytics visualizations, dynamic budget tracking, vault health scoring, and a production-hardened Express/MongoDB backend.

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
│   │   │   ├── Navbar.jsx              # Navigation + currency switcher
│   │   │   ├── ProfileModal.jsx        # Profile setup modal
│   │   │   └── NotificationsModal.jsx  # Alert drawer
│   │   ├── pages/
│   │   │   ├── Login.jsx               # Luxury auth + vault key recovery
│   │   │   └── Dashboard.jsx           # Full dashboard (all sections)
│   │   └── App.jsx                     # Router + ProtectedRoute guard
│   └── vite.config.js                  # Vendor code-splitting config
│
└── server/                  # Node.js + Express backend
    ├── controllers/
    │   ├── authController.js           # Register / Login / Profile
    │   └── transactionController.js    # Full CRUD
    ├── middleware/
    │   └── authMiddleware.js           # JWT verification
    ├── models/
    │   ├── User.js                     # User schema + savingsTarget
    │   └── Transaction.js              # Transaction schema + indexes
    ├── routes/
    │   ├── authRoutes.js
    │   ├── transactionRoutes.js
    │   └── analyticsRoutes.js
    └── server.js                       # Helmet + CORS + Rate-limiting
```

---

## ✅ Feature Completion (Days 1–7)

### Day 1 — Project Scaffold
- React + Vite frontend, Express backend initialized
- MongoDB connection via Mongoose
- `.env` / `.gitignore` / `package.json` configured

### Day 2 — Backend API (13 Endpoints)
- JWT authentication (register / login / profile) — 30-day tokens
- Full Transaction CRUD with ownership verification
- Analytics aggregation pipelines (monthly timeline, category radar, insights)
- Compound indexes: `{ user: 1, date: -1 }`, `{ user: 1, category: 1 }`

### Day 3 — Luxury Landing & Auth UI
- Cinematic Dark + Gold aesthetic (Playfair Display + Inter)
- Glassmorphic login card with animated diamond crest
- "Access Private Vault" auth flow
- Vault Key Recovery / Password Reset modal

### Day 4 — Dashboard, CRUD & Live Data
- Axios service with dynamic JWT Bearer token interceptors
- Glassmorphic Add/Edit Transaction modals (POST/PUT)
- Live account balance sync across Checking, Savings, Investment, Cash
- Full searchable transaction ledger with category tag filters + CSV export

### Day 5 — Analytics, Visualizations & Vault Health
- Consolidated Valuation Chart (SVG spline with gold gradients)
- Radar Budget polygon chart (category allocation)
- Vault Health Score (0–100 dynamic algorithm + advice chips)
- ProtectedRoute client-side auth guard
- Express static asset serving for production builds

### Day 6 — Multi-Currency Engine & Hardening
- **Global CurrencyContext** — ₹ INR / $ USD / € EUR / £ GBP with localStorage persistence
- Currency switcher dropdown in Navbar (live display updates)
- CSV export of full transaction ledger (`SpendWise_Ledger_YYYY-MM-DD.csv`)
- Route authorization guards with 401 session clearing

### Day 7 — Security Hardening, Performance & Docs
- **Helmet** security headers (XSS, HSTS, referrer policy, etc.)
- **Strict CORS** whitelist (dev + production origins via `.env`)
- **Rate Limiting** — auth endpoints: 20 req/15min; API: 120 req/min
- **Vite manualChunks** — react-core / router / charts / icons / network / vendor
- MongoDB compound indexing for sub-millisecond query performance
- Professional repository documentation (this file)

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### Backend

```bash
cd server
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
npm install
npm run dev                 # runs on :5000
```

### Frontend

```bash
cd client
npm install
npm run dev                 # runs on :5173
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
| `VITE_API_URL` | Backend API base URL           |

---

## 📡 API Endpoints

| Method | Endpoint                     | Auth | Description                    |
|--------|------------------------------|------|--------------------------------|
| POST   | `/api/auth/register`         | ✗    | Create account                 |
| POST   | `/api/auth/login`            | ✗    | Sign in, get JWT               |
| GET    | `/api/auth/me`               | ✓    | Get current user profile       |
| PUT    | `/api/auth/profile`          | ✓    | Update profile                 |
| GET    | `/api/transactions`          | ✓    | List transactions (filterable) |
| POST   | `/api/transactions`          | ✓    | Create transaction             |
| PUT    | `/api/transactions/:id`      | ✓    | Update transaction             |
| DELETE | `/api/transactions/:id`      | ✓    | Delete transaction             |
| GET    | `/api/analytics/insights`    | ✓    | Financial insights & score     |
| GET    | `/api/analytics/timeline`    | ✓    | Monthly balance timeline       |
| GET    | `/api/analytics/accounts`    | ✓    | Account balance breakdown      |
| GET    | `/api/health`                | ✗    | Server health check            |

---

## 🏆 Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | React 18, Vite 5, Tailwind CSS v4               |
| Charts      | Custom SVG (spline), Recharts-compatible data   |
| Auth        | JWT (30-day), bcryptjs                          |
| Backend     | Node.js, Express 4                              |
| Database    | MongoDB Atlas, Mongoose                         |
| Security    | Helmet, express-rate-limit, strict CORS         |
| State       | React Context (Auth, Currency)                  |
| HTTP Client | Axios with Bearer token interceptors            |

---

## 👩‍💻 Author

Built for **LiveWires Round 2** — 7-Day Full-Stack Sprint
