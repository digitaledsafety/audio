const { test, expect } = require('@playwright/test');

test.describe('Drum Machine Node & Drum Kits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
    await page.evaluate(async () => {
      if (window.clearEditor) {
        await window.clearEditor();
      } else if (window.editor) {
        await window.editor.clear();
      }
    });
  });

  test('should add Drum Machine node, switch drum kits, and handle extended mini-notation', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addDrumMachineNodeBtn').click();

    const dmNode = page.locator('[data-node-label="Drum Machine"]').first();
    await expect(dmNode).toBeVisible();

    // Verify Kit selector presence and options
    const kitSelect = dmNode.locator('select').filter({ hasText: '808' });
    await expect(kitSelect).toBeVisible();

    // Test changing Kit to 909
    await kitSelect.selectOption('909');
    let kitValue = await kitSelect.inputValue();
    expect(kitValue).toBe('909');

    // Test changing Kit to Chiptune
    await kitSelect.selectOption('Chiptune');
    kitValue = await kitSelect.inputValue();
    expect(kitValue).toBe('Chiptune');

    // Test changing Kit to Acoustic
    await kitSelect.selectOption('Acoustic');
    kitValue = await kitSelect.inputValue();
    expect(kitValue).toBe('Acoustic');

    // Verify Sequence text input and enter extended notation sequence (k s h o c t)
    const seqInput = dmNode.locator('input[type="text"]').first();
    await seqInput.fill('k s h o c t');
    await seqInput.dispatchEvent('input');

    const updatedSeq = await seqInput.inputValue();
    expect(updatedSeq).toBe('k s h o c t');

    // Click Randomize button 🎲
    const diceBtn = dmNode.locator('button:has-text("🎲")');
    await expect(diceBtn).toBeVisible();
    await diceBtn.click({ force: true });

    const randSeq = await seqInput.inputValue();
    expect(randSeq).not.toBe('k s h o c t');
    expect(randSeq.length).toBeGreaterThan(0);

    // Verify programmatic audio node execution for all kits and drum sounds
    const soundCheck = await page.evaluate(() => {
      const audioNodes = Array.from(window.reteAudioNodes.values());
      const dmAudio = audioNodes.find(node => node.constructor.name === 'DrumMachine');
      if (!dmAudio) return { success: false, error: 'DrumMachine audio node not found' };

      try {
        const kits = ['808', '909', 'Chiptune', 'Acoustic'];
        const notes = ['k', 's', 'h', 'o', 'c', 't'];

        for (const kit of kits) {
          dmAudio.updateParameter('kit', kit);
          for (const note of notes) {
            dmAudio.scheduleNote(note, 0.1, dmAudio.audioContext.currentTime + 0.01);
          }
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    expect(soundCheck.success).toBe(true);
  });
});
