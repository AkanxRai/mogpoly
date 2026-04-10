import { describe, it, expect } from "vitest";
import {
  calculateRent, calculateNetWorth, ownsFullPlatform, canBuild,
  countOwnedServerFarms, countOwnedUtilities, calculateUtilityRent,
  calculateServerFarmRent, calculatePaywallTax,
} from "../game-logic";
import { BOARD } from "../board-data";
import type { Player, TileState } from "@/types/game";

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1", name: "Test", token: "doge", position: 0, mogz: 1500,
    properties: [], inShadowBan: false, shadowBanTurns: 0,
    bankrupt: false, getOutOfBanCards: 0, ...overrides,
  };
}

function makeBoard(): TileState[] {
  return BOARD.map(() => ({ houses: 0, owner: null, mortgaged: false }));
}

describe("calculateRent", () => {
  it("returns base rent for property with no houses", () => {
    const board = makeBoard();
    board[1].owner = "p2";
    expect(calculateRent(1, board, 7)).toBe(2);
  });

  it("doubles base rent when owner has full platform group", () => {
    const board = makeBoard();
    board[1].owner = "p2";
    board[3].owner = "p2";
    expect(calculateRent(1, board, 7)).toBe(4);
  });

  it("returns house-level rent", () => {
    const board = makeBoard();
    board[1].owner = "p2";
    board[3].owner = "p2";
    board[1].houses = 3;
    expect(calculateRent(1, board, 7)).toBe(90);
  });

  it("returns 0 for mortgaged property", () => {
    const board = makeBoard();
    board[1].owner = "p2";
    board[1].mortgaged = true;
    expect(calculateRent(1, board, 7)).toBe(0);
  });
});

describe("calculateServerFarmRent", () => {
  it("returns 25 for 1 farm owned", () => {
    const board = makeBoard();
    board[5].owner = "p2";
    expect(calculateServerFarmRent("p2", board)).toBe(25);
  });

  it("returns 200 for 4 farms owned", () => {
    const board = makeBoard();
    board[5].owner = "p2";
    board[15].owner = "p2";
    board[25].owner = "p2";
    board[35].owner = "p2";
    expect(calculateServerFarmRent("p2", board)).toBe(200);
  });
});

describe("calculateUtilityRent", () => {
  it("returns diceRoll * 4 for 1 utility", () => {
    const board = makeBoard();
    board[12].owner = "p2";
    expect(calculateUtilityRent("p2", board, 8)).toBe(32);
  });

  it("returns diceRoll * 10 for 2 utilities", () => {
    const board = makeBoard();
    board[12].owner = "p2";
    board[28].owner = "p2";
    expect(calculateUtilityRent("p2", board, 8)).toBe(80);
  });
});

describe("calculateNetWorth", () => {
  it("includes mogz, property values, and house values", () => {
    const player = makePlayer({ mogz: 500, properties: [1, 3] });
    const board = makeBoard();
    board[1].owner = "p1";
    board[3].owner = "p1";
    board[1].houses = 2;
    expect(calculateNetWorth(player, board)).toBe(660);
  });
});

describe("ownsFullPlatform", () => {
  it("returns true when player owns all tiles in platform", () => {
    const board = makeBoard();
    board[1].owner = "p1";
    board[3].owner = "p1";
    expect(ownsFullPlatform("p1", "reddit", board)).toBe(true);
  });

  it("returns false when player is missing one tile", () => {
    const board = makeBoard();
    board[1].owner = "p1";
    expect(ownsFullPlatform("p1", "reddit", board)).toBe(false);
  });
});

describe("canBuild", () => {
  it("returns true when player owns full group and houses are even", () => {
    const board = makeBoard();
    board[1].owner = "p1";
    board[3].owner = "p1";
    expect(canBuild(1, "p1", board)).toBe(true);
  });

  it("returns false for uneven build", () => {
    const board = makeBoard();
    board[1].owner = "p1";
    board[3].owner = "p1";
    board[1].houses = 1;
    expect(canBuild(1, "p1", board)).toBe(false);
  });

  it("returns false for mortgaged property", () => {
    const board = makeBoard();
    board[1].owner = "p1";
    board[3].owner = "p1";
    board[1].mortgaged = true;
    expect(canBuild(1, "p1", board)).toBe(false);
  });
});

describe("calculatePaywallTax", () => {
  it("returns 10% of net worth", () => {
    const player = makePlayer({ mogz: 1000, properties: [] });
    const board = makeBoard();
    expect(calculatePaywallTax(player, board)).toBe(100);
  });
});
