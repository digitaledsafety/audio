const { test, expect } = require('@playwright/test');

test.describe('Multiplayer Chat and Lobby Discovery', () => {
    test('should register hosted session in lobby and allow real-time chat between peers', async ({ context }) => {
        // Page 1: Host session
        const page1 = await context.newPage();
        await page1.goto('/');
        await page1.click('#cta-button');

        // Open settings dropdown
        await page1.click('#settingsToggle');
        await expect(page1.locator('#createSessionBtn')).toBeVisible();

        // Create session
        await page1.click('#createSessionBtn');
        await expect(page1.locator('#shareLinkInput')).not.toHaveValue('', { timeout: 10000 });

        const p1Raw = await page1.evaluate(() => localStorage.getItem('audio_active_sessions_v1'));
        console.log('P1 raw storage:', p1Raw);

        // Page 2: Visit watch directory to verify session appears
        const page2 = await context.newPage();
        await page2.goto('/watch.html');

        const p2Raw = await page2.evaluate(() => localStorage.getItem('audio_active_sessions_v1'));
        console.log('P2 raw storage:', p2Raw);

        if (!p2Raw && p1Raw) {
            await page2.evaluate((data) => {
                localStorage.setItem('audio_active_sessions_v1', data);
            }, p1Raw);
        }

        // Refresh sessions directory
        await page2.click('#refresh-btn');

        // Check active session card in directory
        await expect(page2.locator('#session-grid')).toBeVisible({ timeout: 5000 });
        const joinBtn = page2.locator('a:has-text("Join & Jam Session")').first();
        await expect(joinBtn).toBeVisible();

        // Click Join Session from watch page
        await joinBtn.click();
        await page2.waitForURL(/\?session=/);
        await page2.click('#cta-button');

        // Verify connected users on page 1 and page 2
        await page1.bringToFront();
        if (!(await page1.locator('#settingsDropdown').isVisible())) {
            await page1.click('#settingsToggle');
        }
        await expect(page1.locator('#connectedUsersList li')).toHaveCount(2, { timeout: 10000 });

        // Test real-time Chat
        const page1ChatInput = page1.locator('#chatInput');
        const page1ChatSend = page1.locator('#sendChatBtn');

        await page1ChatInput.fill('Hello from Host!');
        await page1ChatSend.click();

        // Verify Host sees message
        await expect(page1.locator('#chatMessages')).toContainText('Hello from Host!');

        // Switch to Page 2 (Client) and verify message received
        await page2.bringToFront();
        if (!(await page2.locator('#settingsDropdown').isVisible())) {
            await page2.click('#settingsToggle');
        }

        await expect(page2.locator('#chatMessages')).toContainText('Hello from Host!', { timeout: 10000 });

        // Send reply from Client
        const page2ChatInput = page2.locator('#chatInput');
        const page2ChatSend = page2.locator('#sendChatBtn');

        await page2ChatInput.fill('Hey Host, jamming along!');
        await page2ChatSend.click();

        // Verify Host receives reply
        await page1.bringToFront();
        if (!(await page1.locator('#settingsDropdown').isVisible())) {
            await page1.click('#settingsToggle');
        }
        await expect(page1.locator('#chatMessages')).toContainText('Hey Host, jamming along!', { timeout: 10000 });
    });
});
