import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { supabaseConfigured } from "./supabase/env";
import { supabasePublic } from "./supabase/server";

// An advertiser on one of the two TV ad spots
export type SidebarAd = {
  spot: number;
  brand: string;
  tagline: string;
  details: string;
  link: string;
  logoUrl: string | null;
  color: string;
  sample: boolean;
};

type Row = {
  spot: number;
  brand: string;
  tagline: string;
  details: string;
  link: string;
  logo_url: string | null;
  color: string;
  is_sample: boolean;
};

// The live TV ads, by spot. Empty (or before migration 010) means "Advertise here".
export async function getSidebarAds(): Promise<Record<number, SidebarAd>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("ads");
  if (!supabaseConfigured) return {};
  const { data, error } = await supabasePublic()
    .from("sidebar_ads")
    .select("spot, brand, tagline, details, link, logo_url, color, is_sample")
    .eq("active", true);
  if (error || !data) return {};
  return Object.fromEntries(
    (data as Row[]).map((r) => [
      r.spot,
      {
        spot: r.spot,
        brand: r.brand,
        tagline: r.tagline,
        details: r.details,
        link: r.link,
        logoUrl: r.logo_url,
        color: r.color,
        sample: r.is_sample,
      },
    ]),
  );
}
