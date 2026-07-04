const { test, expect } = require('@playwright/test');

test.describe('Multiple Output Nodes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
    await expect(page.locator('#hero-overlay')).not.toBeAttached({ timeout: 15000 });
    // Clear the random workspace to ensure a clean state
    await page.evaluate(async () => {
        if (window.editor) {
            await window.editor.clear();
        }
    });
  });

  test('should allow multiple Output nodes', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    const addButton = page.locator('#addMasterGainOutputNodeBtn');

    // Add first Output node
    await addButton.click();
    await expect(page.locator('[data-node-label="Output"]')).toHaveCount(1);

    // Add second Output node
    await page.locator('#addNodeToggle').click();
    await addButton.click();
    await expect(page.locator('[data-node-label="Output"]')).toHaveCount(2);

    // Both should be visible
    const nodes = page.locator('[data-node-label="Output"]');
    await expect(nodes.nth(0)).toBeVisible();
    await expect(nodes.nth(1)).toBeVisible();
  });
});
