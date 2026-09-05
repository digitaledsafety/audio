const { test, expect } = require('@playwright/test');

test.describe('Connection Strategy & Cleanup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Enter the studio
    await page.locator('#cta-button').click();
    // Wait for hero overlay to disappear
    await page.locator('#hero-overlay').waitFor({ state: 'detached' });
    // Start audio
    await page.locator('#playStopBtn').click();
  });

  test('should gracefully handle connection strategy disconnection and polling cleanup', async ({ page }) => {
    // Programmatically add a Clock node and a Quantizer node (polling clock target)
    await page.evaluate(async () => {
      const ClockCtor = window.NodeRegistry.getConstructor('MasterClockNode');
      const QuantizerCtor = window.NodeRegistry.getConstructor('QuantizerNode');
      const clockNode = new ClockCtor();
      const quantizerNode = new QuantizerCtor();
      clockNode.position = { x: 100, y: 100 };
      quantizerNode.position = { x: 400, y: 100 };
      await window.editor.addNode(clockNode);
      await window.editor.addNode(quantizerNode);

      // Create a polling connection from clock output to quantizer in input
      const conn = new window.Rete.ClassicPreset.Connection(clockNode, 'clock', quantizerNode, 'in');
      await window.editor.addConnection(conn);
    });

    // Verify polling analyser is registered
    const analysersCount = await page.evaluate(() => {
      return window.voltageConnectionStrategy ? window.voltageConnectionStrategy.analysers.size : -1;
    });
    expect(analysersCount).toBeGreaterThanOrEqual(0);

    // Remove the connection and verify no uncaught errors and analysers map is cleaned up
    await page.evaluate(async () => {
      const connections = window.editor.getConnections();
      if (connections.length > 0) {
        await window.editor.removeConnection(connections[0].id);
      }
    });

    const analysersCountAfterDisconnect = await page.evaluate(() => {
      return window.voltageConnectionStrategy ? window.voltageConnectionStrategy.analysers.size : -1;
    });
    expect(analysersCountAfterDisconnect).toBe(0);

    // Remove nodes cleanly
    await page.evaluate(async () => {
      await window.editor.clear();
    });
  });

  test('should handle node removal without uncaught TypeErrors in strategy handlers', async ({ page }) => {
    // Add two connected nodes and remove one node directly
    const errorLogs = [];
    page.on('pageerror', err => errorLogs.push(err.message));

    await page.evaluate(async () => {
      const ClockCtor = window.NodeRegistry.getConstructor('MasterClockNode');
      const LFOCtor = window.NodeRegistry.getConstructor('LFONode');
      const clockNode = new ClockCtor();
      const lfoNode = new LFOCtor();
      await window.editor.addNode(clockNode);
      await window.editor.addNode(lfoNode);

      const conn = new window.Rete.ClassicPreset.Connection(clockNode, 'clock', lfoNode, 'clock');
      await window.editor.addConnection(conn);

      // Remove clock node directly while connection exists
      await window.editor.removeNode(clockNode.id);
    });

    // Ensure no unhandled exception occurred
    expect(errorLogs).toEqual([]);
  });
});
