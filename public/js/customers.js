let editingCustomerId = null;


// ==========================================
// LOAD CUSTOMERS
// ==========================================

async function loadCustomers() {

    try {

        const response =
            await fetch("/api/customers");

        const customers =
            await response.json();

        const table =
            document.getElementById("customerTable");


        if (customers.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="6" class="loading">
                        No customers found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML = customers.map(customer => {

            return `
                <tr>

                    <td>
                        #${customer.id}
                    </td>

                    <td>
                        <strong>
                            ${customer.name}
                        </strong>
                    </td>

                    <td>
                        ${customer.email}
                    </td>

                    <td>
                        ${customer.phone}
                    </td>

                    <td>
                        ${customer.address || "-"}
                    </td>

                    <td>

                        <button
                            class="edit-btn"
                            onclick="editCustomer(${customer.id})">

                            Edit

                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteCustomer(${customer.id})">

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

function openCustomerForm() {

    editingCustomerId = null;

    document.getElementById("formTitle").textContent =
        "Add Customer";

    document.getElementById("customerForm").style.display =
        "block";

    document.getElementById("customerFormElement").reset();

    document.getElementById("customerId").value = "";

}


// ==========================================
// CLOSE FORM
// ==========================================

function closeCustomerForm() {

    document.getElementById("customerForm").style.display =
        "none";

}


// ==========================================
// SAVE CUSTOMER
// ==========================================

document
    .getElementById("customerFormElement")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const customer = {

            name:
                document.getElementById("name").value,

            email:
                document.getElementById("email").value,

            phone:
                document.getElementById("phone").value,

            address:
                document.getElementById("address").value

        };


        try {

            let response;


            // UPDATE

            if (editingCustomerId) {

                response = await fetch(
                    `/api/customers/${editingCustomerId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(customer)
                    }
                );

            }


            // CREATE

            else {

                response = await fetch(
                    "/api/customers",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(customer)
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
                editingCustomerId
                    ? "Customer updated successfully!"
                    : "Customer added successfully!"
            );


            closeCustomerForm();

            loadCustomers();


        } catch (error) {

            console.error(error);

            alert("Server error");

        }

    });


// ==========================================
// EDIT CUSTOMER
// ==========================================

async function editCustomer(id) {

    try {

        const response =
            await fetch("/api/customers");

        const customers =
            await response.json();


        const customer =
            customers.find(
                item => item.id === id
            );


        if (!customer) {

            alert("Customer not found");

            return;

        }


        editingCustomerId = id;


        document.getElementById("formTitle").textContent =
            "Edit Customer";


        document.getElementById("customerForm").style.display =
            "block";


        document.getElementById("customerId").value =
            customer.id;


        document.getElementById("name").value =
            customer.name;


        document.getElementById("email").value =
            customer.email;


        document.getElementById("phone").value =
            customer.phone;


        document.getElementById("address").value =
            customer.address || "";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

    }

}


// ==========================================
// DELETE CUSTOMER
// ==========================================

async function deleteCustomer(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this customer?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/customers/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Failed to delete customer"
            );

            return;

        }


        alert(
            "Customer deleted successfully!"
        );


        loadCustomers();


    } catch (error) {

        console.error(error);

        alert("Server error");

    }

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadCustomers();