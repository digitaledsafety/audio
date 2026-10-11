const { test, expect } = require('@playwright/test');

test.describe('Clock Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000/');
    // Wait for the Enter the Studio button and click it
    const ctaButton = page.locator('#cta-button');
    await ctaButton.click();

    // Clear the editor to ensure a clean state
    await page.locator('#settingsToggle').click();
    const clearBtn = page.locator('#clearEditorBtn');
    await clearBtn.click();
    // Close settings
    await page.locator('#settingsToggle').click();
  });

  test('should add clock-related nodes and ping pong delay', async ({ page }) => {
    // Add Clock
    await page.locator('#addNodeToggle').click();
    await page.locator('#addMasterClockNodeBtn').click();

    // Add Sequencer
    await page.locator('#addNodeToggle').click();
    await page.locator('#addSequencerNodeBtn').click();

    const masterClockNode = page.locator('[data-node-label="Clock"]');
    await expect(masterClockNode).toBeVisible();

    const sequencerNode = page.locator('[data-node-label="Sequencer"]');
    await expect(sequencerNode).toBeVisible();

    // Verify the BPM controls exist
    await expect(masterClockNode.locator('input[type="range"]')).toBeVisible();
    await expect(sequencerNode.locator('input[type="range"]')).toBeVisible();

    // Check if Ping Pong Delay was added too
    await page.locator('#addNodeToggle').click();
    const addPPBtn = page.locator('#addPingPongDelayNodeBtn');
    await expect(addPPBtn).toBeVisible();
    await addPPBtn.click();

    const ppDelayNode = page.locator('[data-node-label="Ping Pong Delay"]');
    await expect(ppDelayNode).toBeVisible();
  });

  test('should trigger step 0 on tick 0 for whole, half, and quarter note durations when synced to clock', async ({ page }) => {
    // Add Master Clock and Sequencer programmatically
    const result = await page.evaluate(async () => {
      const ClockClass = window.NodeRegistry.getConstructor('Clock');
      const SeqClass = window.NodeRegistry.getConstructor('Sequencer');
      const clockNode = new ClockClass();
      const seqNode = new SeqClass();

      await window.editor.addNode(clockNode);
      await window.editor.addNode(seqNode);

      // Connect Clock Out -> Sequencer Clock In
      const conn = new window.Rete.ClassicPreset.Connection(
        clockNode, 'clock',
        seqNode, 'clock'
      );
      await window.editor.addConnection(conn);

      // Initialize audio nodes and connections
      await window.startAudio();
      await window.stopAudio();

      const durations = ['1', '1/2', '1/4', '1/8', '1/16'];
      const testResults = {};

      for (const dur of durations) {
        seqNode.data.noteDuration = dur;

        await window.startAudio();

        const seqAudio = window.reteAudioNodes.get(seqNode.id);

        // Check if currentStep was advanced to step 1 (indicating step 0 fired on tick 0)
        const stepAfterStart = seqAudio ? seqAudio.currentStep : null;
        testResults[dur] = stepAfterStart;

        await window.stopAudio();
      }

      return testResults;
    });

    // Step 0 should trigger immediately on start for every note duration, advancing currentStep to 1
    for (const [dur, step] of Object.entries(result)) {
      expect(step, `Expected currentStep to be 1 after startAudio for note duration ${dur}`).toBe(1);
    }
  });
});
