const { test, expect } = require('@playwright/test');

test.describe('Sequencer Randomization & Scaled Sequences', () => {
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

  test('should add Sequencer node and configure sequence length and patterns', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addSequencerNodeBtn').click();

    const seqNode = page.locator('[data-node-label="Sequencer"]').first();
    await expect(seqNode).toBeVisible();

    // Toggle Randomize Settings
    const randBtn = seqNode.locator('button:has-text("Randomize Settings")');
    await expect(randBtn).toBeVisible();
    await randBtn.click();

    // Verify Random Mode select
    const randModeSelect = seqNode.locator('select').filter({ hasText: 'Chord' });
    await expect(randModeSelect).toBeVisible();
    await randModeSelect.selectOption('Scale');

    // Verify Scale select is visible
    const scaleSelect = seqNode.locator('select').filter({ hasText: 'Major (Ionian)' });
    await expect(scaleSelect).toBeVisible();
    await scaleSelect.selectOption('Pentatonic Minor');

    // Verify Gen Pattern select includes new algorithms
    const patternSelect = seqNode.locator('select').filter({ hasText: 'Scalar Walk' });
    await expect(patternSelect).toBeVisible();

    // Test Scalar Walk
    await patternSelect.selectOption('Scalar Walk');
    const seqInput = seqNode.locator('input[type="text"]').first();
    let sequenceText = await seqInput.inputValue();
    let notes = sequenceText.split(' ').filter(n => n.length > 0);
    expect(notes.length).toBe(32); // Default sequence length is 32

    // Target the Sequence Length slider specifically by looking near its label
    const seqLengthLabel = seqNode.locator('label:has-text("Sequence Length")');
    await expect(seqLengthLabel).toBeVisible();
    const seqLengthSlider = seqLengthLabel.locator('xpath=following-sibling::input[@type="range"]');
    await seqLengthSlider.evaluate((el) => {
      el.value = '16';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    sequenceText = await seqInput.inputValue();
    notes = sequenceText.split(' ').filter(n => n.length > 0);
    expect(notes.length).toBe(16);

    // Test Motif Generator
    await patternSelect.selectOption('Motif Generator');
    sequenceText = await seqInput.inputValue();
    notes = sequenceText.split(' ').filter(n => n.length > 0);
    expect(notes.length).toBe(16);

    // Test Pentatonic Groove
    await patternSelect.selectOption('Pentatonic Groove');
    sequenceText = await seqInput.inputValue();
    notes = sequenceText.split(' ').filter(n => n.length > 0);
    expect(notes.length).toBe(16);

    // Test regenerate button 🎲
    const diceBtn = seqNode.locator('button:has-text("🎲")');
    await expect(diceBtn).toBeVisible();
    await diceBtn.click();
    const newSeqText = await seqInput.inputValue();
    expect(newSeqText.split(' ').filter(n => n.length > 0).length).toBe(16);
  });
});
