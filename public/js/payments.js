// ==========================================
// LOAD BOOKINGS
// ==========================================

async function loadBookings() {

    const response =
        await fetch("/api/bookings");

    const bookings =
        await response.json();


    const select =
        document.getElementById("booking_id");


    select.innerHTML = `
        <option value="">
            Select booking
        </option>
    `;


    bookings
        .filter(booking =>
            booking.status === "Booked"
        )
        .forEach(booking => {

            select.innerHTML += `
                <option value="${booking.id}">
                    Booking #${booking.id}
                    - ${booking.customer_name}
                    - Room ${booking.room_number}
                </option>
            `;

        });

}


// ==========================================
// LOAD PAYMENTS
// ==========================================

async function loadPayments() {

    const response =
        await fetch("/api/payments");

    const payments =
        await response.json();


    const table =
        document.getElementById("paymentTable");


    if (payments.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7"
                    class="loading">

                    No payments found.

                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        payments.map(payment => {

            return `
                <tr>

                    <td>
                        #${payment.id}
                    </td>

                    <td>
                        ${payment.customer_name}
                    </td>

                    <td>
                        Room ${payment.room_number}
                    </td>

                    <td>
                        ₹${payment.amount}
                    </td>

                    <td>
                        ${payment.payment_method}
                    </td>

                    <td>
                        ${payment.payment_date || "-"}
                    </td>

                    <td>

                        <span class="status-badge paid">
    Paid
</span>

                    </td>

                </tr>
            `;

        }).join("");

}


// ==========================================
// CREATE PAYMENT
// ==========================================

document
    .getElementById("paymentForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const payment = {

                booking_id:
                    document.getElementById(
                        "booking_id"
                    ).value,

                amount:
                    document.getElementById(
                        "amount"
                    ).value,

                payment_method:
                    document.getElementById(
                        "payment_method"
                    ).value

            };


            const response =
                await fetch(
                    "/api/payments",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(payment)
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                alert(
                    result.error ||
                    "Payment failed"
                );

                return;

            }


            alert(
                "Payment recorded successfully!"
            );


            document
                .getElementById("paymentForm")
                .reset();


            loadPayments();

            loadBookings();

        }
    );


// ==========================================
// INITIAL LOAD
// ==========================================

loadBookings();

loadPayments();