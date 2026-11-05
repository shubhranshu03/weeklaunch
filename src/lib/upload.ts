"use client";

import { supabaseBrowser } from "./supabase/client";
import { MEDIA_BUCKET } from "./supabase/env";

const MAX_BYTES = 5 * 1024 * 1024;
const types = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// Uploads an image to the visitor's own folder and returns its public link
export async function uploadImage(file: File, userId: string, kind: string) {
  if (!types.includes(file.type))
    throw new Error("Use a PNG, JPG, WebP or GIF image.");
  if (file.size > MAX_BYTES) throw new Error("Images must be under 5 MB.");

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${userId}/${kind}-${crypto.randomUUID()}.${ext}`;
  const storage = supabaseBrowser().storage.from(MEDIA_BUCKET);
  const { error } = await storage.upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw new Error("Upload failed. Please try again.");
  return storage.getPublicUrl(path).data.publicUrl;
}
