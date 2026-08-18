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
    // Negative offset -0.2 * 12 = -2.4 semitones. In C Major, -2.4 semitones (9.6 semitones in octave) quantizes to 9 semitones (A) -> -3 semitones = -0.25 V
    expect(quantizerResult.ch0[0]).toBeCloseTo(-0.25, 2);
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

  test('GranularProcessor precomputed windowing and multi-channel routing', async ({ page }) => {
    const granularResult = await page.evaluate(async () => {
      const resp = await fetch('/assets/js/audio-worklets/granular-processor.js');
      const text = await resp.text();

      let ProcessorClass;
      globalThis.sampleRate = 44100;
      globalThis.AudioWorkletProcessor = class {
        constructor() {
          this.port = {};
        }
      };
      globalThis.registerProcessor = (name, cls) => { ProcessorClass = cls; };

      eval(text);

      const processor = new ProcessorClass();
      const inBuf = new Float32Array(128).fill(0.8);
      const inputs = [[inBuf]];
      const outCh0 = new Float32Array(128);
      const outCh1 = new Float32Array(128);
      const outputs = [[outCh0, outCh1]];
      const parameters = {
        grainSize: [0.05],
        grainDensity: [100],
        pitchShift: [0],
        positionJitter: [0]
      };

      let ch0HasSignal = false;
      let ch1HasSignal = false;
      let maxActiveGrains = 0;

      // Process enough blocks so buffer fills and grains emit audio
      for (let i = 0; i < 40; i++) {
        processor.process(inputs, outputs, parameters);
        if (processor.activeGrains.length > maxActiveGrains) {
          maxActiveGrains = processor.activeGrains.length;
        }
        if (outputs[0][0].some(v => v !== 0)) ch0HasSignal = true;
        if (outputs[0][1].some(v => v !== 0)) ch1HasSignal = true;
      }

      return {
        bufferLength: processor.buffer.length,
        maxActiveGrains,
        ch0HasSignal,
        ch1HasSignal
      };
    });

    expect(granularResult.bufferLength).toBe(88200);
    expect(granularResult.maxActiveGrains).toBeGreaterThan(0);
    expect(granularResult.ch0HasSignal).toBe(true);
    expect(granularResult.ch1HasSignal).toBe(true);
  });

  test('VocoderProcessor optimized band processing and multi-channel copying', async ({ page }) => {
    const vocoderResult = await page.evaluate(async () => {
      const resp = await fetch('/assets/js/audio-worklets/vocoder-processor.js');
      const text = await resp.text();

      let ProcessorClass;
      globalThis.sampleRate = 44100;
      globalThis.AudioWorkletProcessor = class {
        constructor() {
          this.port = {};
        }
      };
      globalThis.registerProcessor = (name, cls) => { ProcessorClass = cls; };

      eval(text);

      const processor = new ProcessorClass();
      const carrierBuf = new Float32Array(128).fill(0.8);
      const modulatorBuf = new Float32Array(128).fill(0.5);
      const inputs = [[carrierBuf], [modulatorBuf]];
      const outCh0 = new Float32Array(128);
      const outCh1 = new Float32Array(128);
      const outputs = [[outCh0, outCh1]];
      const parameters = {
        numBands: [16],
        formantShift: [0],
        unvoicedLevel: [0.2]
      };

      processor.process(inputs, outputs, parameters);

      return {
        numBands: processor.numBands,
        ch0Length: outputs[0][0].length,
        ch1Length: outputs[0][1].length,
        ch1EqualsCh0: Array.from(outputs[0][1]).every((v, i) => v === outputs[0][0][i])
      };
    });

    expect(vocoderResult.numBands).toBe(16);
    expect(vocoderResult.ch0Length).toBe(128);
    expect(vocoderResult.ch1Length).toBe(128);
    expect(vocoderResult.ch1EqualsCh0).toBe(true);
  });
});
