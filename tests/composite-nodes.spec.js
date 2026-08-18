const { test, expect } = require('@playwright/test');

test.describe('Composite Node & Sub-Circuit Architecture', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.addStyleTag({ content: '#hero-overlay { display: none !important; }' });
    await page.waitForFunction(() => window.editor && window.area);
  });

  test('should create Composite Node and open sub-circuit editor modal', async ({ page }) => {
    await page.evaluate(async () => {
      const Constructor = window.NodeRegistry.getConstructor('Composite Node');
      const node = new Constructor();
      await window.editor.addNode(node);
    });

    const compositeNode = page.locator('[data-node-label="Composite Node"]').first();
    await expect(compositeNode).toBeVisible();

    // Click Edit Sub-Circuit button
    const editBtn = compositeNode.locator('button:has-text("Edit Sub-Circuit")');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Check modal visibility and title
    const modal = page.locator('#subCircuitModal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#subCircuitCurrentNodeTitle')).toContainText('Composite Node');

    // Close modal
    await page.locator('#closeSubCircuitBtn').click();
    await expect(modal).toBeHidden();
  });

  test('should apply sub-circuit presets (Chorus & Ping-Pong Delay)', async ({ page }) => {
    await page.evaluate(async () => {
      const Constructor = window.NodeRegistry.getConstructor('Composite Node');
      const node = new Constructor();
      await window.editor.addNode(node);
    });

    const compositeNode = page.locator('[data-node-label="Composite Node"]').first();
    const select = compositeNode.locator('select');
    await expect(select).toBeVisible();

    // Select Chorus Sub-Circuit
    await select.selectOption('Chorus Sub-Circuit');
    await expect(select).toHaveValue('Chorus Sub-Circuit');

    // Verify subWorkspace has 4 nodes
    const nodeCount = await page.evaluate(() => {
      const node = Array.from(window.editor.getNodes()).find(n => n.label.includes('Chorus') || n.label.includes('Composite'));
      return node ? node.subWorkspace.nodes.length : 0;
    });
    expect(nodeCount).toBe(4);

    // Open sub-circuit modal
    await compositeNode.locator('button:has-text("Edit Sub-Circuit")').click();
    await expect(page.locator('#subCircuitModal')).toBeVisible();

    await page.locator('#closeSubCircuitBtn').click();
  });

  test('should dynamically update sockets when ports are added', async ({ page }) => {
    await page.evaluate(async () => {
      const Constructor = window.NodeRegistry.getConstructor('Composite Node');
      const node = new Constructor();
      await window.editor.addNode(node);
    });

    const compositeNode = page.locator('[data-node-label="Composite Node"]').first();

    // Open modal and add input/output ports
    await compositeNode.locator('button:has-text("Edit Sub-Circuit")').click();
    await page.locator('#addSubInputBtn').click();
    await page.locator('#addSubOutputBtn').click();

    // Close modal
    await page.locator('#closeSubCircuitBtn').click();

    // Verify composite node has updated ports
    const portCount = await page.evaluate(() => {
      const node = Array.from(window.editor.getNodes()).find(n => n.label.includes('Composite'));
      return {
        inputs: Object.keys(node.inputs).length,
        outputs: Object.keys(node.outputs).length
      };
    });

    expect(portCount.inputs).toBeGreaterThanOrEqual(1);
    expect(portCount.outputs).toBeGreaterThanOrEqual(1);
  });
});
