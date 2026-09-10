const { test, expect } = require('@playwright/test');

test.describe('Bitcrusher CV Modulation Inputs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
    await page.waitForFunction(() => window.audioContext && window.audioContext.state === 'running');
  });

  test('should have bits_cv and sr_cv inputs and route to worklet AudioParams', async ({ page }) => {
    const checkState = await page.evaluate(async () => {
      if (typeof window.clearEditor === 'function') {
        await window.clearEditor();
      }
      const editor = window.editor;
      const NodeRegistry = window.NodeRegistry;
      const Classic = window.Rete.ClassicPreset;

      const BitcrusherClass = NodeRegistry.getConstructor('Bitcrusher');
      const LfoClass = NodeRegistry.getConstructor('LFO');

      const bcNode = new BitcrusherClass();
      const lfo1Node = new LfoClass();
      const lfo2Node = new LfoClass();

      await editor.addNode(bcNode);
      await editor.addNode(lfo1Node);
      await editor.addNode(lfo2Node);

      const bcAudio = window.reteAudioNodes.get(bcNode.id);

      const hasBitsCvInput = Boolean(bcNode.inputs['bits_cv']);
      const hasSrCvInput = Boolean(bcNode.inputs['sr_cv']);

      const bitsParam = bcAudio.parameters ? bcAudio.parameters.get('bits') : null;
      const srParam = bcAudio.parameters ? bcAudio.parameters.get('sampleRateReduction') : null;

      // Connect LFO 1 CV out to Bitcrusher bits_cv
      await editor.addConnection(new Classic.Connection(lfo1Node, 'cv', bcNode, 'bits_cv'));

      // Connect LFO 2 CV out to Bitcrusher sr_cv
      await editor.addConnection(new Classic.Connection(lfo2Node, 'cv', bcNode, 'sr_cv'));

      return {
        hasBitsCvInput,
        hasSrCvInput,
        hasBitsParam: Boolean(bitsParam),
        hasSrParam: Boolean(srParam)
      };
    });

    expect(checkState.hasBitsCvInput).toBe(true);
    expect(checkState.hasSrCvInput).toBe(true);
    expect(checkState.hasBitsParam).toBe(true);
    expect(checkState.hasSrParam).toBe(true);
  });
});
