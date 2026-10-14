const { test, expect } = require('@playwright/test');

test.describe('LFO Node BPM Slider', () => {
  test('allows changing BPM via slider when in BPM mode', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }

    // Add an LFO node
    await page.click('#addNodeToggle');
    await page.click('#addLFONodeBtn');

    const lfoNode = page.locator('[data-node-label="LFO"]').first();
    await expect(lfoNode).toBeVisible();

    // Select Rate Mode -> BPM
    const rateModeSelect = lfoNode.locator('select').first();
    await rateModeSelect.selectOption('BPM');

    // Get the BPM slider
    const bpmSlider = lfoNode.locator('input[type="range"]').first();
    await expect(bpmSlider).toBeVisible();

    // Set BPM slider value to 180
    await bpmSlider.fill('180');
    await bpmSlider.dispatchEvent('input');
    await bpmSlider.dispatchEvent('change');

    // Verify frequency on the live audio generator updated according to (180 / 60) * 1 = 3 Hz
    const effectiveFreq = await page.evaluate(() => {
      for (const [id, audioNode] of window.reteAudioNodes.entries()) {
        if (audioNode.computeEffectiveFrequency) {
          return audioNode.computeEffectiveFrequency();
        }
      }
      return null;
    });

    expect(effectiveFreq).toBe(3);
  });
});
