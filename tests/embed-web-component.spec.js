const { test, expect } = require('@playwright/test');

test.describe('Modular Synthesizer Embed & Web Component', () => {

  test('should register <modular-synth> custom element and render Shadow DOM controls', async ({ page }) => {
    // Navigate to a blank page on the server and inject the script
    await page.goto('/showcase.html');

    // Create an inline test container for the custom element
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = '/assets/js/modular-embed.js';
      document.head.appendChild(script);
    });

    // Wait for custom element to be defined
    await page.waitForFunction(() => !!customElements.get('modular-synth'));

    // Insert <modular-synth> into page
    await page.evaluate(() => {
      const synth = document.createElement('modular-synth');
      synth.setAttribute('id', 'test-embed-synth');
      synth.setAttribute('workspace', 'ambient-garden');
      synth.setAttribute('volume', '0.6');
      document.body.appendChild(synth);
    });

    const synthEl = page.locator('#test-embed-synth');
    await expect(synthEl).toBeVisible();

    // Verify shadow DOM contains top bar, poster overlay, controls, and iframe
    const hasShadowRoot = await synthEl.evaluate(el => !!el.shadowRoot);
    expect(hasShadowRoot).toBe(true);

    const titleText = await synthEl.evaluate(el => el.shadowRoot.querySelector('#display-title')?.textContent);
    expect(titleText).toContain('Ambient Garden');

    const iframeSrc = await synthEl.evaluate(el => el.shadowRoot.querySelector('#synth-iframe')?.src);
    expect(iframeSrc).toContain('workspace=ambient-garden');
    expect(iframeSrc).toContain('embed=true');
    expect(iframeSrc).toContain('preview=true');

    const volumeVal = await synthEl.evaluate(el => el.shadowRoot.querySelector('#volume-slider')?.value);
    expect(volumeVal).toBe('0.6');

    // Check Open in Studio link
    const studioLink = await synthEl.evaluate(el => el.shadowRoot.querySelector('#open-studio-link')?.href);
    expect(studioLink).toContain('workspace=ambient-garden');
  });

  test('should handle Click-to-Play interaction and toggle play/pause state', async ({ page }) => {
    await page.goto('/showcase.html');

    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = '/assets/js/modular-embed.js';
      document.head.appendChild(script);
    });
    await page.waitForFunction(() => !!customElements.get('modular-synth'));

    await page.evaluate(() => {
      const synth = document.createElement('modular-synth');
      synth.setAttribute('id', 'interactive-synth');
      synth.setAttribute('workspace', 'waves-drone');
      document.body.appendChild(synth);
    });

    const synthEl = page.locator('#interactive-synth');
    await expect(synthEl).toBeVisible();

    // Verify poster overlay is visible before interaction
    const posterHiddenBefore = await synthEl.evaluate(el => {
      const poster = el.shadowRoot.querySelector('#poster-overlay');
      return poster ? poster.classList.contains('hidden') : false;
    });
    expect(posterHiddenBefore).toBe(false);

    // Click poster play button
    await synthEl.evaluate(el => {
      el.shadowRoot.querySelector('#poster-play-btn')?.click();
    });

    // Poster overlay should now be hidden
    const posterHiddenAfter = await synthEl.evaluate(el => {
      const poster = el.shadowRoot.querySelector('#poster-overlay');
      return poster ? poster.classList.contains('hidden') : false;
    });
    expect(posterHiddenAfter).toBe(true);

    // Play button label should indicate Pause
    const playLabel = await synthEl.evaluate(el => {
      return el.shadowRoot.querySelector('#play-label')?.textContent;
    });
    expect(playLabel).toBe('Pause');

    // Clicking play-btn again toggles back to Play
    await synthEl.evaluate(el => {
      el.shadowRoot.querySelector('#play-btn')?.click();
    });
    const toggledLabel = await synthEl.evaluate(el => {
      return el.shadowRoot.querySelector('#play-label')?.textContent;
    });
    expect(toggledLabel).toBe('Play');
  });

  test('should handle volume changes and update postMessage to iframe', async ({ page }) => {
    await page.goto('/showcase.html');

    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = '/assets/js/modular-embed.js';
      document.head.appendChild(script);
    });
    await page.waitForFunction(() => !!customElements.get('modular-synth'));

    await page.evaluate(() => {
      const synth = document.createElement('modular-synth');
      synth.setAttribute('id', 'vol-synth');
      synth.setAttribute('workspace', 'ambient-garden');
      document.body.appendChild(synth);
    });

    const synthEl = page.locator('#vol-synth');
    await expect(synthEl).toBeVisible();

    // Trigger volume input
    await synthEl.evaluate(el => {
      const slider = el.shadowRoot.querySelector('#volume-slider');
      slider.value = '0.85';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const componentVol = await synthEl.evaluate(el => el.volume);
    expect(componentVol).toBe(0.85);

    // Update via attribute
    await synthEl.evaluate(el => {
      el.setAttribute('volume', '0.25');
    });
    const updatedSliderVal = await synthEl.evaluate(el => el.shadowRoot.querySelector('#volume-slider')?.value);
    expect(updatedSliderVal).toBe('0.25');
  });

  test('should teardown iframe resources on DOM removal', async ({ page }) => {
    await page.goto('/showcase.html');

    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = '/assets/js/modular-embed.js';
      document.head.appendChild(script);
    });
    await page.waitForFunction(() => !!customElements.get('modular-synth'));

    await page.evaluate(() => {
      const synth = document.createElement('modular-synth');
      synth.setAttribute('id', 'teardown-synth');
      synth.setAttribute('workspace', 'ambient-garden');
      document.body.appendChild(synth);
    });

    const synthEl = page.locator('#teardown-synth');
    await expect(synthEl).toBeVisible();

    // Remove element from DOM
    await page.evaluate(() => {
      const el = document.getElementById('teardown-synth');
      el.remove();
    });

    await expect(synthEl).toHaveCount(0);
  });

  test('should open embed share modal on Showcase card click and populate snippets', async ({ page }) => {
    await page.goto('/showcase.html');

    // Find and click the embed button (< / >) on the first card
    const embedBtn = page.locator('button[title="Embed on 3rd-party websites"]').first();
    await expect(embedBtn).toBeVisible();
    await embedBtn.click();

    // Verify embed modal appears
    const modal = page.locator('#embed-modal');
    await expect(modal).toBeVisible();

    // Verify textarea snippets
    const webComponentCode = await page.locator('#embed-code-textarea').inputValue();
    expect(webComponentCode).toContain('<modular-synth');
    expect(webComponentCode).toContain('modular-embed.js');

    const iframeCode = await page.locator('#embed-iframe-textarea').inputValue();
    expect(iframeCode).toContain('<iframe');
    expect(iframeCode).toContain('embed=true');

    // Close modal
    const closeBtn = page.locator('#embed-modal-close-btn');
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });

  test('should load workspace accurately in iframe when ?workspace= is provided in embed mode', async ({ page }) => {
    // Directly test the embedded page inside index.html?workspace=ambient-garden&embed=true&preview=true
    await page.goto('/index.html?workspace=ambient-garden&embed=true&preview=true');

    // In embed mode, body should have is-embed class
    await expect(page.locator('body')).toHaveClass(/is-embed/);

    // Bottom nav and workspace graph should be hidden in embed mode
    await expect(page.locator('#bottom-nav')).toBeHidden();
    await expect(page.locator('#workspace-view')).toBeHidden();

    // Visualizer should be active/visible
    await expect(page.locator('#visualizer-view')).toBeVisible();

    // Verify editor loaded the nodes for ambient-garden (12 nodes)
    await page.waitForFunction(() => {
      return window.editor && window.editor.getNodes().length > 0;
    });
    const nodeCount = await page.evaluate(() => window.editor.getNodes().length);
    expect(nodeCount).toBeGreaterThanOrEqual(10);
  });

});
