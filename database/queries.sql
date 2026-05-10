-- database/queries.sql
-- 10 useful SQL queries for the CineBook Online Movie Ticket Booking System.
-- Each query is preceded by a comment explaining its purpose.

--USE cinebook_db;

-- Query 1: Get all movies
-- Returns the full catalogue of movies ordered alphabetically.

-- Query 2: Get all shows for a specific movie
-- Returns show schedule rows including theatre name, city, screen name, date, time, and price for a given movie_id.

-- Query 3: Get available seats for a specific show
-- Returns all seats for the show's screen, each labelled as 'available' or 'booked', for a given show_id.

-- Query 4: Get a user's full booking history
-- Returns all bookings for a given user_id with movie title, show date/time, theatre, total amount, booking status, and payment status.

-- Query 5: Total revenue per movie
-- Aggregates completed payment amounts grouped by movie title, showing total bookings and total revenue per movie.

-- Query 6: Seat occupancy rate per show
-- Returns each show with total seats, number of booked seats, and the occupancy percentage.
SELECT
    ss.Show_Id,
    m.Title AS Movie_Title,
    sc.Screen_Name,
    sc.Total_Seats,
    NVL(bs_confirmed.Booked_Seats, 0) AS Booked_Seats,
    ROUND(NVL(bs_confirmed.Booked_Seats, 0) * 100.0 / NULLIF(sc.Total_Seats, 0), 2) AS Occupancy_Percentage
FROM ShowSchedule ss
JOIN Screen sc ON ss.Screen_Id = sc.Screen_Id
JOIN Movie m ON ss.Movie_Id = m.Movie_Id
LEFT JOIN (
    SELECT
        bs.Show_Id,
        COUNT(DISTINCT bs.Seat_Id) AS Booked_Seats
    FROM BookingSeat bs
    JOIN Booking b ON bs.Booking_Id = b.Booking_Id
    WHERE b.Status = 'confirmed'
    GROUP BY bs.Show_Id
) bs_confirmed ON ss.Show_Id = bs_confirmed.Show_Id
ORDER BY Occupancy_Percentage DESC;
/


-- Query 7: Top 3 most booked movies
-- Counts confirmed bookings per movie and returns only the top 3 by booking count.
SELECT
    m.Movie_Id,
    m.Title AS Movie_Title,
    COUNT(b.Booking_Id) AS Booking_Count
FROM Movie m
JOIN ShowSchedule ss ON m.Movie_Id = ss.Movie_Id
JOIN Booking b ON ss.Show_Id = b.Show_Id
WHERE b.Status = 'confirmed'
GROUP BY m.Movie_Id, m.Title
ORDER BY Booking_Count DESC
FETCH FIRST 3 ROWS ONLY;
/


-- Query 8: All bookings with their payment status
-- Returns a full admin overview joining bookings, users, movies, show schedules, and payments.
SELECT
    b.Booking_Id,
    u.First_Name || ' ' || u.Last_Name AS Customer_Name,
    u.Email,
    m.Title AS Movie_Title,
    ss.Show_DateTime,
    b.Total_Amount,
    b.Status AS Booking_Status,
    b.Booking_Date,
    p.Payment_Status,
    p.Payment_Method,
    p.Transaction_Reference,
    p.Payment_Date
FROM Booking b
JOIN Users u ON b.User_Id = u.User_Id
JOIN ShowSchedule ss ON b.Show_Id = ss.Show_Id
JOIN Movie m ON ss.Movie_Id = m.Movie_Id
LEFT JOIN Payment p ON b.Booking_Id = p.Booking_Id
ORDER BY b.Booking_Date DESC;
/


-- Query 9: Shows with remaining seats
-- Lists only upcoming shows that still have at least one seat available, including the remaining seat count.
SELECT
    ss.Show_Id,
    m.Title AS Movie_Title,
    sc.Screen_Name,
    ss.Show_DateTime,
    sc.Total_Seats,
    NVL(bs_confirmed.Booked_Seats, 0) AS Booked_Seats,
    (sc.Total_Seats - NVL(bs_confirmed.Booked_Seats, 0)) AS Remaining_Seats
FROM ShowSchedule ss
JOIN Screen sc ON ss.Screen_Id = sc.Screen_Id
JOIN Movie m ON ss.Movie_Id = m.Movie_Id
LEFT JOIN (
    SELECT
        bs.Show_Id,
        COUNT(DISTINCT bs.Seat_Id) AS Booked_Seats
    FROM BookingSeat bs
    JOIN Booking b ON bs.Booking_Id = b.Booking_Id
    WHERE b.Status = 'confirmed'
    GROUP BY bs.Show_Id
) bs_confirmed ON ss.Show_Id = bs_confirmed.Show_Id
WHERE ss.Show_DateTime > CURRENT_TIMESTAMP
  AND (sc.Total_Seats - NVL(bs_confirmed.Booked_Seats, 0)) > 0
ORDER BY ss.Show_DateTime ASC;
/


-- Query 10: Monthly revenue report
-- Summarises completed payment revenue grouped by month, showing total payments, total revenue, and average payment per month.
SELECT
    EXTRACT(YEAR FROM p.Payment_Date) AS Year,
    EXTRACT(MONTH FROM p.Payment_Date) AS Month,
    TO_CHAR(p.Payment_Date, 'YYYY-Month') AS Year_Month,
    COUNT(p.Payment_Id) AS Total_Payments,
    SUM(p.Amount) AS Total_Revenue,
    ROUND(AVG(p.Amount), 2) AS Average_Payment_Amount
FROM Payment p
WHERE p.Payment_Status = 'successful'
  AND p.Payment_Date IS NOT NULL
GROUP BY EXTRACT(YEAR FROM p.Payment_Date),
         EXTRACT(MONTH FROM p.Payment_Date),
         TO_CHAR(p.Payment_Date, 'YYYY-Month')
ORDER BY Year, Month;
/