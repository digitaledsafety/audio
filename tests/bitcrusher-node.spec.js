const { test, expect } = require('@playwright/test');

test.describe('Bitcrusher Node', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
    await page.waitForSelector('.rete-container');
  });

  test('should add and configure Bitcrusher node', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addBitcrusherNodeBtn').click();

    const bitcrusherNode = page.locator('[data-node-label="Bitcrusher"]').first();
    await expect(bitcrusherNode).toBeVisible();

    // Verify inputs and outputs exist
    await expect(bitcrusherNode.locator('.input-title:has-text("Audio In")')).toBeVisible();
    await expect(bitcrusherNode.locator('.output-title:has-text("Audio Out")')).toBeVisible();

    // Verify Bit Depth and Sample Rate Reduction sliders
    const sliders = bitcrusherNode.locator('input[type="range"]');
    await expect(sliders).toHaveCount(2);

    await expect(bitcrusherNode.locator('label:has-text("Bit Depth")')).toBeVisible();
    await expect(bitcrusherNode.locator('label:has-text("Sample Rate Reduction")')).toBeVisible();

    // Change Bit Depth slider value
    const bitsSlider = sliders.nth(0);
    await bitsSlider.fill('4');
    await expect(bitcrusherNode.locator('.value-display').nth(0)).toHaveText('4.00');

    // Change Sample Rate Reduction slider value
    const srrSlider = sliders.nth(1);
    await srrSlider.fill('8');
    await expect(bitcrusherNode.locator('.value-display').nth(1)).toHaveText('8.00');
  });
});
