const currentDate = document.querySelector(".current-date");
const daysTag = document.querySelector(".days");
const prevNextIcon = document.querySelectorAll(".icons span");
const backBtn = document.querySelector("#back-btn");

const decadeView = document.querySelector(".decade-view");
const yearView = document.querySelector(".year-view");
const monthView = document.querySelector(".month-view");
const dayView = document.querySelector(".day-view");

const yearsList = document.querySelector(".years-list");
const monthsList = document.querySelector(".months-list");
const hoursList = document.querySelector(".hours-list");

// State
let date = new Date();
let currYear = date.getFullYear();
let currMonth = date.getMonth();
let currDay = date.getDate();
let currentView = 'month'; // 'decade', 'year', 'month', 'day'

// Decade view range start (e.g., 2020 for 2020-2029)
let decadeStart = Math.floor(currYear / 12) * 12;

const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

// --- View Rendering Functions ---

const renderDecadeView = () => {
    currentView = 'decade';
    decadeView.style.display = 'block';
    yearView.style.display = 'none';
    monthView.style.display = 'none';
    dayView.style.display = 'none';
    backBtn.style.display = 'none'; // Top level

    // Show range in header, e.g., "2016 - 2027"
    currentDate.innerText = `${decadeStart} - ${decadeStart + 11}`;

    let liTag = "";
    // Show 12 years in the grid
    for (let i = 0; i < 12; i++) {
        let year = decadeStart + i;
        let activeClass = (year === new Date().getFullYear()) ? 'active' : '';
        liTag += `<li class="${activeClass}" onclick="selectYear(${year})">${year}</li>`;
    }
    yearsList.innerHTML = liTag;
}

const renderYearView = () => {
    currentView = 'year';
    decadeView.style.display = 'none';
    yearView.style.display = 'block';
    monthView.style.display = 'none';
    dayView.style.display = 'none';
    backBtn.style.display = 'block'; // Back to Decade

    currentDate.innerText = `${currYear}`;

    let liTag = "";
    months.forEach((month, index) => {
        let activeClass = (index === new Date().getMonth() && currYear === new Date().getFullYear()) ? 'active' : '';
        liTag += `<li class="${activeClass}" onclick="selectMonth(${index})">${month}</li>`;
    });
    monthsList.innerHTML = liTag;
}

const renderMonthView = () => {
    currentView = 'month';
    decadeView.style.display = 'none';
    yearView.style.display = 'none';
    monthView.style.display = 'block';
    dayView.style.display = 'none';
    backBtn.style.display = 'block'; // Back to Year

    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay();
    let lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate();
    let lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay();
    let lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) {
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) {
        let isToday = i === date.getDate() && currMonth === new Date().getMonth()
            && currYear === new Date().getFullYear() ? "active" : "";
        liTag += `<li class="${isToday}" onclick="selectDay(${i})">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;
}

const renderDayView = () => {
    currentView = 'day';
    decadeView.style.display = 'none';
    yearView.style.display = 'none';
    monthView.style.display = 'none';
    dayView.style.display = 'block';
    backBtn.style.display = 'block'; // Back to Month

    currentDate.innerText = `${currDay} ${months[currMonth]} ${currYear}`;

    let liTag = "";
    for (let i = 0; i < 24; i++) {
        let hour = i < 10 ? `0${i}:00` : `${i}:00`;
        liTag += `<li>
                    <span class="time-slot">${hour}</span>
                    <span class="event-slot">No events</span>
                  </li>`;
    }
    hoursList.innerHTML = liTag;
}

// --- Navigation Actions ---

window.selectYear = (year) => {
    currYear = year;
    renderYearView();
}

window.selectMonth = (monthIndex) => {
    currMonth = monthIndex;
    renderMonthView();
}

window.selectDay = (day) => {
    currDay = day;
    renderDayView();
}

prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () => {
        if (currentView === 'month') {
            currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
            if (currMonth < 0 || currMonth > 11) {
                date = new Date(currYear, currMonth, new Date().getDate());
                currYear = date.getFullYear();
                currMonth = date.getMonth();
            } else {
                date = new Date();
            }
            renderMonthView();
        } else if (currentView === 'year') {
            currYear = icon.id === "prev" ? currYear - 1 : currYear + 1;
            renderYearView();
        } else if (currentView === 'decade') {
            decadeStart = icon.id === "prev" ? decadeStart - 12 : decadeStart + 12;
            renderDecadeView();
        } else if (currentView === 'day') {
            let currentObj = new Date(currYear, currMonth, currDay);
            if (icon.id === "prev") {
                currentObj.setDate(currentObj.getDate() - 1);
            } else {
                currentObj.setDate(currentObj.getDate() + 1);
            }
            currDay = currentObj.getDate();
            currMonth = currentObj.getMonth();
            currYear = currentObj.getFullYear();
            renderDayView();
        }
    });
});

backBtn.addEventListener("click", () => {
    if (currentView === 'day') {
        renderMonthView();
    } else if (currentView === 'month') {
        renderYearView();
    } else if (currentView === 'year') {
        renderDecadeView();
    }
});

currentDate.addEventListener("click", () => {
    if (currentView === 'day') {
        renderMonthView();
    } else if (currentView === 'month') {
        renderYearView();
    } else if (currentView === 'year') {
        renderDecadeView();
    }
});

renderMonthView();
