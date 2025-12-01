export const saveEvents = (eventsObj) => {
    localStorage.setItem("calendar-events", JSON.stringify(eventsObj));
};

export const loadEvents = () => {
    return JSON.parse(localStorage.getItem("calendar-events") || "{}");
};

export const saveTheme = (theme) => {
    localStorage.setItem("calendar-theme", theme);
};

export const loadTheme = () => {
    return localStorage.getItem("calendar-theme") || "theme-light";
};
