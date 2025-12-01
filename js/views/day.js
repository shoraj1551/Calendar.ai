import { state } from '../state.js';
import { months, getEventKey, calculateEndTime } from '../utils.js';

export const renderDayView = () => {
    const decadeView = document.querySelector(".decade-view");
    const yearView = document.querySelector(".year-view");
    const monthView = document.querySelector(".month-view");
    const dayView = document.querySelector(".day-view");
    const backBtn = document.querySelector("#back-btn");
    const currentDate = document.querySelector(".current-date");
    const hoursList = document.querySelector(".hours-list");

    state.currentView = 'day';
    decadeView.style.display = 'none';
    yearView.style.display = 'none';
    monthView.style.display = 'none';
    dayView.style.display = 'block';
    backBtn.style.display = 'block';

    currentDate.innerText = `${state.currDay} ${months[state.currMonth]} ${state.currYear}`;

    let eventKey = getEventKey(state.currYear, state.currMonth, state.currDay);
    let dayEvents = state.eventsObj[eventKey] || [];

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
};
