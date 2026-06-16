import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        try:
            print("Navigating...")
            await page.goto('http://localhost:8000/')
            await page.click('#cta-button')

            # Wait for any node
            print("Waiting for any node...")
            await page.wait_for_selector('.node', timeout=30000)

            # Count nodes
            nodes = page.locator('.node')
            node_count = await nodes.count()
            print(f"Found {node_count} nodes.")

            for i in range(node_count):
                label = await nodes.nth(i).get_attribute('data-node-label')
                print(f"Node {i}: label={label}")
                sockets = nodes.nth(i).locator('.socket')
                s_count = await sockets.count()
                print(f"  Sockets ({s_count}):")
                for j in range(s_count):
                    key = await sockets.nth(j).get_attribute('data-socket-key')
                    stype = await sockets.nth(j).get_attribute('data-type')
                    # Get the text next to it
                    text = await sockets.nth(j).evaluate("el => el.parentElement.innerText")
                    print(f"    Socket {j}: key={key}, type={stype}, label='{text.strip()}'")

            await page.screenshot(path='final_check.png')
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
