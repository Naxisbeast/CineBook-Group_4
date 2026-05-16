// =============================================================
// CineBook - backend/routes/payments.js
// POST /api/payments - record payment and confirm booking
// =============================================================

const express     = require('express');
const rateLimit   = require('express-rate-limit');
const db          = require('../db/db');
const verifyToken = require('../middleware/verifyToken');
const { sendTicketEmail } = require('../services/emailService');

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 10,
  message : { error: 'Too many payment requests. Please try again later.' }
});

function normalizePaymentMethod(method) {
  const value = String(method || '').trim().toLowerCase();
  if (value === 'card') return 'Card';
  if (value === 'eft') return 'EFT';
  if (value === 'cash') return 'Cash';
  return null;
}

async function loadTicketDetails(paymentId) {
  const [rows] = await db.query(
    `SELECT
        p.Payment_Id,
        p.Amount,
        p.Payment_Method,
        p.Transaction_Reference,
        p.Payment_Date,
        b.Booking_Id,
        b.Total_Amount,
        u.First_Name,
        u.Last_Name,
        u.Email,
        m.Title AS Movie_Title,
        ss.Show_DateTime,
        sc.Screen_Name,
        t.Name AS Theatre_Name,
        t.City AS Theatre_City,
        t.Location AS Theatre_Location,
        GROUP_CONCAT(CONCAT(s.Row_Label, s.Seat_Number) ORDER BY s.Row_Label, s.Seat_Number SEPARATOR ', ') AS Seats
     FROM Payment p
     JOIN Booking b ON b.Booking_Id = p.Booking_Id
     JOIN Users u ON u.User_Id = b.User_Id
     JOIN ShowSchedule ss ON ss.Show_Id = b.Show_Id
     JOIN Movie m ON m.Movie_Id = ss.Movie_Id
     JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
     JOIN Theatre t ON t.Theatre_Id = sc.Theatre_Id
     LEFT JOIN BookingSeat bs ON bs.Booking_Id = b.Booking_Id
     LEFT JOIN Seat s ON s.Seat_Id = bs.Seat_Id
     WHERE p.Payment_Id = ?
     GROUP BY
        p.Payment_Id, p.Amount, p.Payment_Method, p.Transaction_Reference,
        p.Payment_Date, b.Booking_Id, b.Total_Amount,
        u.First_Name, u.Last_Name, u.Email, m.Title,
        ss.Show_DateTime, sc.Screen_Name, t.Name, t.City, t.Location`,
    [paymentId]
  );

  return rows[0] || null;
}

// POST /api/payments
router.post('/', verifyToken, paymentLimiter, async (req, res) => {
  const user_id = Number(req.user.user_id);
  const { booking_id, payment_method } = req.body;
  const method = normalizePaymentMethod(payment_method);

  if (!booking_id || !method) {
    return res.status(400).json({ error: 'booking_id and a valid payment_method are required.' });
  }

  const conn = await db.getConnection();
  let committed = false;

  try {
    await conn.beginTransaction();

    const [bookings] = await conn.query(
      `SELECT Booking_Id, User_Id, Total_Amount, Status
       FROM Booking
       WHERE Booking_Id = ?
       FOR UPDATE`,
      [booking_id]
    );

    if (bookings.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const booking = bookings[0];

    if (Number(booking.User_Id) !== user_id) {
      await conn.rollback();
      return res.status(403).json({ error: 'You are not authorised to pay for this booking.' });
    }

    if (booking.Status === 'confirmed') {
      await conn.rollback();
      return res.status(409).json({ error: 'This booking has already been paid.' });
    }

    if (booking.Status === 'cancelled') {
      await conn.rollback();
      return res.status(409).json({ error: 'This booking has been cancelled and cannot be paid.' });
    }

    const transaction_ref = `CB-${Date.now()}-${booking_id}`;

    const [paymentResult] = await conn.query(
      `INSERT INTO Payment
         (Booking_Id, Amount, Payment_Method, Payment_Status, Transaction_Reference, Payment_Date)
       VALUES (?, ?, ?, 'successful', ?, NOW())`,
      [booking_id, booking.Total_Amount, method, transaction_ref]
    );

    await conn.query(
      `UPDATE Booking
       SET Status = 'confirmed'
       WHERE Booking_Id = ?`,
      [booking_id]
    );

    await conn.commit();
    committed = true;

    let emailResult = { mode: 'not_attempted', sent: false };
    try {
      const ticket = await loadTicketDetails(paymentResult.insertId);
      if (ticket) {
        emailResult = await sendTicketEmail(ticket);
      }
    } catch (emailErr) {
      emailResult = {
        mode: 'error',
        sent: false,
        userMessage: 'Ticket email could not be sent, but your booking is confirmed.'
      };
      console.error('[EMAIL] Ticket confirmation error:', emailErr.message);
    }

    return res.status(201).json({
      message               : 'Payment successful. Booking confirmed.',
      payment_id            : paymentResult.insertId,
      booking_id            : Number(booking_id),
      amount                : booking.Total_Amount,
      payment_method        : method,
      transaction_reference : transaction_ref,
      email_sent            : emailResult.sent,
      email_status          : emailResult.mode,
      email_message         : emailResult.userMessage || null
    });

  } catch (err) {
    if (!committed) await conn.rollback();

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A payment for this booking already exists.' });
    }

    console.error('[PAYMENTS] Error:', err.message);
    return res.status(500).json({ error: 'Failed to process payment.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
