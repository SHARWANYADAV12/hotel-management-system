async function loadDashboard() {

    try {

        const response = await fetch("/api/dashboard");

        const data = await response.json();

        document.getElementById("totalCustomers").textContent =
            data.totalCustomers;

        document.getElementById("availableRooms").textContent =
            data.availableRooms;

        document.getElementById("occupiedRooms").textContent =
            data.occupiedRooms;

        document.getElementById("totalBookings").textContent =
            data.totalBookings;

        displayRooms(data.rooms);

        displayBookings(data.bookings);

    } catch (error) {

        console.error("Dashboard error:", error);

    }
}


function displayRooms(rooms) {

    const container =
        document.getElementById("roomStatus");

    if (rooms.length === 0) {

        container.innerHTML =
            `<div class="loading">No rooms found.</div>`;

        return;
    }

    container.innerHTML = rooms.map(room => {

        return `
            <div class="room-item">

                <div class="room-info">

                    <strong>
                        Room ${room.room_number}
                    </strong>

                    <span>
                        ${room.room_type} · ₹${room.price}
                    </span>

                </div>

                <span class="status ${room.status.toLowerCase()}">
                    ${room.status}
                </span>

            </div>
        `;

    }).join("");
}


function displayBookings(bookings) {

    const container =
        document.getElementById("recentBookings");

    if (bookings.length === 0) {

        container.innerHTML =
            `<div class="loading">No bookings found.</div>`;

        return;
    }

    container.innerHTML = bookings.map(booking => {

        return `
            <div class="booking-item">

                <strong>
                    ${booking.customer_name}
                </strong>

                <span>
                    Room ${booking.room_number}
                    · ${booking.status}
                </span>

            </div>
        `;

    }).join("");
}


loadDashboard();