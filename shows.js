// =============================================================
// CineBook - backend/routes/shows.js
// GET /api/shows/:movie_id - upcoming shows for a movie
// =============================================================

const express = require('express');
const db      = require('../db/db');

const router = express.Router();

router.get('/:movie_id', async (req, res) => {
  const { movie_id } = req.params;

  try {
    const [shows] = await db.query(
      `SELECT
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
       WHERE ss.Movie_Id = ?
         AND ss.Show_DateTime >= NOW()
       GROUP BY
          ss.Show_Id, ss.Movie_Id, ss.Show_DateTime, ss.Price_Per_Seat,
          sc.Screen_Id, sc.Screen_Name, sc.Screen_Type, sc.Total_Seats,
          t.Theatre_Id, t.Name, t.City, t.Location
       ORDER BY ss.Show_DateTime ASC`,
      [movie_id]
    );

    return res.status(200).json(shows);

  } catch (err) {
    console.error('[SHOWS] Fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve show schedules.' });
  }
});

module.exports = router;
