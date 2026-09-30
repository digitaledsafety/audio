import { test, expect } from '@playwright/test';

test.describe('Resilience and Safety Guards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
    await expect(page.locator('#hero-overlay')).not.toBeVisible();
  });

  test('editorToJSON should handle missing views and orphaned connections without throwing', async ({ page }) => {
    const jsonResult = await page.evaluate(async () => {
      if (window.clearEditor) await window.clearEditor();

      const ToneConstructor = window.NodeRegistry.getConstructor('VCO');
      const OutputConstructor = window.NodeRegistry.getConstructor('Output');

      const node1 = new ToneConstructor();
      const node2 = new OutputConstructor();
      await window.editor.addNode(node1);
      await window.editor.addNode(node2);

      // Create a valid connection
      const conn = new window.Rete.ClassicPreset.Connection(node1, 'audio', node2, 'audio');
      await window.editor.addConnection(conn);

      // Inject an orphaned connection into getConnections array / map
      const orphanedConn = {
        id: 'orphaned-1',
        source: 'non-existent-source',
        sourceOutput: 'audio',
        target: 'non-existent-target',
        targetInput: 'audio'
      };

      // In Rete v2 NodeEditor, override getConnections temporarily to include orphanedConn
      const realGetConnections = window.editor.getConnections.bind(window.editor);
      window.editor.getConnections = () => [...realGetConnections(), orphanedConn];

      // Temporarily remove node2 view from area.nodeViews to test position fallback
      const originalView = window.area.nodeViews.get(node2.id);
      window.area.nodeViews.delete(node2.id);

      let exported;
      try {
        exported = window.editorToJSON();
      } finally {
        if (originalView) window.area.nodeViews.set(node2.id, originalView);
        window.editor.getConnections = realGetConnections;
      }

      return exported;
    });

    expect(jsonResult).toBeDefined();
    expect(jsonResult.nodes.length).toBe(2);
    // Position fallback for node with missing view
    expect(jsonResult.nodes[1].position).toEqual({ x: 0, y: 0 });
    // Orphaned connection (with missing source/target nodes) skipped during serialization
    expect(jsonResult.connections.length).toBe(1);
  });

  test('nodedragged and nodetranslated pipe events should handle null or missing node safely', async ({ page }) => {
    const result = await page.evaluate(async () => {
      try {
        // Emit events with non-existent node id directly to area pipe
        await window.area.emit({
          type: 'nodetranslated',
          data: { id: 'non-existent-node-id', position: { x: 100, y: 100 } }
        });

        await window.area.emit({
          type: 'nodedragged',
          data: { id: 'non-existent-node-id' }
        });

        return { success: true };
      } catch (e) {
        return { success: false, error: e.stack || e.message };
      }
    });

    if (!result.success) console.log('Pipe event error details:', result.error);
    expect(result.success).toBe(true);
  });

  test('connections-updated event syncs multiplayer UI state when disconnected', async ({ page }) => {
    await page.click('#settingsToggle');

    const buttonsState = await page.evaluate(() => {
      if (window.multiplayer) {
        window.multiplayer.emit('connections-updated', []);
      }
      const createBtn = document.getElementById('createSessionBtn');
      const disconnectBtn = document.getElementById('disconnectBtn');
      return {
        createHidden: createBtn.classList.contains('hidden'),
        disconnectHidden: disconnectBtn.classList.contains('hidden')
      };
    });

    expect(buttonsState.createHidden).toBe(false);
    expect(buttonsState.disconnectHidden).toBe(true);
  });
});
