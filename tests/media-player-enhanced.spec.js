const { test, expect } = require('@playwright/test');

test.describe('Enhanced Media Player Node', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
        await cta.click();
    }
  });

  test('should add and configure Media Player node with controls', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addMediaPlayerNodeBtn').click();

    const mediaPlayerNode = page.locator('[data-node-label="Media Player"]').first();
    await expect(mediaPlayerNode).toBeVisible();

    // Check sliders (Gain, Speed, Pitch (st))
    const sliders = mediaPlayerNode.locator('input[type="range"]');
    await expect(sliders).toHaveCount(3); // Gain, Speed, Pitch (st)

    // Check slider labels
    await expect(mediaPlayerNode.locator('label:has-text("Gain")')).toBeVisible();
    await expect(mediaPlayerNode.locator('label:has-text("Speed")')).toBeVisible();
    await expect(mediaPlayerNode.locator('label:has-text("Pitch (st)")')).toBeVisible();

    // Set Gain slider
    const gainSlider = sliders.nth(0);
    await gainSlider.fill('1.5');
    await expect(mediaPlayerNode.locator('.value-display').nth(0)).toHaveText('1.50');

    // Set Speed slider
    const speedSlider = sliders.nth(1);
    await speedSlider.fill('2.5');
    await expect(mediaPlayerNode.locator('.value-display').nth(1)).toHaveText('2.50');

    // Set Pitch slider
    const pitchSlider = sliders.nth(2);
    await pitchSlider.fill('5');
    await expect(mediaPlayerNode.locator('.value-display').nth(2)).toHaveText('5.00');

    // Check Reverse & Loop checkboxes (ToggleControls)
    const toggles = mediaPlayerNode.locator('input[type="checkbox"]');
    await expect(toggles).toHaveCount(2);

    const reverseToggle = toggles.nth(0);
    const loopToggle = toggles.nth(1);

    await expect(reverseToggle).not.toBeChecked();
    await expect(loopToggle).not.toBeChecked();

    // Toggle reverse and loop to checked using page.evaluate to bypass sr-only styling
    await page.evaluate((el) => {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }, await reverseToggle.elementHandle());
    await expect(reverseToggle).toBeChecked();

    await page.evaluate((el) => {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }, await loopToggle.elementHandle());
    await expect(loopToggle).toBeChecked();

    // Verify Play and Stop buttons exist
    const playBtn = mediaPlayerNode.locator('button:has-text("Play")');
    await expect(playBtn).toBeVisible();

    const stopBtn = mediaPlayerNode.locator('button:has-text("Stop")');
    await expect(stopBtn).toBeVisible();
  });
});
