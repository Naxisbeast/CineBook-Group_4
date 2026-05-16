// =============================================================
// CineBook - backend/routes/auth.js
// Authentication routes
// POST /api/auth/register - create a new user account
// POST /api/auth/login    - verify credentials and return JWT
// =============================================================

const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db/db');
const { sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cinebook_dev_secret_change_me';

function toClientUser(user) {
  return {
    User_Id        : user.User_Id,
    First_Name     : user.First_Name,
    Last_Name      : user.Last_Name,
    Email          : user.Email,
    Role           : user.Role,
    Loyalty_Status : user.Loyalty_Status,
    Theatre_Id     : user.Theatre_Id
  };
}

function signToken(user) {
  return jwt.sign(
    {
      user_id : user.User_Id,
      email   : user.Email,
      role    : user.Role,
      theatre_id: user.Theatre_Id || null
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { First_Name, Last_Name, Email, Phone_Number, Password } = req.body;
  const email = Email?.trim().toLowerCase();

  if (!First_Name || !Last_Name || !email || !Password) {
    return res.status(400).json({ error: 'First_Name, Last_Name, Email, and Password are required.' });
  }

  try {
    const [existing] = await db.query(
      'SELECT User_Id FROM Users WHERE Email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const Password_Hash = await bcrypt.hash(Password, 10);

    const [result] = await db.query(
      `INSERT INTO Users (First_Name, Last_Name, Email, Phone_Number, Password_Hash)
       VALUES (?, ?, ?, ?, ?)`,
      [First_Name.trim(), Last_Name.trim(), email, Phone_Number || null, Password_Hash]
    );

    const user = {
      User_Id        : result.insertId,
      First_Name     : First_Name.trim(),
      Last_Name      : Last_Name.trim(),
      Email          : email,
      Role           : 'Customer',
      Loyalty_Status : 'Standard',
      Theatre_Id     : null
    };

    let welcomeEmail = { mode: 'not_attempted', sent: false };
    try {
      welcomeEmail = await sendWelcomeEmail(user);
    } catch (emailErr) {
      console.error('[EMAIL] Welcome email error:', emailErr.message);
      welcomeEmail = { mode: 'error', sent: false };
    }

    return res.status(201).json({
      message              : 'Account created successfully.',
      token                : signToken(user),
      user                 : toClientUser(user),
      welcome_email_sent   : welcomeEmail.sent,
      welcome_email_status : welcomeEmail.mode
    });

  } catch (err) {
    console.error('[AUTH] Register error:', err.message);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { Email, Password } = req.body;
  const email = Email?.trim().toLowerCase();

  if (!email || !Password) {
    return res.status(400).json({ error: 'Email and Password are required.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT User_Id, First_Name, Last_Name, Email, Role, Loyalty_Status, Theatre_Id, Password_Hash
       FROM Users
       WHERE Email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(Password, user.Password_Hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.status(200).json({
      token: signToken(user),
      user : toClientUser(user)
    });

  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;
