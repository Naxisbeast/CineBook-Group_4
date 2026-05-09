-- =============================================================
-- CineBook Online Cinema Ticket Booking System
-- Phase 3: Physical Design -- schema.sql
-- Group 4 | CMPG 311 | North-West University | 2026
-- Project Manager: Thapelo Kamogelo Wana
-- =============================================================
-- Corrected against Phase 2 LDM, ER Diagram, and Business Rules
-- All column names match the LDM exactly
-- GENERATED AS IDENTITY used for all PKs (Oracle 12c+)
-- =============================================================


-- =============================================================
-- STEP 1: DROP ALL TABLES (safe reset -- child tables first)
-- =============================================================

BEGIN EXECUTE IMMEDIATE 'DROP TABLE Payment CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE BookingSeat CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Booking CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE ShowSchedule CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Seat CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Screen CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Theatre CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Movie CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Users CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/


-- =============================================================
-- STEP 2: CREATE TABLES (parent tables first)
-- Order: Users -> Movie -> Theatre -> Screen -> Seat
--        -> ShowSchedule -> Booking -> BookingSeat -> Payment
-- =============================================================


-- =============================================================
-- TABLE 1: Users
-- Stores all registered users of the CineBook platform
-- Columns verified against Phase 2 LDM Section 3.1
-- Theatre_Id is nullable -- only populated for Cinema Manager role (BR11)
-- =============================================================
CREATE TABLE Users (
    User_Id         NUMBER(10)      GENERATED AS IDENTITY PRIMARY KEY,
    First_Name      VARCHAR2(100)   NOT NULL,
    Last_Name       VARCHAR2(100)   NOT NULL,
    Email           VARCHAR2(150)   NOT NULL,
    Phone_Number    VARCHAR2(20),
    Password_Hash   VARCHAR2(255)   NOT NULL,
    Role            VARCHAR2(30)    DEFAULT 'Customer' NOT NULL,
    Loyalty_Status  VARCHAR2(20)    DEFAULT 'Standard',
    Theatre_Id      NUMBER(10),
    Created_At      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT uq_users_email
        UNIQUE (Email),

    CONSTRAINT chk_users_role
        CHECK (Role IN ('Customer', 'Administrator', 'Cinema Manager', 'System Administrator')),

    CONSTRAINT chk_users_loyalty
        CHECK (Loyalty_Status IN ('Standard', 'Silver', 'Gold', 'Platinum'))
);
/


-- =============================================================
-- TABLE 2: Movie
-- Stores all movies available on the CineBook platform
-- Columns verified against Phase 2 LDM Section 3.1
-- Age_Rating is VARCHAR (e.g. PG, PG-13, R) per LDM
-- Cast_Info added per Phase 1 scope and Phase 2 ERD
-- Duration_Minutes renamed from Duration per LDM
-- =============================================================
CREATE TABLE Movie (
    Movie_Id        NUMBER(10)      GENERATED AS IDENTITY PRIMARY KEY,
    Title           VARCHAR2(200)   NOT NULL,
    Genre           VARCHAR2(100)   NOT NULL,
    Duration_Minutes NUMBER(5)      NOT NULL,
    Age_Rating      VARCHAR2(10)    NOT NULL,
    Description     VARCHAR2(1000),
    Cast_Info       VARCHAR2(1000),
    Poster_Url      VARCHAR2(500),
    Language        VARCHAR2(50)    DEFAULT 'English',
    Release_Date    TIMESTAMP,
    Created_At      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_movie_duration
        CHECK (Duration_Minutes > 0)
);
/


-- =============================================================
-- TABLE 3: Theatre
-- Stores cinema locations across South Africa
-- Columns verified against Phase 2 LDM Section 3.1
-- Total_Screens added per LDM and ERD
-- =============================================================
CREATE TABLE Theatre (
    Theatre_Id      NUMBER(10)      GENERATED AS IDENTITY PRIMARY KEY,
    Name            VARCHAR2(150)   NOT NULL,
    Location        VARCHAR2(255)   NOT NULL,
    City            VARCHAR2(100)   NOT NULL,
    Total_Screens   NUMBER(5)       DEFAULT 0 NOT NULL,
    Phone           VARCHAR2(20),

    CONSTRAINT chk_theatre_screens
        CHECK (Total_Screens >= 0)
);
/


-- =============================================================
-- TABLE 4: Screen
-- Stores individual screens within a theatre
-- Columns verified against Phase 2 LDM Section 3.1
-- Screen_Name renamed from Name per LDM
-- Screen_Type added per LDM and ERD (Standard, Premium, VIP)
-- =============================================================
CREATE TABLE Screen (
    Screen_Id       NUMBER(10)      GENERATED AS IDENTITY PRIMARY KEY,
    Theatre_Id      NUMBER(10)      NOT NULL,
    Screen_Name     VARCHAR2(100)   NOT NULL,
    Total_Seats     NUMBER(5)       DEFAULT 0 NOT NULL,
    Screen_Type     VARCHAR2(20)    DEFAULT 'Standard' NOT NULL,

    CONSTRAINT chk_screen_type
        CHECK (Screen_Type IN ('Standard', 'Premium', 'VIP')),

    CONSTRAINT chk_screen_seats
        CHECK (Total_Seats >= 0),

    CONSTRAINT fk_screen_theatre
        FOREIGN KEY (Theatre_Id)
        REFERENCES Theatre(Theatre_Id)
);
/


-- =============================================================
-- TABLE 5: Seat
-- Stores individual seats within a screen
-- Columns verified against Phase 2 LDM Section 3.1
-- Row_Label renamed from Seat_Row per LDM
-- Seat_Type CHECK enforces Standard/Premium/VIP (BR12)
-- UNIQUE on (Screen_Id, Row_Label, Seat_Number) prevents duplicate seats
-- =============================================================
CREATE TABLE Seat (
    Seat_Id         NUMBER(10)      GENERATED AS IDENTITY PRIMARY KEY,
    Screen_Id       NUMBER(10)      NOT NULL,
    Row_Label       CHAR(1)         NOT NULL,
    Seat_Number     NUMBER(5)       NOT NULL,
    Seat_Type       VARCHAR2(20)    DEFAULT 'Standard' NOT NULL,

    CONSTRAINT uq_seat_position
        UNIQUE (Screen_Id, Row_Label, Seat_Number),

    CONSTRAINT chk_seat_type
        CHECK (Seat_Type IN ('Standard', 'Premium', 'VIP')),

    CONSTRAINT fk_seat_screen
        FOREIGN KEY (Screen_Id)
        REFERENCES Screen(Screen_Id)
);
/


-- =============================================================
-- TABLE 6: ShowSchedule
-- Stores scheduled screenings linking a movie to a screen
-- Columns verified against Phase 2 LDM Section 3.1
-- Price_Per_Seat renamed from Price per LDM
-- UNIQUE on (Screen_Id, Show_DateTime) enforces BR17
--   (a screen cannot host two shows at the same time)
-- =============================================================
CREATE TABLE ShowSchedule (
    Show_Id         NUMBER(10)      GENERATED AS IDENTITY PRIMARY KEY,
    Movie_Id        NUMBER(10)      NOT NULL,
    Screen_Id       NUMBER(10)      NOT NULL,
    Show_DateTime   TIMESTAMP       NOT NULL,
    Price_Per_Seat  NUMBER(10,2)    DEFAULT 0.00 NOT NULL,

    CONSTRAINT uq_show_screen_time
        UNIQUE (Screen_Id, Show_DateTime),

    CONSTRAINT chk_show_price
        CHECK (Price_Per_Seat >= 0),

    CONSTRAINT fk_show_movie
        FOREIGN KEY (Movie_Id)
        REFERENCES Movie(Movie_Id),

    CONSTRAINT fk_show_screen
        FOREIGN KEY (Screen_Id)
        REFERENCES Screen(Screen_Id)
);
/


-- =============================================================
-- TABLE 7: Booking
-- Stores confirmed ticket bookings by users
-- Columns verified against Phase 2 LDM Section 3.1
-- Booking_Date renamed from Booked_At per LDM
-- Status CHECK enforces BR15 (pending/confirmed/cancelled)
-- =============================================================
CREATE TABLE Booking (
    Booking_Id      NUMBER(10)      GENERATED AS IDENTITY PRIMARY KEY,
    User_Id         NUMBER(10)      NOT NULL,
    Show_Id         NUMBER(10)      NOT NULL,
    Total_Amount    NUMBER(10,2)    DEFAULT 0.00 NOT NULL,
    Status          VARCHAR2(20)    DEFAULT 'pending' NOT NULL,
    Booking_Date    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_booking_status
        CHECK (Status IN ('pending', 'confirmed', 'cancelled')),

    CONSTRAINT chk_booking_amount
        CHECK (Total_Amount >= 0),

    CONSTRAINT fk_booking_user
        FOREIGN KEY (User_Id)
        REFERENCES Users(User_Id),

    CONSTRAINT fk_booking_show
        FOREIGN KEY (Show_Id)
        REFERENCES ShowSchedule(Show_Id)
);
/


-- =============================================================
-- TABLE 8: BookingSeat
-- Bridge/weak entity resolving Booking <-> Seat many-to-many
-- UNIQUE (Show_Id, Seat_Id) is the overbooking prevention
--   mechanism from Phase 1 Problem 2 and Business Rule 8
-- Columns verified against Phase 2 LDM Section 3.1
-- =============================================================
CREATE TABLE BookingSeat (
    Booking_Seat_Id NUMBER(10)      GENERATED AS IDENTITY PRIMARY KEY,
    Booking_Id      NUMBER(10)      NOT NULL,
    Seat_Id         NUMBER(10)      NOT NULL,
    Show_Id         NUMBER(10)      NOT NULL,

    CONSTRAINT uq_booking_seat
        UNIQUE (Show_Id, Seat_Id),

    CONSTRAINT fk_bs_booking
        FOREIGN KEY (Booking_Id)
        REFERENCES Booking(Booking_Id),

    CONSTRAINT fk_bs_seat
        FOREIGN KEY (Seat_Id)
        REFERENCES Seat(Seat_Id),

    CONSTRAINT fk_bs_show
        FOREIGN KEY (Show_Id)
        REFERENCES ShowSchedule(Show_Id)
);
/


-- =============================================================
-- TABLE 9: Payment
-- Stores payment records linked to bookings
-- Columns verified against Phase 2 LDM Section 3.1
-- Transaction_Reference added per Phase 1 Section 3.2 and LDM
--   (system stores reference from external gateway only)
-- Payment_Date renamed from Paid_At per LDM
-- UNIQUE on Booking_Id enforces one payment per booking (BR9)
-- Status CHECK enforces BR16 (pending/successful/failed)
-- =============================================================
CREATE TABLE Payment (
    Payment_Id              NUMBER(10)      GENERATED AS IDENTITY PRIMARY KEY,
    Booking_Id              NUMBER(10)      NOT NULL,
    Amount                  NUMBER(10,2)    NOT NULL,
    Payment_Method          VARCHAR2(20)    DEFAULT 'Card' NOT NULL,
    Payment_Status          VARCHAR2(20)    DEFAULT 'pending' NOT NULL,
    Transaction_Reference   VARCHAR2(100),
    Payment_Date            TIMESTAMP,

    CONSTRAINT uq_payment_booking
        UNIQUE (Booking_Id),

    CONSTRAINT chk_payment_status
        CHECK (Payment_Status IN ('pending', 'successful', 'failed')),

    CONSTRAINT chk_payment_method
        CHECK (Payment_Method IN ('Card', 'EFT', 'Cash')),

    CONSTRAINT chk_payment_amount
        CHECK (Amount > 0),

    CONSTRAINT fk_payment_booking
        FOREIGN KEY (Booking_Id)
        REFERENCES Booking(Booking_Id)
);
/


-- =============================================================
-- STEP 3: ADD DEFERRED FK (Users.Theatre_Id -> Theatre)
-- Added after both tables exist
-- Nullable -- only populated for Cinema Manager role (BR11)
-- =============================================================

ALTER TABLE Users
    ADD CONSTRAINT fk_users_theatre
    FOREIGN KEY (Theatre_Id)
    REFERENCES Theatre(Theatre_Id);
/


-- =============================================================
-- STEP 4: VERIFY ALL TABLES CREATED
-- Run this after the script to confirm success
-- =============================================================

SELECT table_name
FROM user_tables
WHERE table_name IN (
    'USERS', 'MOVIE', 'THEATRE', 'SCREEN', 'SEAT',
    'SHOWSCHEDULE', 'BOOKING', 'BOOKINGSEAT', 'PAYMENT'
)
ORDER BY table_name;
/

-- Expected output: 9 rows, one for each table
-- If any table is missing, check the error log and re-run that section
