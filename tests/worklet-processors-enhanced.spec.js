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

  test('Service Worker cache manifest includes local worklets and mini-notation parser', async ({ page }) => {
    const swContent = await page.evaluate(async () => {
      const response = await fetch('/sw.js');
      return await response.text();
    });

    expect(swContent).toContain('/assets/js/mini-notation-parser.js');
    expect(swContent).toContain('/assets/js/audio-worklets/bitcrusher-processor.js');
    expect(swContent).toContain('/assets/js/audio-worklets/granular-processor.js');
    expect(swContent).toContain('/assets/js/audio-worklets/quantizer-processor.js');
    expect(swContent).toContain('/assets/js/audio-worklets/vocoder-processor.js');
  });

  test('QuantizerProcessor handles negative pitch offsets and multi-channel outputs', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Fetch and evaluate quantizer processor source code
      const response = await fetch('/assets/js/audio-worklets/quantizer-processor.js');
      const code = await response.text();

      // Dummy AudioWorkletProcessor base class
      class AudioWorkletProcessor {
        constructor() {
          this.port = { onmessage: null };
        }
      }
      let registeredProcessor = null;
      const registerProcessor = (name, proc) => {
        registeredProcessor = proc;
      };

      const fn = new Function('AudioWorkletProcessor', 'registerProcessor', code);
      fn(AudioWorkletProcessor, registerProcessor);

      const processor = new registeredProcessor();
      // Test negative voltage (e.g. 55 semitones from C-1, which is G3, rootNote=60 C4)
      const inputBuffer = new Float32Array([55 / 12.0]);
      const outputCh0 = new Float32Array(1);
      const outputCh1 = new Float32Array(1);
      const inputs = [[inputBuffer]];
      const outputs = [[outputCh0, outputCh1]];
      const parameters = { rootNote: [60] };

      processor.process(inputs, outputs, parameters);

      return {
        ch0Voltage: outputCh0[0],
        ch1Voltage: outputCh1[0],
        expectedVoltage: 55 / 12.0
      };
    });

    expect(result.ch0Voltage).toBeCloseTo(result.expectedVoltage, 4);
    expect(result.ch1Voltage).toBeCloseTo(result.expectedVoltage, 4);
  });
});
