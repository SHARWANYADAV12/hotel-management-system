let editingRoomId = null;


// ==========================================
// LOAD ROOMS
// ==========================================

async function loadRooms() {

    try {

        const response =
            await fetch("/api/rooms");

        const rooms =
            await response.json();

        const table =
            document.getElementById("roomTable");


        table.innerHTML = rooms.map(room => {

            return `
                <tr>

                    <td>
                        #${room.id}
                    </td>

                    <td>
                        <strong>
                            ${room.room_number}
                        </strong>
                    </td>

                    <td>
                        ${room.room_type}
                    </td>

                    <td>
                        ₹${room.price}
                    </td>

                    <td>

                        <span class="status-badge ${room.status.toLowerCase()}">

                            ${room.status}

                        </span>

                    </td>

                    <td>

                        <button
                            class="edit-btn"
                            onclick="editRoom(${room.id})">

                            Edit

                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteRoom(${room.id})">

                            Delete

                        </button>

                    </td>

                </tr>
            `;

        }).join("");


    } catch (error) {

        console.error(error);

    }

}


// ==========================================
// OPEN FORM
// ==========================================

function openRoomForm() {

    editingRoomId = null;

    document.getElementById("roomFormTitle").textContent =
        "Add Room";

    document.getElementById("roomForm").style.display =
        "block";

    document.getElementById("roomFormElement").reset();

}


// ==========================================
// CLOSE FORM
// ==========================================

function closeRoomForm() {

    document.getElementById("roomForm").style.display =
        "none";

}


// ==========================================
// SAVE ROOM
// ==========================================

document
    .getElementById("roomFormElement")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const room = {

            room_number:
                document.getElementById("room_number").value,

            room_type:
                document.getElementById("room_type").value,

            price:
                document.getElementById("price").value,

            status:
                document.getElementById("status").value

        };


        try {

            let response;


            if (editingRoomId) {

                response = await fetch(
                    `/api/rooms/${editingRoomId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(room)
                    }
                );

            } else {

                response = await fetch(
                    "/api/rooms",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(room)
                    }
                );

            }


            const result =
                await response.json();


            if (!response.ok) {

                alert(
                    result.error ||
                    "Something went wrong"
                );

                return;

            }


            alert(
                editingRoomId
                    ? "Room updated successfully!"
                    : "Room added successfully!"
            );


            closeRoomForm();

            loadRooms();


        } catch (error) {

            console.error(error);

            alert("Server error");

        }

    });


// ==========================================
// EDIT ROOM
// ==========================================

async function editRoom(id) {

    const response =
        await fetch("/api/rooms");

    const rooms =
        await response.json();


    const room =
        rooms.find(item => item.id === id);


    if (!room) {

        alert("Room not found");

        return;

    }


    editingRoomId = id;


    document.getElementById("roomFormTitle").textContent =
        "Edit Room";


    document.getElementById("roomForm").style.display =
        "block";


    document.getElementById("room_number").value =
        room.room_number;


    document.getElementById("room_type").value =
        room.room_type;


    document.getElementById("price").value =
        room.price;


    document.getElementById("status").value =
        room.status;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// DELETE ROOM
// ==========================================

async function deleteRoom(id) {

    if (!confirm(
        "Are you sure you want to delete this room?"
    )) {

        return;

    }


    const response =
        await fetch(
            `/api/rooms/${id}`,
            {
                method: "DELETE"
            }
        );


    const result =
        await response.json();


    if (!response.ok) {

        alert(
            result.error ||
            "Failed to delete room"
        );

        return;

    }


    alert(
        "Room deleted successfully!"
    );


    loadRooms();

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadRooms();