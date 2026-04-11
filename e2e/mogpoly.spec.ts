import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("shows MOGPOLY title and create/join buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=MOGPOLY").first()).toBeVisible();
    await expect(page.locator("text=CREATE ROOM")).toBeVisible();
    await expect(page.locator("text=JOIN")).toBeVisible();
    await expect(page.locator("input[placeholder='ROOM CODE']")).toBeVisible();
  });

  test("create room navigates to room page", async ({ page }) => {
    await page.goto("/");
    await page.click("text=CREATE ROOM");
    await page.waitForURL(/\/room\/[A-Z0-9]{6}/);
    expect(page.url()).toMatch(/\/room\/[A-Z0-9]{6}$/);
  });

  test("join button is disabled without full room code", async ({ page }) => {
    await page.goto("/");
    const joinBtn = page.locator("button", { hasText: "JOIN" });
    await expect(joinBtn).toBeDisabled();

    await page.fill("input[placeholder='ROOM CODE']", "ABC");
    await expect(joinBtn).toBeDisabled();

    await page.fill("input[placeholder='ROOM CODE']", "ABCDEF");
    await expect(joinBtn).toBeEnabled();
  });
});

test.describe("Lobby", () => {
  test("shows room code and join form", async ({ page }) => {
    await page.goto("/room/TEST01");
    // Wait for WebSocket connection
    await expect(page.locator("text=ROOM CODE")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("input[placeholder='Enter name...']")).toBeVisible();
    await expect(page.locator("text=PICK YOUR TOKEN")).toBeVisible();
  });

  test("can join with name and token", async ({ page }) => {
    await page.goto("/room/TEST02");
    await expect(page.locator("text=ROOM CODE")).toBeVisible({ timeout: 10000 });

    // Enter name
    await page.fill("input[placeholder='Enter name...']", "Player1");

    // Pick a token (click first available in free tab)
    const tokenButton = page.locator("button:has-text('Doge')");
    await tokenButton.click();

    // Join
    await page.click("text=JOIN GAME");

    // Should see player list with our name
    await expect(page.locator("text=Player1")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("HOST", { exact: true })).toBeVisible();
  });

  test("copy button copies room link", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/room/TEST03");
    await expect(page.locator("text=ROOM CODE")).toBeVisible({ timeout: 10000 });

    await page.click("text=COPY");
    await expect(page.locator("text=COPIED")).toBeVisible();
  });
});

test.describe("Multiplayer Lobby", () => {
  test("two players can join the same room", async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const roomCode = "MULTI1";

    // Player 1 joins
    await page1.goto(`/room/${roomCode}`);
    await expect(page1.locator("text=ROOM CODE")).toBeVisible({ timeout: 10000 });
    await page1.fill("input[placeholder='Enter name...']", "Alice");
    await page1.locator("button:has-text('Doge')").click();
    await page1.click("text=JOIN GAME");
    await expect(page1.locator("text=Alice")).toBeVisible({ timeout: 5000 });

    // Player 2 joins
    await page2.goto(`/room/${roomCode}`);
    await expect(page2.locator("text=ROOM CODE")).toBeVisible({ timeout: 10000 });
    await page2.fill("input[placeholder='Enter name...']", "Bob");
    await page2.locator("button:has-text('Pepe')").click();
    await page2.click("text=JOIN GAME");
    await expect(page2.locator("text=Bob")).toBeVisible({ timeout: 5000 });

    // Player 1 should see Player 2
    await expect(page1.locator("text=Bob")).toBeVisible({ timeout: 5000 });

    // Player 1 (host) should see start button enabled
    await expect(page1.locator("text=START GAME (2/6)")).toBeVisible();

    await context1.close();
    await context2.close();
  });

  test("host can start game and board appears", async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const roomCode = "GAME" + Math.random().toString(36).substring(2, 4).toUpperCase();

    // Player 1 joins
    await page1.goto(`/room/${roomCode}`);
    await expect(page1.locator("input[placeholder='Enter name...']")).toBeVisible({ timeout: 10000 });
    await page1.fill("input[placeholder='Enter name...']", "Alice");
    await page1.locator("button:has-text('Doge')").click();
    await page1.click("text=JOIN GAME");
    await expect(page1.locator("text=Alice")).toBeVisible({ timeout: 5000 });

    // Player 2 joins
    await page2.goto(`/room/${roomCode}`);
    await expect(page2.locator("input[placeholder='Enter name...']")).toBeVisible({ timeout: 10000 });
    await page2.fill("input[placeholder='Enter name...']", "Bob");
    await page2.locator("button:has-text('Pepe')").click();
    await page2.click("text=JOIN GAME");
    await expect(page2.locator("text=Bob")).toBeVisible({ timeout: 5000 });

    // Start the game
    await page1.locator("button:has-text('START GAME')").click();

    // Both players should see the game board (MOGPOLY in center)
    // The board renders the title in the center
    await expect(page1.locator("text=HOME").first()).toBeVisible({ timeout: 10000 });
    await expect(page2.locator("text=HOME").first()).toBeVisible({ timeout: 10000 });

    // One player should see the ROLL DICE button
    const rollVisible1 = await page1.locator("text=ROLL DICE").isVisible().catch(() => false);
    const rollVisible2 = await page2.locator("text=ROLL DICE").isVisible().catch(() => false);
    expect(rollVisible1 || rollVisible2).toBeTruthy();

    await context1.close();
    await context2.close();
  });
});
