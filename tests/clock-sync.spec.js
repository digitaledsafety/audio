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

  test('should establish clock connection listeners before clock start on play and restart', async ({ page }) => {
    // Add Clock and Arpeggiator
    await page.locator('#addNodeToggle').click();
    await page.locator('#addMasterClockNodeBtn').click();

    await page.locator('#addNodeToggle').click();
    await page.locator('#addArpeggiatorNodeBtn').click();

    // Verify both nodes are visible
    await expect(page.locator('[data-node-label="Clock"]')).toBeVisible();
    await expect(page.locator('[data-node-label="Arpeggiator"]')).toBeVisible();

    // Connect Clock clock out to Arpeggiator clock in
    await page.evaluate(async () => {
      const clockNode = window.editor.getNodes().find(n => n.label === 'Clock');
      const arpNode = window.editor.getNodes().find(n => n.label === 'Arpeggiator');
      await window.editor.addConnection(new window.Rete.ClassicPreset.Connection(clockNode, 'clock', arpNode, 'clock'));
    });

    // Press Play
    await page.click('#playStopBtn');
    await page.waitForTimeout(200);

    // Verify Master Clock and Arpeggiator audio nodes are started and listeners receive ticks from tickIndex 0
    const clockStatusInitial = await page.evaluate(() => {
      const clockNode = window.editor.getNodes().find(n => n.label === 'Clock');
      const audioClock = window.reteAudioNodes.get(clockNode.id);
      return {
        started: audioClock ? audioClock.started : false,
        listenerCount: audioClock ? audioClock.tickListeners.length : 0,
        beatCount: audioClock ? audioClock.beatCount : -1
      };
    });

    expect(clockStatusInitial.started).toBe(true);
    expect(clockStatusInitial.listenerCount).toBeGreaterThan(0);
    expect(clockStatusInitial.beatCount).toBeGreaterThan(0);

    // Press Stop
    await page.click('#playStopBtn');
    await page.waitForTimeout(200);

    // Press Play again (during editing/restart)
    await page.click('#playStopBtn');
    await page.waitForTimeout(200);

    const clockStatusRestart = await page.evaluate(() => {
      const clockNode = window.editor.getNodes().find(n => n.label === 'Clock');
      const audioClock = window.reteAudioNodes.get(clockNode.id);
      return {
        started: audioClock ? audioClock.started : false,
        listenerCount: audioClock ? audioClock.tickListeners.length : 0,
        beatCount: audioClock ? audioClock.beatCount : -1
      };
    });

    expect(clockStatusRestart.started).toBe(true);
    expect(clockStatusRestart.listenerCount).toBeGreaterThan(0);
    expect(clockStatusRestart.beatCount).toBeGreaterThan(0);
  });
});
