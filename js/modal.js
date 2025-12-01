import { state, setState } from './state.js';
import { saveEvents } from './storage.js';
import { getEventKey, calculateEndTime } from './utils.js';

const eventModal = document.querySelector("#event-modal");
const closeBtn = document.querySelector(".close-btn");
const eventTitleInput = document.querySelector("#event-title");
const eventAgendaInput = document.querySelector("#event-agenda");
const eventTimeInput = document.querySelector("#event-time");
const eventDurationInput = document.querySelector("#event-duration");
const endTimeDisplay = document.querySelector("#end-time-display");
const saveEventBtn = document.querySelector("#save-event");
const deleteEventBtn = document.querySelector("#delete-event");

const updateEndTimeDisplay = () => {
    if (eventTimeInput.value && eventDurationInput.value) {
        const endTime = calculateEndTime(eventTimeInput.value, eventDurationInput.value);
        endTimeDisplay.innerText = `End Time: ${endTime}`;
    } else {
        endTimeDisplay.innerText = "End Time: --:--";
    }
};

export const openModal = (time, title = null, agenda = null, duration = 60) => {
    setState('selectedEvent', title ? { time, title, agenda, duration } : null);
    eventTimeInput.value = time;
    eventTitleInput.value = title || "";
    eventAgendaInput.value = agenda || "";
    eventDurationInput.value = duration;
    updateEndTimeDisplay();
    deleteEventBtn.style.display = title ? "block" : "none";
    eventModal.style.display = "flex";
};

export const closeModal = () => {
    eventModal.style.display = "none";
    setState('selectedEvent', null);
    eventTitleInput.value = "";
    eventAgendaInput.value = "";
    eventTimeInput.value = "";
    eventDurationInput.value = "60";
    endTimeDisplay.innerText = "End Time: --:--";
};

export const initModal = (renderDayViewCallback) => {
    // Expose openModal to window for inline onclick handlers
    window.openModal = openModal;

    eventTimeInput.addEventListener("change", updateEndTimeDisplay);
    eventDurationInput.addEventListener("input", updateEndTimeDisplay);
    closeBtn.addEventListener("click", closeModal);

    saveEventBtn.addEventListener("click", () => {
        const title = eventTitleInput.value;
        const agenda = eventAgendaInput.value;
        const time = eventTimeInput.value;
        const duration = parseInt(eventDurationInput.value) || 60;

        if (title && time) {
            const eventKey = getEventKey(state.currYear, state.currMonth, state.currDay);
            if (!state.eventsObj[eventKey]) {
                state.eventsObj[eventKey] = [];
            }

            // If editing, remove old event first
            if (state.selectedEvent) {
                state.eventsObj[eventKey] = state.eventsObj[eventKey].filter(e => e.time !== state.selectedEvent.time || e.title !== state.selectedEvent.title);
            }

            // Add new event
            state.eventsObj[eventKey].push({ title, agenda, time, duration });

            // Sort events by time
            state.eventsObj[eventKey].sort((a, b) => a.time.localeCompare(b.time));

            saveEvents(state.eventsObj);
            closeModal();
            if (renderDayViewCallback) renderDayViewCallback();
        }
    });

    deleteEventBtn.addEventListener("click", () => {
        if (state.selectedEvent) {
            const eventKey = getEventKey(state.currYear, state.currMonth, state.currDay);
            if (state.eventsObj[eventKey]) {
                state.eventsObj[eventKey] = state.eventsObj[eventKey].filter(e => e.time !== state.selectedEvent.time);
                saveEvents(state.eventsObj);
            }
            closeModal();
            if (renderDayViewCallback) renderDayViewCallback();
        }
    });

    // Close modal if clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === eventModal) {
            closeModal();
        }
    });
};
