import "server-only";
import { PREMIUM_PRICE } from "./data";
import { supabaseAdmin } from "./supabase/server";
import { weekNumber } from "./weeks";

export const FREE_USED = `You've used your one free product. Choose Premium ($${PREMIUM_PRICE}) to launch another.`;

async function activeLaunches(userId: string, exceptId?: string) {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("id, plan, status, launch_week, created_at")
    .eq("maker_id", userId)
    .neq("status", "rejected");
  // Throw rather than guess: an empty answer would let everyone through
  if (error) throw new Error("Couldn't check this account's launches");
  return (data ?? []).filter((p) => p.id !== exceptId);
}

// Each account gets one free product. A rejected one doesn't use it up, and nor
// does an unpaid one whose week has started, as it can't be paid for any more.
export async function freeLaunchUsed(userId: string, exceptId?: string) {
  const now = weekNumber(new Date());
  return (await activeLaunches(userId, exceptId)).some(
    (p) =>
      p.plan === "free" &&
      (p.status !== "pending_payment" || p.launch_week > now),
  );
}

// Why this account can't take a spot, or null when it can
export async function launchBlock(
  userId: string,
  launch: { free: boolean; unpaid: boolean },
  exceptId?: string,
) {
  if (launch.free && (await freeLaunchUsed(userId, exceptId))) return FREE_USED;

  // An unpaid checkout holds a spot for an hour, so each account gets one at a time
  if (launch.unpaid) {
    const hourAgo = Date.now() - 3_600_000;
    const holding = (await activeLaunches(userId, exceptId)).some(
      (p) =>
        p.status === "pending_payment" &&
        new Date(p.created_at).getTime() >= hourAgo,
    );
    if (holding)
      return "You already have a launch waiting for payment. Finish paying in My launches, or try again in an hour.";
  }
  return null;
}
