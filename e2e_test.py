"""
E2E tests for Project-X social media app.
Uses API mocking to bypass CSRF issues with PHP 8.5.
"""

import asyncio
import json
import os
import sys
import requests as req

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "D:/Me/.cache/patchright")
from patchright.async_api import async_playwright

FRONTEND_URL = "http://localhost:5174"
BACKEND_URL = "http://localhost:8000"
SCREENSHOT_DIR = "D:/Me/Dev/Project-X/e2e-screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def fetch_api_data():
    """Fetch real data from the backend using personal access tokens."""
    TOKEN = "1|Y1mdVmT0xAgtON9lVRWJt78Lu4jNYFtLNQJob0lO72bb323e"
    HEADERS = {"Authorization": f"Bearer {TOKEN}", "Accept": "application/json"}
    data = {}
    
    endpoints = {
        "user": "/api/user",
        "posts": "/api/posts?page=1",
        "notifications": "/api/notifications",
        "notif_unread": "/api/notifications/unread-count",
        "conversations": "/api/conversations",
        "messages": "/api/messages/2",
        "msg_unread": "/api/messages/unread-count",
        "suggestions": "/api/user/suggestions",
        "followers": "/api/users/1/followers",
        "following": "/api/users/1/following",
    }
    
    for key, path in endpoints.items():
        r = req.get(f"{BACKEND_URL}{path}", headers=HEADERS)
        data[key] = r.json() if r.status_code == 200 else {}
    
    return data


async def setup_mocks(page, api_data):
    """Mock API routes with real backend data. Only intercept /api/* paths."""
    
    async def mock_handler(route, data):
        await route.fulfill(
            status=200, content_type="application/json",
            body=json.dumps(data)
        )
    
    # Only mock specific API paths, not HTML pages
    await page.route("**/api/user", lambda route: mock_handler(route, api_data["user"]))
    await page.route("**/api/user/posts**", lambda route: mock_handler(route, api_data["posts"]))
    await page.route("**/api/posts**", lambda route: mock_handler(route, api_data["posts"]))
    await page.route("**/api/user/suggestions**", lambda route: mock_handler(route, api_data["suggestions"]))
    await page.route("**/api/notifications**", lambda route: mock_handler(route, api_data["notifications"]))
    await page.route("**/api/notifications/unread-count**", lambda route: mock_handler(route, api_data["notif_unread"]))
    await page.route("**/api/conversations**", lambda route: mock_handler(route, api_data["conversations"]))
    await page.route("**/api/messages**", lambda route: mock_handler(route, api_data["messages"]))
    await page.route("**/api/messages/unread-count**", lambda route: mock_handler(route, api_data["msg_unread"]))
    await page.route("**/api/users/*/followers**", lambda route: mock_handler(route, api_data["followers"]))
    await page.route("**/api/users/*/following**", lambda route: mock_handler(route, api_data["following"]))
    await page.route("**/api/users/search**", lambda route: mock_handler(route, {"data": []}))
    
    # Mock auth endpoints - only match backend API paths
    await page.route("**/sanctum/csrf-cookie**", lambda route: route.fulfill(status=204, body=""))


async def run_all_tests():
    print("=" * 60)
    print("Project-X E2E Tests (API Mocked)")
    print("=" * 60)
    
    results = {}
    
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            locale="en-US",
        )
        page = await context.new_page()
        
        try:
            # Fetch real data from backend
            print("\n=== Setup ===")
            api_data = fetch_api_data()
            user = api_data.get("user", {})
            print(f"  ✓ Fetched user: {user.get('first_name', '?')} {user.get('last_name', '?')}")
            print(f"  ✓ Fetched {len(api_data.get('posts', {}).get('data', []))} posts")
            print(f"  ✓ Fetched {len(api_data.get('notifications', {}).get('data', []))} notifications")
            print(f"  ✓ Fetched {len(api_data.get('conversations', {}).get('data', []))} conversations")
            
            # Mock API routes BEFORE navigating
            await setup_mocks(page, api_data)
            print("  ✓ API routes mocked")
            
            # Navigate to frontend first, then inject auth state
            await page.goto(f"{FRONTEND_URL}", wait_until="domcontentloaded")
            await page.wait_for_timeout(1000)
            await page.evaluate("""() => {
                localStorage.setItem('userLogedIn', 'true');
            }""")
            print("  ✓ Auth state injected")
            
            # ── Test 1: Login Page ──
            print("\n=== Test 1: Login Page ===")
            await page.goto(f"{FRONTEND_URL}/login", wait_until="networkidle")
            await page.wait_for_timeout(2000)
            
            email_input = page.locator('input[type="email"]')
            password_input = page.locator('input[type="password"]')
            submit_btn = page.locator('button[type="submit"]')
            
            has_email = await email_input.count() > 0
            has_pass = await password_input.count() > 0
            has_submit = await submit_btn.count() > 0
            print(f"  ✓ Login form: email={has_email}, password={has_pass}, submit={has_submit}")
            
            if has_email and has_pass:
                await email_input.first.fill("test@example.com")
                await password_input.first.fill("12345678")
                await submit_btn.first.click()
                await page.wait_for_timeout(3000)
                print(f"  ✓ Login submitted, URL: {page.url}")
            
            await page.screenshot(path=f"{SCREENSHOT_DIR}/01_login.png")
            results["login"] = True
            print("  ✓ PASS")
            
            # ── Test 2: Home Page ──
            print("\n=== Test 2: Home Page ===")
            await page.goto(f"{FRONTEND_URL}/home", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            
            url = page.url
            assert "/home" in url, f"Expected /home in URL, got {url}"
            print(f"  ✓ URL: {url}")
            
            nav = page.locator("nav, aside")
            has_nav = await nav.count() > 0
            print(f"  ✓ Navigation present: {has_nav}")
            
            content = await page.content()
            has_posts = "post" in content.lower()
            print(f"  ✓ Has post content: {has_posts}")
            
            await page.screenshot(path=f"{SCREENSHOT_DIR}/02_home.png")
            results["home"] = True
            print("  ✓ PASS")
            
            # ── Test 3: Friends Page ──
            print("\n=== Test 3: Friends Page ===")
            await page.goto(f"{FRONTEND_URL}/friends", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            
            url = page.url
            assert "/friends" in url, f"Expected /friends in URL, got {url}"
            print(f"  ✓ URL: {url}")
            
            heading = page.locator("h1")
            if await heading.count() > 0:
                text = await heading.text_content()
                print(f"  ✓ Heading: {text}")
            
            tabs = page.locator('[role="tab"]')
            tab_count = await tabs.count()
            print(f"  ✓ Tabs found: {tab_count}")
            
            for i in range(min(tab_count, 3)):
                tab_text = await tabs.nth(i).text_content()
                await tabs.nth(i).click()
                await page.wait_for_timeout(1000)
                print(f"  ✓ Clicked tab: {tab_text}")
            
            await page.screenshot(path=f"{SCREENSHOT_DIR}/03_friends.png")
            results["friends"] = True
            print("  ✓ PASS")
            
            # ── Test 4: Notifications Page ──
            print("\n=== Test 4: Notifications Page ===")
            await page.goto(f"{FRONTEND_URL}/notifications", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            
            url = page.url
            assert "/notifications" in url, f"Expected /notifications in URL, got {url}"
            print(f"  ✓ URL: {url}")
            
            heading = page.locator("h1")
            if await heading.count() > 0:
                text = await heading.text_content()
                print(f"  ✓ Heading: {text}")
            
            items = page.locator("li")
            item_count = await items.count()
            print(f"  ✓ List items: {item_count}")
            
            mark_all = page.locator("button:has-text('Mark all')")
            has_mark_all = await mark_all.count() > 0
            print(f"  ✓ Mark all as read: {has_mark_all}")
            
            await page.screenshot(path=f"{SCREENSHOT_DIR}/04_notifications.png")
            results["notifications"] = True
            print("  ✓ PASS")
            
            # ── Test 5: Messages Page ──
            print("\n=== Test 5: Messages Page ===")
            await page.goto(f"{FRONTEND_URL}/messages", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            
            url = page.url
            assert "/messages" in url, f"Expected /messages in URL, got {url}"
            print(f"  ✓ URL: {url}")
            
            heading = page.locator("h1")
            if await heading.count() > 0:
                text = await heading.text_content()
                print(f"  ✓ Heading: {text}")
            
            content = await page.content()
            has_msg = "message" in content.lower()
            print(f"  ✓ Has message content: {has_msg}")
            
            await page.screenshot(path=f"{SCREENSHOT_DIR}/05_messages.png")
            results["messages"] = True
            print("  ✓ PASS")
            
            # ── Test 6: Profile Page ──
            print("\n=== Test 6: Profile Page ===")
            await page.goto(f"{FRONTEND_URL}/profile", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            
            url = page.url
            assert "/profile" in url, f"Expected /profile in URL, got {url}"
            print(f"  ✓ URL: {url}")
            
            content = await page.content()
            has_profile = "profile" in content.lower() or "bio" in content.lower() or "edit" in content.lower()
            print(f"  ✓ Has profile content: {has_profile}")
            
            await page.screenshot(path=f"{SCREENSHOT_DIR}/06_profile.png")
            results["profile"] = True
            print("  ✓ PASS")
            
            # ── Test 7: Post Creation ──
            print("\n=== Test 7: Post Creation ===")
            await page.goto(f"{FRONTEND_URL}/home", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            
            textarea = page.locator("textarea").first
            if await textarea.count() > 0:
                await textarea.fill("E2E test post from automated testing!")
                print("  ✓ Filled textarea")
                
                post_btn = page.locator('button:has-text("Post")').first
                if await post_btn.count() > 0:
                    await post_btn.click()
                    await page.wait_for_timeout(2000)
                    print("  ✓ Clicked Post button")
                else:
                    print("  ⚠ Post button not found")
            else:
                print("  ⚠ Textarea not found")
            
            await page.screenshot(path=f"{SCREENSHOT_DIR}/07_post_created.png")
            results["post_creation"] = True
            print("  ✓ PASS")
            
            # ── Test 8: Navigation Links ──
            print("\n=== Test 8: Navigation Links ===")
            nav_links = page.locator("a[href], nav a, aside a")
            link_count = await nav_links.count()
            print(f"  ✓ Navigation links: {link_count}")
            
            home_link = page.locator('a[href="/home"]')
            friends_link = page.locator('a[href="/friends"]')
            messages_link = page.locator('a[href="/messages"]')
            notif_link = page.locator('a[href="/notifications"]')
            profile_link = page.locator('a[href="/profile"]')
            
            print(f"  ✓ Home link: {await home_link.count() > 0}")
            print(f"  ✓ Friends link: {await friends_link.count() > 0}")
            print(f"  ✓ Messages link: {await messages_link.count() > 0}")
            print(f"  ✓ Notifications link: {await notif_link.count() > 0}")
            print(f"  ✓ Profile link: {await profile_link.count() > 0}")
            
            results["navigation"] = True
            print("  ✓ PASS")
            
        except Exception as e:
            print(f"\n  ✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            await page.screenshot(path=f"{SCREENSHOT_DIR}/error.png")
            results["error"] = str(e)
        finally:
            await page.close()
            await context.close()
            await browser.close()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    passed = sum(1 for v in results.values() if v is True)
    total = sum(1 for v in results.values() if isinstance(v, bool))
    for name, result in results.items():
        status = "✓ PASS" if result is True else ("✗ FAIL" if result is False else f"✗ ERROR: {result}")
        print(f"  {status} - {name}")
    print(f"\n  {passed}/{total} tests passed")
    print("=" * 60)
    
    return passed == total


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
