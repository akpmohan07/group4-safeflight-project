const { test, expect } = require('@playwright/test');

test('default admin user can log in', async ({ page }) => {
  await page.goto('/');

  await page.locator('input[name="email"]').fill('admin@safeflight.com');
  await page.locator('input[name="password"]').fill('admin123');
  await page.locator('form button[type="submit"]').click();

  await expect(page.getByText('Search one-way flights')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});
