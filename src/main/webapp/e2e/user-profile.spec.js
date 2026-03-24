const { test, expect } = require('@playwright/test');

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('input[name="email"]').fill('admin@safeflight.com');
    await page.locator('input[name="password"]').fill('admin123');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('Search one-way flights')).toBeVisible();
  });

  test('user can view their profile', async ({ page }) => {
    await page.getByRole('link').filter({ hasText: 'admin@safeflight.com' }).click();

    // Wait for navigation to profile page
    await page.waitForURL('**/profile');
    await expect(page.locator('input[name="fname"]')).toBeVisible();
    await expect(page.locator('input[name="lname"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('user can update their profile information', async ({ page }) => {
    await page.getByRole('link').filter({ hasText: 'admin@safeflight.com' }).click();
    await page.waitForURL('**/profile');

    // Click Edit button first
    await page.getByRole('button', { name: /Edit/i }).click();
    
    // Update first name
    const fnameInput = page.locator('input[name="fname"]');
    await fnameInput.clear();
    await fnameInput.fill('UpdatedAdmin');

    // Update phone
    const phoneInput = page.locator('input[name="phone"]');
    await phoneInput.clear();
    await phoneInput.fill('9876543210');

    // Save changes
    const saveButton = page.getByRole('button', { name: /Save/i });
    await saveButton.click();

    // Verify success message
    await expect(page.getByText(/Profile updated/i)).toBeVisible({ timeout: 10000 });
  });

  test('user can view their booking history', async ({ page }) => {
    await page.getByRole('link').filter({ hasText: 'admin@safeflight.com' }).click();
    await expect(page.getByText(/User details/i)).toBeVisible({ timeout: 10000 });

    // Check if bookings section exists
    await expect(page.getByText(/My bookings/i)).toBeVisible();
  });

  test('user can view booking details from profile', async ({ page }) => {
    await page.getByRole('link').filter({ hasText: 'admin@safeflight.com' }).click();
    await page.waitForURL('**/profile');

    // Check if there are any bookings
    const bookingLinks = page.locator('a[href*="/bookings/"]');
    const bookingCount = await bookingLinks.count();

    if (bookingCount > 0) {
      await bookingLinks.first().click();
      await expect(page.locator('p.text-muted').filter({ hasText: /Booking #/i }).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('user can logout from profile page', async ({ page }) => {
    await page.getByRole('link').filter({ hasText: 'admin@safeflight.com' }).click();
    await expect(page.getByText(/User details/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Logout/i }).click();

    // Verify redirected to login page
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('email field is read-only in profile', async ({ page }) => {
    await page.getByRole('link').filter({ hasText: 'admin@safeflight.com' }).click();
    await page.waitForURL('**/profile');

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeDisabled();
  });
});
