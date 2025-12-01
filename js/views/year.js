import { state } from '../state.js';
import { months } from '../utils.js';

export const renderYearView = () => {
    const decadeView = document.querySelector(".decade-view");
    const yearView = document.querySelector(".year-view");
    const monthView = document.querySelector(".month-view");
    const dayView = document.querySelector(".day-view");
    const backBtn = document.querySelector("#back-btn");
    const currentDate = document.querySelector(".current-date");
    const monthsList = document.querySelector(".months-list");

    state.currentView = 'year';
    decadeView.style.display = 'none';
    yearView.style.display = 'block';
    monthView.style.display = 'none';
    dayView.style.display = 'none';
    backBtn.style.display = 'block';

    currentDate.innerText = `${state.currYear}`;

    let liTag = "";
    months.forEach((month, index) => {
        let activeClass = (index === new Date().getMonth() && state.currYear === new Date().getFullYear()) ? 'active' : '';
        liTag += `<li class="${activeClass}" onclick="selectMonth(${index})">${month}</li>`;
    });
    monthsList.innerHTML = liTag;
};
