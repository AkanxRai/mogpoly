import type { Card } from "@/types/game";

export const RNG_CARDS: Card[] = [
  { text: "Your meme went viral! Collect 200 mogz.", effect: { type: "collect", amount: 200 } },
  { text: "Server crashed. Pay 100 mogz for hosting.", effect: { type: "pay", amount: 100 } },
  { text: "Algorithm blessed you. Advance to Homepage.", effect: { type: "move", to: 0 } },
  { text: "DMCA strike! Go to Shadow Ban.", effect: { type: "go-to-shadow-ban" } },
  { text: "Your NFT actually sold. Collect 150 mogz.", effect: { type: "collect", amount: 150 } },
  { text: "Bandwidth overage. Pay 50 mogz per server and 200 mogz per data center.", effect: { type: "repairs", perHouse: 50, perHotel: 200 } },
  { text: "Crypto rug pull! Pay each player 50 mogz.", effect: { type: "pay-each", amount: 50 } },
  { text: "You got a brand deal. Collect 100 mogz.", effect: { type: "collect", amount: 100 } },
  { text: "Get Out of Shadow Ban free. Keep this card.", effect: { type: "get-out-of-ban" } },
  { text: "Go back 3 spaces. RNG is not in your favor.", effect: { type: "move-relative", by: -3 } },
  { text: "Your comment got ratio'd. Pay 75 mogz.", effect: { type: "pay", amount: 75 } },
  { text: "Ad revenue hit! Collect 50 mogz from each player.", effect: { type: "collect-from-each", amount: 50 } },
  { text: "Advance to Trend Plaza. The algorithm favors you.", effect: { type: "move", to: 14 } },
  { text: "Doxxed! Pay 200 mogz for damage control.", effect: { type: "pay", amount: 200 } },
  { text: "Your clip went viral on Twitch. Advance to PogChamp Park.", effect: { type: "move", to: 31 } },
  { text: "Bot attack on your server. Pay 25 mogz per server and 100 mogz per data center.", effect: { type: "repairs", perHouse: 25, perHotel: 100 } },
];

export const DMS_CARDS: Card[] = [
  { text: "Anonymous tip: you won a giveaway! Collect 100 mogz.", effect: { type: "collect", amount: 100 } },
  { text: "Tax refund from platform. Collect 20 mogz.", effect: { type: "collect", amount: 20 } },
  { text: "Your alt account got verified. Collect 50 mogz.", effect: { type: "collect", amount: 50 } },
  { text: "Someone slid into your DMs with a sponsorship. Collect 200 mogz.", effect: { type: "collect", amount: 200 } },
  { text: "Get Out of Shadow Ban free. Keep this card.", effect: { type: "get-out-of-ban" } },
  { text: "Advance to Homepage. Collect 200 mogz if you pass.", effect: { type: "move", to: 0 } },
  { text: "Birthday donation stream! Collect 10 mogz from each player.", effect: { type: "collect-from-each", amount: 10 } },
  { text: "Platform bug gave you free premium. Collect 75 mogz.", effect: { type: "collect", amount: 75 } },
  { text: "Your merch dropped. Collect 150 mogz.", effect: { type: "collect", amount: 150 } },
  { text: "Internet bill due. Pay 50 mogz.", effect: { type: "pay", amount: 50 } },
  { text: "You won a Discord Nitro giveaway. Collect 25 mogz.", effect: { type: "collect", amount: 25 } },
  { text: "Patreon subscribers came through. Collect 100 mogz.", effect: { type: "collect", amount: 100 } },
  { text: "Server maintenance costs. Pay 100 mogz.", effect: { type: "pay", amount: 100 } },
  { text: "Anonymous crypto donation! Collect 50 mogz.", effect: { type: "collect", amount: 50 } },
  { text: "Your tutorial video blew up. Collect 30 mogz from each player.", effect: { type: "collect-from-each", amount: 30 } },
  { text: "You found a rare Pepe. Collect 45 mogz.", effect: { type: "collect", amount: 45 } },
];

export function shuffleDeck<T>(deck: T[]): T[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
