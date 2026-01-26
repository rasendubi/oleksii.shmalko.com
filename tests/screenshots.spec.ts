import { test, expect } from '@playwright/test';

const pages = [
  '/',
  '/posts/',
  '/uniorg/',
  '/learn-it-yourself/',
  '/how-i-note/',
  '/20200322200610/', // Thich Quang Duc self-immolation
];

test.describe('Screenshot tests', () => {
  for (const path of pages) {
    test(`${path} should match screenshot`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(
        `${path.replace(/^\/|\/$/, '').replace(/\//g, '_') || 'index'}.png`,
        { fullPage: true }
      );
    });
  }
});
