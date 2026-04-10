import { BOARD, getPlatformTiles, getServerFarmIndices, getUtilityIndices } from "./board-data";
import { SERVER_FARM_RENT, HOTEL_VALUE } from "./constants";
import type { Player, TileState } from "@/types/game";

export function ownsFullPlatform(playerId: string, platform: string, board: TileState[]): boolean {
  const tiles = getPlatformTiles(platform);
  return tiles.every((i) => board[i].owner === playerId && !board[i].mortgaged);
}

export function countOwnedServerFarms(playerId: string, board: TileState[]): number {
  return getServerFarmIndices().filter((i) => board[i].owner === playerId && !board[i].mortgaged).length;
}

export function countOwnedUtilities(playerId: string, board: TileState[]): number {
  return getUtilityIndices().filter((i) => board[i].owner === playerId && !board[i].mortgaged).length;
}

export function calculateRent(tileIndex: number, board: TileState[], diceTotal: number): number {
  const def = BOARD[tileIndex];
  const state = board[tileIndex];
  if (!state.owner || state.mortgaged) return 0;
  if (!def.rent) return 0;
  if (def.type === "server-farm") return calculateServerFarmRent(state.owner, board);
  if (def.type === "utility") return calculateUtilityRent(state.owner, board, diceTotal);
  if (def.type !== "property") return 0;
  if (state.houses > 0) return def.rent[state.houses] ?? 0;
  const baseRent = def.rent[0];
  if (def.platform && ownsFullPlatform(state.owner, def.platform, board)) return baseRent * 2;
  return baseRent;
}

export function calculateServerFarmRent(ownerId: string, board: TileState[]): number {
  const count = countOwnedServerFarms(ownerId, board);
  if (count === 0) return 0;
  return SERVER_FARM_RENT[count - 1];
}

export function calculateUtilityRent(ownerId: string, board: TileState[], diceTotal: number): number {
  const count = countOwnedUtilities(ownerId, board);
  if (count === 0) return 0;
  return diceTotal * (count === 1 ? 4 : 10);
}

export function calculateNetWorth(player: Player, board: TileState[]): number {
  let worth = player.mogz;
  for (const tileIndex of player.properties) {
    const def = BOARD[tileIndex];
    worth += def.mortgageValue ?? 0;
    const state = board[tileIndex];
    if (state.houses > 0 && def.houseCost) {
      const houseCount = state.houses >= HOTEL_VALUE ? 4 : state.houses;
      const hotelCount = state.houses >= HOTEL_VALUE ? 1 : 0;
      worth += houseCount * def.houseCost;
      worth += hotelCount * def.houseCost;
    }
  }
  return worth;
}

export function calculatePaywallTax(player: Player, board: TileState[]): number {
  return Math.floor(calculateNetWorth(player, board) * 0.1);
}

export function canBuild(tileIndex: number, playerId: string, board: TileState[]): boolean {
  const def = BOARD[tileIndex];
  const state = board[tileIndex];
  if (def.type !== "property" || !def.platform) return false;
  if (state.owner !== playerId || state.mortgaged) return false;
  if (state.houses >= HOTEL_VALUE) return false;
  if (!ownsFullPlatform(playerId, def.platform, board)) return false;
  const groupTiles = getPlatformTiles(def.platform);
  if (groupTiles.some((i) => board[i].mortgaged)) return false;
  const minHouses = Math.min(...groupTiles.map((i) => board[i].houses));
  return state.houses <= minHouses;
}

export function canSellBuilding(tileIndex: number, playerId: string, board: TileState[]): boolean {
  const def = BOARD[tileIndex];
  const state = board[tileIndex];
  if (def.type !== "property" || !def.platform) return false;
  if (state.owner !== playerId) return false;
  if (state.houses <= 0) return false;
  const groupTiles = getPlatformTiles(def.platform);
  const maxHouses = Math.max(...groupTiles.map((i) => board[i].houses));
  return state.houses >= maxHouses;
}
