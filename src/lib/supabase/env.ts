// Supabase project settings, from Project Settings → API in the Supabase dashboard.
// Either the newer publishable key or the older anon key works.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

// Public storage bucket for logos, screenshots and profile photos
export const MEDIA_BUCKET = "media";
export const mediaPrefix = `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/`;
