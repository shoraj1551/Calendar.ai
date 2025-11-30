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

// Theme Selector
const themeSelector = document.querySelector("#theme-selector");

// Load saved theme
const savedTheme = localStorage.getItem("calendar-theme") || "theme-light";
document.body.className = savedTheme;
themeSelector.value = savedTheme;

themeSelector.addEventListener("change", (e) => {
    const selectedTheme = e.target.value;
    document.body.className = selectedTheme;
    localStorage.setItem("calendar-theme", selectedTheme);
});

// Modal Elements
const eventModal = document.querySelector("#event-modal");
const closeBtn = document.querySelector(".close-btn");
const eventTitleInput = document.querySelector("#event-title");
const eventAgendaInput = document.querySelector("#event-agenda");
const eventTimeInput = document.querySelector("#event-time");
const eventDurationInput = document.querySelector("#event-duration");
const endTimeDisplay = document.querySelector("#end-time-display");
const saveEventBtn = document.querySelector("#save-event");
const deleteEventBtn = document.querySelector("#delete-event");

// State
let date = new Date();
let currYear = date.getFullYear();
let currMonth = date.getMonth();
let currDay = date.getDate();
let currentView = 'month'; // 'decade', 'year', 'month', 'day'

// Events State: { "YYYY-MM-DD": [ { title: "Meeting", agenda: "...", time: "10:00" } ] }
let eventsObj = JSON.parse(localStorage.getItem("calendar-events") || "{}");
let selectedEvent = null; // For editing/deleting

// Decade view range start (e.g., 2020 for 2020-2029)
let decadeStart = Math.floor(currYear / 12) * 12;

const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

// --- Helper Functions ---
const getEventKey = (year, month, day) => {
    return `${year}-${month + 1}-${day}`;
}

const saveEvents = () => {
    localStorage.setItem("calendar-events", JSON.stringify(eventsObj));
}

const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    date.setMinutes(date.getMinutes() + parseInt(durationMinutes));

    const endHours = String(date.getHours()).padStart(2, '0');
    const endMinutes = String(date.getMinutes()).padStart(2, '0');
    return `${endHours}:${endMinutes}`;
}

const updateEndTimeDisplay = () => {
    if (eventTimeInput.value && eventDurationInput.value) {
        const endTime = calculateEndTime(eventTimeInput.value, eventDurationInput.value);
        endTimeDisplay.innerText = `End Time: ${endTime}`;
    } else {
        endTimeDisplay.innerText = "End Time: --:--";
    }
}

eventTimeInput.addEventListener("change", updateEndTimeDisplay);
eventDurationInput.addEventListener("input", updateEndTimeDisplay);

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

        // Check for events
        let eventKey = getEventKey(currYear, currMonth, i);
        let hasEvent = eventsObj[eventKey] && eventsObj[eventKey].length > 0;
        let eventDot = hasEvent ? `<div class="event-dot"></div>` : "";

        liTag += `<li class="${isToday}" onclick="selectDay(${i})">${i}${eventDot}</li>`;
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

    let eventKey = getEventKey(currYear, currMonth, currDay);
    let dayEvents = eventsObj[eventKey] || [];

    let liTag = "";
    for (let i = 0; i < 24; i++) {
        let hour = i < 10 ? `0${i}:00` : `${i}:00`;

        // Find events for this hour
        let eventsForHour = dayEvents.filter(e => {
            const [eventHour] = e.time.split(':').map(Number);
            return eventHour === i;
        });

        let eventContent = "";
        let onClickAction = `openModal('${hour}')`;

        if (eventsForHour.length > 0) {
            eventContent = `<div style="display: flex; gap: 5px; overflow-x: auto;">`;
            eventsForHour.forEach(event => {
                const safeTitle = event.title.replace(/'/g, "\\'");
                const safeAgenda = (event.agenda || "").replace(/'/g, "\\'").replace(/\n/g, " ");
                const duration = event.duration || 60;
                const endTime = calculateEndTime(event.time, duration);

                // Calculate height based on duration (approx 1px per minute, min 40px)
                const height = Math.max(40, duration * 0.8);

                eventContent += `<div class="event-block" 
                                    onclick="event.stopPropagation(); openModal('${event.time}', '${safeTitle}', '${safeAgenda}', ${duration})"
                                    style="flex: 1; min-width: 100px; height: ${height}px; overflow: hidden;">
                                    <strong>${event.time} - ${endTime}</strong><br>
                                    <strong>${event.title}</strong><br>
                                    <span style="font-size:0.8em; opacity:0.8;">${event.agenda || ''}</span>
                                 </div>`;
            });
            eventContent += `</div>`;
        } else {
            eventContent = "No events";
        }

        liTag += `<li onclick="${onClickAction}" style="align-items: flex-start;">
                    <span class="time-slot" style="margin-top: 10px;">${hour}</span>
                    <span class="event-slot">${eventContent}</span>
                  </li>`;
    }
    hoursList.innerHTML = liTag;
}

// --- Modal Functions ---

window.openModal = (time, title = null, agenda = null, duration = 60) => {
    selectedEvent = title ? { time, title, agenda, duration } : null;
    eventTimeInput.value = time;
    eventTitleInput.value = title || "";
    eventAgendaInput.value = agenda || "";
    eventDurationInput.value = duration;
    updateEndTimeDisplay();
    deleteEventBtn.style.display = title ? "block" : "none";
    eventModal.style.display = "flex";
}

const closeModal = () => {
    eventModal.style.display = "none";
    selectedEvent = null;
    eventTitleInput.value = "";
    eventAgendaInput.value = "";
    eventTimeInput.value = "";
    eventDurationInput.value = "60";
    endTimeDisplay.innerText = "End Time: --:--";
}

closeBtn.addEventListener("click", closeModal);

saveEventBtn.addEventListener("click", () => {
    const title = eventTitleInput.value;
    const agenda = eventAgendaInput.value;
    const time = eventTimeInput.value;
    const duration = parseInt(eventDurationInput.value) || 60;

    if (title && time) {
        const eventKey = getEventKey(currYear, currMonth, currDay);
        if (!eventsObj[eventKey]) {
            eventsObj[eventKey] = [];
        }

        // If editing, remove old event first
        if (selectedEvent) {
            eventsObj[eventKey] = eventsObj[eventKey].filter(e => e.time !== selectedEvent.time || e.title !== selectedEvent.title);
        }

        // Add new event
        eventsObj[eventKey].push({ title, agenda, time, duration });

        // Sort events by time
        eventsObj[eventKey].sort((a, b) => a.time.localeCompare(b.time));

        saveEvents();
        closeModal();
        renderDayView();
    }
});

deleteEventBtn.addEventListener("click", () => {
    if (selectedEvent) {
        const eventKey = getEventKey(currYear, currMonth, currDay);
        if (eventsObj[eventKey]) {
            eventsObj[eventKey] = eventsObj[eventKey].filter(e => e.time !== selectedEvent.time);
            saveEvents();
        }
        closeModal();
        renderDayView();
    }
});

// Close modal if clicking outside
window.addEventListener("click", (e) => {
    if (e.target === eventModal) {
        closeModal();
    }
});

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
