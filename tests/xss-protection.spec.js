const { test, expect } = require('@playwright/test');

test.describe('XSS Protection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
        await cta.click();
    }
  });

  test('should safely render input values in TextControl and prevent DOM XSS', async ({ page }) => {
    // 1. Add Sequencer node which has a TextControl
    await page.locator('#addNodeToggle').click();
    await page.locator('#addSequencerNodeBtn').click();

    const seqNode = page.locator('[data-node-label="Sequencer"]').first();
    await expect(seqNode).toBeVisible();

    // 2. Locate the TextControl text input (class 'control' with a text input inside)
    const textInput = seqNode.locator('input[type="text"]').first();
    await expect(textInput).toBeVisible();

    // 3. Define a malicious HTML/JS injection payload
    // This payload contains double quotes, attributes, and an autofocus/onload script trigger.
    const xssPayload = '" autofocus onfocus="window.xssExploited=true" data-exploit="><script>window.xssExploited=true</script>';

    // 4. Set the value in the input field
    await textInput.fill(xssPayload);
    await textInput.dispatchEvent('input');

    // 5. Verify the value of the input element is exactly the payload
    await expect(textInput).toHaveValue(xssPayload);

    // 6. Check that the script was NOT executed and window.xssExploited remains undefined
    const isExploited = await page.evaluate(() => window.xssExploited);
    expect(isExploited).toBeUndefined();

    // 7. Verify that no script tag or broken attribute is actually injected into the DOM
    const hasScriptInjected = await page.evaluate(() => {
      return !!document.querySelector('script[src*="window.xssExploited"]') ||
             !!document.querySelector('[data-exploit]');
    });
    expect(hasScriptInjected).toBe(false);
  });
});
