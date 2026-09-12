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

      let gateAudio, vcaAudio;
      for (let i = 0; i < 200; i++) {
        gateAudio = window.reteAudioNodes.get(gateNode.id);
        vcaAudio = window.reteAudioNodes.get(vcaNode.id);
        if (gateAudio && vcaAudio) break;
        await new Promise(r => setTimeout(r, 10));
      }

      return {
        gateId: gateNode.id,
        vcaId: vcaNode.id,
        initialVcaGateHigh: vcaAudio ? vcaAudio.gateHigh : undefined,
        gateValue: gateAudio ? gateAudio.data.value : undefined
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

      let vcaAudio;
      for (let i = 0; i < 200; i++) {
        vcaAudio = window.reteAudioNodes.get(vcaId) || window.reteAudioNodes.get(String(vcaId));
        if (vcaAudio) break;
        await new Promise(r => setTimeout(r, 10));
      }
      return {
        vcaGateHighAfterConnect: vcaAudio ? vcaAudio.gateHigh : undefined
      };
    }, { gateId: nodeState.gateId, vcaId: nodeState.vcaId });

    // Since Gate node starts Low (false), connecting it should immediately mute VCA (gateHigh = false)
    expect(connectedState.vcaGateHighAfterConnect).toBe(false);

    // Toggle Manual Gate to High
    const highState = await page.evaluate(async ({ gateId, vcaId }) => {
      let gateAudio, vcaAudio;
      for (let i = 0; i < 200; i++) {
        gateAudio = window.reteAudioNodes.get(gateId) || window.reteAudioNodes.get(String(gateId));
        vcaAudio = window.reteAudioNodes.get(vcaId) || window.reteAudioNodes.get(String(vcaId));
        if (gateAudio && vcaAudio) break;
        await new Promise(r => setTimeout(r, 10));
      }
      if (gateAudio) gateAudio.updateParameter('value', true);

      return {
        vcaGateHighWhenGateHigh: vcaAudio ? vcaAudio.gateHigh : undefined
      };
    }, { gateId: nodeState.gateId, vcaId: nodeState.vcaId });

    expect(highState.vcaGateHighWhenGateHigh).toBe(true);

    // Toggle Manual Gate back to Low
    await page.evaluate(async ({ gateId }) => {
      let gateAudio;
      for (let i = 0; i < 200; i++) {
        gateAudio = window.reteAudioNodes.get(gateId) || window.reteAudioNodes.get(String(gateId));
        if (gateAudio) break;
        await new Promise(r => setTimeout(r, 10));
      }
      if (gateAudio) gateAudio.updateParameter('value', false);
    }, { gateId: nodeState.gateId });

    const lowState = await page.evaluate(async ({ vcaId }) => {
      let vcaAudio;
      for (let i = 0; i < 200; i++) {
        vcaAudio = window.reteAudioNodes.get(vcaId) || window.reteAudioNodes.get(String(vcaId));
        if (vcaAudio) break;
        await new Promise(r => setTimeout(r, 10));
      }
      return vcaAudio ? vcaAudio.gateHigh : undefined;
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

      let vcaAudio;
      for (let i = 0; i < 200; i++) {
        vcaAudio = window.reteAudioNodes.get(vcaId) || window.reteAudioNodes.get(String(vcaId));
        if (vcaAudio) break;
        await new Promise(r => setTimeout(r, 10));
      }
      return {
        vcaGateHighAfterDisconnect: vcaAudio ? vcaAudio.gateHigh : undefined
      };
    }, { gateId: nodeState.gateId, vcaId: nodeState.vcaId });

    // Disconnecting must restore VCA gate to default High (true)
    expect(disconnectedState.vcaGateHighAfterDisconnect).toBe(true);
  });
});
