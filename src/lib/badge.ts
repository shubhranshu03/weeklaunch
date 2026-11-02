import { SITE_URL } from "./site";

export type BadgeTheme = "light" | "dark" | "brand";

// Embed code makers paste on their site
export function badgeCode(slug: string, theme: BadgeTheme) {
  return `<a href="${SITE_URL}/products/${slug}" target="_blank"><img src="${SITE_URL}/badges/${slug}.svg?theme=${theme}" alt="Launched on WeekLaunch" width="200" height="54" /></a>`;
}
