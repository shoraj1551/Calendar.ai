import { loadTheme, saveTheme } from './storage.js';

export const initTheme = () => {
    const themeSelector = document.querySelector("#theme-selector");
    const savedTheme = loadTheme();

    document.body.className = savedTheme;
    themeSelector.value = savedTheme;

    themeSelector.addEventListener("change", (e) => {
        const selectedTheme = e.target.value;
        document.body.className = selectedTheme;
        saveTheme(selectedTheme);
    });
};
