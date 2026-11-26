// An optional discount a maker offers IndieShip visitors: a percent off,
// a coupon code to copy, and one short line saying what it covers.

export type Deal = {
  // Like 30 for "30% off"; empty when the offer isn't a percent
  percent: number | null;
  code: string;
  // Like "First 3 months of any plan"
  text: string;
};

export const emptyDeal: Deal = { percent: null, code: "", text: "" };

export const DEAL_CODE_MAX = 30;
export const DEAL_TEXT_MAX = 80;

export const hasDeal = (d: Deal | null | undefined): d is Deal =>
  !!d && (!!d.code || d.percent != null || !!d.text);

// Short label for chips, like "-30% OFF" or "Deal"
export const dealLabel = (d: Deal) =>
  d.percent != null ? `-${d.percent}% OFF` : "Deal";

// Checks and trims what the maker typed. Codes are letters, numbers, - and _.
export function cleanDeal(
  input: Partial<Deal> | null | undefined,
): { ok: true; value: Deal | null } | { ok: false; error: string } {
  const code = String(input?.code ?? "")
    .trim()
    .toUpperCase();
  const text = String(input?.text ?? "").trim();
  const raw = input?.percent;
  const percent =
    raw == null || String(raw).trim() === "" ? null : Math.round(Number(raw));

  if (!code && percent == null && !text) return { ok: true, value: null };
  if (code.length > DEAL_CODE_MAX || !/^[A-Z0-9_-]*$/.test(code))
    return {
      ok: false,
      error: `Use up to ${DEAL_CODE_MAX} letters, numbers, - or _ for the coupon code.`,
    };
  if (
    percent != null &&
    (!Number.isFinite(percent) || percent < 1 || percent > 100)
  )
    return { ok: false, error: "The discount should be between 1% and 100%." };
  if (text.length > DEAL_TEXT_MAX)
    return {
      ok: false,
      error: `Keep the offer line under ${DEAL_TEXT_MAX} characters.`,
    };
  if (!code && !text)
    return {
      ok: false,
      error: "Add a coupon code, or say how people get the discount.",
    };
  return { ok: true, value: { percent, code, text } };
}

// Database columns for a deal (migration 012)
export const dealColumns = (d: Deal | null) => ({
  deal_percent: d?.percent ?? null,
  deal_code: d?.code || null,
  deal_text: d?.text || null,
});
