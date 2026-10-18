const { test, expect } = require('@playwright/test');

test.describe('Sample & Hold and Attenuverter Utilities', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
  });

  test('Attenuverter Node should have Level and Offset controls and update audio parameters', async ({ page }) => {
    await page.locator('#addNodeToggle').click();

    const addButton = page.locator('#addAttenuverterNodeBtn').first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    const nodeElement = page.locator('[data-node-label="Attenuverter"]').first();
    await expect(nodeElement).toBeVisible({ timeout: 10000 });

    // Verify input and output sockets
    await expect(nodeElement.locator('.input-title:has-text("In")')).toBeVisible();
    await expect(nodeElement.locator('.output-title:has-text("Out")')).toBeVisible();

    // Verify Level and Offset controls
    const levelSlider = nodeElement.locator('input[type="range"]').nth(0);
    const offsetSlider = nodeElement.locator('input[type="range"]').nth(1);

    await expect(levelSlider).toBeVisible();
    await expect(offsetSlider).toBeVisible();

    await expect(levelSlider).toHaveValue('1');
    await expect(offsetSlider).toHaveValue('0');

    // Change level and offset
    await levelSlider.fill('-0.5');
    await levelSlider.dispatchEvent('input');

    await offsetSlider.fill('0.25');
    await offsetSlider.dispatchEvent('input');

    // Verify parameter values in underlying audio instance
    const params = await page.evaluate(() => {
      const audioNodes = Array.from(window.reteAudioNodes.values());
      const attNode = audioNodes.find(n => n.constructor.name === 'Attenuverter');
      if (!attNode) return null;
      return {
        level: attNode.data.level,
        offset: attNode.data.offset,
        gainVal: attNode.attenuatorNode.gain.value,
        offsetVal: attNode.offsetSource.offset.value
      };
    });

    expect(params).not.toBeNull();
    expect(params.level).toBe(-0.5);
    expect(params.offset).toBe(0.25);
  });

  test('Sample & Hold Node should handle rising edge gate signals via handleGate', async ({ page }) => {
    await page.locator('#addNodeToggle').click();

    const addButton = page.locator('#addSampleAndHoldNodeBtn').first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    const nodeElement = page.locator('[data-node-label="Sample & Hold"]').first();
    await expect(nodeElement).toBeVisible({ timeout: 10000 });

    // Verify input and output sockets
    await expect(nodeElement.locator('.input-title:has-text("Signal In")')).toBeVisible();
    await expect(nodeElement.locator('.input-title:has-text("Trigger")')).toBeVisible();
    await expect(nodeElement.locator('.output-title:has-text("CV Out")')).toBeVisible();

    // Verify handleGate execution on the audio instance
    const gateHandled = await page.evaluate(() => {
      const audioNodes = Array.from(window.reteAudioNodes.values());
      const shNode = audioNodes.find(n => n.constructor.name === 'SampleAndHold');
      if (!shNode || typeof shNode.handleGate !== 'function') return false;

      // Trigger rising edge gate
      shNode.handleGate(true, 1.0);
      const isHighGate = shNode.lastGateState === true;

      // Trigger falling edge gate
      shNode.handleGate(false, 1.1);
      const isLowGate = shNode.lastGateState === false;

      return isHighGate && isLowGate;
    });

    expect(gateHandled).toBe(true);
  });
});
