export const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

export const getEventKey = (year, month, day) => {
    return `${year}-${month + 1}-${day}`;
};

export const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    date.setMinutes(date.getMinutes() + parseInt(durationMinutes));

    const endHours = String(date.getHours()).padStart(2, '0');
    const endMinutes = String(date.getMinutes()).padStart(2, '0');
    return `${endHours}:${endMinutes}`;
};
