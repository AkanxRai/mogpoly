import { test, expect } from "@playwright/test";

const BASE = "https://mogpoly.vercel.app";

test.describe("Production - Landing Page", () => {
  test("loads and shows MOGPOLY title", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=MOGPOLY").first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Internet Monopoly")).toBeVisible();
    await expect(page.locator("text=CREATE ROOM")).toBeVisible();
    await expect(page.locator("input[placeholder='ROOM CODE']")).toBeVisible();
  });

  test("CRT scanline overlay is present", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator(".crt-overlay")).toBeAttached();
  });

  test("create room navigates to room URL", async ({ page }) => {
    await page.goto(BASE);
    await page.click("text=CREATE ROOM");
    await page.waitForURL(/\/room\/[A-Z0-9]{6}/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/room\/[A-Z0-9]{6}$/);
  });
});

test.describe("Production - Lobby", () => {
  test("room page loads with join form", async ({ page }) => {
    await page.goto(BASE);
    await page.click("text=CREATE ROOM");
    await page.waitForURL(/\/room\//);

    // Wait for WebSocket connection and lobby to render
    await expect(page.locator("text=ROOM CODE")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("input[placeholder='Enter name...']")).toBeVisible();
    await expect(page.locator("text=PICK YOUR TOKEN")).toBeVisible();
    await expect(page.locator("text=JOIN GAME")).toBeVisible();
  });

  test("can join room with name and token", async ({ page }) => {
    await page.goto(BASE);
    await page.click("text=CREATE ROOM");
    await page.waitForURL(/\/room\//);
    await expect(page.locator("text=ROOM CODE")).toBeVisible({ timeout: 15000 });

    await page.fill("input[placeholder='Enter name...']", "TestPlayer");
    await page.locator("button:has-text('Doge')").click();
    await page.click("text=JOIN GAME");

    await expect(page.locator("text=TestPlayer")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("HOST", { exact: true })).toBeVisible();
  });
});

test.describe("Production - Multiplayer", () => {
  test("two players can join and start a game", async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    // Player 1 creates room
    await page1.goto(BASE);
    await page1.click("text=CREATE ROOM");
    await page1.waitForURL(/\/room\//);
    const roomUrl = page1.url();

    await expect(page1.locator("text=ROOM CODE")).toBeVisible({ timeout: 15000 });
    await page1.fill("input[placeholder='Enter name...']", "Alice");
    await page1.locator("button:has-text('Doge')").click();
    await page1.click("text=JOIN GAME");
    await expect(page1.locator("text=Alice")).toBeVisible({ timeout: 5000 });

    // Player 2 joins same room
    await page2.goto(roomUrl);
    await expect(page2.locator("input[placeholder='Enter name...']")).toBeVisible({ timeout: 15000 });
    await page2.fill("input[placeholder='Enter name...']", "Bob");
    await page2.locator("button:has-text('Pepe')").click();
    await page2.click("text=JOIN GAME");
    await expect(page2.locator("text=Bob")).toBeVisible({ timeout: 5000 });

    // Both see each other
    await expect(page1.locator("text=Bob")).toBeVisible({ timeout: 5000 });
    await expect(page2.locator("text=Alice")).toBeVisible({ timeout: 5000 });

    // Host starts game
    await page1.locator("button:has-text('START GAME')").click();

    // Board renders for both
    await expect(page1.locator("text=Homepage").first()).toBeVisible({ timeout: 15000 });
    await expect(page2.locator("text=Homepage").first()).toBeVisible({ timeout: 15000 });

    // One player should see ROLL DICE button in the board center
    const roll1 = await page1.getByRole("button", { name: "ROLL DICE" }).isVisible().catch(() => false);
    const roll2 = await page2.getByRole("button", { name: "ROLL DICE" }).isVisible().catch(() => false);
    expect(roll1 || roll2).toBeTruthy();

    // The current player rolls dice
    const currentPage = roll1 ? page1 : page2;
    await currentPage.getByRole("button", { name: "ROLL DICE" }).click();

    // After rolling, wait for game state to update — the board should show
    // the player on a new tile (not position 0 anymore for at least one player)
    // Just verify the game progressed by checking that ROLL DICE is gone
    await expect(currentPage.getByRole("button", { name: "ROLL DICE" })).not.toBeVisible({ timeout: 15000 });

    await ctx1.close();
    await ctx2.close();
  });
});
