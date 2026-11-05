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

const isPrivate = (pathname: string) =>
  privatePaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

function toSignIn(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();
  url.pathname = "/signin";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

// Keeps the Supabase session fresh and guards the account pages
export async function proxy(request: NextRequest) {
  if (!supabaseConfigured) return NextResponse.next();

  // Signed-out visitors have no session to refresh: no call to Supabase at all
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!hasSession)
    return isPrivate(request.nextUrl.pathname)
      ? toSignIn(request)
      : NextResponse.next();

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

  // Checks the session's signature on our own server (refreshing it when it has
  // expired), instead of asking Supabase on every page load
  const { data, error } = await supabase.auth.getClaims();

  // If Supabase is slow or unreachable, let the page do its own check
  // instead of signing the visitor out
  const signedOut = !data?.claims && !isAuthRetryableFetchError(error);
  if (signedOut && isPrivate(request.nextUrl.pathname))
    return toSignIn(request);

  return response;
}

export const config = {
  // Skip static files, images, share images and the payment webhook
  matcher: [
    "/((?!_next/static|_next/image|api/webhooks|favicon.ico|icon.svg|robots.txt|sitemap.xml|llms.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
