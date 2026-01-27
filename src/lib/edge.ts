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
  options: { method?: "POST" | "GET" | "PUT" | "DELETE" } = {},
): Promise<T> {
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error(`Session error for ${functionName}:`, sessionError);
      throw new Error("Authentication session error");
    }

    const token = sessionData.session?.access_token;

    if (!token) {
      console.error(
        `[callEdgeFunction] No active session found for ${functionName}. User must be logged in.`,
      );
      throw new Error("Please login to continue");
    }

    console.log(`[callEdgeFunction] Calling ${functionName} with auth token`);

    // supabase.functions.invoke automatically adds Authorization header
    // No need to manually add it
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: options.method === "GET" ? undefined : body,
    });

    if (error) {
      console.error(`Error calling function ${functionName}:`, error);
      throw error;
    }

    return data as T;
  } catch (error) {
    console.error(`[callEdgeFunction] ${functionName} failed:`, error);
    throw error;
  }
}
