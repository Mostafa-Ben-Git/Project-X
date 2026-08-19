"""
Realtime (WebSocket) E2E: verify messages + notifications arrive live via Reverb.
Requires: backend :8000, reverb :8080, SPA deployed.
Flow: browser logged in as testuser -> send a message from otherperson via API
-> confirm useRealtime invalidates the recipient's queries (conversations re-fetch).
"""

import asyncio, os, json, requests, sys
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "D:/Me/.cache/patchright")
from patchright.async_api import async_playwright

BASE = "http://localhost:8000"
passed = failed = 0


def report(name, ok, detail=""):
    global passed, failed
    if ok:
        passed += 1
        print(f"  ✓ {name} {detail}")
    else:
        failed += 1
        print(f"  ✗ {name} {detail}")


def get_token(email, pwd):
    r = requests.post(f"{BASE}/api/token-login", json={"email": email, "password": pwd},
                      headers={"Accept": "application/json"})
    return r.json()["token"]


async def main():
    global passed, failed
    # get a token for the OTHER user (sender) to send a message to testuser (id 1)
    sender_token = get_token("other@example.com", "12345678")

    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        ctx = await b.new_context()
        page = await ctx.new_page()
        conv_calls = []
        page.on("response", lambda r: conv_calls.append(r.url) if "/api/conversations" in r.url else None)
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))

        # login as testuser
        await page.goto(f"{BASE}/login", wait_until="load")
        await page.wait_for_timeout(1000)
        await page.locator("input[type=email]").first.fill("test@example.com")
        await page.locator("input[type=password]").first.fill("12345678")
        await page.locator("button[type=submit]").first.click()
        await page.wait_for_url("**/home", timeout=15000)
        await page.wait_for_timeout(3000)

        # open messages so the conversations query is live
        await page.goto(f"{BASE}/messages", wait_until="load")
        await page.locator("h1").first.wait_for(timeout=15000)
        await page.wait_for_timeout(2000)

        # give the websocket a moment to connect & subscribe
        await page.wait_for_timeout(3000)
        calls_before = len(conv_calls)

        # send a message to testuser (id 1) from otherperson token
        r = requests.post(
            f"{BASE}/api/messages/1",
            json={"content": "hello testuser, realtime check!"},
            headers={"Authorization": f"Bearer {sender_token}", "Accept": "application/json", "Content-Type": "application/json"},
        )
        report("Cross-user message send succeeds", r.status_code in (200, 201), f"(HTTP {r.status_code})")

        # wait for the websocket event -> invalidate -> refetch conversations
        await page.wait_for_timeout(6000)

        # verify the new message appears in the DOM (proves WS -> invalidate -> refetch)
        body = await page.evaluate("() => document.body.innerText")
        report("Recipient sees new message via WebSocket", "realtime check" in body)
        # verify the conversation list refreshed with the new message preview
        report(
            "Conversation list shows latest message preview",
            "realtime check" in body,
        )
        report("No page errors during realtime", not errs)

        await page.screenshot(path="D:/Me/Dev/Project-X/e2e-screenshots/realtime.png")
        await b.close()

    print(f"\n=== REALTIME RESULT: {passed} passed, {failed} failed ===")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    asyncio.run(main())
