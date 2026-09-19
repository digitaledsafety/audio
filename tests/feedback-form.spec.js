const { test, expect } = require('@playwright/test');

test.describe('Feedback Form Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Click CTA to enter the studio if present
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
  });

  test('should open feedback modal from settings menu and validate input', async ({ page }) => {
    // Open Settings Menu
    const settingsToggle = page.locator('#settingsToggle');
    await expect(settingsToggle).toBeVisible();
    await settingsToggle.click();

    // Verify Settings Dropdown is visible
    const settingsDropdown = page.locator('#settingsDropdown');
    await expect(settingsDropdown).toBeVisible();

    // Click Send Feedback button
    const openFeedbackBtn = page.locator('#openFeedbackBtn');
    await expect(openFeedbackBtn).toBeVisible();
    await openFeedbackBtn.click();

    // Verify Settings Dropdown is closed and Feedback Modal is open
    await expect(settingsDropdown).toBeHidden();
    const feedbackModal = page.locator('#feedbackModal');
    await expect(feedbackModal).toBeVisible();

    // Verify error shown when submitting empty / whitespace message
    const submitBtn = page.locator('#submitFeedbackBtn');
    const feedbackError = page.locator('#feedbackError');
    const feedbackMessage = page.locator('#feedbackMessage');

    await expect(feedbackError).toBeHidden();
    await feedbackMessage.fill('   ');
    await submitBtn.click();

    // Error message should now be visible and modal remains open
    await expect(feedbackError).toBeVisible();
    await expect(feedbackModal).toBeVisible();

    // Fill valid feedback message and submit
    await feedbackMessage.fill('Great synthesizer! Love the feedback form addition.');
    await submitBtn.click();

    // Verify modal closes upon submission
    await expect(feedbackModal).toBeHidden();

    // Check message box toast message
    const messageBox = page.locator('#messageBox');
    await expect(messageBox).toBeVisible();
    await expect(messageBox).toContainText('Feedback submitted! Thank you.');
  });

  test('should allow closing the feedback modal without submitting', async ({ page }) => {
    // Open Settings Menu
    await page.locator('#settingsToggle').click();
    await page.locator('#openFeedbackBtn').click();

    const feedbackModal = page.locator('#feedbackModal');
    await expect(feedbackModal).toBeVisible();

    // Click Close Button
    await page.locator('#closeFeedbackModalBtn').click();
    await expect(feedbackModal).toBeHidden();

    // Open again and click Cancel Button
    await page.locator('#settingsToggle').click();
    await page.locator('#openFeedbackBtn').click();
    await expect(feedbackModal).toBeVisible();

    await page.locator('#cancelFeedbackBtn').click();
    await expect(feedbackModal).toBeHidden();
  });
});
