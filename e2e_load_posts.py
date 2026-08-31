"""
E2E test: loading posts on the home feed.
Runs against the real seeded Laravel backend at http://localhost:8000
(must be running + SPA deployed to BACKEND/public).
"""

import asyncio
import os
import sys


from playwright.async_api import async_playwright

BASE = "http://localhost:8000"
EMAIL = "test@example.com"
PASSWORD = "12345678"

passed = 0
failed = 0


def report(name, ok, detail=""):
    global passed, failed
    if ok:
        passed += 1
        print(f"  ✓ {name} {detail}")
    else:
        failed += 1
        print(f"  ✗ {name} {detail}")


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 800})
        

        errors = []
        posts_responses = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("response", lambda r: posts_responses.append((r.status, r.url)) if "/api/posts" in r.url else None)

        print("=== E2E: Loading posts ===")

        # 1. Login
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        await page.locator("input[type=email]").first.fill(EMAIL)
        await page.locator("input[type=password]").first.fill(PASSWORD)
        await page.locator("button[type=submit]").first.click()
        await page.wait_for_url("**/home", timeout=15000)
        await page.wait_for_timeout(3000)
        report("Login redirects to /home", "/home" in page.url)

        # 2. First page of posts loads
        text = await page.evaluate("() => document.body.innerText")
        para_count = await page.evaluate('() => document.querySelectorAll("li p").length')
        report(
            "Posts rendered on first load",
            para_count >= 3,
            f"({para_count} content paragraphs)",
        )
        api_200 = [s for s, _ in posts_responses if s == 200]
        report("GET /api/posts returns 200", len(api_200) >= 1, f"({len(posts_responses)} posts API calls)")

        # capture post content sample
        sample = await page.locator("li p").first.text_content()
        report("Post content is non-empty text", bool(sample and sample.strip()), f"-> {sample[:50]}...")

        # 3. Infinite scroll loads more pages
        before = para_count
        # scroll to bottom a few times
        for _ in range(3):
            await page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(1500)
        after = await page.evaluate('() => document.querySelectorAll("li p").length')
        report("Infinite scroll loads more posts", after > before, f"({before} -> {after} paragraphs)")

        # 4. No client-side errors during loading
        report("No page errors while loading posts", not errors, "" if not errors else "| ".join(errors))

        # 5. Pagination reaches an end (No more posts)
        full_text = await page.evaluate("() => document.body.innerText")
        scrolled_more = await page.evaluate(
            "async () => { for (let i=0;i<6;i++){ window.scrollTo(0, document.body.scrollHeight); await new Promise(r=>setTimeout(r,900)); } return document.body.innerText; }"
        )
        report(
            "Infinite scroll reaches 'No more posts'",
            "no more posts" in scrolled_more.lower(),
        )

        await page.screenshot(path="D:/Me/Dev/Project-X/e2e-screenshots/posts_feed.png")
        await browser.close()

    print(f"\n=== RESULT: {passed} passed, {failed} failed ===")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    asyncio.run(main())
