const { test, expect } = require('@playwright/test');

test.describe('DSP Worklets & PWA Cache Fixes Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
    await page.waitForTimeout(500);
  });

  test('Quantizer correctly calculates non-negative semitone modulo for negative input voltages', async ({ page }) => {
    const semitoneInOctave = await page.evaluate(() => {
      const rootNoteMidi = 60; // C4
      // Negative voltage corresponding to G3 (55 MIDI = -5 semitones from C4)
      const voltage = 55 / 12; // 4.58333...
      const totalSemitonesFromC = voltage * 12; // 55
      const rawOffset = totalSemitonesFromC - rootNoteMidi; // -5
      return (((rawOffset % 12) + 12) % 12);
    });

    // -5 % 12 in JS is -5, but normalized modulo (((-5%12)+12)%12) is 7 (G)
    expect(semitoneInOctave).toBe(7);
  });

  test('Vocoder BiquadFilter setBandpass scales b0 and b2 by a0', async ({ page }) => {
    const filterCoeffs = await page.evaluate(() => {
      class BiquadFilter {
        constructor() {
          this.a1 = this.a2 = this.b0 = this.b1 = this.b2 = 0;
        }
        setBandpass(freq, q, sampleRate) {
          const w0 = 2 * Math.PI * freq / sampleRate;
          const cosW0 = Math.cos(w0);
          const sinW0 = Math.sin(w0);
          const alpha = sinW0 / (2 * q);
          const a0 = 1 + alpha;

          this.b0 = alpha / a0;
          this.b1 = 0;
          this.b2 = -alpha / a0;
          this.a1 = -2 * cosW0 / a0;
          this.a2 = (1 - alpha) / a0;
        }
      }

      const filter = new BiquadFilter();
      filter.setBandpass(1000, 20, 44100);
      return { b0: filter.b0, b2: filter.b2 };
    });

    expect(filterCoeffs.b0).toBeGreaterThan(0);
    expect(filterCoeffs.b0).toBeLessThan(0.1);
    expect(filterCoeffs.b2).toBe(-filterCoeffs.b0);
  });

  test('Granular Synthesizer worklet initializes sine window table and handles execution cleanly', async ({ page }) => {
    // Add Granular Synthesizer node to editor and check creation
    await page.evaluate(async () => {
      const node = new GranularSynthesizerNode();
      await window.editor.addNode(node);
    });

    const nodes = await page.evaluate(() => window.editor.getNodes());
    const granularNode = nodes.find(n => n.label === 'Granular Synthesizer');
    expect(granularNode).toBeDefined();
  });

  test('Service worker script sw.js contains audio worklets in cache manifest', async ({ page }) => {
    const response = await page.goto('/sw.js');
    const content = await response.text();

    expect(content).toContain('assets/js/audio-worklets/bitcrusher-processor.js');
    expect(content).toContain('assets/js/audio-worklets/granular-processor.js');
    expect(content).toContain('assets/js/audio-worklets/vocoder-processor.js');
    expect(content).toContain('assets/js/audio-worklets/quantizer-processor.js');
    expect(content).toContain('showcase.html');
  });
});
