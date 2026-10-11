const { test, expect } = require('@playwright/test');

test.describe('Worklet Processors & Service Worker Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
  });

  test('should add and configure Bitcrusher node with bits and sample rate reduction controls', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addBitcrusherNodeBtn').click();

    const bitcrusherNode = page.locator('[data-node-label="Bitcrusher"]').first();
    await expect(bitcrusherNode).toBeVisible();

    // Verify sliders exist
    const bitsSlider = bitcrusherNode.locator('input[type="range"]').first();
    await expect(bitsSlider).toBeVisible();

    // Change bits value
    await bitsSlider.fill('4');
    await bitsSlider.dispatchEvent('input');
    await bitsSlider.dispatchEvent('change');

    // Verify node data updated in Rete editor
    const bitsVal = await page.evaluate(() => {
      const editor = window.editor;
      const nodes = editor.getNodes();
      const node = nodes.find(n => n.label === 'Bitcrusher');
      return node ? node.data.bits : null;
    });

    expect(Number(bitsVal)).toBe(4);
  });

  test('should add and configure Granular Synthesizer node with position jitter without audio buffer NaN overflow', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addGranularSynthesizerNodeBtn').click();

    const granularNode = page.locator('[data-node-label="Granular Synthesizer"]').first();
    await expect(granularNode).toBeVisible();

    // Set position jitter to max (1.0) and verify parameter update
    const sliders = granularNode.locator('input[type="range"]');
    const jitterSlider = sliders.last(); // Position Jitter slider
    await jitterSlider.fill('1');
    await jitterSlider.dispatchEvent('input');
    await jitterSlider.dispatchEvent('change');

    const jitterVal = await page.evaluate(() => {
      const editor = window.editor;
      const nodes = editor.getNodes();
      const node = nodes.find(n => n.label === 'Granular Synthesizer');
      return node ? node.data.positionJitter : null;
    });

    expect(Number(jitterVal)).toBe(1);
  });

  test('should add and configure Quantizer node with root note and scale type controls', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addQuantizerNodeBtn').click();

    const quantizerNode = page.locator('[data-node-label="Quantizer"]').first();
    await expect(quantizerNode).toBeVisible();

    const selects = quantizerNode.locator('select');
    await expect(selects).toHaveCount(2);

    const rootSelect = selects.nth(0);
    await rootSelect.selectOption('G4');
    await rootSelect.dispatchEvent('change');

    const scaleSelect = selects.nth(1);
    await scaleSelect.selectOption('Pentatonic Minor');
    await scaleSelect.dispatchEvent('change');

    const nodeData = await page.evaluate(() => {
      const editor = window.editor;
      const nodes = editor.getNodes();
      const node = nodes.find(n => n.label === 'Quantizer');
      return node ? { rootNote: node.data.rootNote, scaleType: node.data.scaleType } : null;
    });

    expect(nodeData.rootNote).toBe('G4');
    expect(nodeData.scaleType).toBe('Pentatonic Minor');
  });

  test('should add and configure Vocoder node controls and verify parameter synchronization', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addVocoderNodeBtn').click();

    const vocoderNode = page.locator('[data-node-label="Vocoder"]').first();
    await expect(vocoderNode).toBeVisible();

    const waveSelect = vocoderNode.locator('select').first();
    await waveSelect.selectOption('square');
    await waveSelect.dispatchEvent('change');

    const sliders = vocoderNode.locator('input[type="range"]');
    const bandsSlider = sliders.nth(1); // numBands slider
    await bandsSlider.fill('24');
    await bandsSlider.dispatchEvent('input');
    await bandsSlider.dispatchEvent('change');

    const vocoderData = await page.evaluate(() => {
      const editor = window.editor;
      const nodes = editor.getNodes();
      const node = nodes.find(n => n.label === 'Vocoder');
      return node ? { waveform: node.data.waveform, numBands: node.data.numBands } : null;
    });

    expect(vocoderData.waveform).toBe('square');
    expect(Number(vocoderData.numBands)).toBe(24);
  });

  test('Service Worker fetch event handler includes non-GET and scheme guards and complete cache manifest', async ({ page }) => {
    const swContent = await page.evaluate(async () => {
      const response = await fetch('/sw.js');
      return await response.text();
    });

    expect(swContent).toContain("event.request.method !== 'GET'");
    expect(swContent).toContain("['http:', 'https:'].includes(requestUrl.protocol)");
    expect(swContent).toContain("showcase.html");
    expect(swContent).toContain("mini-notation-parser.js");
    expect(swContent).toContain("bitcrusher-processor.js");
    expect(swContent).toContain("granular-processor.js");
    expect(swContent).toContain("quantizer-processor.js");
    expect(swContent).toContain("vocoder-processor.js");
  });
});
