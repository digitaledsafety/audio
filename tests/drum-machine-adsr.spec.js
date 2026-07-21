const { test, expect } = require('@playwright/test');

test.describe('Drum Machine and Sequencer ADSR Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Unregister service worker and clear caches to avoid loading cached stale files
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    });

    await page.reload();
    await page.waitForSelector('#cta-button');
    await page.locator('#cta-button').click();

    // Clear the editor for a clean starting state
    await page.locator('#settingsToggle').click();
    await page.locator('#clearEditorBtn').click();
    await page.locator('#settingsToggle').click();

    // Hide bottom-nav bar to prevent it from covering Rete nodes during canvas interactions
    await page.evaluate(() => {
      const bottomNav = document.getElementById('bottom-nav');
      if (bottomNav) bottomNav.style.display = 'none';
    });
  });

  const positionNodes = async (page) => {
    await page.evaluate(() => {
      const nodes = window.editor.getNodes();
      nodes.forEach((node) => {
        window.area.translate(node.id, { x: 300, y: 300 });
      });
    });
  };

  const showBottomNav = async (page) => {
    await page.evaluate(() => {
      const bottomNav = document.getElementById('bottom-nav');
      if (bottomNav) bottomNav.style.display = 'flex';
    });
  };

  const hideBottomNav = async (page) => {
    await page.evaluate(() => {
      const bottomNav = document.getElementById('bottom-nav');
      if (bottomNav) bottomNav.style.display = 'none';
    });
  };

  test('should toggle and configure ADSR Envelope controls on Drum Machine', async ({ page }) => {
    // Open Add Node dropdown
    // Note: since bottomNav is hidden, we first show it to open the dropdown
    await showBottomNav(page);
    await page.locator('#addNodeToggle').click();

    // Click Drum Machine button to add it
    await page.locator('#addDrumMachineNodeBtn').click();
    await hideBottomNav(page);

    // Position the node so it is not covered by any UI elements
    await positionNodes(page);

    // Verify Drum Machine node is visible
    const node = page.locator('[data-node-label="Drum Machine"]').first();
    await expect(node).toBeVisible();

    // ADSR inputs should be hidden by default
    const attackSlider = node.locator('input[type="range"]').nth(1); // BPM is index 0
    await expect(attackSlider).not.toBeVisible();

    // Click Envelope toggle button
    const envButton = node.locator('button:has-text("Envelope")');
    await expect(envButton).toBeVisible();
    await envButton.click();

    // ADSR inputs should now be visible
    // Drum Machine Sliders: BPM (index 0), Attack (index 1), Decay (index 2), Sustain (index 3), Release (index 4)
    await expect(node.locator('input[type="range"]').nth(1)).toBeVisible();
    await expect(node.locator('input[type="range"]').nth(2)).toBeVisible();
    await expect(node.locator('input[type="range"]').nth(3)).toBeVisible();
    await expect(node.locator('input[type="range"]').nth(4)).toBeVisible();

    // Fill new values
    await node.locator('input[type="range"]').nth(1).fill('0.45');
    await node.locator('input[type="range"]').nth(2).fill('0.85');
    await node.locator('input[type="range"]').nth(3).fill('0.35');
    await node.locator('input[type="range"]').nth(4).fill('1.25');

    // Verify values were set
    await expect(node.locator('input[type="range"]').nth(1)).toHaveValue('0.45');
    await expect(node.locator('input[type="range"]').nth(2)).toHaveValue('0.85');
    await expect(node.locator('input[type="range"]').nth(3)).toHaveValue('0.35');
    await expect(node.locator('input[type="range"]').nth(4)).toHaveValue('1.25');
  });

  test('should preserve Drum Machine ADSR visibility on save and restore', async ({ page }) => {
    // Add Drum Machine
    await showBottomNav(page);
    await page.locator('#addNodeToggle').click();
    await page.locator('#addDrumMachineNodeBtn').click();
    await hideBottomNav(page);

    await positionNodes(page);

    const dmNode = page.locator('[data-node-label="Drum Machine"]').first();
    await expect(dmNode).toBeVisible();

    // Toggle Envelope on Drum Machine so it is visible
    await dmNode.locator('button:has-text("Envelope")').click();
    await expect(dmNode.locator('input[type="range"]').nth(1)).toBeVisible();

    // Open settings and save
    await showBottomNav(page);
    await page.locator('#settingsToggle').click();
    const workspaceNameInput = page.locator('#workspaceName');
    const testName = 'DM-ADSR-Restore-Test-' + Date.now();
    await workspaceNameInput.fill(testName);
    await page.locator('#saveWorkspaceBtn').click();
    await expect(page.locator('#messageBox')).toContainText('saved');

    // Reload page
    await page.reload();
    await page.locator('#cta-button').click();

    // Load workspace
    await page.locator('#settingsToggle').click();
    const selector = page.locator('#workspaceSelector');
    await selector.selectOption(testName);
    await page.locator('#loadWorkspaceBtn').click();

    // Hide bottom nav after load
    await hideBottomNav(page);

    // Position nodes to ensure visibility
    await positionNodes(page);

    // Verify Drum Machine ADSR is still visible
    const restoredDm = page.locator('[data-node-label="Drum Machine"]').first();
    await expect(restoredDm).toBeVisible();
    await expect(restoredDm.locator('input[type="range"]').nth(1)).toBeVisible();
  });

  test('should preserve Sequencer ADSR and Random Settings visibility on save and restore', async ({ page }) => {
    // Add Sequencer
    await showBottomNav(page);
    await page.locator('#addNodeToggle').click();
    await page.locator('#addSequencerNodeBtn').click();
    await hideBottomNav(page);

    await positionNodes(page);

    const seqNode = page.locator('[data-node-label="Sequencer"]').first();
    await expect(seqNode).toBeVisible();

    // Toggle Envelope on Sequencer so it is visible
    await seqNode.locator('button:has-text("Envelope")').click();
    await expect(seqNode.locator('input[type="range"]').nth(1)).toBeVisible(); // Attack is index 1

    // Toggle Randomize Settings on Sequencer so it is visible
    await seqNode.locator('button:has-text("Randomize Settings")').click();
    // randomizeMode is a select dropdown (index 1 of selectors)
    await expect(seqNode.locator('select').nth(1)).toBeVisible(); // index 0 is noteDuration, index 1 is randomizeMode

    // Open settings and save
    await showBottomNav(page);
    await page.locator('#settingsToggle').click();
    const workspaceNameInput = page.locator('#workspaceName');
    const testName = 'Seq-ADSR-Restore-Test-' + Date.now();
    await workspaceNameInput.fill(testName);
    await page.locator('#saveWorkspaceBtn').click();
    await expect(page.locator('#messageBox')).toContainText('saved');

    // Reload page
    await page.reload();
    await page.locator('#cta-button').click();

    // Load workspace
    await page.locator('#settingsToggle').click();
    const selector = page.locator('#workspaceSelector');
    await selector.selectOption(testName);
    await page.locator('#loadWorkspaceBtn').click();

    // Hide bottom nav after load
    await hideBottomNav(page);

    // Position nodes to ensure visibility
    await positionNodes(page);

    // Verify Sequencer ADSR is still visible
    const restoredSeq = page.locator('[data-node-label="Sequencer"]').first();
    await expect(restoredSeq).toBeVisible();
    await expect(restoredSeq.locator('input[type="range"]').nth(1)).toBeVisible();

    // Verify Sequencer Random settings are still visible
    await expect(restoredSeq.locator('select').nth(1)).toBeVisible();
  });
});
