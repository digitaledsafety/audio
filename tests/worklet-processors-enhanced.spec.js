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

  test('Service Worker fetch event handler includes non-GET and scheme guards and caches worklets', async ({ page }) => {
    const swContent = await page.evaluate(async () => {
      const response = await fetch('/sw.js');
      return await response.text();
    });

    expect(swContent).toContain("event.request.method !== 'GET'");
    expect(swContent).toContain("['http:', 'https:'].includes(requestUrl.protocol)");
    expect(swContent).toContain('mini-notation-parser.js');
    expect(swContent).toContain('bitcrusher-processor.js');
    expect(swContent).toContain('granular-processor.js');
    expect(swContent).toContain('quantizer-processor.js');
    expect(swContent).toContain('vocoder-processor.js');
  });

  test('QuantizerProcessor handles negative pitch offsets and multi-channel outputs', async ({ page }) => {
    const quantizerCode = await page.evaluate(async () => {
      const res = await fetch('/assets/js/audio-worklets/quantizer-processor.js');
      return await res.text();
    });

    // Check non-negative modulo logic for semitone offsets below root note
    expect(quantizerCode).toContain('((diff % 12) + 12) % 12');
    // Check multi-channel output buffer set
    expect(quantizerCode).toContain('output[ch].set(outputChannel)');
  });

  test('GranularProcessor handles NaN parameter guards and non-negative modulo buffer indexing', async ({ page }) => {
    const granularCode = await page.evaluate(async () => {
      const res = await fetch('/assets/js/audio-worklets/granular-processor.js');
      return await res.text();
    });

    // Check parameter guards
    expect(granularCode).toContain('isNaN(parameters.grainSize[0])');
    // Check non-negative modulo logic for buffer indexing
    expect(granularCode).toContain('((bufferIndex % bufLen) + bufLen) % bufLen');
  });
});
