// =============================================================
// CineBook — backend/db/db.js
// MySQL2 connection pool
// | CMPG 311 | Group 4 | 2026
// =============================================================
// All route files import this module and call db.query(sql, params)
// The pool automatically manages multiple simultaneous connections
// =============================================================

const mysql = require('mysql2');

const pool = mysql.createPool({
  host              : process.env.DB_HOST     || 'localhost',
  user              : process.env.DB_USER     || 'root',
  password          : process.env.DB_PASSWORD || '',
  database          : process.env.DB_NAME     || 'cinebook',
  waitForConnections: true,
  connectionLimit   : 10,   // Max simultaneous connections
  queueLimit        : 0     // Unlimited queue
});

// Test the connection on startup so we know immediately if .env is wrong
pool.getConnection((err, connection) => {
    if (err) {
    console.error('[DB] Connection failed:', err.message);
    console.error('[DB] Check your .env file — DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    return;
    }
    console.log('[DB] Connected to MySQL database:', process.env.DB_NAME);
    connection.release();
});

// Export as a promise-based pool so routes can use async/await
module.exports = pool.promise();