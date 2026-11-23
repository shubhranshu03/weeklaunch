import { SITE_URL } from "./site";

export type BadgeTheme = "light" | "dark" | "brand";

// Embed code makers paste on their site
export function badgeCode(slug: string, theme: BadgeTheme) {
  return `<a href="${SITE_URL}/products/${slug}" target="_blank"><img src="${SITE_URL}/badges/${slug}.svg?theme=${theme}" alt="Launched on WeekLaunch" width="200" height="54" /></a>`;
}

// A prompt makers can paste into an AI coding tool (Cursor, Lovable, Claude…)
export function badgePrompt(slug: string, theme: BadgeTheme, website: string) {
  return `Add a "Launched on WeekLaunch" badge to my website (${website}).

1. Paste this HTML exactly as it is into the footer that shows on every page, or at least on the home page:

${badgeCode(slug, theme)}

2. Don't change the link (${SITE_URL}/products/${slug}) or the image address.
3. The badge must be in the HTML the server sends, not only added later by JavaScript. On a single-page app (React with Vite, Create React App and similar), put it in index.html, after the root div. On Next.js, Astro, Nuxt, SvelteKit or Remix, the normal footer component is fine.
4. Keep it visible: not hidden with CSS and not behind a login.

Then tell me which file you changed so I can publish it.`;
}
