// Loads the made-up sample launches and TV advertisers into Supabase, or removes them.
// Run from the project root after migration 010:
//
//   node --env-file=.env.local scripts/samples/load-samples.mjs
//   node --env-file=.env.local scripts/samples/load-samples.mjs --remove
//
// It never touches a real launch or a real advertiser: a sample whose slug or
// spot is already taken by a real one is skipped.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
const db = createClient(url, key, { auth: { persistSession: false } });
const check = ({ error }, what) => {
  if (error) throw new Error(`${what}: ${error.message}`);
};

if (process.argv.includes("--remove")) {
  check(await db.from("products").delete().eq("is_sample", true), "remove launches");
  check(await db.from("sidebar_ads").delete().eq("is_sample", true), "remove ads");
  console.log("Removed every sample launch and sample ad.");
  process.exit(0);
}

const { products, ads } = JSON.parse(
  readFileSync(new URL("./samples.json", import.meta.url), "utf8"),
);

// This week's number (Week 1 started Monday, Nov 2 2026) and its year
const WEEK = 604_800_000;
const first = Date.UTC(2026, 10, 2);
const week = Math.max(1, Math.floor((Date.now() - first) / WEEK) + 1);
const year = new Date(first + (week - 1) * WEEK).getUTCFullYear();

// Skip any slug a real launch already uses
const existing = await db
  .from("products")
  .select("slug, is_sample")
  .in("slug", products.map((p) => p.slug));
check(existing, "read slugs");
const taken = new Set(existing.data.filter((r) => !r.is_sample).map((r) => r.slug));
const rows = products
  .filter((p) => !taken.has(p.slug))
  .map((p) => ({ ...p, launch_year: year, launch_week: week }));
check(await db.from("products").upsert(rows, { onConflict: "slug" }), "load launches");

// Skip any spot a real advertiser already has
const spots = await db.from("sidebar_ads").select("spot, is_sample");
check(spots, "read ads");
const booked = new Set(spots.data.filter((r) => !r.is_sample).map((r) => r.spot));
const adRows = ads.filter((a) => !booked.has(a.spot));
check(await db.from("sidebar_ads").upsert(adRows, { onConflict: "spot" }), "load ads");

console.log(
  `Loaded ${rows.length} sample launches for Week ${week}, ${year}` +
    (taken.size ? ` (skipped ${[...taken].join(", ")}: real launches)` : "") +
    ` and ${adRows.length} sample ads` +
    (booked.size ? ` (spots ${[...booked].join(", ")} have real advertisers)` : "") +
    ".",
);
