import { test as setup, expect } from '@playwright/test';

setup('login and save state', async ({ page }) => {
  await page.goto('http://localhost:4200/login');

  await page.fill('input[formcontrolname="email"]', 'zoordak1234567@hotmail.com');
  await page.fill('input[formcontrolname="password"]', 'V35154177f#');

  await page.click('button[type="submit"]');

  await page.waitForURL('http://localhost:4200/dashboard/forms');

  // spinner kaybolsun veya asıl hedef element gelsin
  await expect(page.getByRole('button', { name: 'Create your first form' })).toBeVisible();

  await page.context().storageState({ path: 'auth.json' });
});
