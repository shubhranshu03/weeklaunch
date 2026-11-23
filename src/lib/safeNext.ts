// Where to send someone after signing in: only a page on this site.
// Browsers treat "\" like "/" and drop tabs and newlines, so "/\evil.com" or
// "/\t/evil.com" would leave the site; anything like that falls back to "/".
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  if (/[\\\s\u0000-\u001f\u007f]/.test(next)) return "/";
  try {
    const base = "https://weeklaunch.invalid";
    const u = new URL(next, base);
    if (u.origin !== base) return "/";
    const path = u.pathname + u.search + u.hash;
    // "/..//evil.com" turns into "//evil.com" once the dots are resolved
    return path.startsWith("//") ? "/" : path;
  } catch {
    return "/";
  }
}
