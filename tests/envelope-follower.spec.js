const { test, expect } = require('@playwright/test');

test.describe('Envelope Follower Node', () => {
  test.beforeEach(async ({ page }) => {
    // Increase timeout for building and loading
    test.setTimeout(60000);
    await page.goto('http://localhost:8000');
    await page.locator('#cta-button').click();
  });

  test('should add and configure Envelope Follower node with attack and release', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addEnvelopeFollowerNodeBtn').click();

    const envFollowerNode = page.locator('[data-node-label="Envelope Follower"]').first();
    await expect(envFollowerNode).toBeVisible();

    // Check sensitivity slider (1st slider)
    const sensitivitySlider = envFollowerNode.locator('input[type="range"]').first();
    await expect(sensitivitySlider).toBeVisible();
    await sensitivitySlider.fill('2.5');

    // Check attack slider (2nd slider)
    const attackSlider = envFollowerNode.locator('input[type="range"]').nth(1);
    await expect(attackSlider).toBeVisible();
    await attackSlider.fill('0.15');

    // Check release slider (3rd slider)
    const releaseSlider = envFollowerNode.locator('input[type="range"]').nth(2);
    await expect(releaseSlider).toBeVisible();
    await releaseSlider.fill('0.5');

    // Verify value displays
    const displays = envFollowerNode.locator('.value-display');
    await expect(displays.nth(0)).toHaveText('2.50');
    await expect(displays.nth(1)).toHaveText('0.15');
    await expect(displays.nth(2)).toHaveText('0.50');
  });
});
