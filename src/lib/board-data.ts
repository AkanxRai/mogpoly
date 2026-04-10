import type { TileDefinition } from "@/types/game";

export const BOARD: TileDefinition[] = [
  { index: 0,  type: "corner",      name: "Homepage" },
  { index: 1,  type: "property",    name: "r/place",              platform: "reddit",    price: 60,  rent: [2, 10, 30, 90, 160, 250],     houseCost: 50,  mortgageValue: 30 },
  { index: 2,  type: "dms",         name: "DMs" },
  { index: 3,  type: "property",    name: "Karma Farm",           platform: "reddit",    price: 60,  rent: [4, 20, 60, 180, 320, 450],    houseCost: 50,  mortgageValue: 30 },
  { index: 4,  type: "tax",         name: "Sub Fee" },
  { index: 5,  type: "server-farm", name: "Server Farm 1",                               price: 200, rent: [25, 50, 100, 200],            mortgageValue: 100 },
  { index: 6,  type: "property",    name: "Greentext Lane",       platform: "4chan",      price: 100, rent: [6, 30, 90, 270, 400, 550],    houseCost: 50,  mortgageValue: 50 },
  { index: 7,  type: "rng",         name: "RNG" },
  { index: 8,  type: "property",    name: "Anon Ave",             platform: "4chan",      price: 100, rent: [6, 30, 90, 270, 400, 550],    houseCost: 50,  mortgageValue: 50 },
  { index: 9,  type: "property",    name: "/b/ Boulevard",        platform: "4chan",      price: 120, rent: [8, 40, 100, 300, 450, 600],   houseCost: 50,  mortgageValue: 60 },
  { index: 10, type: "corner",      name: "Shadow Ban" },
  { index: 11, type: "property",    name: "FYP Street",           platform: "tiktok",    price: 140, rent: [10, 50, 150, 450, 625, 750],  houseCost: 100, mortgageValue: 70 },
  { index: 12, type: "utility",     name: "WiFi",                                        price: 150, rent: [4, 10],                       mortgageValue: 75 },
  { index: 13, type: "property",    name: "Duet Drive",           platform: "tiktok",    price: 140, rent: [10, 50, 150, 450, 625, 750],  houseCost: 100, mortgageValue: 70 },
  { index: 14, type: "property",    name: "Trend Plaza",          platform: "tiktok",    price: 160, rent: [12, 60, 180, 500, 700, 900],  houseCost: 100, mortgageValue: 80 },
  { index: 15, type: "server-farm", name: "Server Farm 2",                               price: 200, rent: [25, 50, 100, 200],            mortgageValue: 100 },
  { index: 16, type: "property",    name: "Nitro Lane",           platform: "discord",   price: 180, rent: [14, 70, 200, 550, 750, 950],  houseCost: 100, mortgageValue: 90 },
  { index: 17, type: "dms",         name: "DMs" },
  { index: 18, type: "property",    name: "Mod Abuse Ave",        platform: "discord",   price: 180, rent: [14, 70, 200, 550, 750, 950],  houseCost: 100, mortgageValue: 90 },
  { index: 19, type: "property",    name: "Server Boost Blvd",    platform: "discord",   price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgageValue: 100 },
  { index: 20, type: "corner",      name: "AFK" },
  { index: 21, type: "property",    name: "Clickbait Court",      platform: "youtube",   price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
  { index: 22, type: "rng",         name: "RNG" },
  { index: 23, type: "property",    name: "Demonetized Drive",    platform: "youtube",   price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
  { index: 24, type: "property",    name: "Algorithm Ave",        platform: "youtube",   price: 240, rent: [20, 100, 300, 750, 925, 1100],houseCost: 150, mortgageValue: 120 },
  { index: 25, type: "server-farm", name: "Server Farm 3",                               price: 200, rent: [25, 50, 100, 200],            mortgageValue: 100 },
  { index: 26, type: "property",    name: "Ratio Road",           platform: "twitter",   price: 260, rent: [22, 110, 330, 800, 975, 1150],houseCost: 150, mortgageValue: 130 },
  { index: 27, type: "property",    name: "Main Character Ave",   platform: "twitter",   price: 260, rent: [22, 110, 330, 800, 975, 1150],houseCost: 150, mortgageValue: 130 },
  { index: 28, type: "utility",     name: "VPN",                                         price: 150, rent: [4, 10],                       mortgageValue: 75 },
  { index: 29, type: "property",    name: "Quote Tweet Blvd",     platform: "twitter",   price: 280, rent: [24, 120, 360, 850, 1025, 1200],houseCost: 150, mortgageValue: 140 },
  { index: 30, type: "corner",      name: "Get Reported" },
  { index: 31, type: "property",    name: "PogChamp Park",        platform: "twitch",    price: 300, rent: [26, 130, 390, 900, 1100, 1275],houseCost: 200, mortgageValue: 150 },
  { index: 32, type: "property",    name: "Sub Train Ave",        platform: "twitch",    price: 300, rent: [26, 130, 390, 900, 1100, 1275],houseCost: 200, mortgageValue: 150 },
  { index: 33, type: "dms",         name: "DMs" },
  { index: 34, type: "property",    name: "Emote Lane",           platform: "twitch",    price: 320, rent: [28, 150, 450, 1000, 1200, 1400],houseCost: 200, mortgageValue: 160 },
  { index: 35, type: "server-farm", name: "Server Farm 4",                               price: 200, rent: [25, 50, 100, 200],            mortgageValue: 100 },
  { index: 36, type: "rng",         name: "RNG" },
  { index: 37, type: "property",    name: "Influencer Ave",       platform: "instagram", price: 350, rent: [35, 175, 500, 1100, 1300, 1500],houseCost: 200, mortgageValue: 175 },
  { index: 38, type: "tax",         name: "Paywall" },
  { index: 39, type: "property",    name: "Reels Row",            platform: "instagram", price: 400, rent: [50, 200, 600, 1400, 1700, 2000],houseCost: 200, mortgageValue: 200 },
];

export function getPlatformTiles(platform: string): number[] {
  return BOARD.filter((t) => t.platform === platform).map((t) => t.index);
}

export function getServerFarmIndices(): number[] {
  return BOARD.filter((t) => t.type === "server-farm").map((t) => t.index);
}

export function getUtilityIndices(): number[] {
  return BOARD.filter((t) => t.type === "utility").map((t) => t.index);
}
