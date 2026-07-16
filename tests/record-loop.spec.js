const { test, expect } = require('@playwright/test');

test.describe('Record Loop Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#cta-button');
  });

  test('should show the Record Loop button in the settings dropdown', async ({ page }) => {
    // Enter the studio
    const ctaButton = page.locator('#cta-button');
    await expect(ctaButton).toBeVisible({ timeout: 15000 });
    await ctaButton.click();

    // Verify hero overlay is removed and Rete container is visible
    await expect(page.locator('#hero-overlay')).not.toBeAttached();
    await expect(page.locator('.rete-container')).toBeVisible();

    // Toggle Settings menu
    const settingsToggle = page.locator('#settingsToggle');
    await expect(settingsToggle).toBeVisible();
    await settingsToggle.click();

    // Verify Settings Dropdown is visible
    const settingsDropdown = page.locator('#settingsDropdown');
    await expect(settingsDropdown).toBeVisible();

    // Verify that "Record Loop" button is visible and has correct default text
    const recordLoopBtn = page.locator('#recordLoopBtn');
    await expect(recordLoopBtn).toBeVisible();
    await expect(recordLoopBtn).toContainText('Record Loop');
  });

  test('should start audio and enter waiting state when Record Loop is clicked', async ({ page }) => {
    // Enter the studio
    await page.locator('#cta-button').click();

    // Add a Master Clock node (required for loop recording)
    const addNodeToggle = page.locator('#addNodeToggle');
    await addNodeToggle.click();
    const addMasterClockBtn = page.locator('#addMasterClockNodeBtn');
    await expect(addMasterClockBtn).toBeVisible();
    await addMasterClockBtn.click();

    // Verify Master Clock node exists
    await expect(page.locator('text=Master Clock').first()).toBeVisible();

    // Toggle Settings menu to see Record Loop button
    await page.locator('#settingsToggle').click();

    // Click Record Loop button
    const recordLoopBtn = page.locator('#recordLoopBtn');
    await expect(recordLoopBtn).toBeVisible();
    await recordLoopBtn.click();

    // Verify state transition: since a Master Clock exists and is started,
    // the state transitions to 'waiting' and shows the appropriate visual indicator/text
    await expect(recordLoopBtn).toContainText('Waiting for Loop...');
    await expect(recordLoopBtn).toHaveClass(/bg-yellow-500/);

    // Click again to cancel/stop
    await recordLoopBtn.click();
    await expect(recordLoopBtn).toContainText('Record Loop');
  });
});
