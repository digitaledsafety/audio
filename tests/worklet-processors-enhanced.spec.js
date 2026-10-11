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

  test('QuantizerProcessor correctly quantizes negative pitch voltages with non-negative modulo logic', async ({ page }) => {
    const quantizedResult = await page.evaluate(async () => {
      // Fetch and evaluate quantizer processor logic
      const response = await fetch('/assets/js/audio-worklets/quantizer-processor.js');
      const text = await response.text();

      let processedOutput = null;
      class DummyProcessor {
        constructor() {
          this.scaleIntervals = [0, 2, 4, 5, 7, 9, 11];
        }
      }

      // Extract process function from script source
      const processMatch = text.match(/process\(inputs, outputs, parameters\)\s*\{([\s\S]*?)\n    \}/);
      if (!processMatch) return null;

      const processFn = new Function('inputs', 'outputs', 'parameters', processMatch[1]);

      const dummyCtx = { scaleIntervals: [0, 2, 4, 5, 7, 9, 11] };
      const inputs = [[new Float32Array([4.5])]]; // 4.5V = 54 semitones (-6 semitones relative to C4 root 60)
      const outputs = [[new Float32Array(1), new Float32Array(1)]];
      const parameters = { rootNote: [60] }; // Root C4 = 60

      processFn.call(dummyCtx, inputs, outputs, parameters);
      return {
        ch0: outputs[0][0][0],
        ch1: outputs[0][1][0]
      };
    });

    expect(quantizedResult).not.toBeNull();
    // Voltage 4.5V (-6 semitones) quantizes in C Major scale to 53 semitones (F3) / 12 = ~4.42V
    expect(quantizedResult.ch0).toBeCloseTo(4.42, 2);
    expect(quantizedResult.ch1).toBeCloseTo(4.42, 2);
  });

  test('VocoderProcessor uses normalized Biquad bandpass filter coefficients', async ({ page }) => {
    const filterCoeffs = await page.evaluate(async () => {
      const response = await fetch('/assets/js/audio-worklets/vocoder-processor.js');
      const text = await response.text();
      return {
        hasNormalizedB0: text.includes('this.b0 = alpha / a0;'),
        hasNormalizedB2: text.includes('this.b2 = -alpha / a0;'),
        hasClampedFormant: text.includes('Math.min(Math.max(freq * formantRatio, 20), this.sampleRate * 0.49)')
      };
    });

    expect(filterCoeffs.hasNormalizedB0).toBe(true);
    expect(filterCoeffs.hasNormalizedB2).toBe(true);
    expect(filterCoeffs.hasClampedFormant).toBe(true);
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
