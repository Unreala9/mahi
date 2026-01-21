import { supabase } from "./supabase";

/**
 * Helper to call Supabase Edge Functions with automatic error handling.
 * @param functionName The name of the Edge Function to call.
 * @param body The JSON body to send.
 * @param options Optional fetch options (headers, method, etc.).
 */
export async function callEdgeFunction<T = any>(
  functionName: string,
  body: any = {},
  options: { method?: "POST" | "GET" | "PUT" | "DELETE" } = {}
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    console.warn(
      "No active session found. Call might fail if auth is required."
    );
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    method: options.method || "POST",
  });

  if (error) {
    console.error(`Error calling function ${functionName}:`, error);
    throw error;
  }

  return data as T;
}
