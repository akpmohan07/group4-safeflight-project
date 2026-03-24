const { test, expect } = require('@playwright/test');

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('input[name="email"]').fill('admin@safeflight.com');
    await page.locator('input[name="password"]').fill('admin123');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('Search one-way flights')).toBeVisible();
  });

  test('user can complete full booking flow', async ({ page }) => {
    // Search for flights
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('select').nth(1).selectOption({ index: 2 });
    
    const futureDate = new Date('2026-06-01');
    const dateString = futureDate.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateString);

    await page.getByRole('button', { name: /Search flights/i }).click();
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });
    
    // Click on first flight
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for seat map to load
    await expect(page.locator('.seatmap')).toBeVisible({ timeout: 10000 });

    // Select an available seat (wait for seats to be rendered)
    await page.waitForSelector('.seatmap .border.bg-light', { timeout: 10000 });
    const availableSeat = page.locator('.seatmap .border.bg-light').first();
    await availableSeat.click();

    // Verify seat is selected (check for the card with selected seats)
    await expect(page.locator('.card-header').filter({ hasText: /Selected seats & price/i })).toBeVisible();

    // Click continue button
    const continueButton = page.getByRole('button', { name: /Continue/i });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    // Fill passenger details
    await expect(page.getByText('Passenger details')).toBeVisible({ timeout: 10000 });
    
    await page.locator('input[type="text"]').first().fill('John');
    await page.locator('input[type="text"]').nth(1).fill('Doe');
    await page.locator('input[type="date"]').fill('1990-01-01');
    await page.locator('input[type="tel"]').fill('1234567890');
    await page.locator('input[type="email"]').fill('john.doe@example.com');
    await page.locator('input[type="text"]').nth(2).fill('P1234567');

    // Proceed to payment
    const proceedButton = page.getByRole('button', { name: /Proceed to payment/i });
    await expect(proceedButton).toBeEnabled();
    await proceedButton.click();

    // Complete payment
    await expect(page.getByText(/Payment/i)).toBeVisible({ timeout: 10000 });
    
    // Fill in payment details
    await page.locator('input[name="number"]').fill('1234567890123456');
    await page.locator('input[name="expiry"]').fill('12/25');
    await page.locator('input[name="cvv"]').fill('123');
    
    // Fill in billing address
    await page.locator('input[name="addressLine1"]').fill('123 Main St');
    await page.locator('input[name="city"]').fill('New York');
    await page.locator('input[name="postalCode"]').fill('10001');
    await page.locator('input[name="country"]').fill('USA');
    
    const confirmButton = page.getByRole('button', { name: /Complete transaction/i });
    await confirmButton.click();

    // Verify booking confirmation (use heading to avoid strict mode violation)
    await expect(page.getByRole('heading', { name: /Booking confirmed/i })).toBeVisible({ timeout: 15000 });
  });

  test('user cannot proceed without selecting seats', async ({ page }) => {
    // Navigate to a flight
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('select').nth(1).selectOption({ index: 2 });
    
    const futureDate = new Date('2026-06-01');
    const dateString = futureDate.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateString);

    await page.getByRole('button', { name: /Search flights/i }).click();
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('.seatmap')).toBeVisible({ timeout: 10000 });

    // Verify continue button is disabled
    const continueButton = page.getByRole('button', { name: /Continue/i });
    await expect(continueButton).toBeDisabled();
  });

  test('user cannot select already booked seats', async ({ page }) => {
    // Navigate to a flight with booked seats
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('select').nth(1).selectOption({ index: 2 });
    
    const futureDate = new Date('2026-06-01');
    const dateString = futureDate.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateString);

    await page.getByRole('button', { name: /Search flights/i }).click();
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('.seatmap')).toBeVisible({ timeout: 10000 });

    // Try to click a booked seat (if any exist)
    await page.waitForSelector('.seatmap .border', { timeout: 10000 });
    const bookedSeats = page.locator('.seatmap .border.bg-secondary');
    const bookedSeatCount = await bookedSeats.count();
    
    if (bookedSeatCount > 0) {
      await bookedSeats.first().click();
      
      // Verify no seat is selected
      await expect(page.locator('.card-header').filter({ hasText: /Selected seats & price/i })).not.toBeVisible();
    }
  });

  test('user can deselect seats', async ({ page }) => {
    // Navigate to seat map
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('select').nth(1).selectOption({ index: 2 });
    
    const futureDate = new Date('2026-06-01');
    const dateString = futureDate.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateString);

    await page.getByRole('button', { name: /Search flights/i }).click();
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('.seatmap')).toBeVisible({ timeout: 10000 });

    // Select a seat
    await page.waitForSelector('.seatmap .border.bg-light', { timeout: 10000 });
    const availableSeat = page.locator('.seatmap .border.bg-light').first();
    await availableSeat.click();
    await expect(page.locator('.card-header').filter({ hasText: /Selected seats & price/i })).toBeVisible();

    // Deselect the seat
    const selectedSeat = page.locator('.seatmap .border.bg-primary').first();
    await selectedSeat.click();

    // Verify seat is deselected
    await expect(page.locator('.card-header').filter({ hasText: /Selected seats & price/i })).not.toBeVisible();
  });

  test('passenger form validates required fields', async ({ page }) => {
    // Navigate to passenger details with a selected seat
    await page.locator('select').first().selectOption({ index: 1 });
    await page.locator('select').nth(1).selectOption({ index: 2 });
    
    const futureDate = new Date('2026-06-01');
    const dateString = futureDate.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateString);

    await page.getByRole('button', { name: /Search flights/i }).click();
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    await expect(page.locator('.seatmap')).toBeVisible({ timeout: 10000 });

    await page.waitForSelector('.seatmap .border.bg-light', { timeout: 10000 });
    const availableSeat = page.locator('.seatmap .border.bg-light').first();
    await availableSeat.click();

    const continueButton = page.getByRole('button', { name: /Continue/i });
    await continueButton.click();

    await expect(page.getByText('Passenger details')).toBeVisible({ timeout: 10000 });

    // Verify proceed button is disabled without filling form
    const proceedButton = page.getByRole('button', { name: /Proceed to payment/i });
    await expect(proceedButton).toBeDisabled();

    // Fill partial form
    await page.locator('input[type="text"]').first().fill('John');
    await expect(proceedButton).toBeDisabled();

    // Fill all required fields
    await page.locator('input[type="text"]').nth(1).fill('Doe');
    await page.locator('input[type="date"]').fill('1990-01-01');
    await page.locator('input[type="tel"]').fill('1234567890');
    await page.locator('input[type="email"]').fill('john.doe@example.com');
    await page.locator('input[type="text"]').nth(2).fill('P1234567');

    // Verify proceed button is now enabled
    await expect(proceedButton).toBeEnabled();
  });
});
