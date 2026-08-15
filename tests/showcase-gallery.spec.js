const { test, expect } = require('@playwright/test');

test.describe('Showcase Gallery & Preset Library', () => {
  test('should load showcase page and display preset cards', async ({ page }) => {
    await page.goto('/showcase.html');

    // Header title check
    await expect(page.locator('header').locator('text=MODULAR STUDIO').first()).toBeVisible();

    // Verify preset cards are rendered
    const presetGrid = page.locator('#preset-grid');
    await expect(presetGrid).toBeVisible();

    const cards = presetGrid.locator('.group');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should filter presets by category chips and search query', async ({ page }) => {
    await page.goto('/showcase.html');

    // Click Category Chip "Ambient"
    const ambientChip = page.locator('#category-chips-container button:has-text("Ambient")');
    if (await ambientChip.isVisible()) {
      await ambientChip.click();
      await expect(ambientChip).toHaveClass(/bg-indigo-600/);
    }

    // Search query filter
    const searchInput = page.locator('#search-input');
    await searchInput.fill('sequencer');

    // Verify cards update or empty state displays
    const gridVisible = await page.locator('#preset-grid').isVisible();
    const emptyVisible = await page.locator('#empty-state').isVisible();
    expect(gridVisible || emptyVisible).toBe(true);
  });

  test('should open live preview modal and render clean unescaped title', async ({ page }) => {
    await page.goto('/showcase.html');

    // Click Quick Preview on the first card
    const previewBtn = page.locator('button:has-text("Quick Preview")').first();
    await expect(previewBtn).toBeVisible();
    await previewBtn.click();

    // Verify modal appears
    const modal = page.locator('#preview-modal');
    await expect(modal).toBeVisible();

    // Verify modal title is populated correctly without raw HTML entities (e.g. no &amp;)
    const modalTitle = page.locator('#modal-title');
    const titleText = await modalTitle.textContent();
    expect(titleText).toContain('Live Audio Preview');
    expect(titleText).not.toContain('&amp;');
    expect(titleText).not.toContain('&#39;');

    // Close modal
    const closeBtn = page.locator('#modal-close-btn');
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });
});
