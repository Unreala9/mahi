/**
 * Casino utility functions
 */

/**
 * Check if a market/selection is suspended
 */
export function isMarketSuspended(gstatus?: string): boolean {
  if (!gstatus) return false;
  return (
    gstatus.toUpperCase() === "SUSPENDED" || gstatus.toUpperCase() === "SUSPEND"
  );
}

/**
 * Check if a market/selection is active
 */
export function isMarketActive(gstatus?: string): boolean {
  if (!gstatus) return false;
  const status = gstatus.toUpperCase();
  return status === "ACTIVE" || status === "OPEN";
}

/**
 * Format odds value
 */
export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

/**
 * Calculate potential win amount
 */
export function calculatePotentialWin(stake: number, odds: number): number {
  return stake * odds;
}

/**
 * Get market status color
 */
export function getMarketStatusColor(gstatus?: string): string {
  if (!gstatus) return "text-gray-400";

  const status = gstatus.toUpperCase();

  if (status === "ACTIVE" || status === "OPEN") {
    return "text-green-500";
  }

  if (status === "SUSPENDED" || status === "SUSPEND") {
    return "text-yellow-500";
  }

  if (status === "CLOSED" || status === "CLOSE") {
    return "text-red-500";
  }

  return "text-gray-400";
}

/**
 * Format game timer display
 */
export function formatTimer(seconds: number): string {
  if (seconds < 0) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Get card display name
 */
export function getCardDisplayName(card: string): string {
  if (!card) return "";

  // Handle card format like "AS", "KH", "10D", etc.
  const rank = card.slice(0, -1);
  const suit = card.slice(-1);

  const rankMap: Record<string, string> = {
    A: "A",
    K: "K",
    Q: "Q",
    J: "J",
    "10": "10",
    "9": "9",
    "8": "8",
    "7": "7",
    "6": "6",
    "5": "5",
    "4": "4",
    "3": "3",
    "2": "2",
  };

  const suitMap: Record<string, string> = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };

  return `${rankMap[rank] || rank}${suitMap[suit] || suit}`;
}

/**
 * Get card suit color
 */
export function getCardColor(card: string): "red" | "black" {
  if (!card) return "black";

  const suit = card.slice(-1).toUpperCase();

  return suit === "H" || suit === "D" ? "red" : "black";
}

/**
 * Parse casino result winner
 */
export function parseWinner(win: string | number): string {
  if (!win) return "Unknown";
  return String(win);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Validate bet amount
 */
export function validateBetAmount(
  amount: number,
  min: number,
  max: number,
): { valid: boolean; message?: string } {
  if (amount < min) {
    return { valid: false, message: `Minimum bet is ${formatCurrency(min)}` };
  }

  if (amount > max) {
    return { valid: false, message: `Maximum bet is ${formatCurrency(max)}` };
  }

  return { valid: true };
}
