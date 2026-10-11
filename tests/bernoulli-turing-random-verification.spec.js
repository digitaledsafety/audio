const { test, expect } = require('@playwright/test');

test.describe('Bernoulli, Turing Machine, and Random Voltage Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
  });

  test('Bernoulli Gate should have Prob CV input, Out A/B outputs, and route correctly', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addBernoulliGateNodeBtn').click();

    const node = page.locator('[data-node-label="Bernoulli Gate"]').first();
    await expect(node).toBeVisible();

    // Check sockets
    await expect(node.locator('.input-title:has-text("Clock/Gate")')).toBeVisible();
    await expect(node.locator('.input-title:has-text("Prob CV")')).toBeVisible();
    await expect(node.locator('.output-title:has-text("Out A")')).toBeVisible();
    await expect(node.locator('.output-title:has-text("Out B")')).toBeVisible();

    // Check slider
    const probSlider = node.locator('input[type="range"]').first();
    await probSlider.fill('0.8');
    await expect(probSlider).toHaveValue('0.8');

    // Test audio node execution
    const results = await page.evaluate(async () => {
      const nodeEntry = Array.from(window.reteAudioNodes.entries()).find(([id, n]) => n.constructor.name === 'BernoulliGate');
      if (!nodeEntry) return { error: 'BernoulliGate instance not found' };
      const audioNode = nodeEntry[1];

      let countA = 0;
      let countB = 0;

      const listenerA = () => { countA++; };
      const listenerB = () => { countB++; };

      audioNode.addTickListener(listenerA, 'outA');
      audioNode.addTickListener(listenerB, 'outB');

      // Test 100% Probability -> All Out A
      audioNode.updateParameter('probability', 1.0);
      for (let i = 0; i < 10; i++) {
        audioNode.onTick(audioNode.audioContext.currentTime, 0.1);
      }
      const test1Passed = countA === 10 && countB === 0;

      // Test 0% Probability -> All Out B
      countA = 0;
      countB = 0;
      audioNode.updateParameter('probability', 0.0);
      for (let i = 0; i < 10; i++) {
        audioNode.onTick(audioNode.audioContext.currentTime, 0.1);
      }
      const test2Passed = countA === 0 && countB === 10;

      return { test1Passed, test2Passed, countA, countB };
    });

    expect(results.test1Passed).toBe(true);
    expect(results.test2Passed).toBe(true);
  });

  test('Turing Machine should support 2-32 steps, Prob CV, and deterministic looping at prob 0', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addTuringMachineNodeBtn').click();

    const node = page.locator('[data-node-label="Turing Machine"]').first();
    await expect(node).toBeVisible();

    // Check sockets
    await expect(node.locator('.input-title:has-text("Clock")')).toBeVisible();
    await expect(node.locator('.input-title:has-text("Prob CV")')).toBeVisible();
    await expect(node.locator('.output-title:has-text("Out")')).toBeVisible();
    await expect(node.locator('.output-title:has-text("Trigger Out")')).toBeVisible();

    // Check controls
    const probSlider = node.locator('input[type="range"]').first();
    await probSlider.fill('0.25');
    await expect(probSlider).toHaveValue('0.25');

    const stepsSlider = node.locator('input[type="range"]').nth(1);
    await stepsSlider.fill('32');
    await expect(stepsSlider).toHaveValue('32');

    // Test audio node execution
    const results = await page.evaluate(async () => {
      const nodeEntry = Array.from(window.reteAudioNodes.entries()).find(([id, n]) => n.constructor.name === 'TuringMachine');
      if (!nodeEntry) return { error: 'TuringMachine instance not found' };
      const audioNode = nodeEntry[1];

      // Test 0% Probability -> Register loops deterministically over steps count
      audioNode.updateParameter('probability', 0.0);
      audioNode.updateParameter('steps', 32);

      const initialRegister = audioNode.register;
      for (let i = 0; i < 32; i++) {
        audioNode.onTick(audioNode.audioContext.currentTime, 0.1);
      }
      const registerAfter32Steps = audioNode.register;

      // Test 8 steps
      audioNode.updateParameter('steps', 8);
      audioNode.register = 0b10101010;
      const initial8 = audioNode.register & 0xFF;
      for (let i = 0; i < 8; i++) {
        audioNode.onTick(audioNode.audioContext.currentTime, 0.1);
      }
      const after8 = audioNode.register & 0xFF;

      return {
        loop32Matched: initialRegister === registerAfter32Steps,
        loop8Matched: initial8 === after8
      };
    });

    expect(results.loop32Matched).toBe(true);
    expect(results.loop8Matched).toBe(true);
  });

  test('Random Voltage should support Range Min, Range Max, and generate bounded CV output', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('#addRandomVoltageNodeBtn').click();

    const node = page.locator('[data-node-label="Random Voltage"]').first();
    await expect(node).toBeVisible();

    // Check controls
    const minSlider = node.locator('input[type="range"]').first();
    await minSlider.fill('2');
    await expect(minSlider).toHaveValue('2');

    const maxSlider = node.locator('input[type="range"]').nth(1);
    await maxSlider.fill('4');
    await expect(maxSlider).toHaveValue('4');

    const slewSlider = node.locator('input[type="range"]').nth(2);
    await slewSlider.fill('0.5');
    await expect(slewSlider).toHaveValue('0.5');

    // Test audio node execution bounds
    const results = await page.evaluate(async () => {
      const nodeEntry = Array.from(window.reteAudioNodes.entries()).find(([id, n]) => n.constructor.name === 'RandomVoltage');
      if (!nodeEntry) return { error: 'RandomVoltage instance not found' };
      const audioNode = nodeEntry[1];

      audioNode.updateParameter('min', 2.0);
      audioNode.updateParameter('max', 4.0);
      audioNode.updateParameter('smoothness', 0.0);

      const generatedValues = [];
      for (let i = 0; i < 50; i++) {
        audioNode.onTick(audioNode.audioContext.currentTime, 0.1);
        generatedValues.push(audioNode.lastValue);
      }

      const allBounded = generatedValues.every(val => val >= 2.0 && val <= 4.0);

      // Negative bound test [-3.0, -1.0]
      audioNode.updateParameter('min', -3.0);
      audioNode.updateParameter('max', -1.0);

      const negValues = [];
      for (let i = 0; i < 50; i++) {
        audioNode.onTick(audioNode.audioContext.currentTime, 0.1);
        negValues.push(audioNode.lastValue);
      }

      const negAllBounded = negValues.every(val => val >= -3.0 && val <= -1.0);

      return {
        allBounded,
        negAllBounded,
        samplePositive: generatedValues.slice(0, 5),
        sampleNegative: negValues.slice(0, 5)
      };
    });

    expect(results.allBounded).toBe(true);
    expect(results.negAllBounded).toBe(true);
  });
});
