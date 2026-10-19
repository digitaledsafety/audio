const { test, expect } = require('@playwright/test');

test.describe('Enhanced Compressor Node', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
      await page.locator('#hero-overlay').waitFor({ state: 'detached' });
    }
  });

  test('should add Compressor node and verify controls including Knee, Makeup Gain, and Threshold CV', async ({ page }) => {
    // Open Add Node dropdown and click Compressor button
    await page.locator('#addNodeToggle').click();
    await page.locator('#addCompressorNodeBtn').click();

    // Verify node is added to editor
    const nodeLocator = page.locator('[data-node-label="Compressor"]').first();
    await expect(nodeLocator).toBeVisible();

    // Verify control labels exist
    await expect(nodeLocator.locator('label:has-text("Threshold (dB)")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Knee (dB)")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Ratio")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Attack (s)")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Release (s)")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Makeup Gain (dB)")')).toBeVisible();
  });

  test('should update Compressor parameters and route Threshold CV input correctly', async ({ page }) => {
    const nodeState = await page.evaluate(async () => {
      const CompClass = window.NodeRegistry.getConstructor('Compressor');
      const node = new CompClass();
      await window.editor.addNode(node);

      // Helper to wait for reteAudioNodes mapping
      async function getAudioNode(id) {
        for (let i = 0; i < 30; i++) {
          const n = window.reteAudioNodes.get(id);
          if (n) return n;
          await new Promise((res) => setTimeout(res, 50));
        }
        return window.reteAudioNodes.get(id);
      }

      // Start audio context if needed
      if (typeof window.startAudio === 'function') {
        await window.startAudio();
      }

      const audioNode = await getAudioNode(node.id);
      if (!audioNode) return null;

      const isAudioParamMatch = window.voltageConnectionStrategy.getAudioParam(audioNode, 'threshold_cv') === audioNode.threshold;

      return {
        hasCompressor: !!audioNode.compressor,
        hasMakeupGainNode: !!audioNode.makeupGainNode,
        threshold: audioNode.threshold.value,
        knee: audioNode.knee.value,
        ratio: audioNode.ratio.value,
        attack: audioNode.attack.value,
        release: audioNode.release.value,
        makeupGain: audioNode.makeupGainNode.gain.value,
        isAudioParamMatch
      };
    });

    expect(nodeState).not.toBeNull();
    expect(nodeState.hasCompressor).toBe(true);
    expect(nodeState.hasMakeupGainNode).toBe(true);
    expect(nodeState.threshold).toBe(-24);
    expect(nodeState.knee).toBe(30);
    expect(nodeState.ratio).toBe(12);
    expect(nodeState.makeupGain).toBe(1); // 0 dB = 1.0 linear
    expect(nodeState.isAudioParamMatch).toBe(true);
  });
});
