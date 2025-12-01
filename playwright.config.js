const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/e2e',
    use: {
        baseURL: 'http://localhost:8000',
        browserName: 'chromium',
        headless: true,
    },
    webServer: {
        command: 'python -m http.server 8000',
        port: 8000,
        reuseExistingServer: !process.env.CI,
    },
});
