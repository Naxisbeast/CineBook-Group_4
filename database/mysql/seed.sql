-- =============================================================
-- CineBook app - MySQL seed data
-- Run after database/mysql/schema.sql.
-- Test credentials:
--   admin@cinebook.co.za / Admin123
--   customer@test.co.za  / Test123
-- =============================================================

USE cinebook_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Payment;
TRUNCATE TABLE BookingSeat;
TRUNCATE TABLE Booking;
TRUNCATE TABLE ShowSchedule;
TRUNCATE TABLE Seat;
TRUNCATE TABLE Screen;
TRUNCATE TABLE Users;
TRUNCATE TABLE Theatre;
TRUNCATE TABLE Movie;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO Theatre (Theatre_Id, Name, Location, City, Total_Screens, Phone) VALUES
(1, 'CineBook Sandton', 'Sandton City, Rivonia Rd', 'Johannesburg', 2, '0117801234'),
(2, 'CineBook V&A Waterfront', 'Victoria Wharf, Beach Rd', 'Cape Town', 2, '0214001234'),
(3, 'CineBook Menlyn', 'Menlyn Park, Atterbury Rd', 'Pretoria', 2, '0128941234');

INSERT INTO Users (User_Id, First_Name, Last_Name, Email, Phone_Number, Password_Hash, Role, Loyalty_Status, Theatre_Id) VALUES
(1, 'Admin', 'CineBook', 'admin@cinebook.co.za', '0110000001', '$2b$10$7g/d92CJLva3/dZFu06HTuEg33PaGV/zD3N/f5haKftKFmBaWxIEq', 'Administrator', 'Platinum', NULL),
(2, 'John', 'Doe', 'customer@test.co.za', '0821234567', '$2b$10$uiuebmnSPy.ovEC6PDYUaeOX5RhMOnfsE.MyjUchk97pA3hw6r6Ae', 'Customer', 'Standard', NULL),
(3, 'Lerato', 'Dlamini', 'lerato.d@gmail.com', '0731112222', '$2b$10$uiuebmnSPy.ovEC6PDYUaeOX5RhMOnfsE.MyjUchk97pA3hw6r6Ae', 'Customer', 'Silver', NULL),
(4, 'Sipho', 'Nkosi', 'sipho.nkosi@gmail.com', '0763334444', '$2b$10$uiuebmnSPy.ovEC6PDYUaeOX5RhMOnfsE.MyjUchk97pA3hw6r6Ae', 'Customer', 'Gold', NULL),
(5, 'Thapelo', 'Wana', 'thapelo@test.co.za', '0810267947', '$2b$10$uiuebmnSPy.ovEC6PDYUaeOX5RhMOnfsE.MyjUchk97pA3hw6r6Ae', 'Customer', 'Gold', NULL),
(6, 'Maya', 'Pillay', 'manager.sandton@cinebook.co.za', '0110000002', '$2b$10$uiuebmnSPy.ovEC6PDYUaeOX5RhMOnfsE.MyjUchk97pA3hw6r6Ae', 'Cinema Manager', 'Standard', 1);

INSERT INTO Movie
  (Movie_Id, Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info, Poster_Url, Backdrop_Url, Language, Release_Date, Tagline, Rating)
VALUES
(1, 'Sinners', 'Horror', 137, 'R',
 'Trying to leave their troubled lives behind, twin brothers return to their hometown to start again, only to discover that an even greater evil is waiting to welcome them back.',
 'Michael B. Jordan, Hailee Steinfeld, Jack O''Connell, Wunmi Mosaku',
 'https://image.tmdb.org/t/p/w500/fWPgbnt2LSqkQ6cdQc0SZN9CpLm.jpg',
 'https://image.tmdb.org/t/p/w1280/nAxGnGHOsfzufThz20zgmRwKur3.jpg',
 'English', '2025-04-18', 'Evil always finds its way home.', 4.4),
(2, 'A Minecraft Movie', 'Adventure', 101, 'PG',
 'Four misfits find themselves struggling in the Overworld, a bizarre place that thrives on imagination. To get back home, they will need to master this world while embarking on a quest with an unlikely adventurer.',
 'Jack Black, Jason Momoa, Emma Myers, Danielle Brooks',
 'https://image.tmdb.org/t/p/w500/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg',
 'https://image.tmdb.org/t/p/w1280/2Nti3gYAX513wvhp8IiLL6ZDyOm.jpg',
 'English', '2025-04-04', 'Craft your destiny.', 3.7),
(3, 'Final Destination: Bloodlines', 'Horror', 110, 'R',
 'Plagued by a violent recurring nightmare, college student Stefanie heads home to confront her family about a dark secret.',
 'Kaitlyn Santa Juana, Teo Briones, Richard Harmon, Brec Bassinger',
 'https://image.tmdb.org/t/p/w500/6WxhEvFsauuACfv8HyoVX6mZKFj.jpg',
 'https://image.tmdb.org/t/p/w1280/uIpJPDNFoeX0TVml9smPrs9KUVx.jpg',
 'English', '2025-05-16', 'Death runs in the family.', 4.1),
(4, 'Mission: Impossible - The Final Reckoning', 'Action', 169, 'PG-13',
 'Ethan Hunt and his IMF team race against time to locate a terrifying new weapon before it falls into the wrong hands.',
 'Tom Cruise, Hayley Atwell, Ving Rhames, Simon Pegg, Pom Klementieff',
 'https://image.tmdb.org/t/p/w500/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg',
 'https://image.tmdb.org/t/p/w1280/xPNDRM50a58uvv1il2GVZrtWjkZ.jpg',
 'English', '2025-05-23', 'One final mission.', 4.8),
(5, 'Thunderbolts*', 'Action', 127, 'PG-13',
 'A group of Marvel antiheroes are brought together for a dangerous mission that could prove to be their redemption or their end.',
 'Florence Pugh, Sebastian Stan, David Harbour, Wyatt Russell, Julia Louis-Dreyfus',
 'https://image.tmdb.org/t/p/w500/hqcexYHbiTBfDIdDWxrxPtVndBX.jpg',
 'https://image.tmdb.org/t/p/w1280/rthMuZfFv4fqEU4JVbgSW9wQ8rs.jpg',
 'English', '2025-05-02', 'Everyone deserves one last shot.', 4.0),
(6, 'How to Train Your Dragon', 'Animation', 110, 'PG',
 'A live-action reimagining of the beloved animated film. A young Viking named Hiccup befriends a dragon named Toothless.',
 'Mason Thames, Nico Parker, Nick Frost, Julian Dennison',
 'https://image.tmdb.org/t/p/w500/41dfWUWtg1kUZcJYe6Zk6ewxzMu.jpg',
 'https://image.tmdb.org/t/p/w1280/79PNOxNXSe5e0bhEj11QJPlsdCN.jpg',
 'English', '2025-06-13', 'The legend takes flight.', 4.6),
(7, 'Karate Kid: Legends', 'Drama', 106, 'PG',
 'After a family tragedy, kung fu prodigy Li Fong moves to New York City and discovers that martial arts go far beyond fighting.',
 'Ben Wang, Jackie Chan, Ralph Macchio, Ming-Na Wen',
 'https://image.tmdb.org/t/p/w500/c90Lt7OQGsOmhv6x4JoFdoHzw5l.jpg',
 'https://image.tmdb.org/t/p/w1280/7Q2CmqIVJuDAESPPp76rWIiA0AD.jpg',
 'English', '2025-05-30', 'Discipline is forever.', 3.9),
(8, 'Lilo & Stitch', 'Family', 108, 'PG',
 'A live-action reimagining of the beloved animated classic about a lonely Hawaiian girl and an experimental alien.',
 'Maia Kealoha, Sydney Agudong, Zach Galifianakis, Tia Carrere',
 'https://image.tmdb.org/t/p/w500/ckQzKpQJO4ZQDCN5evdpKcfm7Ys.jpg',
 'https://image.tmdb.org/t/p/w1280/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg',
 'English', '2025-05-23', 'Ohana means family.', 4.2);

INSERT INTO Screen (Screen_Id, Theatre_Id, Screen_Name, Total_Seats, Screen_Type) VALUES
(1, 1, 'Screen 1', 40, 'Standard'),
(2, 1, 'Premium Hall', 40, 'Premium'),
(3, 2, 'Screen 1', 40, 'Standard'),
(4, 2, 'VIP Lounge', 40, 'VIP'),
(5, 3, 'Screen 1', 40, 'Standard'),
(6, 3, 'Screen 2', 40, 'Premium');

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
    SET r = SUBSTRING(rows_list, i, 1);
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

INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(1, 1, 1, '2026-06-01 14:00:00', 120.00),
(2, 1, 2, '2026-06-01 18:30:00', 180.00),
(3, 1, 4, '2026-06-01 20:00:00', 250.00),
(4, 2, 1, '2026-06-02 11:00:00', 120.00),
(5, 3, 5, '2026-06-02 19:30:00', 120.00),
(6, 4, 3, '2026-06-03 16:00:00', 180.00),
(7, 5, 2, '2026-06-03 19:30:00', 120.00),
(8, 6, 5, '2026-06-04 14:00:00', 120.00),
(9, 7, 6, '2026-06-05 17:00:00', 150.00),
(10, 8, 3, '2026-06-05 11:00:00', 120.00);

INSERT INTO Booking (Booking_Id, User_Id, Show_Id, Total_Amount, Status, Booking_Date) VALUES
(1, 5, 1, 240.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(2, 5, 7, 120.00, 'pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 3, 1, 360.00, 'confirmed', DATE_SUB(NOW(), INTERVAL 8 DAY));

INSERT INTO BookingSeat (Booking_Id, Seat_Id, Show_Id) VALUES
(1, 1, 1),
(1, 2, 1),
(2, 65, 7),
(3, 13, 1),
(3, 14, 1),
(3, 15, 1);

INSERT INTO Payment (Booking_Id, Amount, Payment_Method, Payment_Status, Transaction_Reference, Payment_Date) VALUES
(1, 240.00, 'Card', 'successful', 'CB-PAY-00001', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(3, 360.00, 'Card', 'successful', 'CB-PAY-00003', DATE_SUB(NOW(), INTERVAL 8 DAY));

SELECT 'Users' AS table_name, COUNT(*) AS row_count FROM Users UNION ALL
SELECT 'Movie', COUNT(*) FROM Movie UNION ALL
SELECT 'Theatre', COUNT(*) FROM Theatre UNION ALL
SELECT 'Screen', COUNT(*) FROM Screen UNION ALL
SELECT 'Seat', COUNT(*) FROM Seat UNION ALL
SELECT 'ShowSchedule', COUNT(*) FROM ShowSchedule UNION ALL
SELECT 'Booking', COUNT(*) FROM Booking UNION ALL
SELECT 'BookingSeat', COUNT(*) FROM BookingSeat UNION ALL
SELECT 'Payment', COUNT(*) FROM Payment;
