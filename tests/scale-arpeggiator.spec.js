const { test, expect } = require('@playwright/test');

test.describe('Scale Arpeggiator Node', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
    await expect(page.locator('#hero-overlay')).not.toBeAttached({ timeout: 15000 });
  });

  test('should add Scale Arpeggiator node', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    const addButton = page.locator('#addScaleArpeggiatorNodeBtn');
    await expect(addButton).toBeVisible();
    await addButton.click();

    const node = page.locator('[data-node-label="Scale Arpeggiator"]').first();
    await expect(node).toBeVisible();
  });

  test('should have expected controls', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addScaleArpeggiatorNodeBtn').click();
    const node = page.locator('[data-node-label="Scale Arpeggiator"]').first();

    await expect(node.locator('select')).toHaveCount(5); // Note Duration, Scale Type, Root Note, Pattern, Waveform
    await expect(node.locator('input[type="range"]')).toHaveCount(2); // BPM, Octaves
  });

  test('should toggle envelope controls', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addScaleArpeggiatorNodeBtn').click();
    const node = page.locator('[data-node-label="Scale Arpeggiator"]').first();

    const envBtn = node.locator('button:has-text("Envelope")');
    await expect(envBtn).toBeVisible();

    // Attack slider should be hidden initially
    await expect(node.locator('label:has-text("Attack (s)")')).not.toBeVisible();

    await envBtn.click();
    await expect(node.locator('label:has-text("Attack (s)")')).toBeVisible();
    await expect(node.locator('input[type="range"]')).toHaveCount(6); // BPM, Octaves + 4 ADSR
  });
});
