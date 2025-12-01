import { state, setState } from './state.js';
import { initTheme } from './theme.js';
import { initModal } from './modal.js';
import { renderDecadeView } from './views/decade.js';
import { renderYearView } from './views/year.js';
import { renderMonthView } from './views/month.js';
import { renderDayView } from './views/day.js';
import { updateBackground } from './background.js?v=0.004';

const prevNextIcon = document.querySelectorAll(".icons span");
const backBtn = document.querySelector("#back-btn");
const currentDate = document.querySelector(".current-date");

// Navigation Actions
window.selectYear = (year) => {
    setState('currYear', year);
    renderYearView();
    updateBackground();
};

window.selectMonth = (monthIndex) => {
    setState('currMonth', monthIndex);
    renderMonthView();
    updateBackground();
};

window.selectDay = (day) => {
    setState('currDay', day);
    renderDayView();
    updateBackground();
};

prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () => {
        if (state.currentView === 'month') {
            let newMonth = icon.id === "prev" ? state.currMonth - 1 : state.currMonth + 1;
            if (newMonth < 0 || newMonth > 11) {
                const date = new Date(state.currYear, newMonth, new Date().getDate());
                setState('currYear', date.getFullYear());
                setState('currMonth', date.getMonth());
            } else {
                setState('currMonth', newMonth);
            }
            renderMonthView();
        } else if (state.currentView === 'year') {
            setState('currYear', icon.id === "prev" ? state.currYear - 1 : state.currYear + 1);
            renderYearView();
        } else if (state.currentView === 'decade') {
            setState('decadeStart', icon.id === "prev" ? state.decadeStart - 12 : state.decadeStart + 12);
            renderDecadeView();
        } else if (state.currentView === 'day') {
            let currentObj = new Date(state.currYear, state.currMonth, state.currDay);
            if (icon.id === "prev") {
                currentObj.setDate(currentObj.getDate() - 1);
            } else {
                currentObj.setDate(currentObj.getDate() + 1);
            }
            setState('currDay', currentObj.getDate());
            setState('currMonth', currentObj.getMonth());
            setState('currYear', currentObj.getFullYear());
            renderDayView();
        }
        updateBackground();
    });
});

backBtn.addEventListener("click", () => {
    if (state.currentView === 'day') {
        renderMonthView();
    } else if (state.currentView === 'month') {
        renderYearView();
    } else if (state.currentView === 'year') {
        renderDecadeView();
    }
    updateBackground();
});

currentDate.addEventListener("click", () => {
    if (state.currentView === 'day') {
        renderMonthView();
    } else if (state.currentView === 'month') {
        renderYearView();
    } else if (state.currentView === 'year') {
        renderDecadeView();
    }
    updateBackground();
});

// Initialize App
const init = () => {
    initTheme();
    // Pass renderDayView to initModal so it can re-render after saving/deleting
    initModal(renderDayView);
    renderMonthView();
    updateBackground();
};

init();
