-- =============================================================
-- CineBook Phase 3 - Oracle seed data
-- Run after database/oracle/schema.sql
-- Test credentials:
--   admin@cinebook.co.za / Admin123
--   customer@test.co.za  / Test123
-- =============================================================

SET DEFINE OFF;

DELETE FROM Payment;
DELETE FROM BookingSeat;
DELETE FROM Booking;
DELETE FROM ShowSchedule;
DELETE FROM Seat;
DELETE FROM Screen;
DELETE FROM Users;
DELETE FROM Theatre;
DELETE FROM Movie;
COMMIT;

INSERT INTO Theatre (Theatre_Id, Name, Location, City, Total_Screens) VALUES
(1, 'CineBook Sandton', 'Sandton City, Rivonia Rd', 'Johannesburg', 2);
INSERT INTO Theatre (Theatre_Id, Name, Location, City, Total_Screens) VALUES
(2, 'CineBook V&A Waterfront', 'Victoria Wharf, Beach Rd', 'Cape Town', 2);
INSERT INTO Theatre (Theatre_Id, Name, Location, City, Total_Screens) VALUES
(3, 'CineBook Menlyn', 'Menlyn Park, Atterbury Rd', 'Pretoria', 2);

INSERT INTO Users (User_Id, First_Name, Last_Name, Email, Phone_Number, Password_Hash, Role, Loyalty_Status, Theatre_Id) VALUES
(1, 'Admin', 'CineBook', 'admin@cinebook.co.za', '0110000001', '$2b$10$7g/d92CJLva3/dZFu06HTuEg33PaGV/zD3N/f5haKftKFmBaWxIEq', 'Administrator', 'Platinum', NULL);
INSERT INTO Users (User_Id, First_Name, Last_Name, Email, Phone_Number, Password_Hash, Role, Loyalty_Status, Theatre_Id) VALUES
(2, 'John', 'Doe', 'customer@test.co.za', '0821234567', '$2b$10$uiuebmnSPy.ovEC6PDYUaeOX5RhMOnfsE.MyjUchk97pA3hw6r6Ae', 'Customer', 'Standard', NULL);
INSERT INTO Users (User_Id, First_Name, Last_Name, Email, Phone_Number, Password_Hash, Role, Loyalty_Status, Theatre_Id) VALUES
(3, 'Lerato', 'Dlamini', 'lerato.d@gmail.com', '0731112222', '$2b$10$uiuebmnSPy.ovEC6PDYUaeOX5RhMOnfsE.MyjUchk97pA3hw6r6Ae', 'Customer', 'Silver', NULL);
INSERT INTO Users (User_Id, First_Name, Last_Name, Email, Phone_Number, Password_Hash, Role, Loyalty_Status, Theatre_Id) VALUES
(4, 'Sipho', 'Nkosi', 'sipho.nkosi@gmail.com', '0763334444', '$2b$10$uiuebmnSPy.ovEC6PDYUaeOX5RhMOnfsE.MyjUchk97pA3hw6r6Ae', 'Customer', 'Gold', NULL);
INSERT INTO Users (User_Id, First_Name, Last_Name, Email, Phone_Number, Password_Hash, Role, Loyalty_Status, Theatre_Id) VALUES
(5, 'Thapelo', 'Wana', 'thapelo@test.co.za', '0810267947', '$2b$10$uiuebmnSPy.ovEC6PDYUaeOX5RhMOnfsE.MyjUchk97pA3hw6r6Ae', 'Customer', 'Gold', NULL);
INSERT INTO Users (User_Id, First_Name, Last_Name, Email, Phone_Number, Password_Hash, Role, Loyalty_Status, Theatre_Id) VALUES
(6, 'Maya', 'Pillay', 'manager.sandton@cinebook.co.za', '0110000002', '$2b$10$uiuebmnSPy.ovEC6PDYUaeOX5RhMOnfsE.MyjUchk97pA3hw6r6Ae', 'Cinema Manager', 'Standard', 1);

INSERT INTO Movie (Movie_Id, Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info, Poster_Url) VALUES
(1, 'Sinners', 'Horror', 137, 'R', 'Twin brothers return home to start again, only to find a greater evil waiting for them.', 'Michael B. Jordan, Hailee Steinfeld, Jack O''Connell, Wunmi Mosaku', 'https://image.tmdb.org/t/p/w500/fWPgbnt2LSqkQ6cdQc0SZN9CpLm.jpg');
INSERT INTO Movie (Movie_Id, Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info, Poster_Url) VALUES
(2, 'A Minecraft Movie', 'Adventure', 101, 'PG', 'Four misfits enter the Overworld and must master imagination to get home.', 'Jack Black, Jason Momoa, Emma Myers, Danielle Brooks', 'https://image.tmdb.org/t/p/w500/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg');
INSERT INTO Movie (Movie_Id, Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info, Poster_Url) VALUES
(3, 'Final Destination: Bloodlines', 'Horror', 110, 'R', 'A student confronts a family secret while Death begins collecting.', 'Kaitlyn Santa Juana, Teo Briones, Richard Harmon', 'https://image.tmdb.org/t/p/w500/6WxhEvFsauuACfv8HyoVX6mZKFj.jpg');
INSERT INTO Movie (Movie_Id, Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info, Poster_Url) VALUES
(4, 'Mission: Impossible - The Final Reckoning', 'Action', 169, 'PG-13', 'Ethan Hunt and the IMF race to stop a dangerous weapon.', 'Tom Cruise, Hayley Atwell, Ving Rhames, Simon Pegg', 'https://image.tmdb.org/t/p/w500/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg');
INSERT INTO Movie (Movie_Id, Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info, Poster_Url) VALUES
(5, 'Thunderbolts*', 'Action', 127, 'PG-13', 'A group of antiheroes are brought together for a dangerous mission.', 'Florence Pugh, Sebastian Stan, David Harbour', 'https://image.tmdb.org/t/p/w500/hqcexYHbiTBfDIdDWxrxPtVndBX.jpg');
INSERT INTO Movie (Movie_Id, Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info, Poster_Url) VALUES
(6, 'How to Train Your Dragon', 'Animation', 110, 'PG', 'A young Viking befriends a dragon and challenges his village traditions.', 'Mason Thames, Nico Parker, Nick Frost', 'https://image.tmdb.org/t/p/w500/41dfWUWtg1kUZcJYe6Zk6ewxzMu.jpg');
INSERT INTO Movie (Movie_Id, Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info, Poster_Url) VALUES
(7, 'Karate Kid: Legends', 'Drama', 106, 'PG', 'A kung fu prodigy finds mentorship and discipline in New York City.', 'Ben Wang, Jackie Chan, Ralph Macchio', 'https://image.tmdb.org/t/p/w500/c90Lt7OQGsOmhv6x4JoFdoHzw5l.jpg');
INSERT INTO Movie (Movie_Id, Title, Genre, Duration_Minutes, Age_Rating, Description, Cast_Info, Poster_Url) VALUES
(8, 'Lilo & Stitch', 'Family', 108, 'PG', 'A lonely Hawaiian girl adopts an unusual alien friend.', 'Maia Kealoha, Sydney Agudong, Zach Galifianakis', 'https://image.tmdb.org/t/p/w500/ckQzKpQJO4ZQDCN5evdpKcfm7Ys.jpg');

INSERT INTO Screen (Screen_Id, Theatre_Id, Screen_Name, Total_Seats, Screen_Type) VALUES (1, 1, 'Screen 1', 40, 'Standard');
INSERT INTO Screen (Screen_Id, Theatre_Id, Screen_Name, Total_Seats, Screen_Type) VALUES (2, 1, 'Premium Hall', 40, 'Premium');
INSERT INTO Screen (Screen_Id, Theatre_Id, Screen_Name, Total_Seats, Screen_Type) VALUES (3, 2, 'Screen 1', 40, 'Standard');
INSERT INTO Screen (Screen_Id, Theatre_Id, Screen_Name, Total_Seats, Screen_Type) VALUES (4, 2, 'VIP Lounge', 40, 'VIP');
INSERT INTO Screen (Screen_Id, Theatre_Id, Screen_Name, Total_Seats, Screen_Type) VALUES (5, 3, 'Screen 1', 40, 'Standard');
INSERT INTO Screen (Screen_Id, Theatre_Id, Screen_Name, Total_Seats, Screen_Type) VALUES (6, 3, 'Screen 2', 40, 'Premium');

DECLARE
    v_seat_id NUMBER := 1;
    v_row     CHAR(1);
    v_type    VARCHAR2(20);
BEGIN
    FOR v_screen IN 1..6 LOOP
        FOR v_row_idx IN 1..4 LOOP
            v_row := CHR(64 + v_row_idx);
            v_type := CASE WHEN v_row = 'A' THEN 'Premium' ELSE 'Standard' END;
            FOR v_seat_no IN 1..10 LOOP
                INSERT INTO Seat (Seat_Id, Screen_Id, Row_Label, Seat_Number, Seat_Type)
                VALUES (v_seat_id, v_screen, v_row, v_seat_no, v_type);
                v_seat_id := v_seat_id + 1;
            END LOOP;
        END LOOP;
    END LOOP;
END;
/

INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(1, 1, 1, TIMESTAMP '2026-06-01 14:00:00', 120.00);
INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(2, 1, 2, TIMESTAMP '2026-06-01 18:30:00', 180.00);
INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(3, 1, 4, TIMESTAMP '2026-06-01 20:00:00', 250.00);
INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(4, 2, 1, TIMESTAMP '2026-06-02 11:00:00', 120.00);
INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(5, 3, 5, TIMESTAMP '2026-06-02 19:30:00', 120.00);
INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(6, 4, 3, TIMESTAMP '2026-06-03 16:00:00', 180.00);
INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(7, 5, 2, TIMESTAMP '2026-06-03 19:30:00', 120.00);
INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(8, 6, 5, TIMESTAMP '2026-06-04 14:00:00', 120.00);
INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(9, 7, 6, TIMESTAMP '2026-06-05 17:00:00', 150.00);
INSERT INTO ShowSchedule (Show_Id, Movie_Id, Screen_Id, Show_DateTime, Price_Per_Seat) VALUES
(10, 8, 3, TIMESTAMP '2026-06-05 11:00:00', 120.00);

INSERT INTO Booking (Booking_Id, User_Id, Show_Id, Total_Amount, Status, Booking_Date) VALUES
(1, 5, 1, 240.00, 'confirmed', SYSTIMESTAMP - INTERVAL '12' DAY);
INSERT INTO BookingSeat (BookingSeat_Id, Booking_Id, Seat_Id, Show_Id) VALUES (1, 1, 1, 1);
INSERT INTO BookingSeat (BookingSeat_Id, Booking_Id, Seat_Id, Show_Id) VALUES (2, 1, 2, 1);

INSERT INTO Booking (Booking_Id, User_Id, Show_Id, Total_Amount, Status, Booking_Date) VALUES
(2, 5, 7, 120.00, 'pending', SYSTIMESTAMP - INTERVAL '2' DAY);
INSERT INTO BookingSeat (BookingSeat_Id, Booking_Id, Seat_Id, Show_Id) VALUES (3, 2, 65, 7);

INSERT INTO Booking (Booking_Id, User_Id, Show_Id, Total_Amount, Status, Booking_Date) VALUES
(3, 3, 1, 360.00, 'confirmed', SYSTIMESTAMP - INTERVAL '8' DAY);
INSERT INTO BookingSeat (BookingSeat_Id, Booking_Id, Seat_Id, Show_Id) VALUES (4, 3, 13, 1);
INSERT INTO BookingSeat (BookingSeat_Id, Booking_Id, Seat_Id, Show_Id) VALUES (5, 3, 14, 1);
INSERT INTO BookingSeat (BookingSeat_Id, Booking_Id, Seat_Id, Show_Id) VALUES (6, 3, 15, 1);

INSERT INTO Payment (Payment_Id, Booking_Id, Amount, Payment_Method, Payment_Status, Transaction_Reference, Payment_Date) VALUES
(1, 1, 240.00, 'Card', 'successful', 'CB-PAY-00001', SYSTIMESTAMP - INTERVAL '12' DAY);
INSERT INTO Payment (Payment_Id, Booking_Id, Amount, Payment_Method, Payment_Status, Transaction_Reference, Payment_Date) VALUES
(2, 3, 360.00, 'Card', 'successful', 'CB-PAY-00003', SYSTIMESTAMP - INTERVAL '8' DAY);

COMMIT;

SELECT 'Users' AS table_name, COUNT(*) AS row_count FROM Users UNION ALL
SELECT 'Movie', COUNT(*) FROM Movie UNION ALL
SELECT 'Theatre', COUNT(*) FROM Theatre UNION ALL
SELECT 'Screen', COUNT(*) FROM Screen UNION ALL
SELECT 'Seat', COUNT(*) FROM Seat UNION ALL
SELECT 'ShowSchedule', COUNT(*) FROM ShowSchedule UNION ALL
SELECT 'Booking', COUNT(*) FROM Booking UNION ALL
SELECT 'BookingSeat', COUNT(*) FROM BookingSeat UNION ALL
SELECT 'Payment', COUNT(*) FROM Payment;
