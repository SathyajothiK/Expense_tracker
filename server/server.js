require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const path     = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes        = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes   = require('./routes/analyticsRoutes');

const app = express();

// ── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,       // allow embedding charts / fonts
  contentSecurityPolicy: false,           // managed by Vite in dev; off in server
}));

// ── Strict CORS ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',                 // Vite dev
  'http://localhost:4173',                 // Vite preview
  process.env.CLIENT_ORIGIN,              // production domain via .env
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server (no origin) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Strict limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,                      // max 20 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP — please try again after 15 minutes.',
  },
});

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 120,                     // 120 requests/minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded — please slow down.',
  },
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    project: 'SpendWise Privé — Sovereign Wealth Management Protocol',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ── Mount routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics',    analyticsRoutes);

// ── Serve static assets in production ────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SpendWise Server Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ SpendWise Privé server running on port ${PORT}`);
  });
};

startServer();
