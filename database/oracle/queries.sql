-- =============================================================
-- CineBook Phase 3 - Oracle query pack
-- Run after schema.sql, seed.sql, and indexes_views.sql.
-- These 10 queries map to the Phase 3 rubric categories.
-- =============================================================

SET DEFINE OFF;

-- Query 1: Movie catalogue with filtering, limited columns, and sorting.
SELECT
    Movie_Id,
    Title,
    Genre,
    Duration_Minutes,
    Age_Rating
FROM Movie
WHERE Genre IN ('Action', 'Horror', 'Adventure')
ORDER BY Title ASC;

-- Query 2: Search movies using LIKE, AND, OR plus character functions.
SELECT
    Movie_Id,
    INITCAP(Title) AS Display_Title,
    UPPER(Genre) AS Genre_Label,
    SUBSTR(Age_Rating, 1, 5) AS Rating_Code
FROM Movie
WHERE (LOWER(Title) LIKE '%movie%' OR LOWER(Title) LIKE '%dragon%')
  AND Duration_Minutes >= 100
ORDER BY Genre_Label, Display_Title;

-- Query 3: Upcoming shows with date functions and row limiting.
SELECT
    Show_Id,
    Movie_Title,
    Theatre_Name,
    City,
    TO_CHAR(Show_DateTime, 'Dy DD Mon YYYY HH24:MI') AS Show_Time,
    TRUNC(Show_DateTime) - TRUNC(SYSDATE) AS Days_From_Today,
    Price_Per_Seat
FROM vw_upcoming_shows
WHERE Show_DateTime >= SYSTIMESTAMP
ORDER BY Show_DateTime ASC
FETCH FIRST 8 ROWS ONLY;

-- Query 4: Available seat map for a specific show.
SELECT
    s.Seat_Id,
    s.Row_Label || s.Seat_Number AS Seat_Label,
    s.Seat_Type,
    CASE WHEN bs.Seat_Id IS NULL THEN 'available' ELSE 'booked' END AS Seat_Status
FROM Seat s
JOIN ShowSchedule ss ON ss.Screen_Id = s.Screen_Id
LEFT JOIN BookingSeat bs
    ON bs.Seat_Id = s.Seat_Id
   AND bs.Show_Id = ss.Show_Id
WHERE ss.Show_Id = 1
ORDER BY s.Row_Label, s.Seat_Number;

-- Query 5: Booking history using 4+ table joins.
SELECT
    Booking_Id,
    Customer_Name,
    Email,
    Movie_Title,
    Theatre_Name,
    City,
    Seats,
    Booking_Status,
    Payment_Status,
    Total_Amount
FROM vw_booking_history
WHERE User_Id = 5
ORDER BY Booking_Date DESC;

-- Query 6: Seat occupancy per show with aggregate functions and rounding.
SELECT
    Show_Id,
    Movie_Title,
    Theatre_Name,
    Screen_Name,
    Total_Seats,
    Seats_Booked,
    Seats_Remaining,
    ROUND((Seats_Booked / Total_Seats) * 100, 1) AS Occupancy_Percentage
FROM vw_upcoming_shows
ORDER BY Occupancy_Percentage DESC, Show_DateTime ASC;

-- Query 7: Group by and having for popular movies.
SELECT
    m.Movie_Id,
    m.Title AS Movie_Title,
    COUNT(DISTINCT b.Booking_Id) AS Confirmed_Bookings,
    COUNT(bs.Seat_Id) AS Seats_Sold
FROM Movie m
JOIN ShowSchedule ss ON ss.Movie_Id = m.Movie_Id
JOIN Booking b ON b.Show_Id = ss.Show_Id
LEFT JOIN BookingSeat bs ON bs.Booking_Id = b.Booking_Id
WHERE b.Status = 'confirmed'
GROUP BY m.Movie_Id, m.Title
HAVING COUNT(bs.Seat_Id) >= 2
ORDER BY Seats_Sold DESC;

-- Query 8: Revenue by movie from the revenue view.
SELECT
    Movie_Title,
    Genre,
    Confirmed_Bookings,
    Total_Revenue,
    Average_Revenue
FROM vw_revenue_by_movie
WHERE Total_Revenue > 0
ORDER BY Total_Revenue DESC;

-- Query 9: Subquery showing customers whose spend is above the average booking amount.
SELECT
    u.User_Id,
    u.First_Name || ' ' || u.Last_Name AS Customer_Name,
    u.Loyalty_Status,
    SUM(b.Total_Amount) AS Total_Spent
FROM Users u
JOIN Booking b ON b.User_Id = u.User_Id
WHERE b.Status = 'confirmed'
GROUP BY u.User_Id, u.First_Name, u.Last_Name, u.Loyalty_Status
HAVING SUM(b.Total_Amount) > (
    SELECT AVG(Total_Amount)
    FROM Booking
    WHERE Status = 'confirmed'
)
ORDER BY Total_Spent DESC;

-- Query 10: Monthly payment report using date, aggregate, round, and truncation functions.
SELECT
    TO_CHAR(TRUNC(Payment_Date, 'MM'), 'YYYY-MM') AS Revenue_Month,
    COUNT(Payment_Id) AS Successful_Payments,
    SUM(Amount) AS Total_Revenue,
    ROUND(AVG(Amount), 2) AS Average_Payment,
    TRUNC(MAX(Amount), 0) AS Highest_Whole_Rand
FROM Payment
WHERE Payment_Status = 'successful'
  AND Payment_Date IS NOT NULL
GROUP BY TRUNC(Payment_Date, 'MM')
ORDER BY Revenue_Month ASC;
