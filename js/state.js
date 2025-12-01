import { loadEvents } from './storage.js';

const date = new Date();

export const state = {
    date: new Date(),
    currYear: date.getFullYear(),
    currMonth: date.getMonth(),
    currDay: date.getDate(),
    currentView: 'month', // 'decade', 'year', 'month', 'day'
    eventsObj: loadEvents(),
    selectedEvent: null,
    decadeStart: Math.floor(date.getFullYear() / 12) * 12
};

export const setState = (key, value) => {
    state[key] = value;
};
