// What a launch runs on, and the extra details Mac apps can give.

export const platforms = [
  { id: "web", label: "Web app" },
  { id: "mac", label: "Mac app" },
  { id: "ios", label: "iOS app" },
  { id: "android", label: "Android app" },
  { id: "chrome", label: "Chrome extension" },
  { id: "windows", label: "Windows app" },
  { id: "other", label: "Other" },
] as const;
export type Platform = (typeof platforms)[number]["id"];

export const priceModels = [
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
  { id: "freemium", label: "Free + Pro" },
] as const;
export type PriceModel = (typeof priceModels)[number]["id"];

export const getFromOptions = [
  { id: "app_store", label: "Mac App Store" },
  { id: "download", label: "Direct download" },
  { id: "homebrew", label: "Homebrew" },
] as const;
export type GetFrom = (typeof getFromOptions)[number]["id"];

export type PlatformInfo = {
  platform: Platform;
  // Mac apps only
  priceModel: PriceModel | null;
  getFrom: GetFrom[];
  // true, false, or null for "not sure"
  appleSilicon: boolean | null;
};

export const webApp: PlatformInfo = {
  platform: "web",
  priceModel: null,
  getFrom: [],
  appleSilicon: null,
};

export const platformLabel = (id: Platform) =>
  platforms.find((p) => p.id === id)?.label ?? "Web app";
export const priceLabel = (id: PriceModel) =>
  priceModels.find((p) => p.id === id)?.label ?? "";
export const getFromLabel = (id: GetFrom) =>
  getFromOptions.find((p) => p.id === id)?.label ?? "";

// Keeps only allowed values; Mac details are dropped for other platforms.
// Returns an error message when a Mac app is missing what it needs.
export function cleanPlatform(
  input: Partial<PlatformInfo> | undefined,
): { ok: true; value: PlatformInfo } | { ok: false; error: string } {
  const platform = platforms.some((p) => p.id === input?.platform)
    ? (input!.platform as Platform)
    : "web";
  if (platform !== "mac") return { ok: true, value: { ...webApp, platform } };

  const priceModel = priceModels.some((p) => p.id === input?.priceModel)
    ? (input!.priceModel as PriceModel)
    : null;
  const getFrom = getFromOptions
    .map((o) => o.id)
    .filter((id) => input?.getFrom?.includes(id));
  if (!priceModel)
    return { ok: false, error: "Say whether your Mac app is free or paid." };
  if (getFrom.length === 0)
    return { ok: false, error: "Say where people can get your Mac app." };
  const appleSilicon =
    typeof input?.appleSilicon === "boolean" ? input.appleSilicon : null;
  return { ok: true, value: { platform, priceModel, getFrom, appleSilicon } };
}

// The database columns for a launch's platform
export const platformColumns = (p: PlatformInfo) => ({
  platform: p.platform,
  price_model: p.priceModel,
  get_from: p.getFrom,
  apple_silicon: p.appleSilicon,
});
