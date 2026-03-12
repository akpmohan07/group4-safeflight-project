const { test, expect } = require('@playwright/test');

test.describe('User Signup', () => {
  test('user can sign up with valid information', async ({ page }) => {
    await page.goto('/');

    // Switch to signup tab
    await page.getByRole('button', { name: /Signup/i }).click();

    // Fill signup form
    const timestamp = Date.now();
    await page.locator('input[name="fname"]').fill('Test');
    await page.locator('input[name="lname"]').fill('User');
    await page.locator('input[name="email"]').fill(`testuser${timestamp}@example.com`);
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="phone"]').fill('1234567890');
    await page.locator('input[name="country"]').fill('USA');

    // Submit form
    await page.locator('form button[type="submit"]').click();

    // Verify success message and switch to login
    await expect(page.getByText(/Signup successful/i)).toBeVisible({ timeout: 10000 });
  });

  test('signup form validates required fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Signup/i }).click();

    const submitButton = page.locator('form button[type="submit"]');
    
    // Verify required fields
    const fnameInput = page.locator('input[name="fname"]');
    const lnameInput = page.locator('input[name="lname"]');
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(fnameInput).toHaveAttribute('required', '');
    await expect(lnameInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('signup shows error for duplicate email', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Signup/i }).click();

    // Try to signup with existing admin email
    await page.locator('input[name="fname"]').fill('Test');
    await page.locator('input[name="lname"]').fill('User');
    await page.locator('input[name="email"]').fill('admin@safeflight.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="phone"]').fill('1234567890');
    await page.locator('input[name="country"]').fill('USA');

    await page.locator('form button[type="submit"]').click();

    // Verify error message appears in the alert
    await expect(page.locator('.alert').filter({ hasText: /fail|error|exist|already/i })).toBeVisible({ timeout: 10000 });
  });

  test('user can switch between login and signup tabs', async ({ page }) => {
    await page.goto('/');

    // Verify login tab is active by default (use more specific selector)
    const loginTabButton = page.locator('.btn-group button').filter({ hasText: /^Login$/ });
    await expect(loginTabButton).toHaveClass(/btn-primary/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Switch to signup
    const signupTabButton = page.locator('.btn-group button').filter({ hasText: /^Signup$/ });
    await signupTabButton.click();
    await expect(signupTabButton).toHaveClass(/btn-primary/);
    await expect(page.locator('input[name="fname"]')).toBeVisible();
    await expect(page.locator('input[name="lname"]')).toBeVisible();

    // Switch back to login
    await loginTabButton.click();
    await expect(loginTabButton).toHaveClass(/btn-primary/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('signup form accepts optional fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Signup/i }).click();

    const timestamp = Date.now();
    await page.locator('input[name="fname"]').fill('Test');
    await page.locator('input[name="lname"]').fill('User');
    await page.locator('input[name="email"]').fill(`testuser${timestamp}@example.com`);
    await page.locator('input[name="password"]').fill('password123');
    
    // Optional fields
    await page.locator('input[name="phone"]').fill('1234567890');
    await page.locator('input[name="dob"]').fill('1990-01-01');
    await page.locator('input[name="country"]').fill('USA');

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/Signup successful/i)).toBeVisible({ timeout: 10000 });
  });
});
