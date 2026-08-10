const { test, expect } = require('@playwright/test');

test.describe('DOM XSS Mitigation Security Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#cta-button');
    await page.locator('#cta-button').click();

    // Wait for the initial random workspace nodes to be loaded in the editor
    await page.waitForFunction(() => window.editor && window.editor.getNodes().length > 0);
  });

  test('should securely escape user-supplied control value in TextControl and prevent XSS execution', async ({ page }) => {
    // 1. Clear existing workspace programmatically
    await page.evaluate(async () => {
        try {
            await window.editor.clear();
        } catch (err) {
            console.error("Error during editor clear:", err);
        }
    });

    // 2. Load a workspace containing a malicious script payload inside TextControl (audioUrl)
    const xssPayload = '"><svg/onload="window.xssInjected=true">';

    await page.evaluate(async (payload) => {
        const workspaceData = {
            workspaceFormatVersion: '2.0',
            nodes: [
                {
                    id: 'xss-node-1',
                    label: 'Wave Player',
                    data: {
                        audioUrl: payload
                    },
                    controls: {
                        audioUrl: {
                            value: payload
                        }
                    },
                    position: { x: 100, y: 100 }
                }
            ],
            connections: []
        };
        await window.editorFromJSON(workspaceData);
    }, xssPayload);

    // 3. Wait for the Wave Player node to be rendered in the DOM
    await expect(page.locator('text=Wave Player').first()).toBeVisible();

    // 4. Verify that the script was NOT executed (window.xssInjected should be undefined or not true)
    const xssInjected = await page.evaluate(() => window.xssInjected);
    expect(xssInjected).toBeUndefined();

    // 5. Verify that the input element has the correct escaped value set
    const inputValue = await page.locator('.custom-controls input[type="text"]').first().inputValue();
    expect(inputValue).toBe(xssPayload);

    // 6. Verify that the raw HTML of the control input correctly escapes the double quotes and tags
    // e.g. checking that the double-quote is not unescaped in innerHTML causing an early attribute breakout
    const outerHTML = await page.evaluate(() => {
        const inputEl = document.querySelector('.custom-controls input[type="text"]');
        return inputEl ? inputEl.outerHTML : '';
    });
    // The outerHTML should contain the attribute but it shouldn't contain raw breakout sequence.
    // In fact, the DOM representation will show the browser parsed it as a single value attribute.
    expect(outerHTML).toContain('value="&quot;&gt;&lt;svg/onload=&quot;window.xssInjected=true&quot;&gt;"');
  });
});
