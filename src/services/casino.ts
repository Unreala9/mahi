import { CasinoResponse, CasinoGame } from "@/types/casino";

const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

// Build base URL properly
const BASE_API_URL = API_HOST.startsWith("/")
  ? API_HOST
  : API_PROTOCOL
    ? `${API_PROTOCOL}://${API_HOST}`
    : `http://${API_HOST}`;

const DEFAULT_API = `${BASE_API_URL}/casino/tableid?key=${API_KEY}`;
const API_URL = import.meta.env.VITE_CASINO_API_URL || DEFAULT_API;

// Casino game images CDN
const IMAGE_CDN = "https://nd.sprintstaticdata.com/casino-icons/lc";
const IMAGE_BASE = import.meta.env.VITE_CASINO_IMAGE_BASE || IMAGE_CDN;

// Debug log to verify CDN is being used
console.log("[Casino] IMAGE_BASE:", IMAGE_BASE);

export async function fetchCasinoGames(): Promise<CasinoGame[]> {
  try {
    if (import.meta.env.DEV) {
      console.log("[Casino] Fetching from API:", API_URL);
    }

    // Add timeout and faster failure
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout (reduced from 5s)

    const res = await fetch(API_URL, {
      headers: { Accept: "*/*" },
      signal: controller.signal,
      cache: "force-cache", // Use browser cache for faster loads
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (import.meta.env.DEV) {
        console.warn("[Casino] API returned:", res.status);
      }
      throw new Error(`API returned ${res.status}`);
    }

    const json = (await res.json()) as CasinoResponse;

    // Debug: Check first game's imgpath (only in dev)
    if (import.meta.env.DEV && json.data.t1.length > 0) {
      console.log(
        "[Casino] API loaded successfully, games:",
        json.data.t1.length,
      );
      console.log("[Casino] Sample game data:", json.data.t1[0]);
    }

    return json.data.t1;
  } catch (error) {
    console.error("[Casino] API failed, loading fallback data:", error);

    // Fallback to local JSON file
    try {
      const fallbackRes = await fetch("/casino.json");
      if (!fallbackRes.ok) throw new Error("Fallback also failed");

      const fallbackJson = (await fallbackRes.json()) as CasinoResponse;
      if (import.meta.env.DEV) {
        console.log(
          "[Casino] Fallback loaded successfully, games:",
          fallbackJson.data.t1.length,
        );
      }

      return fallbackJson.data.t1;
    } catch (fallbackError) {
      console.error("[Casino] Fallback also failed:", fallbackError);
      throw new Error("Failed to load casino games from API and fallback");
    }
  }
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

/**
 * Get image URL for a specific game from CDN
 * @param game - The casino game object containing imgpath
 * @returns Array with the CDN image URL
 */
export function getImageUrlForGame(game: CasinoGame): string[] {
  if (!game.imgpath) return [];

  // If already absolute URL, use it directly
  if (/^https?:\/\//i.test(game.imgpath)) return [game.imgpath];

  // Clean the path (remove leading slash if present)
  const cleanPath = game.imgpath.startsWith("/")
    ? game.imgpath.substring(1)
    : game.imgpath;

  // Construct CDN URL: https://nd.sprintstaticdata.com/casino-icons/lc/{imgpath}
  const imageUrl = `${IMAGE_BASE}/${cleanPath}`;

  // Log in dev mode for debugging
  if (import.meta.env.DEV) {
    console.log(`[Casino Image] Loading ${game.gname} from:`, imageUrl);
  }

  return [imageUrl];
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getImageUrlForGame instead for better accuracy
 */
export function getImageCandidates(imgpath: string): string[] {
  if (!imgpath) return [];

  // If already absolute URL, use it directly
  if (/^https?:\/\//i.test(imgpath)) return [imgpath];

  // imgpath is just filename like "worli3.gif" or "teen62.gif"
  // Build complete URL using API host
  const cleanPath = imgpath.startsWith("/") ? imgpath.substring(1) : imgpath;

  // Try common paths
  const urls = [
    `${IMAGE_BASE}/${cleanPath}`,
    `${IMAGE_BASE}/images/${cleanPath}`,
    `${IMAGE_BASE}/game-image/${cleanPath}`,
    `${IMAGE_BASE}/cards/${cleanPath}`,
  ];

  return urls;
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
