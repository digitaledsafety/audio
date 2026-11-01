const { test, expect } = require('@playwright/test');

test.describe('Modular Odyssey Workspace Showcase', () => {
  test('should load modular-odyssey workspace in studio with all nodes and connections intact', async ({ page }) => {
    // Navigate directly with workspace URL param
    await page.goto('/index.html?workspace=modular-odyssey');

    // Dismiss splash / CTA if present
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }

    // Wait for editor to initialize and load nodes
    await page.waitForFunction(() => window.editor && window.editor.getNodes().length >= 17);

    // Verify expected node count and connection count
    const nodeCount = await page.evaluate(() => window.editor.getNodes().length);
    const connCount = await page.evaluate(() => window.editor.getConnections().length);
    expect(nodeCount).toBe(17);
    expect(connCount).toBe(18);

    // Verify distinct key nodes are rendered
    await expect(page.locator('text=Drum Machine').first()).toBeVisible();
    await expect(page.locator('text=Turing Machine').first()).toBeVisible();
    await expect(page.locator('text=Quantizer').first()).toBeVisible();
    await expect(page.locator('text=Chord Generator').first()).toBeVisible();
    await expect(page.locator('text=Stereo Widener').first()).toBeVisible();
    await expect(page.locator('text=Compressor').first()).toBeVisible();
    await expect(page.locator('text=Visualizer').first()).toBeVisible();

    // Start playback via play button
    const playBtn = page.locator('#playStopBtn');
    await expect(playBtn).toBeVisible();
    await playBtn.click();

    // Verify play button indicates playing (stop button emoji)
    await expect(playBtn).toHaveText('⏹️');

    // Wait briefly for audio nodes to run
    await page.waitForTimeout(500);

    // Stop playback
    await playBtn.click();
    await expect(playBtn).toHaveText('▶️');
  });

  test('should appear in Showcase Gallery and open in preview modal', async ({ page }) => {
    await page.goto('/showcase.html');

    // Filter by searching Modular Odyssey
    const searchInput = page.locator('#search-input');
    await searchInput.fill('Modular Odyssey');

    // Verify card is rendered
    const card = page.locator('.group:has-text("Modular Odyssey")');
    await expect(card).toBeVisible();

    // Check preview button
    const previewBtn = card.locator('button:has-text("Quick Preview")');
    await expect(previewBtn).toBeVisible();
    await previewBtn.click();

    // Modal should be open with correct title
    const modal = page.locator('#preview-modal');
    await expect(modal).toBeVisible();
    const modalTitle = page.locator('#modal-title');
    await expect(modalTitle).toContainText('Modular Odyssey');

    // Close preview modal
    await page.locator('#modal-close-btn').click();
    await expect(modal).toBeHidden();
  });
});
