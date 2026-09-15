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

  test('Service Worker fetch event handler includes non-GET and scheme guards', async ({ page }) => {
    const swContent = await page.evaluate(async () => {
      const response = await fetch('/sw.js');
      return await response.text();
    });

    expect(swContent).toContain("event.request.method !== 'GET'");
    expect(swContent).toContain("['http:', 'https:'].includes(requestUrl.protocol)");
  });

  test('Service Worker cache manifest includes local audio worklets and mini notation parser', async ({ page }) => {
    const swContent = await page.evaluate(async () => {
      const response = await fetch('/sw.js');
      return await response.text();
    });

    expect(swContent).toContain('mini-notation-parser.js');
    expect(swContent).toContain('bitcrusher-processor.js');
    expect(swContent).toContain('granular-processor.js');
    expect(swContent).toContain('quantizer-processor.js');
    expect(swContent).toContain('vocoder-processor.js');
  });

  test('QuantizerProcessor handles non-negative modulo logic for negative pitch offsets and multi-channel buffer copy', async ({ page }) => {
    const qContent = await page.evaluate(async () => {
      const response = await fetch('/assets/js/audio-worklets/quantizer-processor.js');
      return await response.text();
    });

    expect(qContent).toContain('((rawSemitone % 12) + 12) % 12');
    expect(qContent).toContain('output[channel].set(outputChannel)');
  });

  test('MiniNotationParser bounds Euclidean pattern steps to 128', async ({ page }) => {
    const parserContent = await page.evaluate(async () => {
      const response = await fetch('/assets/js/mini-notation-parser.js');
      return await response.text();
    });

    expect(parserContent).toContain('Math.min(parseInt(euclideanMatch[3], 10), 128)');
  });
});
