// =============================================================
// CineBook - backend/routes/seats.js
// GET /api/seats/:show_id - seat availability for a show
// =============================================================

const express = require('express');
const db      = require('../db/db');

const router = express.Router();

router.get('/:show_id', async (req, res) => {
  const { show_id } = req.params;

  try {
    const [shows] = await db.query(
      `SELECT
          ss.Show_Id,
          ss.Movie_Id,
          ss.Screen_Id,
          ss.Show_DateTime,
          ss.Price_Per_Seat,
          m.Title,
          m.Genre,
          m.Duration_Minutes,
          m.Age_Rating,
          m.Description,
          m.Cast_Info,
          m.Poster_Url,
          m.Backdrop_Url,
          m.Language,
          m.Release_Date,
          m.Tagline,
          m.Rating,
          sc.Screen_Name,
          sc.Screen_Type,
          sc.Total_Seats,
          t.Theatre_Id,
          t.Name AS Theatre_Name,
          t.City AS City,
          t.Location AS Theatre_Location
       FROM ShowSchedule ss
       JOIN Movie m ON ss.Movie_Id = m.Movie_Id
       JOIN Screen sc ON ss.Screen_Id = sc.Screen_Id
       JOIN Theatre t ON sc.Theatre_Id = t.Theatre_Id
       WHERE ss.Show_Id = ?`,
      [show_id]
    );

    if (shows.length === 0) {
      return res.status(404).json({ error: 'Show not found.' });
    }

    const showRow = shows[0];

    const [seats] = await db.query(
      `SELECT
          s.Seat_Id,
          s.Row_Label,
          s.Seat_Number,
          s.Seat_Type,
          CASE WHEN bs.Seat_Id IS NOT NULL THEN 'booked' ELSE 'available' END AS status
       FROM Seat s
       LEFT JOIN BookingSeat bs
         ON bs.Seat_Id = s.Seat_Id
        AND bs.Show_Id = ?
       WHERE s.Screen_Id = ?
       ORDER BY s.Row_Label ASC, s.Seat_Number ASC`,
      [show_id, showRow.Screen_Id]
    );

    return res.status(200).json({
      show_id        : showRow.Show_Id,
      movie: {
        Movie_Id          : showRow.Movie_Id,
        Title             : showRow.Title,
        Genre             : showRow.Genre,
        Duration_Minutes  : showRow.Duration_Minutes,
        Age_Rating        : showRow.Age_Rating,
        Description       : showRow.Description,
        Cast_Info         : showRow.Cast_Info,
        Poster_Url        : showRow.Poster_Url,
        Backdrop_Url      : showRow.Backdrop_Url,
        Language          : showRow.Language,
        Release_Date      : showRow.Release_Date,
        Tagline           : showRow.Tagline,
        Rating            : showRow.Rating
      },
      show: {
        Show_Id           : showRow.Show_Id,
        Movie_Id          : showRow.Movie_Id,
        Screen_Id         : showRow.Screen_Id,
        Show_DateTime     : showRow.Show_DateTime,
        Price_Per_Seat    : showRow.Price_Per_Seat,
        Screen_Name       : showRow.Screen_Name,
        Screen_Type       : showRow.Screen_Type,
        Total_Seats       : showRow.Total_Seats,
        Theatre_Id        : showRow.Theatre_Id,
        Theatre_Name      : showRow.Theatre_Name,
        City              : showRow.City,
        Theatre_Location  : showRow.Theatre_Location
      },
      seats
    });

  } catch (err) {
    console.error('[SEATS] Fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve seat availability.' });
  }
});

module.exports = router;
