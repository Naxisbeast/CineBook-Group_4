-- =============================================================
-- CineBook Phase 3 - Extra Oracle functionality
-- Demonstrates transactional booking logic and automatic booking
-- confirmation after successful payment.
-- =============================================================

SET DEFINE OFF;

CREATE OR REPLACE TRIGGER trg_payment_confirms_booking
AFTER INSERT OR UPDATE OF Payment_Status ON Payment
FOR EACH ROW
WHEN (NEW.Payment_Status = 'successful')
BEGIN
    UPDATE Booking
    SET Status = 'confirmed'
    WHERE Booking_Id = :NEW.Booking_Id;
END;
/

CREATE OR REPLACE PROCEDURE sp_create_booking (
    p_user_id     IN  NUMBER,
    p_show_id     IN  NUMBER,
    p_seat_ids    IN  SYS.ODCINUMBERLIST,
    p_booking_id  OUT NUMBER
) AS
    v_price        ShowSchedule.Price_Per_Seat%TYPE;
    v_screen_id    ShowSchedule.Screen_Id%TYPE;
    v_valid_count  NUMBER;
    v_total        NUMBER(10,2);
BEGIN
    IF p_seat_ids IS NULL OR p_seat_ids.COUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'At least one seat must be selected.');
    END IF;

    SELECT Price_Per_Seat, Screen_Id
    INTO v_price, v_screen_id
    FROM ShowSchedule
    WHERE Show_Id = p_show_id;

    SELECT COUNT(*)
    INTO v_valid_count
    FROM Seat
    WHERE Screen_Id = v_screen_id
      AND Seat_Id IN (SELECT COLUMN_VALUE FROM TABLE(p_seat_ids));

    IF v_valid_count <> p_seat_ids.COUNT THEN
        RAISE_APPLICATION_ERROR(-20002, 'One or more seats do not belong to the selected show screen.');
    END IF;

    v_total := v_price * p_seat_ids.COUNT;

    INSERT INTO Booking (User_Id, Show_Id, Total_Amount, Status)
    VALUES (p_user_id, p_show_id, v_total, 'pending')
    RETURNING Booking_Id INTO p_booking_id;

    FOR i IN 1..p_seat_ids.COUNT LOOP
        INSERT INTO BookingSeat (Booking_Id, Seat_Id, Show_Id)
        VALUES (p_booking_id, p_seat_ids(i), p_show_id);
    END LOOP;

    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20003, 'One or more selected seats have already been booked.');
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20004, 'Selected show was not found.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Demo block for SQL Developer. Uncomment during the video if needed.
-- VARIABLE new_booking_id NUMBER
-- BEGIN
--     sp_create_booking(5, 8, SYS.ODCINUMBERLIST(161, 162), :new_booking_id);
-- END;
-- /
-- PRINT new_booking_id
-- SELECT * FROM vw_booking_history WHERE Booking_Id = :new_booking_id;
