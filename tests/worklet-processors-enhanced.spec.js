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

  test('QuantizerProcessor correctly quantizes negative pitch offsets and copies across stereo channels', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addQuantizerNodeBtn').click();

    const quantNode = page.locator('[data-node-label="Quantizer"]').first();
    await expect(quantNode).toBeVisible();

    // Verify Quantizer worklet processing directly
    const testResult = await page.evaluate(async () => {
      const resp = await fetch('/assets/js/audio-worklets/quantizer-processor.js');
      const code = await resp.text();

      let procClass;
      const fakeRegister = (name, cls) => { procClass = cls; };
      class MockAudioWorkletProcessor {
        constructor() {
          this.port = { onmessage: null };
        }
      }
      const fn = new Function('AudioWorkletProcessor', 'registerProcessor', code);
      fn(MockAudioWorkletProcessor, fakeRegister);

      const processor = new procClass();
      // Test negative voltage (e.g. 4.833333333333333 V -> 58 semitones, which is 2 semitones below rootNote 60)
      const inputBuffer = [new Float32Array([4.833333333333333])]; // 58 semitones
      const outputChannels = [new Float32Array(1), new Float32Array(1)];
      const params = { rootNote: new Float32Array([60]) };

      processor.process([inputBuffer], [outputChannels], params);

      const voltageCh0 = outputChannels[0][0];
      const voltageCh1 = outputChannels[1][0];

      return {
        voltageCh0,
        voltageCh1,
        isCh0Valid: voltageCh0 > 4.0 && voltageCh0 < 5.0,
        isCh1Match: Math.abs(voltageCh0 - voltageCh1) < 0.00001
      };
    });

    expect(testResult.isCh0Valid).toBe(true);
    expect(testResult.isCh1Match).toBe(true);
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
