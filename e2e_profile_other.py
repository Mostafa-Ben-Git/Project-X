"""Targeted E2E: other-user profile page loads and shows correct user."""
import asyncio
from playwright.async_api import async_playwright

BASE = "http://localhost:8000"
EMAIL = "test@example.com"
PASSWORD = "12345678"


async def main():
    async with async_playwright() as p:
        b = await p.firefox.launch()
        pg = await b.new_page()
        errors = []
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append(str(e)))

        # login
        await pg.goto(f"{BASE}/login", wait_until="load")
        await pg.wait_for_timeout(800)
        await pg.locator("input[type=email]").first.fill(EMAIL)
        await pg.locator("input[type=password]").first.fill(PASSWORD)
        await pg.get_by_role("button", name="Sign in").click()
        await pg.wait_for_timeout(1500)

        # go to other user's profile
        await pg.goto(f"{BASE}/profile/otherperson", wait_until="load")
        await pg.wait_for_timeout(2000)

        # expect the @username to be visible
        handle = await pg.locator("text=@otherperson").count()
        body_text = await pg.locator("body").inner_text()
        has_name = "Other" in body_text
        has_follow = ("Follow" in body_text) or ("Following" in body_text)

        print(f"@otherperson shown: {handle > 0}")
        print(f"Name 'Other' rendered: {has_name}")
        print(f"Follow button present: {has_follow}")
        print(f"Console/page errors: {errors[:5]}")

        ok = handle > 0 and has_name
        print("RESULT:", "PASS" if ok else "FAIL")
        await b.close()
        return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
