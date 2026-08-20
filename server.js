const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// DATABASE
// ==========================================

const databaseFolder = path.join(__dirname, "database");

if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder);
}

const db = new Database(
    path.join(databaseFolder, "hotel.db")
);

db.pragma("foreign_keys = ON");

const databaseSQL = fs.readFileSync(
    path.join(databaseFolder, "database.sql"),
    "utf8"
);

db.exec(databaseSQL);

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(
    path.join(__dirname, "public")
));

// ==========================================
// TEST API
// ==========================================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Hotel Management System API is working!"
    });

});

// ==========================================
// DASHBOARD API
// ==========================================

app.get("/api/dashboard", (req, res) => {

    try {

        const totalCustomers = db.prepare(`
            SELECT COUNT(*) AS count
            FROM customers
        `).get().count;


        const availableRooms = db.prepare(`
            SELECT COUNT(*) AS count
            FROM rooms
            WHERE status = 'Available'
        `).get().count;


        const occupiedRooms = db.prepare(`
            SELECT COUNT(*) AS count
            FROM rooms
            WHERE status = 'Occupied'
        `).get().count;


        const totalBookings = db.prepare(`
            SELECT COUNT(*) AS count
            FROM bookings
        `).get().count;


        const rooms = db.prepare(`
            SELECT
                id,
                room_number,
                room_type,
                price,
                status
            FROM rooms
            ORDER BY room_number
            LIMIT 6
        `).all();


        const bookings = db.prepare(`
            SELECT
                bookings.id,
                customers.name AS customer_name,
                rooms.room_number,
                bookings.status
            FROM bookings

            INNER JOIN customers
                ON bookings.customer_id = customers.id

            INNER JOIN rooms
                ON bookings.room_id = rooms.id

            ORDER BY bookings.id DESC

            LIMIT 5
        `).all();


        res.json({
            totalCustomers,
            availableRooms,
            occupiedRooms,
            totalBookings,
            rooms,
            bookings
        });

    } catch (error) {

        console.error("Dashboard Error:", error);

        res.status(500).json({
            error: "Failed to load dashboard"
        });

    }

});
// ==========================================
// CUSTOMERS CRUD API
// ==========================================

// GET ALL CUSTOMERS
app.get("/api/customers", (req, res) => {

    try {

        const customers = db.prepare(`
            SELECT *
            FROM customers
            ORDER BY id DESC
        `).all();

        res.json(customers);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch customers"
        });

    }

});


// CREATE CUSTOMER
app.post("/api/customers", (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            address
        } = req.body;


        if (!name || !email || !phone) {

            return res.status(400).json({
                error: "Name, email and phone are required"
            });

        }


        const result = db.prepare(`
            INSERT INTO customers
            (name, email, phone, address)

            VALUES (?, ?, ?, ?)
        `).run(
            name,
            email,
            phone,
            address || ""
        );


        const customer = db.prepare(`
            SELECT *
            FROM customers
            WHERE id = ?
        `).get(result.lastInsertRowid);


        res.status(201).json(customer);

    } catch (error) {

        console.error(error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {

            return res.status(400).json({
                error: "Email already exists"
            });

        }

        res.status(500).json({
            error: "Failed to create customer"
        });

    }

});


// UPDATE CUSTOMER
app.put("/api/customers/:id", (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            email,
            phone,
            address
        } = req.body;


        if (!name || !email || !phone) {

            return res.status(400).json({
                error: "Name, email and phone are required"
            });

        }


        const result = db.prepare(`
            UPDATE customers

            SET
                name = ?,
                email = ?,
                phone = ?,
                address = ?

            WHERE id = ?
        `).run(
            name,
            email,
            phone,
            address || "",
            id
        );


        if (result.changes === 0) {

            return res.status(404).json({
                error: "Customer not found"
            });

        }


        const customer = db.prepare(`
            SELECT *
            FROM customers
            WHERE id = ?
        `).get(id);


        res.json(customer);

    } catch (error) {

        console.error(error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {

            return res.status(400).json({
                error: "Email already exists"
            });

        }

        res.status(500).json({
            error: "Failed to update customer"
        });

    }

});


// DELETE CUSTOMER
app.delete("/api/customers/:id", (req, res) => {

    try {

        const { id } = req.params;


        const result = db.prepare(`
            DELETE FROM customers
            WHERE id = ?
        `).run(id);


        if (result.changes === 0) {

            return res.status(404).json({
                error: "Customer not found"
            });

        }


        res.json({
            success: true,
            message: "Customer deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to delete customer"
        });

    }

});
// ==========================================
// ROOMS CRUD API
// ==========================================

// GET ALL ROOMS
app.get("/api/rooms", (req, res) => {

    try {

        const rooms = db.prepare(`
            SELECT *
            FROM rooms
            ORDER BY room_number
        `).all();

        res.json(rooms);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch rooms"
        });

    }

});


// CREATE ROOM
app.post("/api/rooms", (req, res) => {

    try {

        const {
            room_number,
            room_type,
            price,
            status
        } = req.body;


        if (!room_number || !room_type || !price) {

            return res.status(400).json({
                error: "Room number, type and price are required"
            });

        }


        const result = db.prepare(`
            INSERT INTO rooms
            (room_number, room_type, price, status)

            VALUES (?, ?, ?, ?)
        `).run(
            room_number,
            room_type,
            price,
            status || "Available"
        );


        const room = db.prepare(`
            SELECT *
            FROM rooms
            WHERE id = ?
        `).get(result.lastInsertRowid);


        res.status(201).json(room);

    } catch (error) {

        console.error(error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {

            return res.status(400).json({
                error: "Room number already exists"
            });

        }

        res.status(500).json({
            error: "Failed to create room"
        });

    }

});


// UPDATE ROOM
app.put("/api/rooms/:id", (req, res) => {

    try {

        const { id } = req.params;

        const {
            room_number,
            room_type,
            price,
            status
        } = req.body;


        if (!room_number || !room_type || !price) {

            return res.status(400).json({
                error: "Room number, type and price are required"
            });

        }


        const result = db.prepare(`
            UPDATE rooms

            SET
                room_number = ?,
                room_type = ?,
                price = ?,
                status = ?

            WHERE id = ?
        `).run(
            room_number,
            room_type,
            price,
            status,
            id
        );


        if (result.changes === 0) {

            return res.status(404).json({
                error: "Room not found"
            });

        }


        const room = db.prepare(`
            SELECT *
            FROM rooms
            WHERE id = ?
        `).get(id);


        res.json(room);

    } catch (error) {

        console.error(error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {

            return res.status(400).json({
                error: "Room number already exists"
            });

        }

        res.status(500).json({
            error: "Failed to update room"
        });

    }

});


// DELETE ROOM
app.delete("/api/rooms/:id", (req, res) => {

    try {

        const { id } = req.params;


        const result = db.prepare(`
            DELETE FROM rooms
            WHERE id = ?
        `).run(id);


        if (result.changes === 0) {

            return res.status(404).json({
                error: "Room not found"
            });

        }


        res.json({
            success: true,
            message: "Room deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to delete room"
        });

    }

});
// ==========================================
// BOOKINGS API
// ==========================================

// GET ALL BOOKINGS
app.get("/api/bookings", (req, res) => {

    try {

        const bookings = db.prepare(`
            SELECT
                bookings.id,
                bookings.customer_id,
                bookings.room_id,

                customers.name AS customer_name,
                customers.phone AS customer_phone,

                rooms.room_number,
                rooms.room_type,
                rooms.price,

                bookings.check_in,
                bookings.check_out,
                bookings.status

            FROM bookings

            INNER JOIN customers
                ON bookings.customer_id = customers.id

            INNER JOIN rooms
                ON bookings.room_id = rooms.id

            ORDER BY bookings.id DESC
        `).all();

        res.json(bookings);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch bookings"
        });

    }

});


// CREATE BOOKING
app.post("/api/bookings", (req, res) => {

    try {

        const {
            customer_id,
            room_id,
            check_in,
            check_out
        } = req.body;


        if (
            !customer_id ||
            !room_id ||
            !check_in ||
            !check_out
        ) {

            return res.status(400).json({
                error: "All booking fields are required"
            });

        }


        // Check room availability

        const room = db.prepare(`
            SELECT *
            FROM rooms
            WHERE id = ?
        `).get(room_id);


        if (!room) {

            return res.status(404).json({
                error: "Room not found"
            });

        }


        if (room.status !== "Available") {

            return res.status(400).json({
                error: "Room is not available"
            });

        }


        // Create booking

        const result = db.prepare(`
            INSERT INTO bookings
            (
                customer_id,
                room_id,
                check_in,
                check_out,
                status
            )

            VALUES (?, ?, ?, ?, 'Booked')
        `).run(
            customer_id,
            room_id,
            check_in,
            check_out
        );


        // Mark room as occupied

        db.prepare(`
            UPDATE rooms
            SET status = 'Occupied'
            WHERE id = ?
        `).run(room_id);


        const booking = db.prepare(`
            SELECT
                bookings.id,
                customers.name AS customer_name,
                rooms.room_number,
                bookings.check_in,
                bookings.check_out,
                bookings.status

            FROM bookings

            INNER JOIN customers
                ON bookings.customer_id = customers.id

            INNER JOIN rooms
                ON bookings.room_id = rooms.id

            WHERE bookings.id = ?
        `).get(result.lastInsertRowid);


        res.status(201).json(booking);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to create booking"
        });

    }

});


// CANCEL BOOKING
app.put("/api/bookings/:id/cancel", (req, res) => {

    try {

        const { id } = req.params;


        const booking = db.prepare(`
            SELECT *
            FROM bookings
            WHERE id = ?
        `).get(id);


        if (!booking) {

            return res.status(404).json({
                error: "Booking not found"
            });

        }


        db.prepare(`
            UPDATE bookings
            SET status = 'Cancelled'
            WHERE id = ?
        `).run(id);


        db.prepare(`
            UPDATE rooms
            SET status = 'Available'
            WHERE id = ?
        `).run(booking.room_id);


        res.json({
            success: true,
            message: "Booking cancelled successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to cancel booking"
        });

    }

});
// ==========================================
// PAYMENTS API
// ==========================================

// GET ALL PAYMENTS
app.get("/api/payments", (req, res) => {

    try {

        const payments = db.prepare(`
            SELECT
                payments.id,
                payments.booking_id,
                customers.name AS customer_name,
                rooms.room_number,
                payments.amount,
                payments.payment_method,
                payments.payment_date,
                payments.status

            FROM payments

            INNER JOIN bookings
                ON payments.booking_id = bookings.id

            INNER JOIN customers
                ON bookings.customer_id = customers.id

            INNER JOIN rooms
                ON bookings.room_id = rooms.id

            ORDER BY payments.id DESC
        `).all();

        res.json(payments);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to fetch payments"
        });

    }

});


// CREATE PAYMENT
app.post("/api/payments", (req, res) => {

    try {

        const {
            booking_id,
            amount,
            payment_method
        } = req.body;


        if (!booking_id || !amount || !payment_method) {

            return res.status(400).json({
                error: "All payment fields are required"
            });

        }


        const booking = db.prepare(`
            SELECT *
            FROM bookings
            WHERE id = ?
        `).get(booking_id);


        if (!booking) {

            return res.status(404).json({
                error: "Booking not found"
            });

        }


        const result = db.prepare(`
    INSERT INTO payments
    (
        booking_id,
        amount,
        payment_method
    )

    VALUES (?, ?, ?)
`).run(
    booking_id,
    amount,
    payment_method
);


        const payment = db.prepare(`
            SELECT *
            FROM payments
            WHERE id = ?
        `).get(result.lastInsertRowid);


        res.status(201).json(payment);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to create payment"
        });

    }

});
// ==========================================
// REPORTS API
// ==========================================

app.get("/api/reports", (req, res) => {

    try {

        const totalRevenue = db.prepare(`
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM payments
        `).get().total;


        const totalBookings = db.prepare(`
            SELECT COUNT(*) AS count
            FROM bookings
        `).get().count;


        const totalCustomers = db.prepare(`
            SELECT COUNT(*) AS count
            FROM customers
        `).get().count;


        const roomStats = db.prepare(`
            SELECT
                status,
                COUNT(*) AS count
            FROM rooms
            GROUP BY status
        `).all();


        res.json({

            totalRevenue,
            totalBookings,
            totalCustomers,
            roomStats

        });


    } catch (error) {

        console.error("Reports Error:", error);

        res.status(500).json({
            error: "Failed to generate report"
        });

    }

});

// ==========================================
// SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Hotel Management System running at http://localhost:${PORT}`
    );

});