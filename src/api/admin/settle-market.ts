// API Endpoint for Bet Settlement (Next.js API route)
// File: pages/api/admin/settle-market.ts or app/api/admin/settle-market/route.ts

import { NextApiRequest, NextApiResponse } from "next";
import BetSettlementService, {
  SettlementMode,
} from "@/services/betSettlementService";

// Authentication middleware (implement based on your auth system)
const authenticateAdmin = (req: NextApiRequest): boolean => {
  // Check if user is authenticated and has admin role
  // This could check JWT token, session, etc.
  const authHeader = req.headers.authorization;
  const adminToken = req.headers["x-admin-token"];

  // Example: Check for admin token or JWT
  // return verifyAdminToken(adminToken) || verifyJWTHasAdminRole(authHeader);

  // For demo - implement proper authentication
  return !!adminToken && adminToken === process.env.ADMIN_API_KEY;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Authenticate admin user
  if (!authenticateAdmin(req)) {
    return res
      .status(401)
      .json({ error: "Unauthorized - Admin access required" });
  }

  try {
    const { marketId, resultCode, settlementMode = "normal" } = req.body;

    // Validate required parameters
    if (!marketId || (!resultCode && settlementMode !== "void")) {
      return res.status(400).json({
        error:
          "Missing required parameters. marketId and resultCode are required (except for void settlements)",
      });
    }

    // Validate settlement mode
    const validModes: SettlementMode[] = [
      "normal",
      "void",
      "half_win",
      "half_lost",
    ];
    if (!validModes.includes(settlementMode)) {
      return res.status(400).json({
        error:
          "Invalid settlement mode. Must be: normal, void, half_win, or half_lost",
      });
    }

    console.log(
      `🎯 API: Settling market ${marketId} with result ${resultCode} (${settlementMode})`,
    );

    // Call the settlement service
    const result = await BetSettlementService.settleMarket(
      marketId,
      resultCode || "",
      settlementMode,
    );

    if (result.success) {
      console.log(`✅ API: Settlement successful for market ${marketId}`);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Market settled successfully",
      });
    } else {
      console.log(
        `❌ API: Settlement failed for market ${marketId}: ${result.message}`,
      );
      return res.status(400).json({
        success: false,
        error: result.message,
        data: result,
      });
    }
  } catch (error) {
    console.error("❌ API: Settlement error:", error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      message: "Settlement failed due to server error",
    });
  }
}

// Example usage from frontend:
export const settleMarketAPI = async (
  marketId: string,
  resultCode: string,
  settlementMode: SettlementMode = "normal",
) => {
  const response = await fetch("/api/admin/settle-market", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAdminToken()}`, // Your auth token
      "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_API_KEY, // If using API key
    },
    body: JSON.stringify({
      marketId,
      resultCode,
      settlementMode,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Settlement failed");
  }

  return data;
};

// Batch settlement endpoint
export const settleBatchAPI = async (
  settlements: Array<{
    marketId: string;
    resultCode: string;
    settlementMode?: SettlementMode;
  }>,
) => {
  const response = await fetch("/api/admin/settle-batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAdminToken()}`,
      "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_API_KEY,
    },
    body: JSON.stringify({ settlements }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Batch settlement failed");
  }

  return data;
};
