-- ==========================================
-- HOTEL MANAGEMENT SYSTEM DATABASE
-- ==========================================

PRAGMA foreign_keys = ON;

-- ==========================================
-- CUSTOMERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ROOMS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number TEXT UNIQUE NOT NULL,
    room_type TEXT NOT NULL,
    price REAL NOT NULL CHECK(price > 0),
    status TEXT NOT NULL DEFAULT 'Available'
        CHECK(status IN ('Available', 'Occupied', 'Maintenance'))
);

-- ==========================================
-- BOOKINGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    customer_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,

    check_in DATE NOT NULL,
    check_out DATE NOT NULL,

    status TEXT NOT NULL DEFAULT 'Booked'
        CHECK(status IN ('Booked', 'Checked-In', 'Checked-Out', 'Cancelled')),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON DELETE CASCADE,

    CHECK(check_out > check_in)
);

-- ==========================================
-- PAYMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    booking_id INTEGER NOT NULL,

    amount REAL NOT NULL CHECK(amount > 0),

    payment_method TEXT NOT NULL
        CHECK(payment_method IN ('Cash', 'Card', 'UPI')),

    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE CASCADE
);

-- ==========================================
-- TRIGGER
-- Automatically changes room status when
-- a booking is created
-- ==========================================

CREATE TRIGGER IF NOT EXISTS update_room_status_after_booking
AFTER INSERT ON bookings
BEGIN
    UPDATE rooms
    SET status = 'Occupied'
    WHERE id = NEW.room_id;
END;

-- ==========================================
-- SAMPLE CUSTOMERS
-- ==========================================

INSERT OR IGNORE INTO customers
(name, email, phone, address)
VALUES
('Rahul Sharma', 'rahul@gmail.com', '9876543210', 'Lucknow'),
('Aman Verma', 'aman@gmail.com', '9876543211', 'Kanpur'),
('Priya Singh', 'priya@gmail.com', '9876543212', 'Delhi');

-- ==========================================
-- SAMPLE ROOMS
-- ==========================================

INSERT OR IGNORE INTO rooms
(room_number, room_type, price, status)
VALUES
('101', 'Single', 1500, 'Available'),
('102', 'Double', 2500, 'Available'),
('103', 'Deluxe', 3500, 'Available'),
('104', 'Suite', 5000, 'Available'),
('105', 'Single', 1500, 'Available');