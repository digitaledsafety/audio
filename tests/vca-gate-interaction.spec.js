const { test, expect } = require('@playwright/test');

test.describe('VCA Gate Input Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
    await page.waitForFunction(() => window.audioContext && window.audioContext.state === 'running');
  });

  test('should synchronize VCA gate state when connected, toggled, and disconnected', async ({ page }) => {
    // Programmatically clear editor and create Gate and VCA nodes
    const nodeState = await page.evaluate(async () => {
      if (typeof window.clearEditor === 'function') {
        await window.clearEditor();
      }
      const editor = window.editor;
      const NodeRegistry = window.NodeRegistry;

      const GateClass = NodeRegistry.getConstructor('Gate');
      const VCAClass = NodeRegistry.getConstructor('VCA');

      const gateNode = new GateClass();
      const vcaNode = new VCAClass();

      await editor.addNode(gateNode);
      await editor.addNode(vcaNode);

      const gateAudio = window.reteAudioNodes.get(gateNode.id);
      const vcaAudio = window.reteAudioNodes.get(vcaNode.id);

      return {
        gateId: gateNode.id,
        vcaId: vcaNode.id,
        initialVcaGateHigh: vcaAudio.gateHigh,
        gateValue: gateAudio.data.value
      };
    });

    expect(nodeState.initialVcaGateHigh).toBe(true);
    expect(nodeState.gateValue).toBe(false);

    // Connect Manual Gate 'out' to VCA 'gate' input
    const connectedState = await page.evaluate(async ({ gateId, vcaId }) => {
      const editor = window.editor;

      await editor.addConnection({
        source: gateId,
        sourceOutput: 'out',
        target: vcaId,
        targetInput: 'gate'
      });

      const vcaAudio = window.reteAudioNodes.get(vcaId);
      return {
        vcaGateHighAfterConnect: vcaAudio ? vcaAudio.gateHigh : null
      };
    }, { gateId: nodeState.gateId, vcaId: nodeState.vcaId });

    // Since Gate node starts Low (false), connecting it should immediately mute VCA (gateHigh = false)
    expect(connectedState.vcaGateHighAfterConnect).toBe(false);

    // Toggle Manual Gate to High
    const highState = await page.evaluate(async ({ gateId, vcaId }) => {
      const gateAudio = window.reteAudioNodes.get(gateId);
      gateAudio.updateParameter('value', true);

      const vcaAudio = window.reteAudioNodes.get(vcaId);
      return {
        vcaGateHighWhenGateHigh: vcaAudio ? vcaAudio.gateHigh : null
      };
    }, { gateId: nodeState.gateId, vcaId: nodeState.vcaId });

    expect(highState.vcaGateHighWhenGateHigh).toBe(true);

    // Toggle Manual Gate back to Low
    await page.evaluate(({ gateId }) => {
      const gateAudio = window.reteAudioNodes.get(gateId);
      gateAudio.updateParameter('value', false);
    }, { gateId: nodeState.gateId });

    const lowState = await page.evaluate(({ vcaId }) => {
      const vcaAudio = window.reteAudioNodes.get(vcaId);
      return vcaAudio ? vcaAudio.gateHigh : null;
    }, { vcaId: nodeState.vcaId });

    expect(lowState).toBe(false);

    // Disconnect Gate from VCA
    const disconnectedState = await page.evaluate(async ({ gateId, vcaId }) => {
      const editor = window.editor;
      const connections = editor.getConnections();
      for (const conn of connections) {
        if (conn.source === gateId && conn.target === vcaId) {
          await editor.removeConnection(conn.id);
        }
      }

      const vcaAudio = window.reteAudioNodes.get(vcaId);
      return {
        vcaGateHighAfterDisconnect: vcaAudio ? vcaAudio.gateHigh : null
      };
    }, { gateId: nodeState.gateId, vcaId: nodeState.vcaId });

    // Disconnecting must restore VCA gate to default High (true)
    expect(disconnectedState.vcaGateHighAfterDisconnect).toBe(true);
  });
});
