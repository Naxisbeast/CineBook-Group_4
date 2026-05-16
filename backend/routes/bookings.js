// =============================================================
// CineBook - backend/routes/bookings.js
// GET  /api/bookings/my-bookings - logged-in user's booking history
// POST /api/bookings             - create a booking transactionally
// =============================================================

const express     = require('express');
const rateLimit   = require('express-rate-limit');
const db          = require('../db/db');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 20,
  message : { error: 'Too many booking requests. Please try again later.' }
});

function seatPrice(pricePerSeat, seatType) {
  const base = Number(pricePerSeat);
  if (seatType === 'VIP') return Math.round(base * 1.7);
  if (seatType === 'Premium') return Math.round(base * 1.25);
  return base;
}

// GET /api/bookings/my-bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [bookings] = await db.query(
      `SELECT
          b.Booking_Id,
          b.Booking_Date,
          b.Status AS Booking_Status,
          b.Total_Amount,
          m.Title AS Movie_Title,
          m.Poster_Url,
          m.Duration_Minutes,
          ss.Show_DateTime,
          sc.Screen_Name,
          t.Name AS Theatre_Name,
          t.City AS City,
          t.City AS Theatre_City,
          p.Payment_Id,
          p.Payment_Status,
          p.Payment_Method,
          p.Payment_Date,
          p.Transaction_Reference,
          GROUP_CONCAT(CONCAT(s.Row_Label, s.Seat_Number) ORDER BY s.Row_Label, s.Seat_Number SEPARATOR ', ') AS Seats
       FROM Booking b
       JOIN ShowSchedule ss ON b.Show_Id = ss.Show_Id
       JOIN Movie m ON ss.Movie_Id = m.Movie_Id
       JOIN Screen sc ON ss.Screen_Id = sc.Screen_Id
       JOIN Theatre t ON sc.Theatre_Id = t.Theatre_Id
       LEFT JOIN BookingSeat bs ON bs.Booking_Id = b.Booking_Id
       LEFT JOIN Seat s ON bs.Seat_Id = s.Seat_Id
       LEFT JOIN Payment p ON p.Booking_Id = b.Booking_Id
       WHERE b.User_Id = ?
       GROUP BY
          b.Booking_Id, b.Booking_Date, b.Status, b.Total_Amount,
          m.Title, m.Poster_Url, m.Duration_Minutes,
          ss.Show_DateTime, sc.Screen_Name,
          t.Name, t.City,
          p.Payment_Id, p.Payment_Status, p.Payment_Method, p.Payment_Date, p.Transaction_Reference
       ORDER BY b.Booking_Date DESC`,
      [user_id]
    );

    return res.status(200).json(bookings);

  } catch (err) {
    console.error('[BOOKINGS] my-bookings error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
});

// POST /api/bookings
router.post('/', verifyToken, bookingLimiter, async (req, res) => {
  const user_id = req.user.user_id;
  const { show_id, seat_ids } = req.body;

  if (!show_id || !Array.isArray(seat_ids) || seat_ids.length === 0) {
    return res.status(400).json({ error: 'show_id and a non-empty seat_ids array are required.' });
  }

  const uniqueSeatIds = [...new Set(seat_ids.map(Number))].filter(Number.isInteger);

  if (uniqueSeatIds.length !== seat_ids.length) {
    return res.status(400).json({ error: 'seat_ids must contain unique numeric seat ids.' });
  }

  const conn = await db.getConnection();
  let committed = false;

  try {
    await conn.beginTransaction();

    const [shows] = await conn.query(
      `SELECT Show_Id, Price_Per_Seat, Screen_Id
       FROM ShowSchedule
       WHERE Show_Id = ?`,
      [show_id]
    );

    if (shows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Show not found.' });
    }

    const show = shows[0];
    const placeholders = uniqueSeatIds.map(() => '?').join(', ');
    const [seats] = await conn.query(
      `SELECT Seat_Id, Row_Label, Seat_Number, Seat_Type
       FROM Seat
       WHERE Screen_Id = ?
         AND Seat_Id IN (${placeholders})
       ORDER BY Row_Label, Seat_Number`,
      [show.Screen_Id, ...uniqueSeatIds]
    );

    if (seats.length !== uniqueSeatIds.length) {
      await conn.rollback();
      return res.status(400).json({ error: 'One or more selected seats do not belong to this show.' });
    }

    const total_amount = seats.reduce(
      (sum, seat) => sum + seatPrice(show.Price_Per_Seat, seat.Seat_Type),
      0
    );

    const [bookingResult] = await conn.query(
      `INSERT INTO Booking (User_Id, Show_Id, Total_Amount, Status)
       VALUES (?, ?, ?, 'pending')`,
      [user_id, show_id, total_amount]
    );

    const booking_id = bookingResult.insertId;

    for (const seat_id of uniqueSeatIds) {
      await conn.query(
        `INSERT INTO BookingSeat (Booking_Id, Seat_Id, Show_Id)
         VALUES (?, ?, ?)`,
        [booking_id, seat_id, show_id]
      );
    }

    await conn.commit();
    committed = true;

    return res.status(201).json({
      message      : 'Booking created successfully.',
      booking_id,
      total_amount,
      seats
    });

  } catch (err) {
    if (!committed) await conn.rollback();

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'One or more of the selected seats has just been booked by someone else. Please choose different seats.'
      });
    }

    console.error('[BOOKINGS] Create booking error:', err.message);
    return res.status(500).json({ error: 'Failed to create booking.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
