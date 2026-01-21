import { CasinoResponse, CasinoGame } from "@/types/casino";

const API_HOST =
  import.meta.env.VITE_DIAMOND_API_HOST || "130.250.191.174:3009";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
const DEFAULT_API = `${API_PROTOCOL}://${API_HOST}/casino/tableid?key=${API_KEY}`;
const API_URL = import.meta.env.VITE_CASINO_API_URL || DEFAULT_API;
const IMAGE_BASE =
  import.meta.env.VITE_CASINO_IMAGE_BASE || `${API_PROTOCOL}://${API_HOST}`; // Use API host as base

export async function fetchCasinoGames(): Promise<CasinoGame[]> {
  const res = await fetch(API_URL, { headers: { Accept: "*/*" } });
  if (!res.ok) throw new Error("Failed to load casino data");
  const json = (await res.json()) as CasinoResponse;

  // Debug: Check first game's imgpath
  if (json.data.t1.length > 0) {
    console.log("[Casino] Sample game data:", json.data.t1[0]);
    console.log("[Casino] Sample imgpath:", json.data.t1[0].imgpath);
  }

  return json.data.t1;
}

export function getImageUrl(imgpath: string): string {
  if (!imgpath) return "";
  // If already absolute URL, return as-is
  if (/^https?:\/\//i.test(imgpath)) return imgpath;
  // Otherwise assume API returns full path, just return it
  return imgpath;
}

function getApiOrigin(): string | null {
  try {
    const url = new URL(API_URL);
    return url.origin;
  } catch {
    return null;
  }
}

export function getImageCandidates(imgpath: string): string[] {
  if (!imgpath) return [];

  // If already absolute URL, use it directly
  if (/^https?:\/\//i.test(imgpath)) return [imgpath];

  // imgpath is just filename like "worli3.gif" or "teen62.gif"
  // Build complete URL using API host
  const cleanPath = imgpath.startsWith("/") ? imgpath.substring(1) : imgpath;

  // Construct full image URL from API host
  const fullUrl = `${IMAGE_BASE}/casino/images/${cleanPath}`;

  console.log(`[Casino] Image URL for ${imgpath}:`, fullUrl);

  return [fullUrl];
}

export function inferCategory(game: CasinoGame): string {
  const name = game.gname.toLowerCase();
  if (name.includes("teenpatti") || name.includes("teen")) return "Teen Patti";
  if (name.includes("poker")) return "Poker";
  if (name.includes("roulette")) return "Roulette";
  if (
    name.includes("andar bahar") ||
    name.includes("andar") ||
    name.includes("bahar")
  )
    return "Andar Bahar";
  if (name.includes("dragon tiger") || name.includes("d t"))
    return "Dragon Tiger";
  if (name.includes("baccarat")) return "Baccarat";
  if (name.includes("sic bo")) return "Sic Bo";
  if (name.includes("lucky")) return "Lucky";
  if (name.includes("cricket")) return "Cricket";
  return "Other";
}
