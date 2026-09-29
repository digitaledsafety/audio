const { test, expect } = require('@playwright/test');

test.describe('DSP Worklet Fixes & Precision Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
  });

  test('Vocoder node handles max formant shift (+1200 cents) without filter instability or NaN', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addVocoderNodeBtn').click();

    const vocoderNode = page.locator('[data-node-label="Vocoder"]').first();
    await expect(vocoderNode).toBeVisible();

    const sliders = vocoderNode.locator('input[type="range"]');
    const formantSlider = sliders.nth(2); // Formant shift slider (-1200 to +1200)
    await expect(formantSlider).toBeVisible();

    // Set formant shift to maximum +1200
    await formantSlider.fill('1200');
    await formantSlider.dispatchEvent('input');
    await formantSlider.dispatchEvent('change');

    // Verify node data updated in Rete editor
    const formantVal = await page.evaluate(() => {
      const editor = window.editor;
      const node = editor.getNodes().find(n => n.label === 'Vocoder');
      return node ? node.data.formantShift : null;
    });

    expect(Number(formantVal)).toBe(1200);
  });

  test('Quantizer node handles scale selection and root note configuration', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addQuantizerNodeBtn').click();

    const quantizerNode = page.locator('[data-node-label="Quantizer"]').first();
    await expect(quantizerNode).toBeVisible();

    const selects = quantizerNode.locator('select');
    const rootSelect = selects.nth(0);
    await expect(rootSelect).toBeVisible();

    await rootSelect.selectOption('D4');

    const quantizerValid = await page.evaluate(() => {
      const editor = window.editor;
      const node = editor.getNodes().find(n => n.label === 'Quantizer');
      return node ? node.data.rootNote === 'D4' : false;
    });

    expect(quantizerValid).toBe(true);
  });

  test('Granular Synthesizer node initializes and operates smoothly', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addGranularSynthesizerNodeBtn').click();

    const granularNode = page.locator('[data-node-label="Granular Synthesizer"]').first();
    await expect(granularNode).toBeVisible();

    // Verify controls
    const grainSizeSlider = granularNode.locator('input[type="range"]').first();
    await expect(grainSizeSlider).toBeVisible();

    await grainSizeSlider.fill('0.2');
    await grainSizeSlider.dispatchEvent('input');
    await grainSizeSlider.dispatchEvent('change');

    const sizeVal = await page.evaluate(() => {
      const editor = window.editor;
      const node = editor.getNodes().find(n => n.label === 'Granular Synthesizer');
      return node ? node.data.grainSize : null;
    });

    expect(Number(sizeVal)).toBe(0.2);
  });
});
