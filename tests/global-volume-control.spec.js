const { test, expect } = require('@playwright/test');

test.describe('Global Master Volume Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
    await page.waitForTimeout(500);
  });

  test('should display volume toggle button and popup volume dropdown', async ({ page }) => {
    const volumeToggle = page.locator('#volumeToggle');
    await expect(volumeToggle).toBeVisible();

    const volumeDropdown = page.locator('#volumeDropdown');
    await expect(volumeDropdown).toBeHidden();

    // Open volume dropdown
    await volumeToggle.click();
    await expect(volumeDropdown).toBeVisible();

    // Close volume dropdown by clicking outside or toggling
    await volumeToggle.click();
    await expect(volumeDropdown).toBeHidden();
  });

  test('should adjust master volume when slider is changed', async ({ page }) => {
    // Start audio context by clicking play
    const playBtn = page.locator('#playStopBtn');
    await playBtn.click();
    await page.waitForTimeout(200);

    const volumeToggle = page.locator('#volumeToggle');
    await volumeToggle.click();

    const slider = page.locator('#globalVolumeSlider');
    await expect(slider).toBeVisible();

    const valueLabel = page.locator('#globalVolumeValue');
    await expect(valueLabel).toHaveText('100%');

    // Change slider value to 50%
    await slider.fill('0.5');
    await slider.dispatchEvent('input');

    await expect(valueLabel).toHaveText('50%');

    const masterGainVal = await page.evaluate(() => {
      return window.masterGain ? window.masterGain.gain.value : null;
    });

    expect(masterGainVal).toBeCloseTo(0.5, 2);
  });
});
