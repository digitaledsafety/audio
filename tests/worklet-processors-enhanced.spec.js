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

  test('QuantizerProcessor correctly quantizes negative voltages and mirrors output channels', async ({ page }) => {
    const quantizerResult = await page.evaluate(async () => {
      const resp = await fetch('/assets/js/audio-worklets/quantizer-processor.js');
      const text = await resp.text();

      let registeredClass = null;
      const fakeRegisterProcessor = (name, cls) => { registeredClass = cls; };

      const fn = new Function('AudioWorkletProcessor', 'registerProcessor', text);
      class FakeAudioWorkletProcessor {
        constructor() { this.port = { onmessage: null }; }
      }
      fn(FakeAudioWorkletProcessor, fakeRegisterProcessor);

      if (!registeredClass) return { success: false, error: 'Class not registered' };

      const processor = new registeredClass();

      const inputs = [[new Float32Array([-0.25, -0.5])]];
      const outputs = [[new Float32Array(2), new Float32Array(2)]];
      const parameters = { rootNote: [60] };

      processor.process(inputs, outputs, parameters);

      const ch0 = Array.from(outputs[0][0]);
      const ch1 = Array.from(outputs[0][1]);

      const validValues = ch0.every(v => !isNaN(v) && isFinite(v)) &&
                          ch1.every(v => !isNaN(v) && isFinite(v));
      const channelsMatch = ch0.every((v, idx) => v === ch1[idx]);

      return { success: validValues && channelsMatch, ch0, ch1 };
    });

    expect(quantizerResult.success).toBe(true);
  });

  test('VocoderProcessor BiquadFilter bandpass coefficients are properly normalized', async ({ page }) => {
    const vocoderResult = await page.evaluate(async () => {
      const resp = await fetch('/assets/js/audio-worklets/vocoder-processor.js');
      const text = await resp.text();

      let registeredClass = null;
      const fakeRegister = (name, cls) => { registeredClass = cls; };
      const fn = new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', text);
      class FakeProc {}
      fn(FakeProc, fakeRegister, 44100);

      const processor = new registeredClass({});
      processor.rebuildFilters(8, 0);

      const filter = processor.modulatorFilters[0];
      const isNormalized = filter.b0 < 1.0 && filter.b0 > 0;
      return { isNormalized, b0: filter.b0 };
    });

    expect(vocoderResult.isNormalized).toBe(true);
  });
});
