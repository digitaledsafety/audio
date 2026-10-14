const { test, expect } = require('@playwright/test');

test.describe('Audio Nodes Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
  });

  test('should add and configure Filter node', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addFilterNodeBtn').click();

    const filterNode = page.locator('[data-node-label="VCF"]').first();
    await expect(filterNode).toBeVisible();

    const typeSelect = filterNode.locator('select');
    await expect(typeSelect).toBeVisible();
    await typeSelect.selectOption('highpass');
    await expect(typeSelect).toHaveValue('highpass');
  });

  test('should add and configure ADSR Envelope node', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addADSREnvelopeNodeBtn').click();

    const adsrNode = page.locator('[data-node-label="EG"]').first();
    await expect(adsrNode).toBeVisible();

    const modeSelect = adsrNode.locator('select');
    await expect(modeSelect).toBeVisible();
    await modeSelect.selectOption('LFO');
    await expect(modeSelect).toHaveValue('LFO');
  });

  test('should add Visualizer node', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addVisualizerNodeBtn').click();

    const visualizerNode = page.locator('[data-node-label="Visualizer"]').first();
    await expect(visualizerNode).toBeVisible();

    // Check if canvas is present
    const canvas = visualizerNode.locator('canvas');
    await expect(canvas).toBeAttached();
  });

  test('should support ADSR Attack and Decay ranges up to 10s across ADSR nodes', async ({ page }) => {
    await page.evaluate(() => {
      const { editor } = window;

      const EGClass = window.NodeRegistry.getConstructor('EG');
      const egNode = new EGClass();
      editor.addNode(egNode);
      if (egNode.controls.attack.max !== 10) throw new Error(`EG attack max expected 10, got ${egNode.controls.attack.max}`);
      if (egNode.controls.decay.max !== 10) throw new Error(`EG decay max expected 10, got ${egNode.controls.decay.max}`);
      egNode.controls.attack.onValueChange(10);
      egNode.controls.decay.onValueChange(10);
      if (egNode.data.attack !== 10) throw new Error(`EG attack data expected 10, got ${egNode.data.attack}`);
      if (egNode.data.decay !== 10) throw new Error(`EG decay data expected 10, got ${egNode.data.decay}`);

      const ArpClass = window.NodeRegistry.getConstructor('Arpeggiator');
      const arpNode = new ArpClass();
      editor.addNode(arpNode);
      if (arpNode.controls.attack.max !== 10) throw new Error(`Arp attack max expected 10, got ${arpNode.controls.attack.max}`);
      if (arpNode.controls.decay.max !== 10) throw new Error(`Arp decay max expected 10, got ${arpNode.controls.decay.max}`);
      arpNode.controls.attack.onValueChange(10);
      arpNode.controls.decay.onValueChange(10);
      if (arpNode.data.attack !== 10) throw new Error(`Arp attack data expected 10, got ${arpNode.data.attack}`);
      if (arpNode.data.decay !== 10) throw new Error(`Arp decay data expected 10, got ${arpNode.data.decay}`);

      const SeqClass = window.NodeRegistry.getConstructor('Sequencer');
      const seqNode = new SeqClass();
      editor.addNode(seqNode);
      if (seqNode.controls.attack.max !== 10) throw new Error(`Seq attack max expected 10, got ${seqNode.controls.attack.max}`);
      if (seqNode.controls.decay.max !== 10) throw new Error(`Seq decay max expected 10, got ${seqNode.controls.decay.max}`);
      seqNode.controls.attack.onValueChange(10);
      seqNode.controls.decay.onValueChange(10);
      if (seqNode.data.attack !== 10) throw new Error(`Seq attack data expected 10, got ${seqNode.data.attack}`);
      if (seqNode.data.decay !== 10) throw new Error(`Seq decay data expected 10, got ${seqNode.data.decay}`);
    });
  });
});
