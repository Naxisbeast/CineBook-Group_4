-- =============================================================
-- CineBook — database/seed.sql
-- MySQL seed data — matches the frontend mock data exactly.
-- Run order: schema.sql → migrate_app_columns.sql → seed.sql
-- CMPG 311 | Group 4 | 2026
-- =============================================================
-- Test credentials:
--   Admin    → admin@cinebook.co.za  / Admin123
--   Customer → customer@test.co.za  / Test123
-- =============================================================

USE cinebook_db;

-- Safe re-run
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Payment;
TRUNCATE TABLE BookingSeat;
TRUNCATE TABLE Booking;
TRUNCATE TABLE ShowSchedule;
TRUNCATE TABLE Seat;
TRUNCATE TABLE Screen;
TRUNCATE TABLE Theatre;
TRUNCATE TABLE Movie;
TRUNCATE TABLE Users;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- Users
-- Admin123  → bcrypt hash (cost 10)
-- Test123   → bcrypt hash (cost 10)
-- =============================================================
INSERT INTO Users (First_Name, Last_Name, Email, Phone_Number, Password_Hash, Role, Loyalty_Status) VALUES
('Admin',   'CineBook',  'admin@cinebook.co.za',  '0110000001', '$2b$10$XkFqHFh0WtO9UiKlgOBWROjkj6U7mCTCFi.j1RJh/RA7GjKR.g0Xm', 'Administrator', 'Platinum'),
('John',    'Doe',       'customer@test.co.za',   '0821234567', '$2b$10$N9qiGosGk5MLH5bJCFkFNuJWKQISTbbGnp3O3RObJhqBJREFJ5Oim', 'Customer',      'Standard'),
('Lerato',  'Dlamini',   'lerato.d@gmail.com',    '0731112222', '$2b$10$N9qiGosGk5MLH5bJCFkFNuJWKQISTbbGnp3O3RObJhqBJREFJ5Oim', 'Customer',      'Silver'),
('Sipho',   'Nkosi',     'sipho.nkosi@gmail.com', '0763334444', '$2b$10$N9qiGosGk5MLH5bJCFkFNuJWKQISTbbGnp3O3RObJhqBJREFJ5Oim', 'Customer',      'Gold'),
('Thapelo', 'Wana',      'thapelo@test.co.za',    '0810267947', '$2b$10$N9qiGosGk5MLH5bJCFkFNuJWKQISTbbGnp3O3RObJhqBJREFJ5Oim', 'Customer',      'Gold');

-- =============================================================
-- Movie  (matches MOCK_MOVIES exactly — same IDs, same posters)
-- =============================================================
INSERT INTO Movie (Movie_Id, Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info, Poster_Url, Backdrop_Url, Language, Release_Date, Tagline, Rating) VALUES
(1, 'Sinners',
   'Horror', 137, 'R',
   'Trying to leave their troubled lives behind, twin brothers return to their hometown to start again, only to discover that an even greater evil is waiting to welcome them back.',
   'Michael B. Jordan, Hailee Steinfeld, Jack O''Connell, Wunmi Mosaku',
   'https://image.tmdb.org/t/p/w500/fWPgbnt2LSqkQ6cdQc0SZN9CpLm.jpg',
   'https://image.tmdb.org/t/p/w1280/nAxGnGHOsfzufThz20zgmRwKur3.jpg',
   'English', '2025-04-18', 'Evil always finds its way home.', 4.4),

(2, 'A Minecraft Movie',
   'Adventure', 101, 'PG',
   'Four misfits find themselves struggling in the Overworld, a bizarre place that thrives on imagination. To get back home, they''ll need to master this world while embarking on a quest with an unlikely adventurer.',
   'Jack Black, Jason Momoa, Emma Myers, Danielle Brooks',
   'https://image.tmdb.org/t/p/w500/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg',
   'https://image.tmdb.org/t/p/w1280/2Nti3gYAX513wvhp8IiLL6ZDyOm.jpg',
   'English', '2025-04-04', 'Craft your destiny.', 3.7),

(3, 'Final Destination: Bloodlines',
   'Horror', 110, 'R',
   'Plagued by a violent recurring nightmare, college student Stefanie heads home to confront her family about a dark secret. Her visit sets off a terrifying chain of events when Death comes to collect.',
   'Kaitlyn Santa Juana, Teo Briones, Richard Harmon, Brec Bassinger',
   'https://image.tmdb.org/t/p/w500/6WxhEvFsauuACfv8HyoVX6mZKFj.jpg',
   'https://image.tmdb.org/t/p/w1280/uIpJPDNFoeX0TVml9smPrs9KUVx.jpg',
   'English', '2025-05-16', 'Death runs in the family.', 4.1),

(4, 'Mission: Impossible - The Final Reckoning',
   'Action', 169, 'PG-13',
   'Ethan Hunt and his IMF team race against time to locate a terrifying new weapon before it falls into the wrong hands. The world is once again at the precipice.',
   'Tom Cruise, Hayley Atwell, Ving Rhames, Simon Pegg, Pom Klementieff',
   'https://image.tmdb.org/t/p/w500/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg',
   'https://image.tmdb.org/t/p/w1280/xPNDRM50a58uvv1il2GVZrtWjkZ.jpg',
   'English', '2025-05-23', 'One final mission.', 4.8),

(5, 'Thunderbolts*',
   'Action', 127, 'PG-13',
   'A group of Marvel antiheroes are brought together for a dangerous mission that could prove to be their redemption - or their end.',
   'Florence Pugh, Sebastian Stan, David Harbour, Wyatt Russell, Julia Louis-Dreyfus',
   'https://image.tmdb.org/t/p/w500/hqcexYHbiTBfDIdDWxrxPtVndBX.jpg',
   'https://image.tmdb.org/t/p/w1280/rthMuZfFv4fqEU4JVbgSW9wQ8rs.jpg',
   'English', '2025-05-02', 'Everyone deserves one last shot.', 4.0),

(6, 'How to Train Your Dragon',
   'Animation', 110, 'PG',
   'A live-action reimagining of the beloved animated film. A young Viking named Hiccup befriends a dragon named Toothless, challenging everything his village believes.',
   'Mason Thames, Nico Parker, Nick Frost, Julian Dennison',
   'https://image.tmdb.org/t/p/w500/41dfWUWtg1kUZcJYe6Zk6ewxzMu.jpg',
   'https://image.tmdb.org/t/p/w1280/79PNOxNXSe5e0bhEj11QJPlsdCN.jpg',
   'English', '2025-06-13', 'The legend takes flight.', 4.6),

(7, 'Karate Kid: Legends',
   'Drama', 106, 'PG',
   'After a family tragedy, kung fu prodigy Li Fong must move to New York City where he meets karate legend Daniel LaRusso and discovers that the discipline of martial arts goes far beyond fighting.',
   'Ben Wang, Jackie Chan, Ralph Macchio, Ming-Na Wen',
   'https://image.tmdb.org/t/p/w500/c90Lt7OQGsOmhv6x4JoFdoHzw5l.jpg',
   'https://image.tmdb.org/t/p/w1280/7Q2CmqIVJuDAESPPp76rWIiA0AD.jpg',
   'English', '2025-05-30', 'Discipline is forever.', 3.9),

(8, 'Lilo & Stitch',
   'Family', 108, 'PG',
   'A live-action reimagining of the beloved animated classic about a lonely Hawaiian girl who adopts what she thinks is a dog, but is actually an experimental alien.',
   'Maia Kealoha, Sydney Agudong, Zach Galifianakis, Tia Carrere',
   'https://image.tmdb.org/t/p/w500/ckQzKpQJO4ZQDCN5evdpKcfm7Ys.jpg',
   'https://image.tmdb.org/t/p/w1280/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg',
   'English', '2025-05-23', 'Ohana means family.', 4.2);

-- =============================================================
-- Theatre (matches MOCK_THEATRES)
-- =============================================================
INSERT INTO Theatre (Theatre_Id, Name, Location, City, Total_Screens, Phone) VALUES
(1, 'CineBook Sandton',        'Sandton City, Rivonia Rd',    'Johannesburg', 2, '0117801234'),
(2, 'CineBook V&A Waterfront', 'Victoria Wharf, Beach Rd',    'Cape Town',    2, '0214001234'),
(3, 'CineBook Menlyn',         'Menlyn Park, Atterbury Rd',   'Pretoria',     2, '0128941234');

-- =============================================================
-- Screen (2 per theatre = 6 total)
-- =============================================================
INSERT INTO Screen (Screen_Id, Theatre_Id, Screen_Name, Total_Seats, Screen_Type) VALUES
(1, 1, 'Screen 1',      40, 'Standard'),
(2, 1, 'Premium Hall',  40, 'Premium'),
(3, 2, 'Screen 1',      40, 'Standard'),
(4, 2, 'VIP Lounge',    40, 'VIP'),
(5, 3, 'Screen 1',      40, 'Standard'),
(6, 3, 'Screen 2',      40, 'Premium');

-- =============================================================
-- Seat  (rows A-D, seats 1-10 per row = 40 seats per screen)
-- Row A = Premium, rows B-D = Standard
-- =============================================================
DROP PROCEDURE IF EXISTS insert_seats;
DELIMITER $$
CREATE PROCEDURE insert_seats(IN p_screen_id INT)
BEGIN
  DECLARE rows_list VARCHAR(10) DEFAULT 'ABCD';
  DECLARE i INT DEFAULT 1;
  DECLARE j INT;
  DECLARE r CHAR(1);
  DECLARE stype VARCHAR(20);
  WHILE i <= 4 DO
    SET r     = SUBSTRING(rows_list, i, 1);
    SET stype = IF(r = 'A', 'Premium', 'Standard');
    SET j = 1;
    WHILE j <= 10 DO
      INSERT INTO Seat (Screen_Id, Row_Label, Seat_Number, Seat_Type)
      VALUES (p_screen_id, r, j, stype);
      SET j = j + 1;
    END WHILE;
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

CALL insert_seats(1);
CALL insert_seats(2);
CALL insert_seats(3);
CALL insert_seats(4);
CALL insert_seats(5);
CALL insert_seats(6);
DROP PROCEDURE IF EXISTS insert_seats;

-- =============================================================
-- ShowSchedule  (matches MOCK_SHOWS — same IDs and screen types)
-- Sold_Out column added by migrate_app_columns.sql
-- =============================================================
INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat, Sold_Out) VALUES
(1, 1, 1, '2026-05-14 14:00:00', 120.00, 0),   -- Sinners    Sandton Standard
(2, 1, 2, '2026-05-14 18:30:00', 180.00, 0),   -- Sinners    Sandton Premium
(3, 1, 4, '2026-05-14 20:00:00', 250.00, 1),   -- Sinners    V&A VIP (sold out)
(4, 2, 1, '2026-05-14 11:00:00', 120.00, 0),   -- Minecraft  Sandton Standard
(5, 3, 5, '2026-05-15 19:30:00', 120.00, 0),   -- FD Menlyn  Standard
(6, 4, 3, '2026-05-15 16:00:00', 180.00, 0),   -- MI V&A     Premium
(7, 5, 2, '2026-05-20 19:30:00', 120.00, 0),   -- Thunderbolts Sandton Premium
(8, 6, 5, '2026-05-21 14:00:00', 120.00, 0),   -- HTTYD Menlyn
(9, 7, 6, '2026-05-22 17:00:00', 150.00, 0),   -- KK Menlyn Premium
(10,8, 3, '2026-05-23 11:00:00', 120.00, 0);   -- Lilo V&A Standard

-- =============================================================
-- Booking  (matches MOCK_BOOKINGS for test user thapelo@test.co.za = User_Id 5)
-- =============================================================
INSERT INTO Booking (Booking_Id, User_Id, Show_Id, Total_Amount, Status) VALUES
(1, 5, 1, 240.00, 'confirmed'),   -- Sinners, 2 seats x R120
(2, 5, 7,  120.00, 'pending');    -- Thunderbolts*, 1 seat x R120

-- =============================================================
-- BookingSeat
-- Screen 1: Seat IDs 1-40 (row A = 1-10, B = 11-20, C = 21-30, D = 31-40)
-- Screen 2: Seat IDs 41-80
-- =============================================================
-- Booking 1: Show 1, Screen 1, seats A1 (id=1) and A2 (id=2)
INSERT INTO BookingSeat (Booking_Id, Seat_Id, Show_Id) VALUES
(1, 1, 1),
(1, 2, 1);

-- Mock data shows B3, B4, B5 as booked on Show 1 (Screen 1)
-- B3 = seat id 23 (B row = 11-20, so B3 = id 13), B4=14, B5=15
-- NOTE: these need to be in a booking — we attach them to a dummy booking for Lerato (User 3)
INSERT INTO Booking (Booking_Id, User_Id, Show_Id, Total_Amount, Status) VALUES
(3, 3, 1, 360.00, 'confirmed');
INSERT INTO BookingSeat (Booking_Id, Seat_Id, Show_Id) VALUES
(3, 13, 1),
(3, 14, 1),
(3, 15, 1);

-- Booking 2 (pending, no seats yet)

-- =============================================================
-- Payment
-- =============================================================
INSERT INTO Payment (Booking_Id, Amount, Payment_Method, Payment_Status, Transaction_Reference, Payment_Date) VALUES
(1, 240.00, 'Card', 'successful', 'CB-PAY-00001', NOW()),
(3, 360.00, 'Card', 'successful', 'CB-PAY-00003', NOW());

-- =============================================================
-- Verify
-- =============================================================
SELECT 'Users'        AS tbl, COUNT(*) AS rows FROM Users        UNION ALL
SELECT 'Movie',        COUNT(*) FROM Movie        UNION ALL
SELECT 'Theatre',      COUNT(*) FROM Theatre      UNION ALL
SELECT 'Screen',       COUNT(*) FROM Screen        UNION ALL
SELECT 'Seat',         COUNT(*) FROM Seat          UNION ALL
SELECT 'ShowSchedule', COUNT(*) FROM ShowSchedule UNION ALL
SELECT 'Booking',      COUNT(*) FROM Booking       UNION ALL
SELECT 'BookingSeat',  COUNT(*) FROM BookingSeat   UNION ALL
SELECT 'Payment',      COUNT(*) FROM Payment;
