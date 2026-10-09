const { test, expect } = require('@playwright/test');

test.describe('Reverb Shared Convolver Pool & Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
      await page.locator('#hero-overlay').waitFor({ state: 'detached' });
    }
    await page.evaluate(async () => {
      if (typeof window.clearEditor === 'function') {
        await window.clearEditor();
      }
      if (window.sharedConvolverPool) {
        window.sharedConvolverPool.clear();
      }
      if (typeof window.startAudio === 'function') {
        await window.startAudio();
      }
    });
  });

  test('should create multiple Reverb nodes and utilize shared convolver pool', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const editor = window.editor;
      const ReverbNodeClass = window.NodeRegistry ? window.NodeRegistry.getConstructor('Reverb') : null;
      if (!ReverbNodeClass) return { error: 'ReverbNode class not found' };

      const reverb1 = new ReverbNodeClass();
      const reverb2 = new ReverbNodeClass();

      await editor.addNode(reverb1);
      await editor.addNode(reverb2);

      async function getAudioNode(id) {
        for (let i = 0; i < 30; i++) {
          const node = window.reteAudioNodes.get(id);
          if (node) return node;
          await new Promise((res) => setTimeout(res, 50));
        }
        return window.reteAudioNodes.get(id);
      }

      const audioNode1 = await getAudioNode(reverb1.id);
      const audioNode2 = await getAudioNode(reverb2.id);

      const poolMapSize = window.sharedConvolverPool.convolvers.size;
      const convolverKey = audioNode1 && audioNode1.convolverEntry ? audioNode1.convolverEntry.key : null;
      const refCount = audioNode1 && audioNode1.convolverEntry ? audioNode1.convolverEntry.refCount : 0;
      const isShared = audioNode1 && audioNode2 && audioNode1.convolverEntry && audioNode2.convolverEntry && audioNode1.convolverEntry.convolver === audioNode2.convolverEntry.convolver;

      return {
        hasAudioNode1: !!audioNode1,
        hasAudioNode2: !!audioNode2,
        poolMapSize,
        convolverKey,
        refCount,
        isShared,
        hasMixCvInput: !!reverb1.inputs.mix_cv,
      };
    });

    expect(result.error).toBeUndefined();
    expect(result.hasAudioNode1).toBe(true);
    expect(result.hasAudioNode2).toBe(true);
    expect(result.hasMixCvInput).toBe(true);
    expect(result.poolMapSize).toBe(1); // Both nodes with default duration=2, decay=2 share 1 convolver entry
    expect(result.refCount).toBe(2);
    expect(result.isShared).toBe(true);
  });

  test('should update duration and decay independently and manage pool references', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const editor = window.editor;
      const ReverbNodeClass = window.NodeRegistry.getConstructor('Reverb');

      const reverb1 = new ReverbNodeClass();
      const reverb2 = new ReverbNodeClass();

      await editor.addNode(reverb1);
      await editor.addNode(reverb2);

      async function getAudioNode(id) {
        for (let i = 0; i < 30; i++) {
          const node = window.reteAudioNodes.get(id);
          if (node) return node;
          await new Promise((res) => setTimeout(res, 50));
        }
        return window.reteAudioNodes.get(id);
      }

      const audioNode1 = await getAudioNode(reverb1.id);
      await getAudioNode(reverb2.id);

      // Change reverb1 duration to 4 seconds
      audioNode1.updateConvolver(4, 2);

      const poolSizeAfterUpdate = window.sharedConvolverPool.convolvers.size;

      // Remove reverb2
      await editor.removeNode(reverb2.id);
      await new Promise((res) => setTimeout(res, 200));

      const poolSizeAfterRemove = window.sharedConvolverPool.convolvers.size;

      return {
        poolSizeAfterUpdate,
        poolSizeAfterRemove,
      };
    });

    expect(result.poolSizeAfterUpdate).toBe(2); // One for (2,2) and one for (4,2)
    expect(result.poolSizeAfterRemove).toBe(1); // Reverb2 removed, its (2,2) entry was released
  });

  test('should connect CV modulation to mix_cv input socket', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const editor = window.editor;
      const ReverbNodeClass = window.NodeRegistry.getConstructor('Reverb');
      const LFONodeClass = window.NodeRegistry.getConstructor('LFO');

      const lfo = new LFONodeClass();
      const reverb = new ReverbNodeClass();

      await editor.addNode(lfo);
      await editor.addNode(reverb);

      async function getAudioNode(id) {
        for (let i = 0; i < 30; i++) {
          const node = window.reteAudioNodes.get(id);
          if (node) return node;
          await new Promise((res) => setTimeout(res, 50));
        }
        return window.reteAudioNodes.get(id);
      }

      await getAudioNode(lfo.id);
      const audioNode = await getAudioNode(reverb.id);

      // Connect LFO CV output to Reverb Mix CV input
      const conn = new window.Rete.ClassicPreset.Connection(lfo, 'cv', reverb, 'mix_cv');
      await editor.addConnection(conn);
      await new Promise((res) => setTimeout(res, 200));

      const isWetGainTargeted = !!audioNode.wetGain;

      return {
        connectionAdded: editor.getConnections().length > 0,
        isWetGainTargeted,
      };
    });

    expect(result.connectionAdded).toBe(true);
    expect(result.isWetGainTargeted).toBe(true);
  });
});
