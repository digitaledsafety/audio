const { test, expect } = require('@playwright/test');

test.describe('Workspace Export and Import Functionality', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('/');
    await page.waitForSelector('#cta-button');
    await page.locator('#cta-button').click();

    // Wait for the initial random workspace nodes to be loaded in the editor
    await page.waitForFunction(() => window.editor && window.editor.getNodes().length > 0);
  });

  test('should successfully export, clear, and import a workspace', async ({ page }) => {
    // 1. Clear existing workspace programmatically to ensure a clean state
    await page.evaluate(async () => {
        try {
            await window.editor.clear();
        } catch (err) {
            console.error("Error during editor clear:", err);
        }
    });

    // 2. Add two nodes: Tone Generator and Master (Output)
    await page.locator('#addNodeToggle').click();
    await page.locator('#addToneGeneratorNodeBtn').click();

    await page.locator('#addNodeToggle').click();
    await page.locator('#addMasterGainOutputNodeBtn').click();

    // Verify nodes are added
    await expect(page.locator('text=Tone Generator').first()).toBeVisible();
    await expect(page.locator('text=Master').first()).toBeVisible();

    // 3. Connect them programmatically
    await page.evaluate(async () => {
        const nodes = Array.from(window.editor.getNodes());
        const toneNode = nodes.find(n => n.label === 'Tone Generator');
        const masterNode = nodes.find(n => n.label === 'Master');
        await window.editor.addConnection(new window.Rete.ClassicPreset.Connection(toneNode, 'audio', masterNode, 'audio'));
    });

    // Verify visual connection is added in Rete
    const initialConnectionsCount = await page.evaluate(() => window.editor.getConnections().length);
    expect(initialConnectionsCount).toBe(1);

    // 4. Export the workspace to a JSON file
    await page.locator('#settingsToggle').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#exportWorkspaceBtn').click();
    const download = await downloadPromise;
    const downloadPath = await download.path();

    // 5. Clear the editor programmatically (so it has 0 nodes)
    await page.evaluate(async () => {
        await window.editor.clear();
    });

    // Verify editor is empty
    const clearedNodesCount = await page.evaluate(() => window.editor.getNodes().length);
    expect(clearedNodesCount).toBe(0);

    // 6. Import the exported workspace back (editor is empty, so NO confirmation dialog)
    // Settings dropdown might be closed, so let's make sure it's open
    const settingsDropdown = page.locator('#settingsDropdown');
    if (await settingsDropdown.isHidden()) {
        await page.locator('#settingsToggle').click();
    }
    const importInput = page.locator('#importWorkspaceInput');
    await importInput.setInputFiles(downloadPath);

    // Verify that the nodes and connection are fully restored
    // Close settings if it's open to see the editor clearly
    if (await settingsDropdown.isVisible()) {
        await page.locator('#settingsToggle').click();
    }
    await expect(page.locator('text=Tone Generator').first()).toBeVisible();
    await expect(page.locator('text=Master').first()).toBeVisible();

    const restoredConnectionsCount = await page.evaluate(() => window.editor.getConnections().length);
    expect(restoredConnectionsCount).toBe(1);

    // 7. Verify import with confirmation dialog (when editor is NOT empty)
    // Register a dialog listener to automatically accept the confirmation prompt
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to import this workspace');
      await dialog.accept();
    });

    // Try importing again while the workspace already has nodes (should trigger confirmation dialog)
    if (await settingsDropdown.isHidden()) {
        await page.locator('#settingsToggle').click();
    }
    await importInput.setInputFiles(downloadPath);

    // Verify workspace is still successfully loaded and has exactly 1 connection (not duplicated)
    if (await settingsDropdown.isVisible()) {
        await page.locator('#settingsToggle').click();
    }
    await expect(page.locator('text=Tone Generator').first()).toBeVisible();
    await expect(page.locator('text=Master').first()).toBeVisible();

    const restoredConnectionsCount2 = await page.evaluate(() => window.editor.getConnections().length);
    expect(restoredConnectionsCount2).toBe(1);
  });
});
