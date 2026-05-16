// =============================================================
// CineBook - backend/routes/movies.js
// Movie routes
// GET /api/movies      - all movies
// GET /api/movies/:id  - one movie with its upcoming shows
// =============================================================

const express = require('express');
const db      = require('../db/db');

const router = express.Router();

const showSelect = `
  SELECT
    ss.Show_Id,
    ss.Movie_Id,
    ss.Show_DateTime,
    ss.Price_Per_Seat,
    sc.Screen_Id,
    sc.Screen_Name,
    sc.Screen_Type,
    sc.Total_Seats,
    t.Theatre_Id,
    t.Name AS Theatre_Name,
    t.City AS City,
    t.City AS Theatre_City,
    t.Location AS Theatre_Location,
    COUNT(bs.Seat_Id) AS Seats_Booked,
    sc.Total_Seats - COUNT(bs.Seat_Id) AS Seats_Remaining,
    CASE WHEN COUNT(bs.Seat_Id) >= sc.Total_Seats THEN 1 ELSE 0 END AS Sold_Out
  FROM ShowSchedule ss
  JOIN Screen sc ON ss.Screen_Id = sc.Screen_Id
  JOIN Theatre t ON sc.Theatre_Id = t.Theatre_Id
  LEFT JOIN BookingSeat bs ON bs.Show_Id = ss.Show_Id
`;

// GET /api/movies
router.get('/', async (_req, res) => {
  try {
    const [movies] = await db.query(
      `SELECT Movie_Id, Title, Genre, Duration_Minutes, Age_Rating,
              Description, Cast_Info, Poster_Url, Backdrop_Url,
              Language, Release_Date, Tagline, Rating
       FROM Movie
       ORDER BY Title ASC`
    );

    return res.status(200).json(movies);
  } catch (err) {
    console.error('[MOVIES] Fetch all error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve movies.' });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [movies] = await db.query(
      `SELECT Movie_Id, Title, Genre, Duration_Minutes, Age_Rating,
              Description, Cast_Info, Poster_Url, Backdrop_Url,
              Language, Release_Date, Tagline, Rating
       FROM Movie
       WHERE Movie_Id = ?`,
      [id]
    );

    if (movies.length === 0) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const [shows] = await db.query(
      `${showSelect}
       WHERE ss.Movie_Id = ?
         AND ss.Show_DateTime >= NOW()
       GROUP BY
         ss.Show_Id, ss.Movie_Id, ss.Show_DateTime, ss.Price_Per_Seat,
         sc.Screen_Id, sc.Screen_Name, sc.Screen_Type, sc.Total_Seats,
         t.Theatre_Id, t.Name, t.City, t.Location
       ORDER BY ss.Show_DateTime ASC`,
      [id]
    );

    return res.status(200).json({ movie: movies[0], shows });

  } catch (err) {
    console.error('[MOVIES] Fetch single error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve movie.' });
  }
});

module.exports = router;
