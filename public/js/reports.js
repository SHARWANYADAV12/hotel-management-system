async function loadReports() {

    try {

        const response =
            await fetch("/api/reports");

        const data =
            await response.json();


        document.getElementById(
            "totalRevenue"
        ).textContent =
            `₹${data.totalRevenue}`;


        document.getElementById(
            "totalBookings"
        ).textContent =
            data.totalBookings;


        document.getElementById(
            "totalCustomers"
        ).textContent =
            data.totalCustomers;


        const roomReport =
            document.getElementById(
                "roomReport"
            );


        if (data.roomStats.length === 0) {

            roomReport.innerHTML =
                "<p>No room data available.</p>";

            return;

        }


        roomReport.innerHTML =
            data.roomStats.map(item => {

                return `
                    <div class="report-row">

                        <span>
                            ${item.status}
                        </span>

                        <strong>
                            ${item.count}
                        </strong>

                    </div>
                `;

            }).join("");


    } catch (error) {

        console.error(error);

        document.getElementById(
            "roomReport"
        ).innerHTML =
            "Failed to load reports.";

    }

}


loadReports();