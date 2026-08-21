const { test, expect } = require('@playwright/test');

test.describe('Worklets and MiniNotationParser Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
    await page.waitForTimeout(500);
  });

  test('MiniNotationParser bounds Euclidean pattern steps to 128', async ({ page }) => {
    const resultCount = await page.evaluate(() => {
      const notesMap = { C4: 60 };
      const parser = new MiniNotationParser(notesMap);
      // Pass a pattern with steps = 500
      const parsed = parser.parse('C4*3/500');
      return parsed.length;
    });

    expect(resultCount).toBe(128);
  });

  test('QuantizerProcessor handles negative voltage offsets and copies multi-channel output', async ({ page }) => {
    const quantizerResult = await page.evaluate(async () => {
      const resp = await fetch('/assets/js/audio-worklets/quantizer-processor.js');
      const text = await resp.text();

      let ProcessorClass;
      globalThis.AudioWorkletProcessor = class {
        constructor() {
          this.port = {};
        }
      };
      globalThis.registerProcessor = (name, cls) => { ProcessorClass = cls; };

      eval(text);

      const processor = new ProcessorClass();

      // inputs[0] has channel 0 with negative voltage (-0.2 V = -2.4 semitones)
      const inputs = [[new Float32Array([-0.2, -0.5])]];
      // outputs[0] has channel 0 and channel 1
      const ch0 = new Float32Array(2);
      const ch1 = new Float32Array(2);
      const outputs = [[ch0, ch1]];
      const parameters = { rootNote: [60] };

      processor.process(inputs, outputs, parameters);

      return {
        ch0: Array.from(outputs[0][0]),
        ch1: Array.from(outputs[0][1])
      };
    });

    expect(quantizerResult.ch0.length).toBe(2);
    expect(quantizerResult.ch1.length).toBe(2);
    // Channel 1 should match Channel 0
    expect(quantizerResult.ch1).toEqual(quantizerResult.ch0);
  });

  test('BitcrusherProcessor maintains isolated state across multiple channels', async ({ page }) => {
    const bitcrusherResult = await page.evaluate(async () => {
      const resp = await fetch('/assets/js/audio-worklets/bitcrusher-processor.js');
      const text = await resp.text();

      let ProcessorClass;
      globalThis.AudioWorkletProcessor = class {
        constructor() {
          this.port = {};
        }
      };
      globalThis.registerProcessor = (name, cls) => { ProcessorClass = cls; };

      eval(text);

      const processor = new ProcessorClass();

      // 2 input channels with different values
      const inputs = [[new Float32Array([0.5, 0.8]), new Float32Array([-0.3, -0.7])]];
      const outputs = [[new Float32Array(2), new Float32Array(2)]];
      const parameters = { bits: [8], sampleRateReduction: [2] };

      processor.process(inputs, outputs, parameters);

      return {
        lastSamplesLength: processor.lastSamples.length,
        phasesLength: processor.phases.length,
        ch0: Array.from(outputs[0][0]),
        ch1: Array.from(outputs[0][1])
      };
    });

    expect(bitcrusherResult.lastSamplesLength).toBe(2);
    expect(bitcrusherResult.phasesLength).toBe(2);
    expect(bitcrusherResult.ch0.length).toBe(2);
    expect(bitcrusherResult.ch1.length).toBe(2);
  });
});
