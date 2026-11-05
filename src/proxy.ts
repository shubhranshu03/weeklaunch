import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import {
  SUPABASE_KEY,
  SUPABASE_URL,
  supabaseConfigured,
} from "./lib/supabase/env";

// Pages that need an account; signed-out visitors go to sign-in first
const privatePaths = ["/dashboard", "/profile", "/settings", "/admin"];

// Keeps the Supabase session fresh on every page load
export async function proxy(request: NextRequest) {
  if (!supabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list)
          response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Only send people to sign-in when they're clearly signed out. If Supabase is
  // slow or unreachable, let the page do its own check instead of signing them out.
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  const signedOut = !user && (!hasSession || !isAuthRetryableFetchError(error));

  const { pathname, search } = request.nextUrl;
  if (
    signedOut &&
    privatePaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Skip static files, images, share images and the payment webhook
  matcher: [
    "/((?!_next/static|_next/image|api/webhooks|favicon.ico|icon.svg|robots.txt|sitemap.xml|llms.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
