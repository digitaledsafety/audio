import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        try:
            # Navigate to the app
            print("Navigating to http://localhost:8000/")
            await page.goto('http://localhost:8000/', wait_until="networkidle")

            # Click Enter the Studio
            print("Clicking #cta-button")
            await page.click('#cta-button')

            # Wait for randomization and editor to load
            print("Waiting for nodes...")
            # Instead of wait_for_selector which might be failing due to some weirdness,
            # let's just wait for the Master node specifically.
            master_node = page.locator('.node[data-node-label="Master"]')
            await master_node.wait_for(timeout=60000)
            print("Found Master node")

            # Check for sockets and their data-socket-key
            sockets = master_node.locator('.socket')
            count = await sockets.count()
            print(f"Total sockets found in Master node: {count}")

            for i in range(count):
                key = await sockets.nth(i).get_attribute('data-socket-key')
                side = await sockets.nth(i).get_attribute('data-type') or ("input" if "input" in await sockets.nth(i).get_attribute("class") else "output")
                label = await sockets.nth(i).evaluate("el => el.parentElement.innerText")
                print(f"Socket {i}: side={side}, key={key}, label='{label.strip()}'")

            # Verify specifically that 'audio' comes before 'gain_cv' (as they are added in that order)
            # and that they have the correct keys.

            # Check for other nodes too
            filter_node = page.locator('.node[data-node-label="Filter"]').first()
            if await filter_node.count() > 0:
                print("\nFilter node sockets:")
                f_sockets = filter_node.locator('.socket')
                f_count = await f_sockets.count()
                for i in range(f_count):
                    key = await f_sockets.nth(i).get_attribute('data-socket-key')
                    label = await f_sockets.nth(i).evaluate("el => el.parentElement.innerText")
                    print(f"  Socket {i}: key={key}, label='{label.strip()}'")

            await page.screenshot(path='verification_final.png')

        except Exception as e:
            print(f"Error during diagnostic: {e}")
            await page.screenshot(path='error_final.png')
        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
