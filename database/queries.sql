USE cinebook;


-- =============================================================
-- QUERY 1: Get all movies
-- Purpose : Returns the full movie catalogue ordered alphabetically.
--           Used by the homepage and admin movie management screen.
-- Returns : Movie_Id, Title, Genre, Duration_Minutes, Age_Rating,
--           Language, Release_Date, Poster_Url, Description
-- Params  : None
-- =============================================================
SELECT
    m.Movie_Id,
    m.Title,
    m.Genre,
    m.Duration_Minutes,
    m.Age_Rating,
    m.Language,
    m.Release_Date,
    m.Poster_Url,
    m.Description
FROM
    Movie m
ORDER BY
    m.Title ASC;


-- =============================================================
-- QUERY 2: Get all shows for a specific movie
-- Purpose : Returns every scheduled show for one movie including
--           the theatre location, screen type, date/time and price.
--           Used by MoviePage to populate the "Select a Show" section.
-- Returns : Show_Id, Show_DateTime, Price_Per_Seat, Theatre_Name,
--           City, Theatre_Location, Screen_Name, Screen_Type, Total_Seats
-- Params  : Replace ? with Movie_Id  e.g. 1
-- =============================================================
SELECT
    ss.Show_Id,
    ss.Show_DateTime,
    ss.Price_Per_Seat,
    t.Name          AS Theatre_Name,
    t.City,
    t.Location      AS Theatre_Location,
    sc.Screen_Name,
    sc.Screen_Type,
    sc.Total_Seats
FROM
    ShowSchedule ss
    JOIN Screen  sc ON sc.Screen_Id  = ss.Screen_Id
    JOIN Theatre t  ON t.Theatre_Id  = sc.Theatre_Id
WHERE
    ss.Movie_Id       = ?
    AND ss.Show_DateTime > NOW()
ORDER BY
    ss.Show_DateTime ASC;


-- =============================================================
-- QUERY 3: Get available seats for a specific show
-- Purpose : Returns every seat on the screen running the given show.
--           Each seat is labelled 'available' or 'booked'.
--           The UNIQUE(Show_Id, Seat_Id) constraint on BookingSeat
--           means a seat can only appear once per show — the LEFT JOIN
--           correctly identifies which seats are taken.
-- Returns : Seat_Id, Row_Label, Seat_Number, Seat_Type, status
-- Params  : Replace both ? with the same Show_Id  e.g. 1
-- =============================================================
SELECT
    s.Seat_Id,
    s.Row_Label,
    s.Seat_Number,
    s.Seat_Type,
    CASE
        WHEN bs.Seat_Id IS NOT NULL THEN 'booked'
        ELSE 'available'
    END AS status
FROM
    Seat s
    JOIN ShowSchedule ss
        ON ss.Show_Id   = ?
    LEFT JOIN BookingSeat bs
        ON  bs.Seat_Id  = s.Seat_Id
        AND bs.Show_Id  = ?
WHERE
    s.Screen_Id = ss.Screen_Id
ORDER BY
    s.Row_Label   ASC,
    s.Seat_Number ASC;


-- =============================================================
-- QUERY 4: Get a user full booking history
-- Purpose : Returns every booking made by one user with all
--           the detail they need on the ProfilePage — movie,
--           show, theatre, seats booked, total paid, statuses.
-- Returns : Booking_Id, Booking_Date, Booking_Status, Total_Amount,
--           Movie_Title, Poster_Url, Show_DateTime, Theatre_Name,
--           City, Screen_Name, Screen_Type, Seats_Booked,
--           Payment_Status, Payment_Date, Payment_Method
-- Params  : Replace ? with User_Id  e.g. 4
-- =============================================================
SELECT
    b.Booking_Id,
    b.Booking_Date,
    b.Status                        AS Booking_Status,
    b.Total_Amount,
    m.Title                         AS Movie_Title,
    m.Poster_Url,
    m.Age_Rating,
    ss.Show_DateTime,
    t.Name                          AS Theatre_Name,
    t.City,
    sc.Screen_Name,
    sc.Screen_Type,
    COUNT(bseat.Seat_Id)            AS Seats_Booked,
    p.Payment_Status,
    p.Payment_Date,
    p.Payment_Method,
    p.Transaction_Reference
FROM
    Booking b
    JOIN ShowSchedule ss    ON ss.Show_Id    = b.Show_Id
    JOIN Movie        m     ON m.Movie_Id    = ss.Movie_Id
    JOIN Screen       sc    ON sc.Screen_Id  = ss.Screen_Id
    JOIN Theatre      t     ON t.Theatre_Id  = sc.Theatre_Id
    LEFT JOIN BookingSeat bseat ON bseat.Booking_Id = b.Booking_Id
    LEFT JOIN Payment     p     ON p.Booking_Id     = b.Booking_Id
WHERE
    b.User_Id = ?
GROUP BY
    b.Booking_Id, b.Booking_Date, b.Status, b.Total_Amount,
    m.Title, m.Poster_Url, m.Age_Rating,
    ss.Show_DateTime,
    t.Name, t.City,
    sc.Screen_Name, sc.Screen_Type,
    p.Payment_Status, p.Payment_Date, p.Payment_Method, p.Transaction_Reference
ORDER BY
    b.Booking_Date DESC;


-- =============================================================
-- QUERY 5: Total revenue per movie
-- Purpose : Aggregates all successful payment amounts grouped by
--           movie. Shows total confirmed bookings and total rand
--           value earned per movie. Used in admin reporting.
-- Returns : Movie_Title, Genre, Total_Bookings, Total_Revenue,
--           Avg_Revenue_Per_Booking
-- Params  : None
-- =============================================================
SELECT
    m.Movie_Id,
    m.Title                         AS Movie_Title,
    m.Genre,
    COUNT(DISTINCT b.Booking_Id)    AS Total_Bookings,
    SUM(p.Amount)                   AS Total_Revenue,
    ROUND(AVG(p.Amount), 2)         AS Avg_Revenue_Per_Booking
FROM
    Movie         m
    JOIN ShowSchedule ss  ON ss.Movie_Id   = m.Movie_Id
    JOIN Booking      b   ON b.Show_Id     = ss.Show_Id
    JOIN Payment      p   ON p.Booking_Id  = b.Booking_Id
WHERE
    p.Payment_Status = 'successful'
    AND b.Status     = 'confirmed'
GROUP BY
    m.Movie_Id, m.Title, m.Genre
ORDER BY
    Total_Revenue DESC;


-- =============================================================
-- QUERY 6: Seat occupancy rate per show
-- Purpose : For every scheduled show calculates how many of the
--           available seats have been booked as a percentage.
--           Useful for cinema managers to see which shows are
--           selling well vs underperforming.
-- Returns : Show_Id, Movie_Title, Show_DateTime, Theatre_Name,
--           City, Screen_Name, Screen_Type, Total_Seats,
--           Seats_Booked, Seats_Remaining, Occupancy_Pct
-- Params  : None
-- =============================================================
SELECT
    ss.Show_Id,
    m.Title                                         AS Movie_Title,
    ss.Show_DateTime,
    t.Name                                          AS Theatre_Name,
    t.City,
    sc.Screen_Name,
    sc.Screen_Type,
    sc.Total_Seats,
    COUNT(bs.Seat_Id)                               AS Seats_Booked,
    sc.Total_Seats - COUNT(bs.Seat_Id)              AS Seats_Remaining,
    ROUND(
        (COUNT(bs.Seat_Id) / sc.Total_Seats) * 100,
    1)                                              AS Occupancy_Pct
FROM
    ShowSchedule  ss
    JOIN Movie    m   ON m.Movie_Id   = ss.Movie_Id
    JOIN Screen   sc  ON sc.Screen_Id = ss.Screen_Id
    JOIN Theatre  t   ON t.Theatre_Id = sc.Theatre_Id
    LEFT JOIN BookingSeat bs ON bs.Show_Id = ss.Show_Id
GROUP BY
    ss.Show_Id, m.Title, ss.Show_DateTime,
    t.Name, t.City,
    sc.Screen_Name, sc.Screen_Type, sc.Total_Seats
ORDER BY
    Occupancy_Pct DESC, ss.Show_DateTime ASC;


-- =============================================================
-- QUERY 7: Top 3 most booked movies
-- Purpose : Counts all confirmed bookings per movie and returns
--           only the top 3 by booking count. Used by the admin
--           dashboard to highlight the most popular titles.
-- Returns : Movie_Title, Genre, Age_Rating, Confirmed_Bookings,
--           Total_Seats_Sold
-- Params  : None
-- =============================================================
SELECT
    m.Movie_Id,
    m.Title                         AS Movie_Title,
    m.Genre,
    m.Age_Rating,
    m.Poster_Url,
    COUNT(DISTINCT b.Booking_Id)    AS Confirmed_Bookings,
    COUNT(bs.Seat_Id)               AS Total_Seats_Sold
FROM
    Movie         m
    JOIN ShowSchedule  ss  ON ss.Movie_Id    = m.Movie_Id
    JOIN Booking       b   ON b.Show_Id      = ss.Show_Id
    LEFT JOIN BookingSeat  bs  ON bs.Booking_Id = b.Booking_Id
WHERE
    b.Status = 'confirmed'
GROUP BY
    m.Movie_Id, m.Title, m.Genre, m.Age_Rating, m.Poster_Url
ORDER BY
    Confirmed_Bookings DESC
LIMIT 3;


-- =============================================================
-- QUERY 8: All bookings with their payment status (admin view)
-- Purpose : Full admin overview of every booking in the system.
--           Joins users, movies, show schedules and payments into
--           one denormalised result for reporting and oversight.
--           Used by Administrator and System Administrator roles.
-- Returns : Booking_Id, Customer_Name, Customer_Email,
--           Loyalty_Status, Movie_Title, Genre, Show_DateTime,
--           Theatre_Name, City, Screen_Name, Screen_Type,
--           Seats_Booked, Total_Amount, Booking_Status,
--           Payment_Status, Payment_Method, Transaction_Ref
-- Params  : None — returns ALL bookings
-- =============================================================
SELECT
    b.Booking_Id,
    b.Booking_Date,
    CONCAT(u.First_Name, ' ', u.Last_Name)   AS Customer_Name,
    u.Email                                   AS Customer_Email,
    u.Role,
    u.Loyalty_Status,
    m.Title                                   AS Movie_Title,
    m.Genre,
    ss.Show_DateTime,
    t.Name                                    AS Theatre_Name,
    t.City,
    sc.Screen_Name,
    sc.Screen_Type,
    COUNT(bs.Seat_Id)                         AS Seats_Booked,
    b.Total_Amount,
    b.Status                                  AS Booking_Status,
    COALESCE(p.Payment_Status, 'no payment')  AS Payment_Status,
    COALESCE(p.Payment_Method, 'N/A')         AS Payment_Method,
    COALESCE(p.Transaction_Reference, 'N/A')  AS Transaction_Ref,
    p.Payment_Date
FROM
    Booking       b
    JOIN Users        u   ON u.User_Id    = b.User_Id
    JOIN ShowSchedule ss  ON ss.Show_Id   = b.Show_Id
    JOIN Movie        m   ON m.Movie_Id   = ss.Movie_Id
    JOIN Screen       sc  ON sc.Screen_Id = ss.Screen_Id
    JOIN Theatre      t   ON t.Theatre_Id = sc.Theatre_Id
    LEFT JOIN BookingSeat  bs  ON bs.Booking_Id = b.Booking_Id
    LEFT JOIN Payment      p   ON p.Booking_Id  = b.Booking_Id
GROUP BY
    b.Booking_Id, b.Booking_Date,
    u.First_Name, u.Last_Name, u.Email, u.Role, u.Loyalty_Status,
    m.Title, m.Genre,
    ss.Show_DateTime,
    t.Name, t.City,
    sc.Screen_Name, sc.Screen_Type,
    b.Total_Amount, b.Status,
    p.Payment_Status, p.Payment_Method, p.Transaction_Reference, p.Payment_Date
ORDER BY
    b.Booking_Date DESC;


-- =============================================================
-- QUERY 9: Upcoming shows with remaining seats
-- Purpose : Lists only future shows that are not sold out.
--           Used by the homepage and MoviePage to show only
--           bookable screenings. Shows where Total_Seats equals
--           Seats_Booked are excluded by the HAVING clause.
-- Returns : Show_Id, Movie_Id, Movie_Title, Poster_Url,
--           Age_Rating, Duration_Minutes, Show_DateTime,
--           Price_Per_Seat, Theatre_Name, City, Screen_Name,
--           Screen_Type, Total_Seats, Seats_Booked, Seats_Remaining
-- Params  : None — auto-filters to NOW() and beyond
-- =============================================================
SELECT
    ss.Show_Id,
    m.Movie_Id,
    m.Title                                       AS Movie_Title,
    m.Poster_Url,
    m.Age_Rating,
    m.Duration_Minutes,
    ss.Show_DateTime,
    ss.Price_Per_Seat,
    t.Theatre_Id,
    t.Name                                        AS Theatre_Name,
    t.City,
    sc.Screen_Name,
    sc.Screen_Type,
    sc.Total_Seats,
    COUNT(bs.Seat_Id)                             AS Seats_Booked,
    sc.Total_Seats - COUNT(bs.Seat_Id)            AS Seats_Remaining
FROM
    ShowSchedule  ss
    JOIN Movie    m   ON m.Movie_Id   = ss.Movie_Id
    JOIN Screen   sc  ON sc.Screen_Id = ss.Screen_Id
    JOIN Theatre  t   ON t.Theatre_Id = sc.Theatre_Id
    LEFT JOIN BookingSeat bs ON bs.Show_Id = ss.Show_Id
WHERE
    ss.Show_DateTime > NOW()
GROUP BY
    ss.Show_Id,
    m.Movie_Id, m.Title, m.Poster_Url, m.Age_Rating, m.Duration_Minutes,
    ss.Show_DateTime, ss.Price_Per_Seat,
    t.Theatre_Id, t.Name, t.City,
    sc.Screen_Name, sc.Screen_Type, sc.Total_Seats
HAVING
    Seats_Remaining > 0
ORDER BY
    ss.Show_DateTime ASC;


-- =============================================================
-- QUERY 10: Monthly revenue report
-- Purpose : Summarises all successful payment revenue grouped by
--           calendar month. Shows payments made, total rand value
--           collected, average per booking, and the highest and
--           lowest single payment that month. Used by admins for
--           financial reporting (Phase 1 Section 4.2.2).
-- Returns : Revenue_Month, Month_Label, Total_Payments,
--           Total_Revenue, Avg_Per_Payment, Highest_Payment,
--           Lowest_Payment
-- Params  : None — covers all time
--           To filter by year add: AND YEAR(p.Payment_Date) = 2026
-- =============================================================
SELECT
    DATE_FORMAT(p.Payment_Date, '%Y-%m')    AS Revenue_Month,
    DATE_FORMAT(p.Payment_Date, '%M %Y')    AS Month_Label,
    COUNT(p.Payment_Id)                     AS Total_Payments,
    SUM(p.Amount)                           AS Total_Revenue,
    ROUND(AVG(p.Amount), 2)                 AS Avg_Per_Payment,
    MAX(p.Amount)                           AS Highest_Payment,
    MIN(p.Amount)                           AS Lowest_Payment
FROM
    Payment p
WHERE
    p.Payment_Status = 'successful'
    AND p.Payment_Date IS NOT NULL
GROUP BY
    DATE_FORMAT(p.Payment_Date, '%Y-%m'),
    DATE_FORMAT(p.Payment_Date, '%M %Y')
ORDER BY
    Revenue_Month ASC;


-- =============================================================
-- VERIFICATION: Run after seeding to confirm queries return data
-- Uncomment each line to test individually
-- =============================================================
-- SELECT 'Q1'  AS q, COUNT(*) AS rows FROM Movie;
-- SELECT 'Q5'  AS q, COUNT(*) AS rows FROM Payment WHERE Payment_Status = 'successful';
-- SELECT 'Q7'  AS q, COUNT(*) AS rows FROM Booking WHERE Status = 'confirmed';
-- SELECT 'Q10' AS q, COUNT(DISTINCT DATE_FORMAT(Payment_Date,'%Y-%m')) AS months FROM Payment WHERE Payment_Status = 'successful' AND Payment_Date IS NOT NULL;
