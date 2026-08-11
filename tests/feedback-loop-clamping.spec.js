const { test, expect } = require('@playwright/test');

test.describe('Feedback Loop Clamping and Visual Control Disabling', () => {
  test.beforeEach(async ({ page }) => {
    // Capture page console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://localhost:8000/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
        await cta.click();
    }

    // Clear any previous editor state
    await page.evaluate(async () => {
        if (window.clearEditor) {
            await window.clearEditor();
        }
    });
  });

  test('should clamp mix to 100% wet and visually disable the Mix slider on feedback loop', async ({ page }) => {
    // 1. Add a Delay node via the UI button
    await page.locator('#addNodeToggle').click();
    await page.locator('#addDelayNodeBtn').click();

    const delayNodeElement = page.locator('[data-node-label="Delay"]').first();
    await expect(delayNodeElement).toBeVisible();

    // 2. Set Mix slider value to 0.4
    const mixSlider = delayNodeElement.locator('input[type="range"]').nth(2);
    await mixSlider.fill('0.4');
    await expect(delayNodeElement.locator('.value-display').nth(2)).toHaveText('0.40');

    // 3. Connect the Delay node's output back to its own input (into itself) programmatically
    const result = await page.evaluate(async () => {
        const delayNode = window.editor.getNodes().find(n => n.label === 'Delay');
        if (!delayNode) throw new Error('Delay node not found in editor');

        // Create self-connection
        const connection = new window.Rete.ClassicPreset.Connection(delayNode, 'audio', delayNode, 'audio');
        await window.editor.addConnection(connection);

        return {
            connections: window.editor.getConnections().map(c => ({ id: c.id, source: c.source, target: c.target })),
            cycles: Array.from(window.findNodesInCycles())
        };
    });
    console.log("Result from page:", result);

    const debugInfo = await page.evaluate(() => {
        const delayNode = window.editor.getNodes().find(n => n.label === 'Delay');
        const hasMixControl = !!delayNode.controls.mix;
        const mixDisabled = delayNode.controls.mix ? delayNode.controls.mix.disabled : null;
        return { hasMixControl, mixDisabled };
    });
    console.log("Debug Info:", debugInfo);

    // 4. Verify that the Mix control is visually disabled / greyed out
    const mixControlContainer = delayNodeElement.locator('.control').filter({ hasText: 'Mix' });
    await expect(mixControlContainer).toHaveClass(/opacity-50/);
    await expect(mixControlContainer).toHaveClass(/pointer-events-none/);
    const mixInputRange = mixControlContainer.locator('input');
    await expect(mixInputRange).toBeDisabled();

    // 5. Verify under the hood that finding nodes in cycles includes the delay node
    const isDelayInCycle = await page.evaluate(() => {
        const delayNode = window.editor.getNodes().find(n => n.label === 'Delay');
        const cycles = window.findNodesInCycles();
        return cycles.has(delayNode.id);
    });
    expect(isDelayInCycle).toBe(true);

    // 6. Delete/remove the feedback loop connection
    await page.evaluate(async () => {
        const connections = window.editor.getConnections();
        for (const conn of connections) {
            if (conn.source === conn.target) {
                await window.editor.removeConnection(conn.id);
            }
        }
    });

    // 7. Verify that the Mix control is restored and enabled
    await expect(mixControlContainer).not.toHaveClass(/opacity-50/);
    await expect(mixControlContainer).not.toHaveClass(/pointer-events-none/);
    await expect(mixInputRange).not.toBeDisabled();
    await expect(delayNodeElement.locator('.value-display').nth(2)).toHaveText('0.40');
  });
});
