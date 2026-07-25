const { test, expect } = require('@playwright/test');

test.describe('Enhanced Wave Player Node', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
        await cta.click();
    }
    await page.waitForSelector('.rete-container');
  });

  test('should add and configure Wave Player node with playbackRate and loop', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addWavePlayerNodeBtn').click();

    const wavePlayerNode = page.locator('[data-node-label="Wave Player"]').first();
    await expect(wavePlayerNode).toBeVisible();

    // Check sliders (Gain, Playback Rate)
    const sliders = wavePlayerNode.locator('input[type="range"]');
    await expect(sliders).toHaveCount(2); // Gain, Playback Rate

    // Check slider labels
    await expect(wavePlayerNode.locator('label:has-text("Gain")')).toBeVisible();
    await expect(wavePlayerNode.locator('label:has-text("Playback Rate")')).toBeVisible();

    // Set Gain slider
    const gainSlider = sliders.nth(0);
    await gainSlider.fill('1.5');
    await expect(wavePlayerNode.locator('.value-display').nth(0)).toHaveText('1.50');

    // Set Playback Rate slider
    const playbackRateSlider = sliders.nth(1);
    await playbackRateSlider.fill('2.5');
    await expect(wavePlayerNode.locator('.value-display').nth(1)).toHaveText('2.50');

    // Check Loop checkbox (ToggleControl)
    const loopToggle = wavePlayerNode.locator('input[type="checkbox"]');
    await expect(loopToggle).toBeVisible();
    await expect(loopToggle).not.toBeChecked();

    // Toggle loop to checked using page.evaluate to bypass any sr-only visibility checks
    await page.evaluate((el) => {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }, await loopToggle.elementHandle());
    await expect(loopToggle).toBeChecked();

    // Verify play button exists
    const playBtn = wavePlayerNode.locator('button:has-text("Play")');
    await expect(playBtn).toBeVisible();
  });
});
