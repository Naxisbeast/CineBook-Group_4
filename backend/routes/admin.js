const express = require('express');
const db = require('../db/db');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

const adminRoles = ['Administrator', 'System Administrator'];
const userRoles = ['Customer', 'Administrator', 'Cinema Manager', 'System Administrator'];
const bookingStatuses = ['pending', 'confirmed', 'cancelled'];

router.use(verifyToken, requireRole(adminRoles));

function normalizeDateTime(value) {
  const text = String(value || '').trim().replace('T', ' ');
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(text)) return null;
  return text.length === 16 ? `${text}:00` : text.slice(0, 19);
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

async function cancelBooking(bookingId, conn = db) {
  await conn.query('DELETE FROM BookingSeat WHERE Booking_Id = ?', [bookingId]);
  const [result] = await conn.query(
    `UPDATE Booking
     SET Status = 'cancelled'
     WHERE Booking_Id = ?`,
    [bookingId]
  );
  return result.affectedRows;
}

router.get('/summary', async (_req, res) => {
  try {
    const [[totals]] = await db.query(
      `SELECT
          (SELECT COUNT(*) FROM Movie) AS movie_count,
          (SELECT COUNT(*) FROM Users) AS user_count,
          (SELECT COUNT(*) FROM Theatre) AS theatre_count,
          (SELECT COUNT(*) FROM ShowSchedule) AS show_count,
          (SELECT COUNT(*) FROM Booking) AS booking_count,
          (SELECT COUNT(*) FROM Booking WHERE Status = 'pending') AS pending_bookings,
          (SELECT COUNT(*) FROM Booking WHERE Status = 'confirmed') AS confirmed_bookings,
          (SELECT COALESCE(SUM(Amount), 0) FROM Payment WHERE Payment_Status = 'successful') AS revenue`
    );

    const [topMovies] = await db.query(
      `SELECT
          m.Movie_Id,
          m.Title,
          COUNT(DISTINCT b.Booking_Id) AS booking_count,
          COALESCE(SUM(CASE WHEN b.Status = 'confirmed' THEN b.Total_Amount ELSE 0 END), 0) AS revenue
       FROM Movie m
       LEFT JOIN ShowSchedule ss ON ss.Movie_Id = m.Movie_Id
       LEFT JOIN Booking b ON b.Show_Id = ss.Show_Id
       GROUP BY m.Movie_Id, m.Title
       ORDER BY booking_count DESC, revenue DESC
       LIMIT 5`
    );

    const [recentPayments] = await db.query(
      `SELECT
          DATE(Payment_Date) AS payment_date,
          COALESCE(SUM(Amount), 0) AS revenue
       FROM Payment
       WHERE Payment_Status = 'successful'
       GROUP BY DATE(Payment_Date)
       ORDER BY payment_date DESC
       LIMIT 7`
    );

    return res.json({ totals, topMovies, recentPayments });
  } catch (err) {
    console.error('[ADMIN] Summary error:', err.message);
    return res.status(500).json({ error: 'Failed to load admin summary.' });
  }
});

router.get('/lookups', async (_req, res) => {
  try {
    const [movies] = await db.query(
      `SELECT Movie_Id, Title, Genre, Duration_Minutes, Age_Rating
       FROM Movie
       ORDER BY Title ASC`
    );

    const [theatres] = await db.query(
      `SELECT Theatre_Id, Name, City, Location
       FROM Theatre
       ORDER BY Name ASC`
    );

    const [screens] = await db.query(
      `SELECT
          sc.Screen_Id,
          sc.Screen_Name,
          sc.Screen_Type,
          sc.Total_Seats,
          sc.Theatre_Id,
          t.Name AS Theatre_Name,
          t.City AS Theatre_City
       FROM Screen sc
       JOIN Theatre t ON t.Theatre_Id = sc.Theatre_Id
       ORDER BY t.Name, sc.Screen_Name`
    );

    return res.json({ movies, theatres, screens });
  } catch (err) {
    console.error('[ADMIN] Lookups error:', err.message);
    return res.status(500).json({ error: 'Failed to load admin lookup data.' });
  }
});

router.get('/users', async (_req, res) => {
  try {
    const [users] = await db.query(
      `SELECT
          u.User_Id,
          u.First_Name,
          u.Last_Name,
          u.Email,
          u.Phone_Number,
          u.Role,
          u.Loyalty_Status,
          u.Created_At,
          u.Theatre_Id,
          t.Name AS Theatre_Name,
          t.City AS Theatre_City
       FROM Users u
       LEFT JOIN Theatre t ON t.Theatre_Id = u.Theatre_Id
       ORDER BY u.Created_At DESC`
    );

    return res.json(users);
  } catch (err) {
    console.error('[ADMIN] Users error:', err.message);
    return res.status(500).json({ error: 'Failed to load users.' });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  const userId = Number(req.params.id);
  const { Role, Theatre_Id } = req.body;

  if (!userRoles.includes(Role)) {
    return res.status(400).json({ error: 'Invalid user role.' });
  }

  if (Number(req.user.user_id) === userId && !adminRoles.includes(Role)) {
    return res.status(400).json({ error: 'You cannot remove your own administrator access.' });
  }

  const theatreId = Role === 'Cinema Manager' ? Number(Theatre_Id) : null;

  if (Role === 'Cinema Manager' && !Number.isInteger(theatreId)) {
    return res.status(400).json({ error: 'Cinema Managers must be assigned to a theatre.' });
  }

  try {
    if (Role === 'Cinema Manager') {
      const [theatres] = await db.query('SELECT Theatre_Id FROM Theatre WHERE Theatre_Id = ?', [theatreId]);
      if (theatres.length === 0) {
        return res.status(400).json({ error: 'Selected theatre does not exist.' });
      }
    }

    const [result] = await db.query(
      `UPDATE Users
       SET Role = ?, Theatre_Id = ?
       WHERE User_Id = ?`,
      [Role, theatreId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ message: 'User role updated successfully.' });
  } catch (err) {
    console.error('[ADMIN] Update user role error:', err.message);
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
});

router.get('/movies', async (_req, res) => {
  try {
    const [movies] = await db.query(
      `SELECT Movie_Id, Title, Genre, Duration_Minutes, Age_Rating,
              Description, Cast_Info, Poster_Url, Backdrop_Url,
              Language, Release_Date, Tagline, Rating
       FROM Movie
       ORDER BY Title ASC`
    );

    return res.json(movies);
  } catch (err) {
    console.error('[ADMIN] Movies error:', err.message);
    return res.status(500).json({ error: 'Failed to load movies.' });
  }
});

router.post('/movies', async (req, res) => {
  const {
    Title,
    Genre,
    Duration_Minutes,
    Age_Rating,
    Description,
    Cast_Info,
    Poster_Url,
    Backdrop_Url,
    Language,
    Release_Date,
    Tagline,
    Rating
  } = req.body;

  if (!Title || !Genre || !Duration_Minutes || !Age_Rating) {
    return res.status(400).json({ error: 'Title, Genre, Duration_Minutes, and Age_Rating are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Movie
         (Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info,
          Poster_Url, Backdrop_Url, Language, Release_Date, Tagline, Rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(Title).trim(),
        String(Genre).trim(),
        Number(Duration_Minutes),
        String(Age_Rating).trim(),
        Description || null,
        Cast_Info || null,
        Poster_Url || null,
        Backdrop_Url || null,
        Language || 'English',
        Release_Date || null,
        Tagline || null,
        Rating || null
      ]
    );

    return res.status(201).json({ message: 'Movie created successfully.', movie_id: result.insertId });
  } catch (err) {
    console.error('[ADMIN] Create movie error:', err.message);
    return res.status(500).json({ error: 'Failed to create movie.' });
  }
});

router.patch('/movies/:id', async (req, res) => {
  const allowedFields = [
    'Title',
    'Genre',
    'Duration_Minutes',
    'Age_Rating',
    'Description',
    'Cast_Info',
    'Poster_Url',
    'Backdrop_Url',
    'Language',
    'Release_Date',
    'Tagline',
    'Rating'
  ];

  const fields = allowedFields.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field));
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No movie fields provided.' });
  }

  const values = fields.map((field) => req.body[field] || null);

  try {
    const [result] = await db.query(
      `UPDATE Movie
       SET ${fields.map((field) => `${field} = ?`).join(', ')}
       WHERE Movie_Id = ?`,
      [...values, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    return res.json({ message: 'Movie updated successfully.' });
  } catch (err) {
    console.error('[ADMIN] Update movie error:', err.message);
    return res.status(500).json({ error: 'Failed to update movie.' });
  }
});

router.delete('/movies/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Movie WHERE Movie_Id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    return res.json({ message: 'Movie deleted successfully.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'This movie has show schedules and cannot be deleted.' });
    }

    console.error('[ADMIN] Delete movie error:', err.message);
    return res.status(500).json({ error: 'Failed to delete movie.' });
  }
});

router.get('/shows', async (_req, res) => {
  try {
    const [shows] = await db.query(
      `SELECT
          ss.Show_Id,
          ss.Movie_Id,
          m.Title AS Movie_Title,
          ss.Screen_Id,
          sc.Screen_Name,
          sc.Screen_Type,
          t.Theatre_Id,
          t.Name AS Theatre_Name,
          t.City AS Theatre_City,
          ss.Show_DateTime,
          ss.Price_Per_Seat,
          COUNT(bs.Seat_Id) AS Seats_Booked,
          sc.Total_Seats - COUNT(bs.Seat_Id) AS Seats_Remaining
       FROM ShowSchedule ss
       JOIN Movie m ON m.Movie_Id = ss.Movie_Id
       JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
       JOIN Theatre t ON t.Theatre_Id = sc.Theatre_Id
       LEFT JOIN BookingSeat bs ON bs.Show_Id = ss.Show_Id
       GROUP BY
          ss.Show_Id, ss.Movie_Id, m.Title, ss.Screen_Id,
          sc.Screen_Name, sc.Screen_Type, t.Theatre_Id, t.Name, t.City,
          ss.Show_DateTime, ss.Price_Per_Seat, sc.Total_Seats
       ORDER BY ss.Show_DateTime ASC`
    );

    return res.json(shows);
  } catch (err) {
    console.error('[ADMIN] Shows error:', err.message);
    return res.status(500).json({ error: 'Failed to load shows.' });
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

    console.error('[ADMIN] Create show error:', err.message);
    return res.status(500).json({ error: 'Failed to create show.' });
  }
});

router.patch('/shows/:id', async (req, res) => {
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
    const [result] = await db.query(
      `UPDATE ShowSchedule
       SET ${fields.map((field) => `${field} = ?`).join(', ')}
       WHERE Show_Id = ?`,
      [...fields.map((field) => updates[field]), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Show not found.' });
    }

    return res.json({ message: 'Show updated successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That screen already has a show at this time.' });
    }

    console.error('[ADMIN] Update show error:', err.message);
    return res.status(500).json({ error: 'Failed to update show.' });
  }
});

router.delete('/shows/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM ShowSchedule WHERE Show_Id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Show not found.' });
    }

    return res.json({ message: 'Show deleted successfully.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'This show has bookings and cannot be deleted. Cancel the bookings first.' });
    }

    console.error('[ADMIN] Delete show error:', err.message);
    return res.status(500).json({ error: 'Failed to delete show.' });
  }
});

router.get('/bookings', async (_req, res) => {
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
          t.Name AS Theatre_Name,
          t.City AS Theatre_City,
          p.Payment_Status,
          p.Payment_Method,
          p.Transaction_Reference,
          GROUP_CONCAT(CONCAT(s.Row_Label, s.Seat_Number) ORDER BY s.Row_Label, s.Seat_Number SEPARATOR ', ') AS Seats
       FROM Booking b
       JOIN Users u ON u.User_Id = b.User_Id
       JOIN ShowSchedule ss ON ss.Show_Id = b.Show_Id
       JOIN Movie m ON m.Movie_Id = ss.Movie_Id
       JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
       JOIN Theatre t ON t.Theatre_Id = sc.Theatre_Id
       LEFT JOIN Payment p ON p.Booking_Id = b.Booking_Id
       LEFT JOIN BookingSeat bs ON bs.Booking_Id = b.Booking_Id
       LEFT JOIN Seat s ON s.Seat_Id = bs.Seat_Id
       GROUP BY
          b.Booking_Id, b.Booking_Date, b.Status, b.Total_Amount,
          u.First_Name, u.Last_Name, u.Email, m.Title,
          ss.Show_DateTime, sc.Screen_Name, t.Name, t.City,
          p.Payment_Status, p.Payment_Method, p.Transaction_Reference
       ORDER BY b.Booking_Date DESC
       LIMIT 200`
    );

    return res.json(bookings);
  } catch (err) {
    console.error('[ADMIN] Bookings error:', err.message);
    return res.status(500).json({ error: 'Failed to load bookings.' });
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
      `SELECT Booking_Id, Status
       FROM Booking
       WHERE Booking_Id = ?
       FOR UPDATE`,
      [bookingId]
    );

    if (bookings.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (bookings[0].Status === 'cancelled' && Status !== 'cancelled') {
      await conn.rollback();
      return res.status(409).json({ error: 'Cancelled bookings cannot be restored because their seats were released.' });
    }

    if (Status === 'cancelled') {
      await cancelBooking(bookingId, conn);
    } else {
      await conn.query(
        `UPDATE Booking
         SET Status = ?
         WHERE Booking_Id = ?`,
        [Status, bookingId]
      );
    }

    await conn.commit();
    committed = true;
    return res.json({ message: 'Booking status updated successfully.' });
  } catch (err) {
    if (!committed) await conn.rollback();
    console.error('[ADMIN] Update booking status error:', err.message);
    return res.status(500).json({ error: 'Failed to update booking status.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
