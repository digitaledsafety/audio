const { test, expect } = require('@playwright/test');

test.describe('VCA Gate Input Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
    await page.waitForFunction(() => window.editor && window.editor.getNodes().length > 0);
    await page.waitForFunction(() => window.audioContext && window.audioContext.state === 'running');
  });

  test('should synchronize VCA gate state when connected, toggled, and disconnected', async ({ page }) => {
    const results = await page.evaluate(async () => {
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
      for (let i = 0; i < 20; i++) {
        gateAudio = window.reteAudioNodes.get(gateNode.id);
        vcaAudio = window.reteAudioNodes.get(vcaNode.id);
        if (gateAudio && vcaAudio) break;
        await new Promise(r => setTimeout(r, 50));
      }

      const initialVcaGateHigh = vcaAudio ? vcaAudio.gateHigh : null;
      const gateValue = gateAudio ? gateAudio.data.value : null;

      // Connect Manual Gate 'out' to VCA 'gate' input
      await editor.addConnection(new window.Rete.ClassicPreset.Connection(gateNode, 'out', vcaNode, 'gate'));
      const vcaGateHighAfterConnect = vcaAudio ? vcaAudio.gateHigh : null;

      // Toggle Manual Gate to High
      if (gateAudio && gateAudio.updateParameter) {
        gateAudio.updateParameter('value', true);
      }
      const vcaGateHighWhenGateHigh = vcaAudio ? vcaAudio.gateHigh : null;

      // Toggle Manual Gate back to Low
      if (gateAudio && gateAudio.updateParameter) {
        gateAudio.updateParameter('value', false);
      }
      const vcaGateHighWhenGateLow = vcaAudio ? vcaAudio.gateHigh : null;

      // Disconnect Gate from VCA
      const connections = editor.getConnections();
      for (const conn of connections) {
        if (conn.source === gateNode.id && conn.target === vcaNode.id) {
          await editor.removeConnection(conn.id);
        }
      }
      const vcaGateHighAfterDisconnect = vcaAudio ? vcaAudio.gateHigh : null;

      return {
        initialVcaGateHigh,
        gateValue,
        vcaGateHighAfterConnect,
        vcaGateHighWhenGateHigh,
        vcaGateHighWhenGateLow,
        vcaGateHighAfterDisconnect
      };
    });

    expect(results.initialVcaGateHigh).toBe(true);
    expect(results.gateValue).toBe(false);
    expect(results.vcaGateHighAfterConnect).toBe(false);
    expect(results.vcaGateHighWhenGateHigh).toBe(true);
    expect(results.vcaGateHighWhenGateLow).toBe(false);
    expect(results.vcaGateHighAfterDisconnect).toBe(true);
  });
});
