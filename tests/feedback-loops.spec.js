const { test, expect } = require('@playwright/test');

test.describe('Feedback Loops & Cycle Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#cta-button');
  });

  test('should detect cycles and log appropriate messages based on DelayNode presence', async ({ page }) => {
    const consoleMsgs = [];
    page.on('console', msg => {
      consoleMsgs.push({ type: msg.type(), text: msg.text() });
    });

    // Enter the studio
    await page.locator('#cta-button').click();

    // Verify global functions exist
    const hasGlobalFunctions = await page.evaluate(() => {
      return typeof window.detectCycles === 'function' && typeof window.logGraphCycles === 'function';
    });
    expect(hasGlobalFunctions).toBe(true);

    // Build cyclic graphs programmatically and run cycle detection
    const result = await page.evaluate(async () => {
      const editor = window.editor;

      // Clear current workspace
      await editor.clear();

      // Retrieve constructors
      const ToneGeneratorNode = window.NodeRegistry.getConstructor('ToneGeneratorNode');
      const FilterNode = window.NodeRegistry.getConstructor('FilterNode');
      const DelayNode = window.NodeRegistry.getConstructor('DelayNode');

      // Instantiate nodes
      const vco = new ToneGeneratorNode();
      vco.id = 'vco-1';
      const filter = new FilterNode();
      filter.id = 'filter-1';

      await editor.addNode(vco);
      await editor.addNode(filter);

      // 1. Create connection: VCO Out -> VCF In
      const conn1 = new window.Rete.ClassicPreset.Connection(vco, 'audio', filter, 'audio');
      await editor.addConnection(conn1);

      // 2. Create loop back: VCF Out -> VCO Freq (Cycle WITHOUT delay)
      const conn2 = new window.Rete.ClassicPreset.Connection(filter, 'audio', vco, 'freq');
      await editor.addConnection(conn2);

      const cyclesNoDelay = window.detectCycles();

      // Remove invalid loop connection to prepare for Delay node insertion
      await editor.removeConnection(conn2.id);

      // Instantiate and add Delay node
      const delay = new DelayNode();
      delay.id = 'delay-1';
      await editor.addNode(delay);

      // 3. Create connection: VCF Out -> Delay In
      const conn3 = new window.Rete.ClassicPreset.Connection(filter, 'audio', delay, 'audio');
      await editor.addConnection(conn3);

      // 4. Create loop back with Delay: Delay Out -> VCO Freq (Cycle WITH delay)
      const conn4 = new window.Rete.ClassicPreset.Connection(delay, 'audio', vco, 'freq');
      await editor.addConnection(conn4);

      const cyclesWithDelay = window.detectCycles();

      return {
        cyclesNoDelay,
        cyclesWithDelay
      };
    });

    // Assert that the cycle without a delay node was identified correctly
    expect(result.cyclesNoDelay.length).toBe(1);
    expect(result.cyclesNoDelay[0].hasDelay).toBe(false);

    // Assert that the cycle with a delay node was identified correctly
    expect(result.cyclesWithDelay.length).toBe(1);
    expect(result.cyclesWithDelay[0].hasDelay).toBe(true);

    // Assert console outputs
    const warnings = consoleMsgs.filter(m => m.text.includes('[Cycle Detection] ⚠️ Warning'));
    const infos = consoleMsgs.filter(m => m.text.includes('[Cycle Detection] Valid feedback'));

    expect(warnings.length).toBeGreaterThan(0);
    expect(infos.length).toBeGreaterThan(0);

    // Check specific warning text
    expect(warnings[0].text).toContain("Feedback loop detected without a Delay node");
    // Check specific success/info text
    expect(infos[0].text).toContain("Valid feedback loop detected");
  });
});
