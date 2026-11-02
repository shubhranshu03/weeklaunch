// Public address of the site, used for canonical links, the sitemap and share images.
// Set NEXT_PUBLIC_SITE_URL once you have a custom domain; on Vercel it falls back to
// the production address automatically.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://weeklaunch.vercel.app")
).replace(/\/$/, "");

export const SITE_NAME = "WeekLaunch";

export const SITE_DESCRIPTION =
  "A weekly product launch directory for indie makers and startups. Launch your product, climb the weekly leaderboard and keep a permanent product page.";

// Date the static pages last changed meaningfully (used in the sitemap)
export const CONTENT_UPDATED = "2026-11-02";
