// =============================================================
// CineBook — backend/middleware/verifyToken.js
// JWT authentication middleware
// CMPG 311 | Group 4 | 2026
// =============================================================
// Usage: add verifyToken as middleware on any protected route
//
//   const verifyToken = require('../middleware/verifyToken');
//   router.get('/my-bookings', verifyToken, async (req, res) => { ... });
//
// After this middleware runs, req.user contains the decoded token:
//   req.user.id    — the logged-in user's User_Id
//   req.user.email — their email
//   req.user.role  — 'Customer', 'Administrator', etc.
// =============================================================

const jwt = require('jsonwebtoken');

module.exports = function verifyToken(req, res, next) {
  // Expect: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach decoded payload to req so routes can read it
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};