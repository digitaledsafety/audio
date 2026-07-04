const { test, expect } = require('@playwright/test');

test.describe('Security: XSS Protection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
    await expect(page.locator('#hero-overlay')).not.toBeAttached({ timeout: 15000 });
  });

  test('should not execute injected script in Sequencer sequence control', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addSequencerNodeBtn').click();

    const sequencerNode = page.locator('[data-node-label="Sequencer"]').first();
    await expect(sequencerNode).toBeVisible();

    const xssPayload = '<img src=x onerror="window.xssExecuted=true">';
    const input = sequencerNode.locator('input[type="text"]');

    // Set the value
    await input.fill(xssPayload);
    // Trigger the change event
    await input.dispatchEvent('input');

    // Check if the script was executed in the page context
    const xssExecuted = await page.evaluate(() => window.xssExecuted);
    expect(xssExecuted).toBeUndefined();

    // Verify it's rendered as text and not as a DOM element
    const imgInNode = sequencerNode.locator('img');
    await expect(imgInNode).toHaveCount(0);
  });
});
