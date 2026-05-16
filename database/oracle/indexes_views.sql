-- =============================================================
-- CineBook Phase 3 - Oracle indexes and views
-- Run after schema.sql and seed.sql.
-- =============================================================

SET DEFINE OFF;

BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_revenue_by_movie'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_booking_history'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW vw_upcoming_shows'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

BEGIN EXECUTE IMMEDIATE 'DROP INDEX idx_movie_genre'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP INDEX idx_show_movie_datetime'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP INDEX idx_booking_user_status'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP INDEX idx_payment_status_date'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

CREATE INDEX idx_movie_genre ON Movie (Genre);
CREATE INDEX idx_show_movie_datetime ON ShowSchedule (Movie_Id, Show_DateTime);
CREATE INDEX idx_booking_user_status ON Booking (User_Id, Status);
CREATE INDEX idx_payment_status_date ON Payment (Payment_Status, Payment_Date);

CREATE OR REPLACE VIEW vw_upcoming_shows AS
SELECT
    ss.Show_Id,
    m.Movie_Id,
    m.Title AS Movie_Title,
    m.Genre,
    m.Age_Rating,
    ss.Show_DateTime,
    ss.Price_Per_Seat,
    t.Theatre_Id,
    t.Name AS Theatre_Name,
    t.City,
    sc.Screen_Id,
    sc.Screen_Name,
    sc.Screen_Type,
    sc.Total_Seats,
    COUNT(bs.Seat_Id) AS Seats_Booked,
    sc.Total_Seats - COUNT(bs.Seat_Id) AS Seats_Remaining
FROM ShowSchedule ss
JOIN Movie m ON m.Movie_Id = ss.Movie_Id
JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
JOIN Theatre t ON t.Theatre_Id = sc.Theatre_Id
LEFT JOIN BookingSeat bs ON bs.Show_Id = ss.Show_Id
GROUP BY
    ss.Show_Id, m.Movie_Id, m.Title, m.Genre, m.Age_Rating,
    ss.Show_DateTime, ss.Price_Per_Seat,
    t.Theatre_Id, t.Name, t.City,
    sc.Screen_Id, sc.Screen_Name, sc.Screen_Type, sc.Total_Seats;

CREATE OR REPLACE VIEW vw_booking_history AS
SELECT
    b.Booking_Id,
    b.Booking_Date,
    b.Status AS Booking_Status,
    b.Total_Amount,
    u.User_Id,
    u.First_Name || ' ' || u.Last_Name AS Customer_Name,
    u.Email,
    m.Title AS Movie_Title,
    ss.Show_DateTime,
    t.Name AS Theatre_Name,
    t.City,
    sc.Screen_Name,
    LISTAGG(s.Row_Label || s.Seat_Number, ', ')
        WITHIN GROUP (ORDER BY s.Row_Label, s.Seat_Number) AS Seats,
    p.Payment_Status,
    p.Payment_Method,
    p.Transaction_Reference
FROM Booking b
JOIN Users u ON u.User_Id = b.User_Id
JOIN ShowSchedule ss ON ss.Show_Id = b.Show_Id
JOIN Movie m ON m.Movie_Id = ss.Movie_Id
JOIN Screen sc ON sc.Screen_Id = ss.Screen_Id
JOIN Theatre t ON t.Theatre_Id = sc.Theatre_Id
LEFT JOIN BookingSeat bs ON bs.Booking_Id = b.Booking_Id
LEFT JOIN Seat s ON s.Seat_Id = bs.Seat_Id
LEFT JOIN Payment p ON p.Booking_Id = b.Booking_Id
GROUP BY
    b.Booking_Id, b.Booking_Date, b.Status, b.Total_Amount,
    u.User_Id, u.First_Name, u.Last_Name, u.Email,
    m.Title, ss.Show_DateTime, t.Name, t.City, sc.Screen_Name,
    p.Payment_Status, p.Payment_Method, p.Transaction_Reference;

CREATE OR REPLACE VIEW vw_revenue_by_movie AS
SELECT
    m.Movie_Id,
    m.Title AS Movie_Title,
    m.Genre,
    COUNT(DISTINCT b.Booking_Id) AS Confirmed_Bookings,
    NVL(SUM(p.Amount), 0) AS Total_Revenue,
    ROUND(NVL(AVG(p.Amount), 0), 2) AS Average_Revenue
FROM Movie m
JOIN ShowSchedule ss ON ss.Movie_Id = m.Movie_Id
JOIN Booking b ON b.Show_Id = ss.Show_Id
JOIN Payment p ON p.Booking_Id = b.Booking_Id
WHERE b.Status = 'confirmed'
  AND p.Payment_Status = 'successful'
GROUP BY m.Movie_Id, m.Title, m.Genre;

SELECT index_name, table_name
FROM user_indexes
WHERE index_name IN (
    'IDX_MOVIE_GENRE',
    'IDX_SHOW_MOVIE_DATETIME',
    'IDX_BOOKING_USER_STATUS',
    'IDX_PAYMENT_STATUS_DATE'
)
ORDER BY index_name;

SELECT view_name
FROM user_views
WHERE view_name IN (
    'VW_UPCOMING_SHOWS',
    'VW_BOOKING_HISTORY',
    'VW_REVENUE_BY_MOVIE'
)
ORDER BY view_name;
