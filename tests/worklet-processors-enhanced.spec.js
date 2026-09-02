const { test, expect } = require('@playwright/test');

test.describe('Enhanced AudioWorklet Processors and Bitcrusher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
  });

  test('should add and configure Bitcrusher node with CV inputs', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addBitcrusherNodeBtn').click();

    const bitcrusherNode = page.locator('[data-node-label="Bitcrusher"]').first();
    await expect(bitcrusherNode).toBeVisible();

    // Verify CV inputs
    await expect(bitcrusherNode.locator('.input-title:has-text("Bits CV")')).toBeVisible();
    await expect(bitcrusherNode.locator('.input-title:has-text("SR CV")')).toBeVisible();

    // Verify controls
    const sliders = bitcrusherNode.locator('input[type="range"]');
    await expect(sliders).toHaveCount(2); // Bit Depth, Sample Rate Reduction

    // Fill Bit Depth slider
    const bitsSlider = sliders.nth(0);
    await bitsSlider.fill('4');
    await expect(bitcrusherNode.locator('.value-display').nth(0)).toHaveText('4.00');

    // Fill Sample Rate Reduction slider
    const srSlider = sliders.nth(1);
    await srSlider.fill('8');
    await expect(bitcrusherNode.locator('.value-display').nth(1)).toHaveText('8.00');
  });

  test('should load Quantizer and Granular Synthesizer nodes correctly', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addQuantizerNodeBtn').click();

    const quantizerNode = page.locator('[data-node-label="Quantizer"]').first();
    await expect(quantizerNode).toBeVisible();

    await page.locator('#addNodeToggle').click();
    await page.locator('#addGranularSynthesizerNodeBtn').click();

    const granularNode = page.locator('[data-node-label="Granular Synthesizer"]').first();
    await expect(granularNode).toBeVisible();
  });
});
