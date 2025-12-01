import { state } from '../state.js';

export const renderDecadeView = () => {
    const decadeView = document.querySelector(".decade-view");
    const yearView = document.querySelector(".year-view");
    const monthView = document.querySelector(".month-view");
    const dayView = document.querySelector(".day-view");
    const backBtn = document.querySelector("#back-btn");
    const currentDate = document.querySelector(".current-date");
    const yearsList = document.querySelector(".years-list");

    state.currentView = 'decade';
    decadeView.style.display = 'block';
    yearView.style.display = 'none';
    monthView.style.display = 'none';
    dayView.style.display = 'none';
    backBtn.style.display = 'none';

    currentDate.innerText = `${state.decadeStart} - ${state.decadeStart + 11}`;

    let liTag = "";
    for (let i = 0; i < 12; i++) {
        let year = state.decadeStart + i;
        let activeClass = (year === new Date().getFullYear()) ? 'active' : '';
        liTag += `<li class="${activeClass}" onclick="selectYear(${year})">${year}</li>`;
    }
    yearsList.innerHTML = liTag;
};
