const welcomeHeadline = document.getElementById("welcome-headline");
const tableContainerBooked = document.getElementById("table-container-booked");
const tableContainerCompleted = document.getElementById("table-container-completed");
const tableBodyBooked = document.getElementById("table-body-booked");
const tableBodyCompleted = document.getElementById("table-body-completed");
const btnDeleteBookings = document.getElementById("btn-delete-bookings");
const form = document.getElementById("booking-form");
const cleaningDate = document.getElementById("cleaning-date");

// Tom array att lagra JSON-data i.
let bookingList = [];

fetch("mockdata.json")
    .then(res => res.json())
    .then(data => {
        bookingList = data;
        // console.log(bookingList); // console logga ut och kontrollera att arrayen är fylld

        // Fyller titel på sidan med kundens namn
        welcomeHeadline.innerHTML = `Välkommen <span>${bookingList[0].kund}</span>!`;

        showBookings(); // måste kalla på funktionen här, annars är arrayen tom i funktionen

        createNewBooking();
    })
    .catch(error => console.log(error));

// Klass för att skapa objekt för bokning
class Booking {
    constructor(datum, tid, nivå, städare) {
        this.id = (bookingList.length + 1);
        this.datum = datum;
        this.tid = tid;
        this.kund = bookingList[0].kund;
        this.nivå = nivå;
        this.städare = städare;
        this.status = false;
    }
}

function showBookings() {
    // Skapar ny array från bookingList som sorterar i datumordning och sen loopa igenom den nya arrayen i for of-loopen.
    const sortedBookingList = bookingList.sort((a, b) => {
        return new Date(a.datum) - new Date(b.datum);
    })

    console.log(sortedBookingList) // kolla så att arrayen sortedBookingList har blivit rätt sorterad.

    for (let obj of sortedBookingList) {
        const tableRow = document.createElement("tr");
        const tableDataDate = document.createElement("td");
        const tableDataCleaner = document.createElement("td");
        const tableDataLevel = document.createElement("td");

        tableDataDate.innerHTML = `${obj.datum} kl. ${obj.tid}`;
        tableDataCleaner.innerHTML = obj.städare;
        tableDataLevel.innerHTML = obj.nivå;

        tableRow.appendChild(tableDataDate);
        tableRow.appendChild(tableDataCleaner);
        tableRow.appendChild(tableDataLevel);


        if (obj.status === false) {
            const tableDataDeleteTrash = document.createElement("td");
            tableDataDeleteTrash.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            tableDataDeleteTrash.classList.add("td-delete-trashcan");

            tableRow.appendChild(tableDataDeleteTrash);
            tableBodyBooked.appendChild(tableRow);
            tableContainerBooked.appendChild(tableBodyBooked);

            deleteUpcomingBookings(tableDataDeleteTrash, tableRow, obj); // kallar på funktion som raderar objekt från arrayen Bookinglist och rätt rad från Kommande städningar.
        } else {
            const tableDataDeleteCheckbox = document.createElement("td");
            const checkboxDelete = document.createElement("input");
            checkboxDelete.setAttribute("type", "checkbox");
            // tableDataDeleteCheckbox.innerHTML = null;

            tableDataDeleteCheckbox.classList.add("td-delete-checkbox");

            tableDataDeleteCheckbox.appendChild(checkboxDelete);
            tableRow.appendChild(tableDataDeleteCheckbox);
            tableBodyCompleted.appendChild(tableRow);
            tableContainerCompleted.appendChild(tableBodyCompleted);

            deleteFormerBookings(checkboxDelete, tableRow, obj); // kallar på funktion som raderar objekt från arrayen Bookinglist och rätt rad från Utförda städningar.
        }
    }
}

// Funktion för att radera data från Kommande bokningar.
function deleteUpcomingBookings(deleteElement, rowElement, obj) {
    deleteElement.addEventListener('click', () => {

        rowElement.remove(); // raderar raden i tabellen.

        bookingList.splice((bookingList.indexOf(obj)), 1) // raderar objektet från arrayen bookingList

        console.log(bookingList); // console.log bookingList för att kontrollera att rätt objekt raderas från arrayen.
    })
}

// Funktion för att radera data från Utförda bokningar.
function deleteFormerBookings(checkbox, rowElement, obj) {

    btnDeleteBookings.addEventListener('click', () => {

        if (checkbox.checked) { // kollar om checkboxen är ikryssad

            checkbox.checked = false; // ändra status på den ikryssade checkboxen från true till false.

            rowElement.remove(); // raderar raden i tabellen.

            bookingList.splice((bookingList.indexOf(obj)), 1); // raderar objektet från arrayen bookingList 

            console.log(bookingList); // console.log bookingList för att kontrollera att rätt objekt raderas från arrayen.
        }
    })
}

// Funktion för att skpa nytt objekt med class Booking
function createNewBooking() {

    restrictDatePicker(); // kallar på funktionen för att begränsa val av datum.

    form.addEventListener('submit', createFormData);

    function createFormData(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        // lagrar key-values från Form-objektet i ett nytt objekt "formDataObj" i JSON-format.
        const formDataObj = Object.fromEntries(formData.entries());

        // variabel som kollar om datumet från form-input redan existerar på en bokning i arrayen bookingList.
        const filteredBooking = bookingList.find(obj => obj.datum === formDataObj.cleaningDate)

        // konditionsvillkor som kollar om variabeln filteredBooking är tom eller inte.
        if (!filteredBooking) {
            // Skapar nytt objekt av class Booking och hämtar input values från objektet formDataObj
            const newBooking = new Booking(formDataObj.cleaningDate, formDataObj.cleaningTime, formDataObj.service, formDataObj.cleanerChoice);

            // pushar nya objektet till arrayen bookingList
            bookingList.push(newBooking);

            tableBodyBooked.innerHTML = null;
            tableBodyCompleted.innerHTML = null;

            form.reset(); // Gör en reset av formuläret.

            showBookings(); // kallar på funktionen för att visa upp bokade städningar från arrayen "bookingList".

            alert(`Du har bokat en städning ${formDataObj.cleaningDate} kl ${formDataObj.cleaningTime}`);


        } else {
            alert(`Du har redan en städning inbokad ${formDataObj.cleaningDate}. Vänligen välj ett annat datum!`);
        }
    };
}

// funktion som ser till att man inte kan välja ett datum tidigare än dagens datum.
function restrictDatePicker() {
    const todaysDate = new Date();

    let monthAddZero = "";
    let dayAddZero = "";

    if (todaysDate.getMonth() <= 8) {
        monthAddZero = "0";
    }
    if (todaysDate.getDate() <= 9) {
        dayAddZero = "0";
    }

    cleaningDate.setAttribute("min", `${todaysDate.getFullYear()}-${monthAddZero}${todaysDate.getMonth() + 1}-${dayAddZero}${todaysDate.getDate()}`);
}
