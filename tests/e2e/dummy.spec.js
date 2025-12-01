const { test, expect } = require('@playwright/test');

test('dummy e2e test', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Calendar.ai/);
});
