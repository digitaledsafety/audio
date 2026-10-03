const { test, expect } = require('@playwright/test');

test.describe('DSP Worklets Mathematical Safety & Correctness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
  });

  test('QuantizerProcessor uses Euclidean modulo for negative semitone relative offsets without pitch distortion', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const sampleRate = 44100;
      const ctx = new OfflineAudioContext(1, 128, sampleRate);
      await ctx.audioWorklet.addModule('/assets/js/audio-worklets/quantizer-processor.js');

      const quantizerNode = new AudioWorkletNode(ctx, 'quantizer-processor', {
        parameterData: { rootNote: 60 } // C4
      });

      // 4.75V corresponds to 57 semitones (A3, -3 semitones from C4 at 5.0V)
      const buffer = ctx.createBuffer(1, 128, sampleRate);
      const data = buffer.getChannelData(0);
      data.fill(4.75);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(quantizerNode);
      quantizerNode.connect(ctx.destination);
      source.start();

      const renderedBuffer = await ctx.startRendering();
      const outputData = renderedBuffer.getChannelData(0);

      return {
        inputVoltage: 4.75,
        outputVoltage: outputData[0],
        outputMidiNote: Math.round(outputData[0] * 12)
      };
    });

    // 4.75V * 12 = 57 semitones (MIDI 57, A3).
    // Relative to C4 (60), offset is -3.
    // Euclidean modulo (((-3 % 12) + 12) % 12) yields 9 (Major 6th in C Major scale -> A3, MIDI 57).
    expect(result.outputMidiNote).toBe(57);
    expect(result.outputVoltage).toBeCloseTo(4.75, 2);
  });

  test('VocoderProcessor clamps filter frequencies below Nyquist under maximum formant shift', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const sampleRate = 44100;
      const ctx = new OfflineAudioContext(2, 128, sampleRate);
      await ctx.audioWorklet.addModule('/assets/js/audio-worklets/vocoder-processor.js');

      const vocoderNode = new AudioWorkletNode(ctx, 'vocoder-processor', {
        numberOfInputs: 2,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        parameterData: { formantShift: 1200, numBands: 16 } // Max +1200 cents (+1 octave)
      });

      // Connect carrier and modulator dummy sources
      const carrierBuf = ctx.createBuffer(1, 128, sampleRate);
      carrierBuf.getChannelData(0).fill(0.5);
      const carrierSrc = ctx.createBufferSource();
      carrierSrc.buffer = carrierBuf;

      const modBuf = ctx.createBuffer(1, 128, sampleRate);
      modBuf.getChannelData(0).fill(0.5);
      const modSrc = ctx.createBufferSource();
      modSrc.buffer = modBuf;

      carrierSrc.connect(vocoderNode, 0, 0);
      modSrc.connect(vocoderNode, 0, 1);
      vocoderNode.connect(ctx.destination);

      carrierSrc.start();
      modSrc.start();

      const renderedBuffer = await ctx.startRendering();
      const outputData = renderedBuffer.getChannelData(0);

      // Verify output does not contain NaN or Infinity
      let hasNaN = false;
      for (let i = 0; i < outputData.length; i++) {
        if (Number.isNaN(outputData[i]) || !Number.isFinite(outputData[i])) {
          hasNaN = true;
          break;
        }
      }

      return { hasNaN, firstSample: outputData[0] };
    });

    expect(result.hasNaN).toBe(false);
  });
});
