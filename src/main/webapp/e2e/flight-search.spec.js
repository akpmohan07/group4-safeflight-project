const { test, expect } = require('@playwright/test');

test.describe('Flight Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('input[name="email"]').fill('admin@safeflight.com');
    await page.locator('input[name="password"]').fill('admin123');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('Search one-way flights')).toBeVisible();
  });

  test('user can search for available flights', async ({ page }) => {
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('select').nth(1).selectOption({ index: 2 });
    
    // Use a date far in the future to ensure flights exist
    const futureDate = new Date('2026-06-01');
    const dateString = futureDate.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateString);

    await page.getByRole('button', { name: /Search flights/i }).click();

    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });
  });

  test('user sees no results message when no flights available', async ({ page }) => {
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('select').nth(1).selectOption({ index: 1 });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateString);

    await page.getByRole('button', { name: /Search flights/i }).click();

    await expect(page.getByText(/No flights available/i)).toBeVisible({ timeout: 10000 });
  });

  test('user can click on flight result to view seat map', async ({ page }) => {
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('select').nth(1).selectOption({ index: 2 });
    
    const futureDate = new Date('2026-06-01');
    const dateString = futureDate.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateString);

    await page.getByRole('button', { name: /Search flights/i }).click();

    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.url()).toContain('/flights/');
  });

  test('search form validates required fields', async ({ page }) => {
    const searchButton = page.getByRole('button', { name: /Search flights/i });
    
    // Button is enabled but HTML5 validation prevents submission
    await expect(searchButton).toBeEnabled();
    
    // Verify required attributes on form fields
    await expect(page.locator('select').first()).toHaveAttribute('required', '');
    await expect(page.locator('select').nth(1)).toHaveAttribute('required', '');
    await expect(page.locator('input[type="date"]')).toHaveAttribute('required', '');
  });
});
