const { test, expect } = require('@playwright/test');

test.describe('Node Precision & Fine-Tuning Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('#cta-button');
  });

  test('VCO node supports Fine Tune slider and parameter updates', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('button:has-text("VCO")').first().click();

    const node = page.locator('[data-node-label="VCO"]').first();
    await expect(node).toBeVisible();

    // Verify Fine Tune control is visible at index 1 and can be set
    const fineTuneSlider = node.locator('input[type="range"]').nth(1);
    await expect(fineTuneSlider).toBeVisible();
    await fineTuneSlider.fill('15');
    await expect(fineTuneSlider).toHaveValue('15');

    // Verify parameter data on Rete node
    const fineTuneValue = await page.evaluate(() => {
      const nodes = Array.from(window.editor.getNodes());
      const vco = nodes.find(n => n.label === 'VCO');
      return vco ? vco.data.fineTune : null;
    });
    expect(fineTuneValue).toBe(15);
  });

  test('LFO node supports Fine Rate slider', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('button:has-text("LFO")').first().click();

    const node = page.locator('[data-node-label="LFO"]').first();
    await expect(node).toBeVisible();

    // Fine Rate slider is index 1
    const fineRateSlider = node.locator('input[type="range"]').nth(1);
    await expect(fineRateSlider).toBeVisible();
    await fineRateSlider.fill('0.35');
    await expect(fineRateSlider).toHaveValue('0.35');

    const fineTuneValue = await page.evaluate(() => {
      const nodes = Array.from(window.editor.getNodes());
      const lfo = nodes.find(n => n.label === 'LFO');
      return lfo ? lfo.data.fineTune : null;
    });
    expect(fineTuneValue).toBe(0.35);
  });

  test('Chord Generator node supports Fine Tune slider', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('button:has-text("Chord Gen")').first().click();

    const node = page.locator('[data-node-label="Chord Generator"]').first();
    await expect(node).toBeVisible();

    const fineTuneSlider = node.locator('input[type="range"]').nth(1);
    await expect(fineTuneSlider).toBeVisible();
    await fineTuneSlider.fill('-25');
    await expect(fineTuneSlider).toHaveValue('-25');

    const fineTuneValue = await page.evaluate(() => {
      const nodes = Array.from(window.editor.getNodes());
      const chordGen = nodes.find(n => n.label === 'Chord Generator');
      return chordGen ? chordGen.data.fineTune : null;
    });
    expect(fineTuneValue).toBe(-25);
  });

  test('Delay node has millisecond step precision', async ({ page }) => {
    await page.locator('#addNodeToggle').click();
    await page.locator('button:has-text("Delay")').first().click();

    const delayNode = page.locator('[data-node-label="Delay"]').first();
    await expect(delayNode).toBeVisible();

    const delayTimeSlider = delayNode.locator('input[type="range"]').first();
    await expect(delayTimeSlider).toHaveAttribute('step', '0.001');

    await delayTimeSlider.fill('0.005');
    await expect(delayTimeSlider).toHaveValue('0.005');
  });
});
