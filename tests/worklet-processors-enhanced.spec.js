const { test, expect } = require('@playwright/test');

test.describe('Enhanced AudioWorklet Processors & Custom Node Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
  });

  test('should add Quantizer node, update parameters, and expose connect/disconnect methods', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addQuantizerNodeBtn').click();

    const quantNode = page.locator('[data-node-label="Quantizer"]').first();
    await expect(quantNode).toBeVisible();

    // Verify root note select control
    const rootSelect = quantNode.locator('select').first();
    await expect(rootSelect).toBeVisible();
    await rootSelect.selectOption('G4');
    await expect(rootSelect).toHaveValue('G4');

    // Verify scale select control
    const scaleSelect = quantNode.locator('select').nth(1);
    await expect(scaleSelect).toBeVisible();
    await scaleSelect.selectOption('Natural Minor (Aeolian)');
    await expect(scaleSelect).toHaveValue('Natural Minor (Aeolian)');

    // Verify live audio node in window.reteAudioNodes has connect/disconnect methods
    const hasMethods = await page.evaluate(() => {
      const nodes = Array.from(window.reteAudioNodes.values());
      const quantizer = nodes.find(n => n && n.constructor && n.constructor.name === 'Quantizer');
      return quantizer && typeof quantizer.connect === 'function' && typeof quantizer.disconnect === 'function';
    });
    expect(hasMethods).toBe(true);
  });

  test('should add Bitcrusher node and update parameters', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addBitcrusherNodeBtn').click();

    const bitcrusherNode = page.locator('[data-node-label="Bitcrusher"]').first();
    await expect(bitcrusherNode).toBeVisible();

    const sliders = bitcrusherNode.locator('input[type="range"]');
    await expect(sliders).toHaveCount(2);

    const bitsSlider = sliders.nth(0);
    await bitsSlider.fill('4');
    const bitsDisplay = bitcrusherNode.locator('.value-display').nth(0);
    await expect(bitsDisplay).toHaveText('4.00');

    const srSlider = sliders.nth(1);
    await srSlider.fill('8');
    const srDisplay = bitcrusherNode.locator('.value-display').nth(1);
    await expect(srDisplay).toHaveText('8.00');
  });

  test('should add Vocoder node, update parameters, and expose connect/disconnect methods', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addVocoderNodeBtn').click();

    const vocoderNode = page.locator('[data-node-label="Vocoder"]').first();
    await expect(vocoderNode).toBeVisible();

    const waveSelect = vocoderNode.locator('select').first();
    await expect(waveSelect).toBeVisible();
    await waveSelect.selectOption('square');
    await expect(waveSelect).toHaveValue('square');

    const hasMethods = await page.evaluate(() => {
      const nodes = Array.from(window.reteAudioNodes.values());
      const vocoder = nodes.find(n => n && n.constructor && n.constructor.name === 'Vocoder');
      return vocoder && typeof vocoder.connect === 'function' && typeof vocoder.disconnect === 'function';
    });
    expect(hasMethods).toBe(true);
  });

  test('should add Granular Synthesizer node, update parameters, and expose connect/disconnect methods', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addGranularSynthesizerNodeBtn').click();

    const granularNode = page.locator('[data-node-label="Granular Synthesizer"]').first();
    await expect(granularNode).toBeVisible();

    const sliders = granularNode.locator('input[type="range"]');
    await expect(sliders).toHaveCount(4);

    const hasMethods = await page.evaluate(() => {
      const nodes = Array.from(window.reteAudioNodes.values());
      const granular = nodes.find(n => n && n.constructor && n.constructor.name === 'GranularSynthesizer');
      return granular && typeof granular.connect === 'function' && typeof granular.disconnect === 'function';
    });
    expect(hasMethods).toBe(true);
  });
});
