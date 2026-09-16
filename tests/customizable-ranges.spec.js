const { test, expect } = require('@playwright/test');

test.describe('Slider Precision Zooming & Sensitivity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('#cta-button');
    await page.waitForFunction(() => window.NodeRegistry && window.editor);
    await page.evaluate(async () => {
      if (window.editor) {
        await window.editor.clear();
      }
    });
  });

  test('should support Shift key high-precision wheel scrolling', async ({ page }) => {
    const nodeId = await page.evaluate(async () => {
      const Constructor = window.NodeRegistry.getConstructor('ToneGeneratorNode');
      const node = new Constructor();
      node.data.frequency = 440;
      await window.editor.addNode(node);
      return node.id;
    });

    const initialVal = await page.evaluate((id) => window.editor.getNode(id).controls.frequency.value, nodeId);
    expect(initialVal).toBe(440);

    // Trigger Shift + Wheel scroll over slider
    const sliderLocator = page.locator('input[type="range"]').first();
    await sliderLocator.dispatchEvent('wheel', { deltaY: -10, shiftKey: true });

    // Verify value changed at fine micro-step resolution
    const newVal = await page.evaluate((id) => window.editor.getNode(id).controls.frequency.value, nodeId);
    expect(newVal).not.toBe(440);
    expect(Math.abs(newVal - 440)).toBeLessThan(10); // Micro step
  });

  test('should show Fine Precision badge during Shift or 2D drag scrubbing', async ({ page }) => {
    await page.evaluate(async () => {
      const Constructor = window.NodeRegistry.getConstructor('FilterNode');
      const node = new Constructor();
      await window.editor.addNode(node);
    });

    const fineBadge = page.locator('.fine-badge').first();
    await expect(fineBadge).toBeHidden();

    const sliderLocator = page.locator('input[type="range"]').first();
    await sliderLocator.dispatchEvent('pointerdown', { clientX: 100, clientY: 100 });
    await sliderLocator.dispatchEvent('pointermove', { clientX: 120, clientY: 160 }); // 60px vertical pull

    // Verify Fine badge is visible during vertical pull scrubbing
    await expect(fineBadge).toBeVisible();

    await sliderLocator.dispatchEvent('pointerup');
    // Verify badge hides after pointer release
    await expect(fineBadge).toBeHidden();
  });

  test('should preserve full parameter bounds while allowing micro-tuning', async ({ page }) => {
    const nodeId = await page.evaluate(async () => {
      const Constructor = window.NodeRegistry.getConstructor('ToneGeneratorNode');
      const node = new Constructor();
      await window.editor.addNode(node);
      return node.id;
    });

    const bounds = await page.evaluate((id) => {
      const ctrl = window.editor.getNode(id).controls.frequency;
      return { min: ctrl.min, max: ctrl.max };
    }, nodeId);

    expect(bounds.min).toBe(20);
    expect(bounds.max).toBe(20000);
  });
});
