const { test, expect } = require('@playwright/test');

test.describe('Customizable Slider Ranges', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('#cta-button');
    await page.waitForFunction(() => window.NodeRegistry && window.editor);
    await page.evaluate(async () => {
      if (window.editor) {
        await window.editor.clear();
      }
    });
  });

  test('should allow zooming slider range and reset via reset button', async ({ page }) => {
    const nodeId = await page.evaluate(async () => {
      const Constructor = window.NodeRegistry.getConstructor('ToneGeneratorNode');
      const node = new Constructor();
      await window.editor.addNode(node);
      return node.id;
    });

    const isZoomedInitially = await page.evaluate((id) => {
      const node = window.editor.getNode(id);
      const ctrl = node.controls.frequency;
      return ctrl.isZoomed();
    }, nodeId);
    expect(isZoomedInitially).toBe(false);

    // Zoom range programmatically on VCO frequency control
    await page.evaluate(async (id) => {
      const node = window.editor.getNode(id);
      if (node) {
        const ctrl = node.controls.frequency;
        ctrl.zoomRange(0.2, 500); // Narrow range around 500 Hz
        node.data.frequency_range = [ctrl.min, ctrl.max];
        // Re-render controls
        const nodeView = new window.CustomNodeComponent(node);
        const nodeEl = window.area.nodeViews.get(id).element;
        let customControls = nodeEl.children[0].getElementsByClassName("custom-controls");
        while(customControls.length > 0){
          customControls[0].parentNode.removeChild(customControls[0]);
        }
        let elements = nodeEl.children[0].getElementsByClassName("control");
        while(elements.length > 0){
          elements[0].parentNode.removeChild(elements[0]);
        }
        nodeEl.children[0].appendChild(nodeView.el);
      }
    }, nodeId);

    const resetBtn = page.locator('.reset-range-btn').first();
    await expect(resetBtn).toBeVisible();

    // Click reset button
    await resetBtn.click();

    // Verify reset button disappears after reset
    await expect(resetBtn).not.toBeVisible();

    const isZoomedAfterReset = await page.evaluate((id) => {
      const node = window.editor.getNode(id);
      return node.controls.frequency.isZoomed();
    }, nodeId);

    expect(isZoomedAfterReset).toBe(false);
  });

  test('should persist custom slider ranges in editorToJSON and restore in editorFromJSON', async ({ page }) => {
    const nodeId = await page.evaluate(async () => {
      const Constructor = window.NodeRegistry.getConstructor('FilterNode');
      const node = new Constructor();
      await window.editor.addNode(node);
      return node.id;
    });

    await page.evaluate(async (id) => {
      const node = window.editor.getNode(id);
      if (node) {
        const ctrl = node.controls.frequency;
        ctrl.zoomRange(0.2, 500);
        node.data.frequency_range = [ctrl.min, ctrl.max];
      }
    }, nodeId);

    // Export workspace JSON
    const exportedJSON = await page.evaluate(() => window.editorToJSON());
    expect(exportedJSON.nodes.length).toBeGreaterThan(0);
    expect(exportedJSON.nodes[0].data.frequency_range).toBeDefined();

    // Clear and restore
    await page.evaluate(async (json) => {
      await window.editor.clear();
      await window.editorFromJSON(json);
    }, exportedJSON);

    // Verify restored control is zoomed
    const isZoomed = await page.evaluate((id) => {
      const node = window.editor.getNode(id);
      return node ? node.controls.frequency.isZoomed() : false;
    }, nodeId);

    expect(isZoomed).toBe(true);
  });

  test('should clamp slider value when range is zoomed', async ({ page }) => {
    const nodeId = await page.evaluate(async () => {
      const Constructor = window.NodeRegistry.getConstructor('ToneGeneratorNode');
      const node = new Constructor();
      node.data.frequency = 440;
      await window.editor.addNode(node);
      const ctrl = node.controls.frequency;
      ctrl.value = 440;
      // Zoom into range [1000, 2000]
      ctrl.min = 1000;
      ctrl.max = 2000;
      ctrl.zoomRange(1, 1500); // Will clamp value
      return node.id;
    });

    const clampedValue = await page.evaluate((id) => {
      const node = window.editor.getNode(id);
      return node.controls.frequency.value;
    }, nodeId);

    expect(clampedValue).toBeGreaterThanOrEqual(1000);
    expect(clampedValue).toBeLessThanOrEqual(2000);
  });
});
