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

  test('Service Worker fetch event handler includes non-GET and scheme guards and caches local assets', async ({ page }) => {
    const swContent = await page.evaluate(async () => {
      const response = await fetch('/sw.js');
      return await response.text();
    });

    expect(swContent).toContain("event.request.method !== 'GET'");
    expect(swContent).toContain("['http:', 'https:'].includes(requestUrl.protocol)");
    expect(swContent).toContain("assets/js/mini-notation-parser.js");
    expect(swContent).toContain("assets/js/audio-worklets/bitcrusher-processor.js");
    expect(swContent).toContain("assets/js/audio-worklets/granular-processor.js");
    expect(swContent).toContain("assets/js/audio-worklets/quantizer-processor.js");
    expect(swContent).toContain("assets/js/audio-worklets/vocoder-processor.js");
  });

  test('MiniNotationParser bounds Euclidean steps and repetition counts to prevent stack overflow', async ({ page }) => {
    const result = await page.evaluate(() => {
      const parser = new MiniNotationParser({ C4: 60 });
      // Test Euclidean pattern with extreme steps parameter
      const euclideanResult = parser.parse('C4*8/999999');
      // Test group repetition with extreme count
      const repetitionResult = parser.parse('[C4 D4]*999999');
      return {
        euclideanLength: euclideanResult.length,
        repetitionLength: repetitionResult.length
      };
    });

    expect(result.euclideanLength).toBeLessThanOrEqual(128);
    expect(result.repetitionLength).toBeLessThanOrEqual(256); // 2 items * max 128
  });

  test('Audio worklet processors are safely defined without errors', async ({ page }) => {
    const processorsLoaded = await page.evaluate(async () => {
      const granularResp = await fetch('/assets/js/audio-worklets/granular-processor.js');
      const quantizerResp = await fetch('/assets/js/audio-worklets/quantizer-processor.js');
      const vocoderResp = await fetch('/assets/js/audio-worklets/vocoder-processor.js');

      const granularText = await granularResp.text();
      const quantizerText = await quantizerResp.text();
      const vocoderText = await vocoderResp.text();

      return {
        granularHasModulo: granularText.includes('((bufferIndex % len) + len) % len'),
        quantizerHasNonNegativeModulo: quantizerText.includes('(((totalSemitonesFromC - rootNoteMidi) % 12) + 12) % 12'),
        vocoderHasNyquistClamp: vocoderText.includes('Math.min(Math.max(rawShiftedFreq, 20), this.sampleRate * 0.49)')
      };
    });

    expect(processorsLoaded.granularHasModulo).toBe(true);
    expect(processorsLoaded.quantizerHasNonNegativeModulo).toBe(true);
    expect(processorsLoaded.vocoderHasNyquistClamp).toBe(true);
  });
});
