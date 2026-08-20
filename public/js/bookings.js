// ==========================================
// LOAD CUSTOMERS
// ==========================================

async function loadCustomers() {

    const response =
        await fetch("/api/customers");

    const customers =
        await response.json();


    const select =
        document.getElementById("customer_id");


    select.innerHTML = `
        <option value="">
            Select customer
        </option>
    `;


    customers.forEach(customer => {

        select.innerHTML += `
            <option value="${customer.id}">
                ${customer.name} - ${customer.phone}
            </option>
        `;

    });

}


// ==========================================
// LOAD AVAILABLE ROOMS
// ==========================================

async function loadRooms() {

    const response =
        await fetch("/api/rooms");

    const rooms =
        await response.json();


    const select =
        document.getElementById("room_id");


    select.innerHTML = `
        <option value="">
            Select available room
        </option>
    `;


    rooms
        .filter(room => room.status === "Available")
        .forEach(room => {

            select.innerHTML += `
                <option value="${room.id}">
                    Room ${room.room_number}
                    - ${room.room_type}
                    - ₹${room.price}
                </option>
            `;

        });

}


// ==========================================
// LOAD BOOKINGS
// ==========================================

async function loadBookings() {

    const response =
        await fetch("/api/bookings");

    const bookings =
        await response.json();


    const table =
        document.getElementById("bookingTable");


    if (bookings.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8"
                    class="loading">

                    No bookings found.

                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        bookings.map(booking => {

            return `
                <tr>

                    <td>
                        #${booking.id}
                    </td>

                    <td>
                        <strong>
                            ${booking.customer_name}
                        </strong>
                    </td>

                    <td>
                        ${booking.customer_phone}
                    </td>

                    <td>
                        Room ${booking.room_number}
                    </td>

                    <td>
                        ${booking.check_in}
                    </td>

                    <td>
                        ${booking.check_out}
                    </td>

                    <td>

                        <span class="status-badge
                            ${booking.status.toLowerCase()}">

                            ${booking.status}

                        </span>

                    </td>

                    <td>

                        ${
                            booking.status !== "Cancelled"
                            ?

                            `<button
                                class="delete-btn"
                                onclick="cancelBooking(${booking.id})">

                                Cancel

                            </button>`

                            :

                            "-"
                        }

                    </td>

                </tr>
            `;

        }).join("");

}


// ==========================================
// CREATE BOOKING
// ==========================================

document
    .getElementById("bookingForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const booking = {

                customer_id:
                    document.getElementById(
                        "customer_id"
                    ).value,

                room_id:
                    document.getElementById(
                        "room_id"
                    ).value,

                check_in:
                    document.getElementById(
                        "check_in"
                    ).value,

                check_out:
                    document.getElementById(
                        "check_out"
                    ).value

            };


            try {

                const response =
                    await fetch(
                        "/api/bookings",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(booking)
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.error ||
                        "Booking failed"
                    );

                    return;

                }


                alert(
                    "Booking created successfully!"
                );


                document
                    .getElementById("bookingForm")
                    .reset();


                loadBookings();

                loadRooms();


            } catch (error) {

                console.error(error);

                alert("Server error");

            }

        }
    );


// ==========================================
// CANCEL BOOKING
// ==========================================

async function cancelBooking(id) {

    if (!confirm(
        "Cancel this booking?"
    )) {

        return;

    }


    const response =
        await fetch(
            `/api/bookings/${id}/cancel`,
            {
                method: "PUT"
            }
        );


    const result =
        await response.json();


    if (!response.ok) {

        alert(
            result.error ||
            "Failed to cancel booking"
        );

        return;

    }


    alert(
        "Booking cancelled successfully!"
    );


    loadBookings();

    loadRooms();

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadCustomers();

loadRooms();

loadBookings();