// =============================================================
// CineBook — backend/server.js
// Express API entry point
// PM: Thapelo Kamogelo Wana | CMPG 311 | Group 4 | 2026
// =============================================================
// Responsibilities (PM task):
//   - Load environment variables
//   - Set up middleware (cors, json, security headers)
//   - Mount all route files
//   - Start server on PORT 5000
// =============================================================

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');

// ── Route imports ──────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const movieRoutes    = require('./routes/movies');
const showRoutes     = require('./routes/shows');
const seatRoutes     = require('./routes/seats');
const bookingRoutes  = require('./routes/bookings');
const paymentRoutes  = require('./routes/payments');
const imageRoutes    = require('./routes/images');
const adminRoutes    = require('./routes/admin');
const managerRoutes  = require('./routes/manager');

const app  = express();
const PORT = process.env.PORT || 5000;
const configuredClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = new Set([
  configuredClientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
]);

function allowOrigin(origin, callback) {
  if (!origin || allowedOrigins.has(origin)) {
    callback(null, true);
    return;
  }

  const isLocalViteOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  if (process.env.NODE_ENV !== 'production' && isLocalViteOrigin) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked origin: ${origin}`));
}

// ── Global middleware ───────────────────────────────────────
app.use(helmet());           // Security headers
app.use(cors({
  origin: allowOrigin,
  credentials: true
}));
app.use(express.json());     // Parse JSON request bodies

// ── Health check ────────────────────────────────────────────
// Test with: GET http://localhost:5000/api
app.get('/api', (req, res) => {
  res.json({
    message : 'CineBook API is running',
    version : '1.0.0',
    group   : 'CMPG 311 — Group 4'
  });
});

// ── Route mounting ──────────────────────────────────────────
app.use('/api/auth',     authRoutes);      // POST /api/auth/register  POST /api/auth/login
app.use('/api/movies',   movieRoutes);     // GET  /api/movies          GET  /api/movies/:id
app.use('/api/shows',    showRoutes);      // GET  /api/shows/:movie_id
app.use('/api/seats',    seatRoutes);      // GET  /api/seats/:show_id
app.use('/api/bookings', bookingRoutes);   // GET  /api/bookings/my-bookings  POST /api/bookings
app.use('/api/payments', paymentRoutes);   // POST /api/payments
app.use('/api/images',   imageRoutes);      // GET  /api/images/movie?title=...
app.use('/api/admin',    adminRoutes);      // Administrator and System Administrator actions
app.use('/api/manager',  managerRoutes);    // Cinema Manager theatre-scoped actions

// ── 404 handler (route not found) ──────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Global error handler ────────────────────────────────────
// Catches any error thrown with next(err) in any route
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

// ── Start server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`CineBook API running on http://localhost:${PORT}/api`);
});

module.exports = app;
