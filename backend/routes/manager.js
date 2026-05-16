const express = require('express');
const db = require('../db/db');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');

const router = express.Router();
const bookingStatuses = ['pending', 'confirmed', 'cancelled'];

router.use(verifyToken, requireRole('Cinema Manager'));

function normalizeDateTime(value) {
  const text = String(value || '').trim().replace('T', ' ');
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(text)) return null;
  return text.length === 16 ? `${text}:00` : text.slice(0, 19);
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

async function loadManagerTheatre(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT
          u.Theatre_Id,
          t.Name AS Theatre_Name,
          t.City AS Theatre_City
       FROM Users u
       LEFT JOIN Theatre t ON t.Theatre_Id = u.Theatre_Id
       WHERE u.User_Id = ?
         AND u.Role = 'Cinema Manager'`,
      [req.user.user_id]
    );

    if (rows.length === 0 || !rows[0].Theatre_Id) {
      return res.status(403).json({ error: 'Cinema manager account is not assigned to a theatre.' });
    }

    req.managerTheatre = rows[0];
    return next();
  } catch (err) {
    console.error('[MANAGER] Theatre lookup error:', err.message);
    return res.status(500).json({ error: 'Failed to verify manager theatre.' });
  }
}

async function screenBelongsToTheatre(screenId, theatreId) {
  const [rows] = await db.query(
    `SELECT Screen_Id
     FROM Screen
     WHERE Screen_Id = ?
       AND Theatre_Id = ?`,
    [screenId, theatreId]
  );

  return rows.length > 0;
}

async function showBelongsToTheatre(showId, theatreId, conn = db) {
  const [rows] = await conn.query(
    `SELECT ss.Show_Id
     FROM ShowSchedule ss
     JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
     WHERE ss.Show_Id = ?
       AND sc.Theatre_Id = ?`,
    [showId, theatreId]
  );

  return rows.length > 0;
}

router.use(loadManagerTheatre);

router.get('/summary', async (req, res) => {
  const theatreId = req.managerTheatre.Theatre_Id;

  try {
    const [[totals]] = await db.query(
      `SELECT
          (SELECT COUNT(*) FROM Screen WHERE Theatre_Id = ?) AS screen_count,
          (SELECT COUNT(*)
           FROM ShowSchedule ss
           JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
           WHERE sc.Theatre_Id = ?) AS show_count,
          (SELECT COUNT(*)
           FROM Booking b
           JOIN ShowSchedule ss ON ss.Show_Id = b.Show_Id
           JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
           WHERE sc.Theatre_Id = ?) AS booking_count,
          (SELECT COUNT(*)
           FROM Booking b
           JOIN ShowSchedule ss ON ss.Show_Id = b.Show_Id
           JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
           WHERE sc.Theatre_Id = ? AND b.Status = 'pending') AS pending_bookings,
          (SELECT COALESCE(SUM(p.Amount), 0)
           FROM Payment p
           JOIN Booking b ON b.Booking_Id = p.Booking_Id
           JOIN ShowSchedule ss ON ss.Show_Id = b.Show_Id
           JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
           WHERE sc.Theatre_Id = ? AND p.Payment_Status = 'successful') AS revenue`,
      [theatreId, theatreId, theatreId, theatreId, theatreId]
    );

    const [topShows] = await db.query(
      `SELECT
          ss.Show_Id,
          m.Title AS Movie_Title,
          ss.Show_DateTime,
          sc.Screen_Name,
          COUNT(bs.Seat_Id) AS seats_booked,
          sc.Total_Seats
       FROM ShowSchedule ss
       JOIN Movie m ON m.Movie_Id = ss.Movie_Id
       JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
       LEFT JOIN BookingSeat bs ON bs.Show_Id = ss.Show_Id
       WHERE sc.Theatre_Id = ?
       GROUP BY ss.Show_Id, m.Title, ss.Show_DateTime, sc.Screen_Name, sc.Total_Seats
       ORDER BY seats_booked DESC, ss.Show_DateTime ASC
       LIMIT 5`,
      [theatreId]
    );

    return res.json({
      theatre: req.managerTheatre,
      totals,
      topShows
    });
  } catch (err) {
    console.error('[MANAGER] Summary error:', err.message);
    return res.status(500).json({ error: 'Failed to load manager summary.' });
  }
});

router.get('/lookups', async (req, res) => {
  try {
    const [movies] = await db.query(
      `SELECT Movie_Id, Title
       FROM Movie
       ORDER BY Title ASC`
    );

    const [screens] = await db.query(
      `SELECT Screen_Id, Screen_Name, Screen_Type, Total_Seats, Theatre_Id
       FROM Screen
       WHERE Theatre_Id = ?
       ORDER BY Screen_Name ASC`,
      [req.managerTheatre.Theatre_Id]
    );

    return res.json({
      theatre: req.managerTheatre,
      movies,
      screens
    });
  } catch (err) {
    console.error('[MANAGER] Lookups error:', err.message);
    return res.status(500).json({ error: 'Failed to load manager lookup data.' });
  }
});

router.get('/shows', async (req, res) => {
  try {
    const [shows] = await db.query(
      `SELECT
          ss.Show_Id,
          ss.Movie_Id,
          m.Title AS Movie_Title,
          ss.Screen_Id,
          sc.Screen_Name,
          sc.Screen_Type,
          ss.Show_DateTime,
          ss.Price_Per_Seat,
          COUNT(bs.Seat_Id) AS Seats_Booked,
          sc.Total_Seats - COUNT(bs.Seat_Id) AS Seats_Remaining
       FROM ShowSchedule ss
       JOIN Movie m ON m.Movie_Id = ss.Movie_Id
       JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
       LEFT JOIN BookingSeat bs ON bs.Show_Id = ss.Show_Id
       WHERE sc.Theatre_Id = ?
       GROUP BY
          ss.Show_Id, ss.Movie_Id, m.Title, ss.Screen_Id,
          sc.Screen_Name, sc.Screen_Type, ss.Show_DateTime,
          ss.Price_Per_Seat, sc.Total_Seats
       ORDER BY ss.Show_DateTime ASC`,
      [req.managerTheatre.Theatre_Id]
    );

    return res.json(shows);
  } catch (err) {
    console.error('[MANAGER] Shows error:', err.message);
    return res.status(500).json({ error: 'Failed to load manager shows.' });
  }
});

router.post('/shows', async (req, res) => {
  const showDateTime = normalizeDateTime(req.body.Show_DateTime);
  const price = positiveNumber(req.body.Price_Per_Seat);
  const movieId = Number(req.body.Movie_Id);
  const screenId = Number(req.body.Screen_Id);

  if (!Number.isInteger(movieId) || !Number.isInteger(screenId) || !showDateTime || price === null) {
    return res.status(400).json({ error: 'Movie_Id, Screen_Id, Show_DateTime, and Price_Per_Seat are required.' });
  }

  try {
    const isOwnScreen = await screenBelongsToTheatre(screenId, req.managerTheatre.Theatre_Id);
    if (!isOwnScreen) {
      return res.status(403).json({ error: 'You can only schedule shows for your assigned theatre.' });
    }

    const [result] = await db.query(
      `INSERT INTO ShowSchedule (Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat)
       VALUES (?, ?, ?, ?)`,
      [movieId, screenId, showDateTime, price]
    );

    return res.status(201).json({ message: 'Show created successfully.', show_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That screen already has a show at this time.' });
    }

    console.error('[MANAGER] Create show error:', err.message);
    return res.status(500).json({ error: 'Failed to create show.' });
  }
});

router.patch('/shows/:id', async (req, res) => {
  const showId = Number(req.params.id);
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(req.body, 'Movie_Id')) updates.Movie_Id = Number(req.body.Movie_Id);
  if (Object.prototype.hasOwnProperty.call(req.body, 'Screen_Id')) updates.Screen_Id = Number(req.body.Screen_Id);
  if (Object.prototype.hasOwnProperty.call(req.body, 'Show_DateTime')) updates.Show_DateTime = normalizeDateTime(req.body.Show_DateTime);
  if (Object.prototype.hasOwnProperty.call(req.body, 'Price_Per_Seat')) updates.Price_Per_Seat = positiveNumber(req.body.Price_Per_Seat);

  const fields = Object.keys(updates);
  if (fields.length === 0 || Object.values(updates).some((value) => value === null || Number.isNaN(value))) {
    return res.status(400).json({ error: 'No valid show fields provided.' });
  }

  try {
    const isOwnShow = await showBelongsToTheatre(showId, req.managerTheatre.Theatre_Id);
    if (!isOwnShow) {
      return res.status(404).json({ error: 'Show not found for your theatre.' });
    }

    if (updates.Screen_Id) {
      const isOwnScreen = await screenBelongsToTheatre(updates.Screen_Id, req.managerTheatre.Theatre_Id);
      if (!isOwnScreen) {
        return res.status(403).json({ error: 'You can only move shows to screens in your assigned theatre.' });
      }
    }

    await db.query(
      `UPDATE ShowSchedule
       SET ${fields.map((field) => `${field} = ?`).join(', ')}
       WHERE Show_Id = ?`,
      [...fields.map((field) => updates[field]), showId]
    );

    return res.json({ message: 'Show updated successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That screen already has a show at this time.' });
    }

    console.error('[MANAGER] Update show error:', err.message);
    return res.status(500).json({ error: 'Failed to update show.' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT
          b.Booking_Id,
          b.Booking_Date,
          b.Status,
          b.Total_Amount,
          u.First_Name,
          u.Last_Name,
          u.Email,
          m.Title AS Movie_Title,
          ss.Show_DateTime,
          sc.Screen_Name,
          p.Payment_Status,
          p.Payment_Method,
          GROUP_CONCAT(CONCAT(s.Row_Label, s.Seat_Number) ORDER BY s.Row_Label, s.Seat_Number SEPARATOR ', ') AS Seats
       FROM Booking b
       JOIN Users u ON u.User_Id = b.User_Id
       JOIN ShowSchedule ss ON ss.Show_Id = b.Show_Id
       JOIN Movie m ON m.Movie_Id = ss.Movie_Id
       JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
       LEFT JOIN Payment p ON p.Booking_Id = b.Booking_Id
       LEFT JOIN BookingSeat bs ON bs.Booking_Id = b.Booking_Id
       LEFT JOIN Seat s ON s.Seat_Id = bs.Seat_Id
       WHERE sc.Theatre_Id = ?
       GROUP BY
          b.Booking_Id, b.Booking_Date, b.Status, b.Total_Amount,
          u.First_Name, u.Last_Name, u.Email, m.Title, ss.Show_DateTime,
          sc.Screen_Name, p.Payment_Status, p.Payment_Method
       ORDER BY b.Booking_Date DESC
       LIMIT 200`,
      [req.managerTheatre.Theatre_Id]
    );

    return res.json(bookings);
  } catch (err) {
    console.error('[MANAGER] Bookings error:', err.message);
    return res.status(500).json({ error: 'Failed to load manager bookings.' });
  }
});

router.patch('/bookings/:id/status', async (req, res) => {
  const bookingId = Number(req.params.id);
  const { Status } = req.body;

  if (!bookingStatuses.includes(Status)) {
    return res.status(400).json({ error: 'Invalid booking status.' });
  }

  const conn = await db.getConnection();
  let committed = false;

  try {
    await conn.beginTransaction();

    const [bookings] = await conn.query(
      `SELECT b.Booking_Id, b.Status
       FROM Booking b
       JOIN ShowSchedule ss ON ss.Show_Id = b.Show_Id
       JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
       WHERE b.Booking_Id = ?
         AND sc.Theatre_Id = ?
       FOR UPDATE`,
      [bookingId, req.managerTheatre.Theatre_Id]
    );

    if (bookings.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Booking not found for your theatre.' });
    }

    if (bookings[0].Status === 'cancelled' && Status !== 'cancelled') {
      await conn.rollback();
      return res.status(409).json({ error: 'Cancelled bookings cannot be restored because their seats were released.' });
    }

    if (Status === 'cancelled') {
      await conn.query('DELETE FROM BookingSeat WHERE Booking_Id = ?', [bookingId]);
    }

    await conn.query(
      `UPDATE Booking
       SET Status = ?
       WHERE Booking_Id = ?`,
      [Status, bookingId]
    );

    await conn.commit();
    committed = true;
    return res.json({ message: 'Booking status updated successfully.' });
  } catch (err) {
    if (!committed) await conn.rollback();
    console.error('[MANAGER] Update booking status error:', err.message);
    return res.status(500).json({ error: 'Failed to update booking status.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
