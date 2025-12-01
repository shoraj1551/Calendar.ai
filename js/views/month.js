import { state } from '../state.js';
import { months, getEventKey } from '../utils.js';

export const renderMonthView = () => {
    const decadeView = document.querySelector(".decade-view");
    const yearView = document.querySelector(".year-view");
    const monthView = document.querySelector(".month-view");
    const dayView = document.querySelector(".day-view");
    const backBtn = document.querySelector("#back-btn");
    const currentDate = document.querySelector(".current-date");
    const daysTag = document.querySelector(".days");

    state.currentView = 'month';
    decadeView.style.display = 'none';
    yearView.style.display = 'none';
    monthView.style.display = 'block';
    dayView.style.display = 'none';
    backBtn.style.display = 'block';

    let firstDayofMonth = new Date(state.currYear, state.currMonth, 1).getDay();
    let lastDateofMonth = new Date(state.currYear, state.currMonth + 1, 0).getDate();
    let lastDayofMonth = new Date(state.currYear, state.currMonth, lastDateofMonth).getDay();
    let lastDateofLastMonth = new Date(state.currYear, state.currMonth, 0).getDate();
    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) {
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) {
        let dateObj = new Date(state.currYear, state.currMonth, i);
        let dayOfWeek = dateObj.getDay();
        let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6) ? "weekend" : "";

        let isToday = i === new Date().getDate() && state.currMonth === new Date().getMonth()
            && state.currYear === new Date().getFullYear() ? "active" : "";

        // Check for events
        let eventKey = getEventKey(state.currYear, state.currMonth, i);
        let hasEvent = state.eventsObj[eventKey] && state.eventsObj[eventKey].length > 0;
        let eventDot = hasEvent ? `<div class="event-dot"></div>` : "";

        liTag += `<li class="${isToday} ${isWeekend}" onclick="selectDay(${i})">${i}${eventDot}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }
    currentDate.innerText = `${months[state.currMonth]} ${state.currYear}`;
    daysTag.innerHTML = liTag;
};
