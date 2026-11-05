import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

let client: SupabaseClient | undefined;

// One shared client in the browser; the session lives in cookies
export function supabaseBrowser() {
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
