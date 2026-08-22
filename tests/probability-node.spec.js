const { test, expect } = require('@playwright/test');

test.describe('Probability Node', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
  });

  test('should add and configure Probability node', async ({ page }) => {
    await page.locator('#addNodeToggle').click();

    const addButton = page.locator('#addProbabilityNodeBtn').first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    const nodeElement = page.locator('[data-node-label="Probability"]').first();
    await expect(nodeElement).toBeVisible({ timeout: 10000 });

    // Verify input sockets: Clock/Gate and Prob CV
    await expect(nodeElement.locator('.input-title:has-text("Clock/Gate")')).toBeVisible();
    await expect(nodeElement.locator('.input-title:has-text("Prob CV")')).toBeVisible();

    // Verify output socket: Out
    await expect(nodeElement.locator('.output-title:has-text("Out")')).toBeVisible();

    // Verify probability slider control
    const probSlider = nodeElement.locator('input[type="range"]');
    await expect(probSlider).toBeVisible();
    await expect(probSlider).toHaveValue('0.5');

    // Change slider value
    await probSlider.fill('0.75');
    await probSlider.dispatchEvent('input');
    await expect(probSlider).toHaveValue('0.75');
  });
});
