const { test, expect } = require('@playwright/test');

test.describe('Enhanced Compressor Node', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('#cta-button');
  });

  test('should add Compressor node and verify controls including Knee, Makeup Gain, and Threshold CV', async ({ page }) => {
    // Open Add Node dropdown and click Compressor button
    await page.click('#addNodeToggle');
    await page.click('#addCompressorNodeBtn');

    // Verify node is added to editor
    const nodeLocator = page.locator('.node[data-node-label="Compressor"]');
    await expect(nodeLocator).toBeVisible();

    // Verify inputs (Audio In, Threshold CV) and output (Audio Out) sockets
    const audioInSocket = nodeLocator.locator('.socket.input[data-socket-key="audio"]');
    const thresholdCvSocket = nodeLocator.locator('.socket.input[data-socket-key="threshold_cv"]');
    const audioOutSocket = nodeLocator.locator('.socket.output[data-socket-key="audio"]');

    await expect(audioInSocket).toBeVisible();
    await expect(thresholdCvSocket).toBeVisible();
    await expect(audioOutSocket).toBeVisible();

    // Verify control sliders exist
    await expect(nodeLocator.locator('label:has-text("Threshold (dB)")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Knee (dB)")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Ratio")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Attack (s)")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Release (s)")')).toBeVisible();
    await expect(nodeLocator.locator('label:has-text("Makeup Gain (dB)")')).toBeVisible();
  });

  test('should update Compressor parameters and route Threshold CV input correctly', async ({ page }) => {
    await page.evaluate(() => {
      const node = new window.NodeRegistry.getConstructor('Compressor')();
      window.editor.addNode(node);
    });

    // Start audio context
    await page.click('#playStopBtn');

    // Verify audio node and parameters
    const nodeState = await page.evaluate(() => {
      const reteNode = window.editor.getNodes().find(n => n.label === 'Compressor');
      if (!reteNode) return null;
      const audioNode = window.reteAudioNodes.get(reteNode.id);
      if (!audioNode) return null;

      return {
        hasCompressor: !!audioNode.compressor,
        hasMakeupGainNode: !!audioNode.makeupGainNode,
        threshold: audioNode.threshold.value,
        knee: audioNode.knee.value,
        ratio: audioNode.ratio.value,
        attack: audioNode.attack.value,
        release: audioNode.release.value,
        makeupGain: audioNode.makeupGainNode.gain.value
      };
    });

    expect(nodeState).not.toBeNull();
    expect(nodeState.hasCompressor).toBe(true);
    expect(nodeState.hasMakeupGainNode).toBe(true);
    expect(nodeState.threshold).toBe(-24);
    expect(nodeState.knee).toBe(30);
    expect(nodeState.ratio).toBe(12);
    expect(nodeState.makeupGain).toBe(1); // 0 dB = 1.0 linear

    // Verify Threshold CV audioParam mapping
    const audioParam = await page.evaluate(() => {
      const reteNode = window.editor.getNodes().find(n => n.label === 'Compressor');
      const audioNode = window.reteAudioNodes.get(reteNode.id);
      return window.voltageConnectionStrategy.getAudioParam(audioNode, 'threshold_cv') === audioNode.threshold;
    });

    expect(audioParam).toBe(true);
  });
});
