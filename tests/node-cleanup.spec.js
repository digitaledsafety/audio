const { test, expect } = require('@playwright/test');

test.describe('Node Removal and Stop Audio Cleanup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
  });

  test('should cleanly stop audio nodes on individual removal', async ({ page }) => {
    // Start audio
    await page.click('#playStopBtn');

    // Get initial node count
    const initialCount = await page.evaluate(() => window.editor.getNodes().length);

    // Add a VCO node
    await page.click('#addNodeToggle');
    await page.click('#addToneGeneratorNodeBtn');

    // Add a Noise Source node
    await page.click('#addNodeToggle');
    await page.click('#addNoiseGeneratorNodeBtn');

    // Add an Arpeggiator node
    await page.click('#addNodeToggle');
    await page.click('#addArpeggiatorNodeBtn');

    // Verify nodes are added to window.editor
    const nodeCountBefore = await page.evaluate(() => window.editor.getNodes().length);
    expect(nodeCountBefore).toBe(initialCount + 3);

    // Get ID of first added node and remove it
    const removedNodeId = await page.evaluate(async () => {
      const nodes = window.editor.getNodes();
      const nodeToRemove = nodes[nodes.length - 1];
      await window.editor.removeNode(nodeToRemove.id);
      return nodeToRemove.id;
    });

    // Verify editor has initialCount + 2 nodes left and removed node is no longer in reteAudioNodes
    const nodeCountAfter = await page.evaluate(() => window.editor.getNodes().length);
    expect(nodeCountAfter).toBe(initialCount + 2);

    const isNodeInAudioMap = await page.evaluate((id) => window.reteAudioNodes.has(id), removedNodeId);
    expect(isNodeInAudioMap).toBe(false);
  });

  test('should stop all audio nodes on stopAudio / clearEditor call', async ({ page }) => {
    // Start audio
    await page.click('#playStopBtn');

    // Add VCO, Noise Source, and Clock nodes
    await page.click('#addNodeToggle');
    await page.click('#addToneGeneratorNodeBtn');

    await page.click('#addNodeToggle');
    await page.click('#addNoiseGeneratorNodeBtn');

    await page.click('#addNodeToggle');
    await page.click('#addMasterClockNodeBtn');

    // Ensure audio nodes map has entries
    const audioMapSizeBefore = await page.evaluate(() => window.reteAudioNodes.size);
    expect(audioMapSizeBefore).toBeGreaterThan(0);

    // Call stopAudio
    await page.evaluate(async () => {
      await window.stopAudio();
    });

    // Verify reteAudioNodes is cleared
    const audioMapSizeAfter = await page.evaluate(() => window.reteAudioNodes.size);
    expect(audioMapSizeAfter).toBe(0);
  });
});
