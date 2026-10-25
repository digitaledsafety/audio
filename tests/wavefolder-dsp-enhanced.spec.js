const { test, expect } = require('@playwright/test');

test.describe('Wavefolder & DSP Concepts Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
      await page.locator('#hero-overlay').waitFor({ state: 'detached' });
    }
  });

  test('should add Wavefolder node and verify UI controls', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addWavefolderNodeBtn').click();

    const nodeLocator = page.locator('[data-node-label="Wavefolder"]').first();
    await expect(nodeLocator).toBeVisible();

    await expect(nodeLocator.locator('label:has-text("Folds")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Drive")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Mix")')).toBeVisible();
  });

  test('should instantiate Wavefolder audio class with 4x oversampling and CV routing', async ({ page }) => {
    const wavefolderState = await page.evaluate(async () => {
      const WavefolderClass = window.NodeRegistry.getConstructor('Wavefolder');
      const node = new WavefolderClass();
      await window.editor.addNode(node);

      async function getAudioNode(id) {
        for (let i = 0; i < 30; i++) {
          const n = window.reteAudioNodes.get(id);
          if (n) return n;
          await new Promise((res) => setTimeout(res, 50));
        }
        return window.reteAudioNodes.get(id);
      }

      if (typeof window.startAudio === 'function') {
        await window.startAudio();
      }

      const audioNode = await getAudioNode(node.id);
      if (!audioNode) return null;

      const oversample = audioNode.waveShaperNode ? audioNode.waveShaperNode.oversample : null;
      const foldCvParam = window.voltageConnectionStrategy.getAudioParam(audioNode, 'fold_cv');

      return {
        hasWaveShaper: !!audioNode.waveShaperNode,
        oversample,
        driveValue: audioNode.driveGain.gain.value,
        hasFoldCvMatch: foldCvParam === audioNode.driveGain.gain
      };
    });

    expect(wavefolderState).not.toBeNull();
    expect(wavefolderState.hasWaveShaper).toBe(true);
    expect(wavefolderState.oversample).toBe('4x');
    expect(wavefolderState.driveValue).toBe(1.0);
    expect(wavefolderState.hasFoldCvMatch).toBe(true);
  });

  test('should generate bandlimited PeriodicWave tables for VCO oscillators', async ({ page }) => {
    const bandlimitedState = await page.evaluate(async () => {
      if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const sawWave = window.getPeriodicWaveForType(window.audioContext, 'sawtooth');
      const sqWave = window.getPeriodicWaveForType(window.audioContext, 'square');
      const triWave = window.getPeriodicWaveForType(window.audioContext, 'triangle');

      return {
        hasSawWave: sawWave instanceof PeriodicWave,
        hasSqWave: sqWave instanceof PeriodicWave,
        hasTriWave: triWave instanceof PeriodicWave
      };
    });

    expect(bandlimitedState.hasSawWave).toBe(true);
    expect(bandlimitedState.hasSqWave).toBe(true);
    expect(bandlimitedState.hasTriWave).toBe(true);
  });

  test('should configure VCF multi-stage 24dB and 12dB filter topologies with saturation', async ({ page }) => {
    const vcfState = await page.evaluate(async () => {
      const VCFClass = window.NodeRegistry.getConstructor('VCF');
      const node = new VCFClass();
      await window.editor.addNode(node);

      async function getAudioNode(id) {
        for (let i = 0; i < 30; i++) {
          const n = window.reteAudioNodes.get(id);
          if (n) return n;
          await new Promise((res) => setTimeout(res, 50));
        }
        return window.reteAudioNodes.get(id);
      }

      if (typeof window.startAudio === 'function') {
        await window.startAudio();
      }

      const audioNode = await getAudioNode(node.id);
      if (!audioNode) return null;

      const initialSlope = audioNode.slope;
      audioNode.updateParameter('slope', '12dB');
      const updatedSlope = audioNode.slope;

      return {
        hasFilter1: !!audioNode.filter1,
        hasFilter2: !!audioNode.filter2,
        hasSaturator: !!audioNode.saturator,
        saturatorOversample: audioNode.saturator.oversample,
        initialSlope,
        updatedSlope
      };
    });

    expect(vcfState).not.toBeNull();
    expect(vcfState.hasFilter1).toBe(true);
    expect(vcfState.hasFilter2).toBe(true);
    expect(vcfState.hasSaturator).toBe(true);
    expect(vcfState.saturatorOversample).toBe('4x');
    expect(vcfState.initialSlope).toBe('24dB');
    expect(vcfState.updatedSlope).toBe('12dB');
  });
});
