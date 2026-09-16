const { test, expect } = require('@playwright/test');

test.describe('Chord Generator Glide & Pop-Free Transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
  });

  test('should add Chord Generator node and verify controls including Glide', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addChordGeneratorNodeBtn').click();

    const chordNode = page.locator('[data-node-label="Chord Generator"]').first();
    await expect(chordNode).toBeVisible();

    // Verify Glide control exists
    const glideSlider = chordNode.locator('input[type="range"]').nth(1); // octaveRange is 0, glide is 1, gain is 2
    await expect(glideSlider).toBeVisible();

    // Verify Root Note dropdown
    const rootNoteSelect = chordNode.locator('select').nth(1); // chordType is 0, rootNote is 1, waveform is 2
    await expect(rootNoteSelect).toBeVisible();
    await rootNoteSelect.selectOption('G4');
    await expect(rootNoteSelect).toHaveValue('G4');
  });

  test('should update root note smoothly using AudioParams without recreating oscillators when running', async ({ page }) => {
    // Add Chord Generator Node
    await page.locator('#addNodeToggle').click();
    await page.locator('#addChordGeneratorNodeBtn').click();

    // Start audio
    await page.locator('#playStopBtn').click();

    // Evaluate on page to test ChordGenerator audio node instance directly
    const result = await page.evaluate(async () => {
      // Find Chord Generator node in reteAudioNodes
      let chordAudioNode = null;
      for (const [id, audioNode] of window.reteAudioNodes.entries()) {
        if (audioNode && audioNode.constructor.name === 'ChordGenerator') {
          chordAudioNode = audioNode;
          break;
        }
      }

      if (!chordAudioNode) return { success: false, reason: 'ChordGenerator audio node not found' };

      // Ensure it is started
      if (!chordAudioNode.started) {
        chordAudioNode.start();
      }

      const initialOscillators = [...chordAudioNode.oscillators];
      const initialCount = initialOscillators.length;

      // Update root note
      chordAudioNode.updateParameter('rootNote', 'G4');

      // Check if the oscillator instances remained the exact same objects
      const postOscillators = [...chordAudioNode.oscillators];
      const instancesMatched = initialOscillators.length === postOscillators.length &&
        initialOscillators.every((osc, idx) => osc === postOscillators[idx]);

      return {
        success: true,
        instancesMatched,
        initialCount,
        postCount: postOscillators.length,
        currentRootNote: chordAudioNode.data.rootNote,
        glideValue: chordAudioNode.data.glide
      };
    });

    expect(result.success).toBe(true);
    expect(result.instancesMatched).toBe(true);
    expect(result.currentRootNote).toBe('G4');
    expect(result.glideValue).toBe(0.01);
  });

  test('should configure Glide parameter and crossfade on Chord Type change', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addChordGeneratorNodeBtn').click();
    await page.locator('#playStopBtn').click();

    const evalResult = await page.evaluate(async () => {
      let chordAudioNode = null;
      for (const [id, audioNode] of window.reteAudioNodes.entries()) {
        if (audioNode && audioNode.constructor.name === 'ChordGenerator') {
          chordAudioNode = audioNode;
          break;
        }
      }

      if (!chordAudioNode) return { success: false };

      // Set glide
      chordAudioNode.updateParameter('glide', 0.05);

      // Change chord type to Major 7th (4 notes instead of 3)
      chordAudioNode.updateParameter('chordType', 'Major 7th');

      await new Promise(resolve => setTimeout(resolve, 50));

      return {
        success: true,
        glide: chordAudioNode.data.glide,
        chordType: chordAudioNode.data.chordType,
        oscillatorCount: chordAudioNode.oscillators.length
      };
    });

    expect(evalResult.success).toBe(true);
    expect(evalResult.glide).toBe(0.05);
    expect(evalResult.chordType).toBe('Major 7th');
    expect(evalResult.oscillatorCount).toBe(4); // Major 7th has 4 notes
  });
});
