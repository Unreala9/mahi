import { supabase } from "./supabase";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "../integrations/supabase/client";

let tokenRefreshPromise: Promise<string | null> | null = null;

async function refreshTokenIfNeeded(): Promise<string | null> {
  if (tokenRefreshPromise) return await tokenRefreshPromise;

  tokenRefreshPromise = (async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) return null;

      const token = data.session.access_token;
      if (!token) return null;

      // Optional: refresh if near expiry (skip heavy decoding if you want)
      return token;
    } finally {
      tokenRefreshPromise = null;
    }
  })();

  return await tokenRefreshPromise;
}

export async function callEdgeFunction<T = any>(
  functionName: string,
  body: any = {},
  options: { method?: "POST" | "GET" | "PUT" | "DELETE" } = {},
): Promise<T> {
  const method = options.method ?? "POST";
  const token = await refreshTokenIfNeeded();

  if (!token) {
    throw new Error("No session token found. Please login again.");
  }

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  const resp = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: method === "GET" ? undefined : JSON.stringify(body),
  });

  const text = await resp.text();

  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }

  if (!resp.ok) {
    const errorBody =
      typeof parsed === "object" ? JSON.stringify(parsed) : parsed;
    console.error("[EdgeInvokeError]", {
      fn: functionName,
      status: resp.status,
      statusText: resp.statusText,
      body: errorBody,
    });

    throw new Error(
      JSON.stringify({
        name: "EdgeInvokeError",
        status: resp.status,
        statusText: resp.statusText,
        body: parsed,
      }),
    );
  }

  return (parsed ?? text) as T;
}
