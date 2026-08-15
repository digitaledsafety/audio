const { test, expect } = require('@playwright/test');

test.describe('Additional Scale Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#cta-button').click();
    await page.waitForTimeout(500);
    await page.evaluate(async () => {
      if (window.editor) {
        await window.editor.clear();
      }
    });
  });

  test('should support new scale types in Sequencer node', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addSequencerNodeBtn').click();

    const seqNode = page.locator('[data-node-label="Sequencer"]').first();
    await expect(seqNode).toBeVisible();

    // Toggle Randomize Settings
    const randBtn = seqNode.locator('button:has-text("Randomize Settings")');
    await randBtn.click();

    // Set Random Mode to Scale
    const randModeSelect = seqNode.locator('select').filter({ hasText: 'Chord' });
    await randModeSelect.selectOption('Scale');

    // Verify scale selector contains the new scales
    const scaleSelect = seqNode.locator('select').filter({ hasText: 'Major (Ionian)' });
    await expect(scaleSelect).toBeVisible();

    const newScales = [
      'Harmonic Major',
      'Lydian Dominant',
      'Phrygian Dominant',
      'Major Blues',
      'Bebop Major',
      'Altered Scale',
      'Hungarian Minor',
      'Hirajoshi'
    ];

    for (const scale of newScales) {
      await scaleSelect.selectOption(scale);
      // Click regenerate
      const diceBtn = seqNode.locator('button:has-text("🎲")');
      await diceBtn.click();
      const seqInput = seqNode.locator('input[type="text"]').first();
      const sequenceText = await seqInput.inputValue();
      expect(sequenceText.length).toBeGreaterThan(0);
    }
  });

  test('should support new scale types in Quantizer node', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addQuantizerNodeBtn').click();

    const quantNode = page.locator('[data-node-label="Quantizer"]').first();
    await expect(quantNode).toBeVisible();

    const scaleSelect = quantNode.locator('select').filter({ hasText: 'Major (Ionian)' });
    await expect(scaleSelect).toBeVisible();

    await scaleSelect.selectOption('Harmonic Major');
    await scaleSelect.selectOption('Phrygian Dominant');
    await scaleSelect.selectOption('Hungarian Minor');
    await scaleSelect.selectOption('Hirajoshi');
  });

  test('should support new scale types in Scale Arpeggiator node', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addArpeggiatorNodeBtn').click();

    const arpNode = page.locator('[data-node-label="Arpeggiator"]').first();
    await expect(arpNode).toBeVisible();

    const scaleSelect = arpNode.locator('select').filter({ hasText: 'Major (Ionian)' });
    if (await scaleSelect.isVisible()) {
      await scaleSelect.selectOption('Harmonic Major');
      await scaleSelect.selectOption('Hungarian Minor');
    }
  });
});
