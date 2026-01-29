import { supabase } from "./supabase";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "../integrations/supabase/client";

/**
 * Helper to call Supabase Edge Functions with automatic error handling.
 * @param functionName The name of the Edge Function to call.
 * @param body The JSON body to send.
 * @param options Optional fetch options (headers, method, etc.).
 */
export async function callEdgeFunction<T = any>(
  functionName: string,
  body: any = {},
  options: { method?: "POST" | "GET" | "PUT" | "DELETE" } = {},
): Promise<T> {
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error(`Session error for ${functionName}:`, sessionError);
      // Optionally, force logout if session is invalid
      await supabase.auth.signOut();
      throw new Error("Authentication session error. Please log in again.");
    }

    let token = sessionData.session?.access_token;

    if (!token) {
      console.error(
        `[callEdgeFunction] No active session found for ${functionName}. User must be logged in.`,
      );
      await supabase.auth.signOut();
      throw new Error("You are not logged in or your session has expired. Please log in again.");
    }

    // Decode JWT payload for debug (don't log raw token)
    let tokenPayload: any = null;
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const payload = parts[1];
        const json = decodeURIComponent(
          atob(payload)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );
        tokenPayload = JSON.parse(json);
        console.log("[callEdgeFunction] token payload:", {
          sub: tokenPayload.sub || tokenPayload.user_id || tokenPayload.aud,
          exp: tokenPayload.exp,
        });

        // If token is expired, try to refresh using the refresh token
        if (tokenPayload.exp && tokenPayload.exp * 1000 < Date.now()) {
          console.log(
            "[callEdgeFunction] access token expired, attempting refresh...",
          );
          try {
            const refreshToken = sessionData.session?.refresh_token;
            if (refreshToken) {
              const { data: refreshed, error: refreshError } =
                await supabase.auth.setSession({
                  refresh_token: refreshToken,
                });
              if (refreshError) {
                console.warn(
                  "[callEdgeFunction] refresh failed:",
                  refreshError,
                );
                await supabase.auth.signOut();
                throw new Error("Session expired and could not be refreshed. Please log in again.");
              } else if (refreshed?.session?.access_token) {
                // Replace token variable with refreshed token
                token = refreshed.session.access_token;
                console.log("[callEdgeFunction] token refreshed");
              }
            }
          } catch (e) {
            console.warn("[callEdgeFunction] refresh attempt threw:", e);
            await supabase.auth.signOut();
            throw new Error("Session expired and could not be refreshed. Please log in again.");
          }
        }
      }
    } catch (e) {
      console.warn("[callEdgeFunction] Failed to decode token payload", e);
    }

    console.log(`[callEdgeFunction] Calling ${functionName} with auth token`);

    // Build direct fetch to the Edge Function endpoint so we can capture
    // response status and body for better diagnostics.
    const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
    const fetchOptions: RequestInit = {
      method: options.method ?? (options.method === "GET" ? "GET" : "POST"),
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: options.method === "GET" ? undefined : JSON.stringify(body),
    };

    console.log("[callEdgeFunction] fetch", url, fetchOptions);

    const resp = await fetch(url, fetchOptions);

    const text = await resp.text();
    let parsed: any = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch (e) {
      // keep parsed as null (response was not JSON)
    }

    if (!resp.ok) {
      console.error(
        `[callEdgeFunction] Function ${functionName} responded ${resp.status}:`,
        text,
      );
      throw new Error(
        JSON.stringify({
          name: "FunctionsHttpError",
          message: `Edge Function returned status ${resp.status}`,
          status: resp.status,
          body: parsed ?? text,
        }),
      );
    }

    return (parsed ?? text) as T;
  } catch (error) {
    console.error(`[callEdgeFunction] ${functionName} failed:`, error);
    throw error;
  }
}
