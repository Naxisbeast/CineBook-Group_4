-- =============================================================
-- CineBook app - MySQL schema
-- Used by the React + Express application.
-- Mirrors the 9-table Phase 2 model with small app-friendly
-- movie display columns.
-- =============================================================

CREATE DATABASE IF NOT EXISTS cinebook_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cinebook_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS BookingSeat;
DROP TABLE IF EXISTS Booking;
DROP TABLE IF EXISTS ShowSchedule;
DROP TABLE IF EXISTS Seat;
DROP TABLE IF EXISTS Screen;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Theatre;
DROP TABLE IF EXISTS Movie;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Movie (
  Movie_Id INT NOT NULL AUTO_INCREMENT,
  Title VARCHAR(150) NOT NULL,
  Genre VARCHAR(50) NOT NULL,
  Duration_Minutes INT NOT NULL,
  Age_Rating VARCHAR(10) NOT NULL,
  Description TEXT,
  Cast_Info TEXT,
  Poster_Url VARCHAR(500),
  Backdrop_Url VARCHAR(500),
  Language VARCHAR(50) DEFAULT 'English',
  Release_Date DATE,
  Tagline VARCHAR(255),
  Rating DECIMAL(3,1),
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Movie_Id),
  CONSTRAINT chk_movie_duration CHECK (Duration_Minutes > 0)
) ENGINE=InnoDB;

CREATE TABLE Theatre (
  Theatre_Id INT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(100) NOT NULL,
  Location VARCHAR(200) NOT NULL,
  City VARCHAR(100) NOT NULL,
  Total_Screens INT NOT NULL DEFAULT 0,
  Phone VARCHAR(20),
  PRIMARY KEY (Theatre_Id),
  CONSTRAINT chk_theatre_total_screens CHECK (Total_Screens >= 0)
) ENGINE=InnoDB;

CREATE TABLE Users (
  User_Id INT NOT NULL AUTO_INCREMENT,
  First_Name VARCHAR(50) NOT NULL,
  Last_Name VARCHAR(50) NOT NULL,
  Email VARCHAR(100) NOT NULL,
  Phone_Number VARCHAR(20),
  Password_Hash VARCHAR(255) NOT NULL,
  Role ENUM('Customer', 'Administrator', 'Cinema Manager', 'System Administrator') NOT NULL DEFAULT 'Customer',
  Loyalty_Status ENUM('Standard', 'Silver', 'Gold', 'Platinum') NOT NULL DEFAULT 'Standard',
  Created_At DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Theatre_Id INT NULL,
  PRIMARY KEY (User_Id),
  UNIQUE KEY uq_users_email (Email),
  CONSTRAINT fk_users_theatre FOREIGN KEY (Theatre_Id) REFERENCES Theatre(Theatre_Id)
) ENGINE=InnoDB;

CREATE TABLE Screen (
  Screen_Id INT NOT NULL AUTO_INCREMENT,
  Screen_Name VARCHAR(50) NOT NULL,
  Total_Seats INT NOT NULL,
  Screen_Type ENUM('Standard', 'Premium', 'VIP') NOT NULL DEFAULT 'Standard',
  Theatre_Id INT NOT NULL,
  PRIMARY KEY (Screen_Id),
  CONSTRAINT chk_screen_total_seats CHECK (Total_Seats >= 0),
  CONSTRAINT fk_screen_theatre FOREIGN KEY (Theatre_Id) REFERENCES Theatre(Theatre_Id)
) ENGINE=InnoDB;

CREATE TABLE Seat (
  Seat_Id INT NOT NULL AUTO_INCREMENT,
  Row_Label CHAR(1) NOT NULL,
  Seat_Number INT NOT NULL,
  Seat_Type ENUM('Standard', 'Premium', 'VIP') NOT NULL DEFAULT 'Standard',
  Screen_Id INT NOT NULL,
  PRIMARY KEY (Seat_Id),
  UNIQUE KEY uq_seat_position (Screen_Id, Row_Label, Seat_Number),
  CONSTRAINT chk_seat_number CHECK (Seat_Number > 0),
  CONSTRAINT fk_seat_screen FOREIGN KEY (Screen_Id) REFERENCES Screen(Screen_Id)
) ENGINE=InnoDB;

CREATE TABLE ShowSchedule (
  Show_Id INT NOT NULL AUTO_INCREMENT,
  Show_DateTime DATETIME NOT NULL,
  Price_Per_Seat DECIMAL(10,2) NOT NULL,
  Movie_Id INT NOT NULL,
  Screen_Id INT NOT NULL,
  PRIMARY KEY (Show_Id),
  UNIQUE KEY uq_show_screen_time (Screen_Id, Show_DateTime),
  KEY idx_show_movie_datetime (Movie_Id, Show_DateTime),
  CONSTRAINT chk_show_price CHECK (Price_Per_Seat >= 0),
  CONSTRAINT fk_show_movie FOREIGN KEY (Movie_Id) REFERENCES Movie(Movie_Id),
  CONSTRAINT fk_show_screen FOREIGN KEY (Screen_Id) REFERENCES Screen(Screen_Id)
) ENGINE=InnoDB;

CREATE TABLE Booking (
  Booking_Id INT NOT NULL AUTO_INCREMENT,
  Booking_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  Total_Amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  User_Id INT NOT NULL,
  Show_Id INT NOT NULL,
  PRIMARY KEY (Booking_Id),
  KEY idx_booking_user_status (User_Id, Status),
  CONSTRAINT chk_booking_amount CHECK (Total_Amount >= 0),
  CONSTRAINT fk_booking_user FOREIGN KEY (User_Id) REFERENCES Users(User_Id),
  CONSTRAINT fk_booking_show FOREIGN KEY (Show_Id) REFERENCES ShowSchedule(Show_Id)
) ENGINE=InnoDB;

CREATE TABLE BookingSeat (
  BookingSeat_Id INT NOT NULL AUTO_INCREMENT,
  Booking_Id INT NOT NULL,
  Seat_Id INT NOT NULL,
  Show_Id INT NOT NULL,
  PRIMARY KEY (BookingSeat_Id),
  UNIQUE KEY uq_bookingseat_show_seat (Show_Id, Seat_Id),
  CONSTRAINT fk_bookingseat_booking FOREIGN KEY (Booking_Id) REFERENCES Booking(Booking_Id),
  CONSTRAINT fk_bookingseat_seat FOREIGN KEY (Seat_Id) REFERENCES Seat(Seat_Id),
  CONSTRAINT fk_bookingseat_show FOREIGN KEY (Show_Id) REFERENCES ShowSchedule(Show_Id)
) ENGINE=InnoDB;

CREATE TABLE Payment (
  Payment_Id INT NOT NULL AUTO_INCREMENT,
  Payment_Date DATETIME NULL,
  Amount DECIMAL(10,2) NOT NULL,
  Payment_Method ENUM('Card', 'EFT', 'Cash') NOT NULL DEFAULT 'Card',
  Payment_Status ENUM('pending', 'successful', 'failed') NOT NULL DEFAULT 'pending',
  Transaction_Reference VARCHAR(100),
  Booking_Id INT NOT NULL,
  PRIMARY KEY (Payment_Id),
  UNIQUE KEY uq_payment_booking (Booking_Id),
  KEY idx_payment_status_date (Payment_Status, Payment_Date),
  CONSTRAINT chk_payment_amount CHECK (Amount > 0),
  CONSTRAINT fk_payment_booking FOREIGN KEY (Booking_Id) REFERENCES Booking(Booking_Id)
) ENGINE=InnoDB;
