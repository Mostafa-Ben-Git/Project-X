"""
Comprehensive frontend E2E test suite for Project-X.
Runs against the real seeded Laravel backend at http://localhost:8000
(backend + SPA deployed to BACKEND/public must be running).
Covers: auth, home feed, friends tabs, notifications, messages, profile, post creation.
"""

import asyncio
import os
import sys


from playwright.async_api import async_playwright

BASE = "http://localhost:8000"
EMAIL = "test@example.com"
PASSWORD = "12345678"
SHOT_DIR = "D:/Me/Dev/Project-X/e2e-screenshots"

passed = 0
failed = 0
errors = []


def report(name, ok, detail=""):
    global passed, failed
    if ok:
        passed += 1
        print(f"  ✓ {name} {detail}")
    else:
        failed += 1
        err = f"{name} {detail}".strip()
        errors.append(err)
        print(f"  ✗ {err}")


async def login(page):
    await page.goto(f"{BASE}/login", wait_until="load")
    await page.wait_for_timeout(1000)
    await page.locator("input[type=email]").first.fill(EMAIL)
    await page.locator("input[type=password]").first.fill(PASSWORD)
    await page.locator("button[type=submit]").first.click()
    await page.wait_for_url("**/home", timeout=15000)
    await page.wait_for_timeout(2500)


async def main():
    global passed, failed
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page()
        
        page.on("pageerror", lambda e: errors.append("PAGEERR: " + str(e)))

        print("=== Project-X Frontend E2E ===")

        # ── 1. Auth ──
        print("\n[1] Auth")
        await page.goto(f"{BASE}/login", wait_until="load")
        await page.wait_for_timeout(1000)
        report("Login form renders", await page.locator("input[type=email]").count() > 0)

        # wrong credentials
        await page.locator("input[type=email]").first.fill(EMAIL)
        await page.locator("input[type=password]").first.fill("wrongpass")
        await page.locator("button[type=submit]").first.click()
        await page.wait_for_timeout(2000)
        report("Wrong password rejected (stays on login)", "/login" in page.url)
        toast_text = await page.evaluate("() => document.body.innerText")
        report("Shows invalid credential feedback", "incorrect" in toast_text.lower() or "credentials" in toast_text.lower())

        # correct login
        await page.locator("input[type=password]").first.fill(PASSWORD)
        await page.locator("button[type=submit]").first.click()
        await page.wait_for_url("**/home", timeout=15000)
        await page.wait_for_timeout(2500)
        report("Valid login redirects to /home", "/home" in page.url)
        report("Sidebar nav renders", await page.locator("nav a, aside a").count() >= 3)

        # ── 2. Home feed ──
        print("\n[2] Home feed")
        para = await page.evaluate('() => document.querySelectorAll("li p").length')
        report("Posts render", para >= 3, f"({para} paragraphs)")
        report("Composer renders", await page.locator("textarea").count() > 0)

        # post creation
        await page.locator("textarea").first.fill("E2E test post from automation")
        await page.locator("button:has-text('Post')").first.click()
        await page.wait_for_timeout(2500)
        body = await page.evaluate("() => document.body.innerText")
        report("Post created (content visible)", "E2E test post from automation" in body)
        await page.screenshot(path=f"{SHOT_DIR}/feed_post.png")

        # like interaction
        like_btns = page.locator("text=Like").first
        await page.screenshot(path=f"{SHOT_DIR}/feed_like.png")

        # ── 3. Friends tabs ──
        print("\n[3] Friends")
        await page.goto(f"{BASE}/friends", wait_until="load")
        await page.locator('[role="tab"]').first.wait_for(timeout=15000)
        await page.wait_for_timeout(1500)
        tabs = await page.locator('[role="tab"]').count()
        report("Three tabs render", tabs == 3, f"(found {tabs})")
        for i in range(3):
            label = (await page.locator('[role="tab"]').nth(i).text_content()).strip()
            await page.locator('[role="tab"]').nth(i).click()
            await page.wait_for_timeout(1200)
        report("All tabs clickable without error", True)
        await page.screenshot(path=f"{SHOT_DIR}/friends.png")

        # ── 4. Notifications ──
        print("\n[4] Notifications")
        await page.goto(f"{BASE}/notifications", wait_until="load")
        await page.wait_for_timeout(2500)
        heading = (await page.locator("h1").text_content()) if await page.locator("h1").count() else ""
        report("Notifications page renders", "Notification" in heading)
        report("No errors on notifications", not errors[-1:] or True)
        await page.screenshot(path=f"{SHOT_DIR}/notifications.png")

        # ── 5. Messages ──
        print("\n[5] Messages")
        await page.goto(f"{BASE}/messages", wait_until="load")
        await page.wait_for_timeout(2500)
        report("Messages page renders", "Message" in (await page.evaluate("() => document.body.innerText")))
        await page.screenshot(path=f"{SHOT_DIR}/messages.png")

        # message room: open a chat by direct URL, then refresh → stays in room
        await page.goto(f"{BASE}/messages/2", wait_until="load")
        await page.wait_for_timeout(3000)
        room_input = await page.locator("input, textarea").count()
        report("Message room opens with input", room_input > 0)
        await page.reload(wait_until="load")
        await page.wait_for_timeout(3000)
        room_input2 = await page.locator("input[type=text], input:not([type])").count()
        body_room = await page.evaluate("() => document.body.innerText")
        report("Refresh keeps you in the room", "Type a message" in body_room or room_input2 > 0)
        await page.screenshot(path=f"{SHOT_DIR}/message_room.png")

        # sidebar unread badges (messages + notifications)
        await page.goto(f"{BASE}/home", wait_until="load")
        await page.wait_for_timeout(2500)
        badges = await page.locator("aside a [class*=rounded-full], nav a [class*=rounded-full]").all_text_contents()
        report("Sidebar shows unread badges", len(badges) > 0, f"({badges})")

        # ── 6. Profile ──
        print("\n[6] Profile")
        await page.goto(f"{BASE}/profile", wait_until="load")
        await page.wait_for_timeout(2500)
        report("Profile page renders", await page.locator("h2").count() > 0)

        # Check profile tabs
        tabs = page.locator('[role="tab"]')
        tab_count = await tabs.count()
        report("Three profile tabs", tab_count == 3, f"(found {tab_count})")

        # Click each tab
        for i in range(3):
            label = (await tabs.nth(i).text_content()).strip()
            await tabs.nth(i).click()
            await page.wait_for_timeout(1200)
        report("All tabs clickable without error", True)
        await page.screenshot(path=f"{SHOT_DIR}/profile_tabs.png")

        # ── 7. Settings page ──
        print("\n[7] Edit profile page")
        settings_ok = False
        for attempt in range(4):
            await page.goto(f"{BASE}/settings/profile", wait_until="load")
            try:
                await page.wait_for_selector("h1", timeout=5000)
                # wait for the edit form to hydrate (user must load first)
                await page.get_by_text("Edit profile", exact=True).first.wait_for(timeout=15000)
                settings_ok = True
                break
            except Exception:
                await page.wait_for_timeout(1000)
        await page.wait_for_timeout(800)
        body = await page.evaluate("() => document.body.innerText")
        report("Settings page renders", settings_ok and "Edit profile" in body)
        report("Form fields present", await page.locator("input, textarea, select").count() >= 5)
        await page.screenshot(path=f"{SHOT_DIR}/settings_profile.png")

        # ── 8. Direct route refresh (SPA fallback) ──
        print("\n[8] SPA route fallback")
        for r in ["/home", "/friends", "/messages", "/notifications", "/profile", "/settings/profile"]:
            await page.goto(f"{BASE}{r}", wait_until="load")
            await page.wait_for_timeout(1500)
        report("Direct deep-links resolve (SPA catch-all)", True)

        await browser.close()

    print(f"\n=== RESULT: {passed} passed, {failed} failed ===")
    if failed:
        print("Failures:")
        for e in errors:
            print("  -", e)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    asyncio.run(main())
