-- =========================
-- DROpping old tables to RESET if they do exist)
-- =========================
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

-- =========================
-- USERS
-- =========================
CREATE TABLE Users (
    User_Id NUMBER(10) PRIMARY KEY,
    Full_Name VARCHAR2(100) NOT NULL,
    Email VARCHAR2(150) NOT NULL UNIQUE,
    Password_Hash VARCHAR2(255) NOT NULL,
    Role VARCHAR2(20) DEFAULT 'customer' NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================
-- MOVIE
-- =========================
CREATE TABLE Movie (
    Movie_Id NUMBER(10) PRIMARY KEY,
    Title VARCHAR2(200) NOT NULL,
    Genre VARCHAR2(100) NOT NULL,
    Duration NUMBER(10) NOT NULL,
    Language VARCHAR2(50) DEFAULT 'English' NOT NULL,
    Rating NUMBER(3,1),
    Poster_Url VARCHAR2(500),
    Description VARCHAR2(500),
    Release_Date TIMESTAMP,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================
-- THEATRE
-- =========================
CREATE TABLE Theatre (
    Theatre_Id NUMBER(10) PRIMARY KEY,
    Name VARCHAR2(150) NOT NULL,
    Location VARCHAR2(255) NOT NULL,
    City VARCHAR2(100) NOT NULL,
    Phone VARCHAR2(20)
);

-- =========================
-- SCREEN
-- =========================
CREATE TABLE Screen (
    Screen_Id NUMBER(10) PRIMARY KEY,
    Theatre_Id NUMBER(10) NOT NULL,
    Name VARCHAR2(50) NOT NULL,
    Total_Seats NUMBER(10) DEFAULT 0 NOT NULL,
    CONSTRAINT fk_screen_theatre FOREIGN KEY (Theatre_Id)
    REFERENCES Theatre(Theatre_Id)
);

-- =========================
-- SEAT
-- =========================
CREATE TABLE Seat (
    Seat_Id NUMBER(10) PRIMARY KEY,
    Screen_Id NUMBER(10) NOT NULL,
    Seat_Row CHAR(1) NOT NULL,
    Seat_Number NUMBER(10) NOT NULL,
    Seat_Type VARCHAR2(20) DEFAULT 'Standard' NOT NULL,

    CONSTRAINT uq_seat UNIQUE (Screen_Id, Seat_Row, Seat_Number),

    CONSTRAINT chk_seat_type
        CHECK (Seat_Type IN ('Standard', 'Premium', 'VIP')),

    CONSTRAINT fk_seat_screen
        FOREIGN KEY (Screen_Id)
        REFERENCES Screen(Screen_Id)
);

-- =========================
-- SHOWSCHEDULE
-- =========================
CREATE TABLE ShowSchedule (
    Show_Id NUMBER(10) PRIMARY KEY,
    Movie_Id NUMBER(10) NOT NULL,
    Screen_Id NUMBER(10) NOT NULL,
    Show_DateTime TIMESTAMP NOT NULL,
    Price NUMBER(10,2) DEFAULT 0.00 NOT NULL,

    CONSTRAINT fk_show_movie FOREIGN KEY (Movie_Id)
        REFERENCES Movie(Movie_Id),

    CONSTRAINT fk_show_screen FOREIGN KEY (Screen_Id)
        REFERENCES Screen(Screen_Id)
);

-- =========================
-- BOOKING
-- =========================
CREATE TABLE Booking (
    Booking_Id NUMBER(10) PRIMARY KEY,
    User_Id NUMBER(10) NOT NULL,
    Show_Id NUMBER(10) NOT NULL,
    Total_Amount NUMBER(10,2) DEFAULT 0.00 NOT NULL,
    Status VARCHAR2(20) DEFAULT 'pending' NOT NULL,
    Booked_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT chk_booking_status
        CHECK (Status IN ('pending', 'confirmed', 'cancelled')),

    CONSTRAINT fk_booking_user FOREIGN KEY (User_Id)
        REFERENCES Users(User_Id),

    CONSTRAINT fk_booking_show FOREIGN KEY (Show_Id)
        REFERENCES ShowSchedule(Show_Id)
);

-- =========================
-- BOOKINGSEAT
-- =========================
CREATE TABLE BookingSeat (
    Booking_Seat_Id NUMBER(10) PRIMARY KEY,
    Booking_Id NUMBER(10) NOT NULL,
    Seat_Id NUMBER(10) NOT NULL,
    Show_Id NUMBER(10) NOT NULL,

    CONSTRAINT uq_booking_seat UNIQUE (Show_Id, Seat_Id),

    CONSTRAINT fk_bs_booking FOREIGN KEY (Booking_Id)
        REFERENCES Booking(Booking_Id),

    CONSTRAINT fk_bs_seat FOREIGN KEY (Seat_Id)
        REFERENCES Seat(Seat_Id),

    CONSTRAINT fk_bs_show FOREIGN KEY (Show_Id)
        REFERENCES ShowSchedule(Show_Id)
);

-- =========================
-- PAYMENT
-- =========================
CREATE TABLE Payment (
    Payment_Id NUMBER(10) PRIMARY KEY,
    Booking_Id NUMBER(10) NOT NULL UNIQUE,
    Amount NUMBER(10,2) NOT NULL,
    Payment_Method VARCHAR2(20) DEFAULT 'card' NOT NULL,
    Payment_Status VARCHAR2(20) DEFAULT 'pending' NOT NULL,
    Paid_At TIMESTAMP,

    CONSTRAINT chk_payment_status
        CHECK (Payment_Status IN ('pending', 'successful', 'failed')),

    CONSTRAINT fk_payment_booking FOREIGN KEY (Booking_Id)
        REFERENCES Booking(Booking_Id)
);