const { test, expect } = require('@playwright/test');

test.describe('DTS Enhancer and Vector Panner Nodes', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the local server
    await page.goto('/');
    // Enter the studio
    const ctaButton = page.locator('#cta-button');
    if (await ctaButton.isVisible()) {
      await ctaButton.click();
    }
  });

  test('should add a DTS Enhancer node, verify controls and custom connect methods', async ({ page }) => {
    // Open Add Node dropdown
    await page.evaluate(() => {
      document.getElementById('addNodeDropdown').classList.remove('hidden');
    });

    // Click DTS Enhancer button
    const addDTSBtn = page.locator('#addDTSEnhancerNodeBtn');
    await expect(addDTSBtn).toBeVisible();
    await addDTSBtn.click();

    // Verify DTS Enhancer node exists
    await expect(page.locator('text=DTS Enhancer').first()).toBeVisible();

    // Verify controls
    await expect(page.locator('text=Punch (dB)').first()).toBeVisible();
    await expect(page.locator('text=Clarity (dB)').first()).toBeVisible();
    await expect(page.locator('text=LFE Cutoff (Hz)').first()).toBeVisible();
    await expect(page.locator('text=LFE Gain').first()).toBeVisible();

    // Verify outputs
    await expect(page.locator('text=Audio Out').first()).toBeVisible();
    await expect(page.locator('text=LFE Out').first()).toBeVisible();

    // Verify internal DTSEnhancer instance methods
    const result = await page.evaluate(() => {
      const nodes = Array.from(window.reteAudioNodes.values());
      const dts = nodes.find(n => n.constructor.name === 'DTSEnhancer');
      if (!dts) return null;
      return {
        hasMainOutput: Boolean(dts.mainOutput),
        hasConnect: typeof dts.connect === 'function',
        hasDisconnect: typeof dts.disconnect === 'function'
      };
    });

    expect(result).not.toBeNull();
    expect(result.hasMainOutput).toBe(true);
    expect(result.hasConnect).toBe(true);
    expect(result.hasDisconnect).toBe(true);
  });

  test('should add a Vector Panner node and verify controls and CV inputs', async ({ page }) => {
    // Open Add Node dropdown
    await page.evaluate(() => {
      document.getElementById('addNodeDropdown').classList.remove('hidden');
    });

    // Click Vector Panner button
    const addVectorBtn = page.locator('#addVectorPannerNodeBtn');
    await expect(addVectorBtn).toBeVisible();
    await addVectorBtn.click();

    // Verify Vector Panner node exists
    await expect(page.locator('text=Vector Panner').first()).toBeVisible();

    // Verify controls and CV inputs
    await expect(page.locator('text=X (Left/Right)').first()).toBeVisible();
    await expect(page.locator('text=Y (Front/Back)').first()).toBeVisible();
    await expect(page.locator('text=X CV').first()).toBeVisible();
    await expect(page.locator('text=Y CV').first()).toBeVisible();
  });
});
