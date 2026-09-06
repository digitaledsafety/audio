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

  test('should add and configure Quantizer node with root note and scale type controls', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addQuantizerNodeBtn').click();

    const quantizerNode = page.locator('[data-node-label="Quantizer"]').first();
    await expect(quantizerNode).toBeVisible();

    const rootSelect = quantizerNode.locator('select').filter({ hasText: 'C4' });
    await expect(rootSelect).toBeVisible();

    await rootSelect.selectOption('G3');

    const nodeData = await page.evaluate(() => {
      const editor = window.editor;
      const nodes = editor.getNodes();
      const node = nodes.find(n => n.label === 'Quantizer');
      return node ? node.data : null;
    });

    expect(nodeData.rootNote).toBe('G3');
  });

  test('Service Worker fetch event handler includes non-GET, scheme guards, and cached worklets', async ({ page }) => {
    const swContent = await page.evaluate(async () => {
      const response = await fetch('/sw.js');
      return await response.text();
    });

    expect(swContent).toContain("event.request.method !== 'GET'");
    expect(swContent).toContain("['http:', 'https:'].includes(requestUrl.protocol)");
    expect(swContent).toContain("assets/js/mini-notation-parser.js");
    expect(swContent).toContain("assets/js/audio-worklets/bitcrusher-processor.js");
    expect(swContent).toContain("assets/js/audio-worklets/granular-processor.js");
    expect(swContent).toContain("assets/js/audio-worklets/vocoder-processor.js");
    expect(swContent).toContain("assets/js/audio-worklets/quantizer-processor.js");
  });
});
