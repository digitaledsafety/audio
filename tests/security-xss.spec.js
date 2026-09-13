const { test, expect } = require('@playwright/test');

test.describe('DOM XSS Security & HTML Escaping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }
  });

  test('window.escapeHtml escapes HTML special characters properly', async ({ page }) => {
    const escaped = await page.evaluate(() => {
      return window.escapeHtml('<script>alert("xss")</script> & \'hello"');
    });

    expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;hello&quot;');
  });

  test('Workspace load with XSS payload in node label/data does not execute script', async ({ page }) => {
    const xssPayload = '<img src=x onerror="window.xssExecuted=true">';

    const result = await page.evaluate(async (payload) => {
      window.xssExecuted = false;
      const editor = window.editor;
      const NodeRegistry = window.NodeRegistry;

      const ToneClass = NodeRegistry.getConstructor('VCO');
      const node = new ToneClass();
      node.label = payload;
      node.data.sequence = payload;

      await editor.addNode(node);

      // Give any potential DOM injection time to run
      await new Promise(resolve => setTimeout(resolve, 300));

      const serialized = typeof window.editorToJSON === 'function' ? window.editorToJSON() : null;

      return {
        xssExecuted: window.xssExecuted,
        serializedNodesCount: serialized ? serialized.nodes.length : 0
      };
    }, xssPayload);

    expect(result.xssExecuted).toBe(false);
    expect(result.serializedNodesCount).toBeGreaterThan(0);
  });
});
