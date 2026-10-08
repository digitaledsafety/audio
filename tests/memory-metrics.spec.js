const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.use({
  launchOptions: {
    args: ['--enable-precise-memory-info']
  }
});

test.describe('Memory Metrics and Optimization', () => {
  test('benchmark hyper-shift workspace memory usage', async ({ page }) => {
    test.setTimeout(60000);

    // Read hyper-shift base64 workspace_data
    const mdPath = path.join(__dirname, '../_workspaces/hyper-shift.md');
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const match = mdContent.match(/workspace_data:\s*([A-Za-z0-9+/=]+)/);
    const base64Data = match[1];
    const jsonStr = Buffer.from(base64Data, 'base64').toString('utf8');

    await page.goto('/');
    await page.waitForSelector('#cta-button');
    await page.locator('#cta-button').click();

    // Wait for initial workspace nodes
    await page.waitForFunction(() => window.editor && typeof window.editorFromJSON === 'function' && window.editor.getNodes().length > 0);

    // Load hyper-shift workspace
    await page.evaluate(async (json) => {
      const parsed = JSON.parse(json);
      await window.editorFromJSON(parsed);
    }, jsonStr);

    await page.waitForFunction(() => window.editor && window.editor.getNodes().length === 28, { timeout: 30000 });

    const nodeCount = await page.evaluate(() => window.editor.getNodes().length);
    expect(nodeCount).toBe(28);

    // Start Playback
    await page.locator('#playStopBtn').click();
    await page.waitForTimeout(1000);

    // Initial memory check
    const initialMem = await page.evaluate(() => {
      return {
        usedHeapMB: (performance.memory ? performance.memory.usedJSHeapSize : 0) / (1024 * 1024),
        totalHeapMB: (performance.memory ? performance.memory.totalJSHeapSize : 0) / (1024 * 1024),
        audioNodesCount: window.reteAudioNodes ? window.reteAudioNodes.size : 0
      };
    });
    console.log('Initial Memory:', initialMem);

    // Play for 10 seconds
    await page.waitForTimeout(10000);

    // Check memory after 10 seconds
    const finalMem = await page.evaluate(() => {
      return {
        usedHeapMB: (performance.memory ? performance.memory.usedJSHeapSize : 0) / (1024 * 1024),
        totalHeapMB: (performance.memory ? performance.memory.totalJSHeapSize : 0) / (1024 * 1024),
        audioNodesCount: window.reteAudioNodes ? window.reteAudioNodes.size : 0
      };
    });
    console.log('Memory after 10s playback:', finalMem);

    // Memory threshold check: Used heap should be well under 100MB-200MB limit (< 100MB)
    expect(finalMem.usedHeapMB).toBeLessThan(100);
  });

  test('scale up to 100+ nodes cleanly without memory overload', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/');
    await page.waitForSelector('#cta-button');
    await page.locator('#cta-button').click();

    await page.waitForFunction(() => window.editor && typeof window.editorFromJSON === 'function' && window.editor.getNodes().length > 0);

    // Create a 100-node workspace JSON structure
    const types = [
      'ToneGeneratorNode',
      'FilterNode',
      'LFONode',
      'DrumMachineNode',
      'ReverbNode',
      'MixerNode',
      'VCANode',
      'SequencerNode'
    ];

    const nodes = [];
    const connections = [];

    for (let i = 1; i <= 100; i++) {
      const type = types[(i - 1) % types.length];
      nodes.push({
        id: `node-${i}`,
        type: type,
        label: type,
        data: {},
        position: { x: ((i - 1) % 10) * 220, y: Math.floor((i - 1) / 10) * 180 }
      });
    }

    const workspaceJSON = JSON.stringify({
      workspaceFormatVersion: '2.0',
      nodes,
      connections
    });

    await page.evaluate(async (jsonStr) => {
      await window.editorFromJSON(JSON.parse(jsonStr));
    }, workspaceJSON);

    await page.waitForFunction(() => window.editor && window.editor.getNodes().length === 100, { timeout: 30000 });

    const createdCount = await page.evaluate(() => window.editor.getNodes().length);
    expect(createdCount).toBe(100);

    // Start playback with 100 nodes
    await page.locator('#playStopBtn').click();
    await page.waitForTimeout(3000);

    const heapInfo = await page.evaluate(() => {
      return {
        usedHeapMB: (performance.memory ? performance.memory.usedJSHeapSize : 0) / (1024 * 1024),
        audioNodesCount: window.reteAudioNodes ? window.reteAudioNodes.size : 0
      };
    });
    console.log('100 nodes memory:', heapInfo);

    // Heap usage should remain well below 200MB ceiling
    expect(heapInfo.usedHeapMB).toBeLessThan(200);

    // Stop audio & clear editor
    await page.evaluate(async () => {
      await window.clearEditor();
    });

    const clearedCount = await page.evaluate(() => window.editor.getNodes().length);
    expect(clearedCount).toBe(0);
  });
});
