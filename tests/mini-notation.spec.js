const { test, expect } = require('@playwright/test');

test.describe('MiniNotation & AudioWorklets Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        const cta = page.locator('#cta-button');
        if (await cta.isVisible()) {
            await cta.click();
        }
    });

    test('MiniNotationParser handles Euclidean patterns and bounds correctly', async ({ page }) => {
        const result = await page.evaluate(() => {
            const rootNotes = { 'C4': 60, 'D4': 62, 'E4': 64, 'F4': 65, 'G4': 67 };
            const parser = new MiniNotationParser(rootNotes);

            // Test normal Euclidean pattern
            const eucResult = parser.parse('C4*3/8');

            // Test bounded Euclidean pattern (steps capped at 128)
            const boundedResult = parser.parse('C4*3/200');

            // Test probability notation
            const probResult = parser.parse('C4?0.75 D4');

            return {
                eucLength: eucResult.length,
                boundedLength: boundedResult.length,
                probNote1: probResult[0].probability,
                probNote2: probResult[1].probability,
            };
        });

        expect(result.eucLength).toBe(8);
        expect(result.boundedLength).toBe(128);
        expect(result.probNote1).toBe(0.75);
        expect(result.probNote2).toBe(1.0);
    });

    test('Bitcrusher and Quantizer nodes can be added to the canvas', async ({ page }) => {
        // Add Bitcrusher node
        await page.locator('#addNodeToggle').click();
        await page.locator('#addBitcrusherNodeBtn').click();
        const bitcrusherNode = page.locator('[data-node-label="Bitcrusher"]').first();
        await expect(bitcrusherNode).toBeVisible();

        // Add Quantizer node
        await page.locator('#addNodeToggle').click();
        await page.locator('#addQuantizerNodeBtn').click();
        const quantizerNode = page.locator('[data-node-label="Quantizer"]').first();
        await expect(quantizerNode).toBeVisible();
    });
});
