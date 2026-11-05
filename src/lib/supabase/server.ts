import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

// Acts as the signed-in visitor (reads the session cookie). Use outside "use cache".
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list)
            store.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy refreshes the session instead.
        }
      },
    },
  });
}

// Anonymous reads of public data; safe inside "use cache"
export function supabasePublic() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Full access, bypasses row level security. Only after checking who is signed in.
export function supabaseAdmin() {
  const secret =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient(SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
