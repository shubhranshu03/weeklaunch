"use server";

import { getCurrentUser } from "../auth";
import type { PlatformInfo } from "../platforms";
import { fetchHtml, fetchPublic } from "../safeFetch";
import { readSite } from "../siteInfo";
import { MEDIA_BUCKET } from "../supabase/env";
import { supabaseAdmin } from "../supabase/server";

export type AutofillFields = {
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  logo: string | null;
  shots: string[];
  app: PlatformInfo | null;
};

type Result =
  { ok: true; fields: AutofillFields } | { ok: false; error: string };

// A few tries per person every 10 minutes (per server instance)
const recent = new Map<string, number[]>();
function limited(userId: string) {
  const now = Date.now();
  const tries = (recent.get(userId) ?? []).filter((t) => now - t < 600_000);
  if (tries.length >= 8) return true;
  recent.set(userId, [...tries, now]);
  if (recent.size > 5000) recent.clear();
  return false;
}

const MAX_IMAGE = 5 * 1024 * 1024;

// Trusts the file's first bytes, not what the server says it is
function imageType(b: Buffer) {
  if (b.length < 12) return null;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
    return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.subarray(0, 4).toString() === "GIF8") return "gif";
  if (
    b.subarray(0, 4).toString() === "RIFF" &&
    b.subarray(8, 12).toString() === "WEBP"
  )
    return "webp";
  return null;
}

// Copies an image into the maker's own folder, so it can't break or change later
async function copyImage(url: string, userId: string, kind: "logo" | "shot") {
  const r = await fetchPublic(url, {
    accept: "image/png,image/jpeg,image/webp,image/gif",
    maxBytes: MAX_IMAGE,
  });
  if (!r || r.bytes.length >= MAX_IMAGE) return null;
  const type = imageType(r.bytes);
  if (!type) return null;
  // Tiny favicons look blurry as a logo
  if (kind === "logo" && r.bytes.length < 1200) return null;
  const path = `${userId}/${kind}-${crypto.randomUUID()}.${type.replace("jpeg", "jpg")}`;
  const storage = supabaseAdmin().storage.from(MEDIA_BUCKET);
  const { error } = await storage.upload(path, r.bytes, {
    contentType: `image/${type}`,
    cacheControl: "31536000",
  });
  if (error) return null;
  return storage.getPublicUrl(path).data.publicUrl;
}

async function firstImage(urls: string[], userId: string) {
  for (const u of urls.slice(0, 4)) {
    const copied = await copyImage(u, userId, "logo");
    if (copied) return copied;
  }
  return null;
}

// Reads a product's website and suggests the launch details
export async function autofillFromSite(website: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const url = website.trim();
  if (!/^https?:\/\/\S+\.\S+/.test(url))
    return {
      ok: false,
      error: "Add a full link, like https://yourproduct.com",
    };
  if (limited(user.id))
    return {
      ok: false,
      error:
        "That's a lot of tries. Wait a few minutes, or fill the form in by hand.",
    };

  const page = await fetchHtml(url);
  if (!page)
    return {
      ok: false,
      error:
        "We couldn't open that site. Check the link works and is public, or fill the form in by hand.",
    };

  const info = readSite(page.html, page.url);
  const [logo, shot] = await Promise.all([
    firstImage(info.logos, user.id),
    info.image ? copyImage(info.image, user.id, "shot") : null,
  ]);

  return {
    ok: true,
    fields: {
      name: info.name,
      tagline: info.tagline,
      description: info.description,
      categories: info.categories,
      logo,
      shots: shot ? [shot] : [],
      app: info.mac ? { platform: "mac", ...info.mac } : null,
    },
  };
}
