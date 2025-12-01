import { state } from './state.js';

export const updateBackground = () => {
    const body = document.body;
    let bgImage = '';

    if (state.currentView === 'decade') {
        bgImage = 'url("assets/decade.png")';
    } else if (state.currentView === 'year' || state.currentView === 'month') {
        bgImage = 'url("assets/year.png")';
    } else if (state.currentView === 'day') {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            bgImage = 'url("assets/morning.png")';
        } else if (hour >= 12 && hour < 17) {
            bgImage = 'url("assets/noon.png")';
        } else if (hour >= 17 && hour < 21) {
            bgImage = 'url("assets/evening.png")';
        } else {
            bgImage = 'url("assets/night.png")';
        }
    }

    body.style.backgroundImage = bgImage;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundAttachment = 'fixed';
    body.style.transition = 'background-image 0.5s ease-in-out';
};
