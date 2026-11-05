import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  CircleCheck,
  CircleX,
  CreditCard,
  Crown,
  Hourglass,
  MessageSquare,
  Plus,
  Rocket,
  Send,
  ShieldCheck,
  Triangle,
} from "lucide-react";
import { PayButton } from "@/components/PayButton";
import { ProductLogo } from "@/components/ProductRow";
import { SiteShell } from "@/components/SiteShell";
import { isAdmin, requireUser } from "@/lib/auth";
import { getDirectoryPackage } from "@/lib/directories";
import { supabaseAdmin } from "@/lib/supabase/server";
import { PREMIUM_PRICE, type LaunchStatus, type Product } from "@/lib/data";
import { getCurrentWeek, getMakerLaunches } from "@/lib/products";

export const metadata: Metadata = {
  title: "My launches",
  robots: { index: false, follow: false },
};

const statusStyle = {
  pending_payment: {
    label: "Waiting for payment",
    icon: CreditCard,
    className: "bg-amber-100 text-amber-800",
  },
  pending_review: {
    label: "In review",
    icon: Hourglass,
    className: "bg-violet-100 text-violet-800",
  },
  rejected: {
    label: "Not approved",
    icon: CircleX,
    className: "bg-rose-100 text-rose-800",
  },
  live: {
    label: "Live now",
    icon: CircleCheck,
    className: "bg-emerald-100 text-emerald-800",
  },
  scheduled: {
    label: "Scheduled",
    icon: CalendarClock,
    className: "bg-sky-100 text-sky-800",
  },
  past: {
    label: "Launched",
    icon: CircleCheck,
    className: "bg-slate-100 text-slate-700",
  },
};

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <SiteShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            My launches
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            How your products are doing on WeekLaunch.
          </p>
        </div>
        <Link
          href="/submit"
          className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="size-4" />
          New launch
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="mt-4 h-96 animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <Launches searchParams={props.searchParams} />
      </Suspense>
    </SiteShell>
  );
}

async function Launches({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("/dashboard");
  const [
    launches,
    now,
    { paid, status: payStatus, payment_id, directory },
    { data: dirOrders },
  ] = await Promise.all([
    getMakerLaunches(user.id),
    getCurrentWeek(),
    searchParams,
    supabaseAdmin()
      .from("directory_orders")
      .select("id, package, product_name, status, created_at")
      .eq("user_id", user.id)
      .neq("status", "pending_payment")
      .order("created_at", { ascending: false }),
  ]);

  // Checkouts started before the return check land here directly; check them too
  if (typeof payment_id === "string")
    redirect(
      `/api/payments/return?payment_id=${encodeURIComponent(payment_id)}`,
    );

  const phase = (p: Product, status: LaunchStatus) => {
    if (status !== "approved") return status;
    const cmp = p.year - now.year || p.week - now.number;
    return cmp === 0 ? "live" : cmp > 0 ? "scheduled" : "past";
  };

  const live = launches.filter((l) => l.status === "approved");
  const stats = [
    { label: "Launches", value: launches.length, icon: Rocket },
    {
      label: "Upvotes",
      value: live.reduce((n, l) => n + l.product.upvotes, 0),
      icon: Triangle,
    },
    {
      label: "Comments",
      value: live.reduce((n, l) => n + l.product.comments, 0),
      icon: MessageSquare,
    },
  ];

  // Offer Premium for the next free launch that hasn't started yet
  const upgrade = launches.find((l) => {
    const ph = phase(l.product, l.status);
    return (
      !l.product.premium && (ph === "scheduled" || ph === "pending_review")
    );
  });

  return (
    <>
      {directory && (
        <p
          className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
            directory === "failed" || directory === "cancelled"
              ? "bg-rose-50 text-rose-800"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {directory === "failed" || directory === "cancelled" ? (
            <>
              <CircleX className="size-4 shrink-0" />
              The payment didn&apos;t go through, so you weren&apos;t charged.
            </>
          ) : (
            <>
              <CircleCheck className="size-4 shrink-0" />
              Thanks! We&apos;ll start your directory submissions within 2
              working days and email you the report.
            </>
          )}
        </p>
      )}

      {/* Dodo sends people back here with ?paid=<launch>&status=<result> */}
      {paid &&
        (payStatus === "failed" || payStatus === "cancelled" ? (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800">
            <CircleX className="size-4 shrink-0" />
            The payment didn&apos;t go through, so you weren&apos;t charged. Try
            again with Complete payment below.
          </p>
        ) : (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <CircleCheck className="size-4 shrink-0" />
            Thanks! Your payment is being confirmed. It can take a minute to
            show here; refresh the page if the status hasn&apos;t changed.
          </p>
        ))}

      {isAdmin(user.email) && (
        <Link
          href="/admin"
          className="mt-4 flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          <ShieldCheck className="size-4" />
          Review launches waiting for approval
          <ArrowUpRight className="ml-auto size-4" />
        </Link>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
          >
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <s.icon className="size-3.5 shrink-0" />
              <span className="truncate">{s.label}</span>
            </dt>
            <dd className="mt-2 text-xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-2xl">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Your products
      </h2>
      {launches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-semibold text-slate-900">No launches yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Submit your product and it shows up here.
          </p>
          <Link
            href="/submit"
            className="btn-pop mt-5 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Rocket className="size-4" />
            Launch a product
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {launches.map(({ product: p, status }) => {
            const st = statusStyle[phase(p, status)];
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-3 p-4 sm:gap-4"
              >
                <ProductLogo logo={p.logo} name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <span className="truncate">{p.name}</span>
                    {p.premium && (
                      <Crown className="size-3.5 shrink-0 text-amber-500" />
                    )}
                  </p>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${st.className}`}
                    >
                      <st.icon className="size-3" />
                      {st.label}
                    </span>
                    Week {p.week}
                    <span className="flex items-center gap-1">
                      <Triangle className="size-2.5 fill-current" />
                      {p.upvotes}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {status === "pending_payment" ? (
                    <PayButton
                      productId={p.id}
                      premium={p.premium ?? false}
                      className="btn-pop flex h-9 items-center gap-1.5 rounded-lg bg-amber-300 px-3 text-xs font-bold text-slate-900 hover:bg-amber-200"
                    >
                      <CreditCard className="size-3.5" />
                      Complete payment
                    </PayButton>
                  ) : status === "approved" ? (
                    <Link
                      href={`/products/${p.slug}`}
                      className="btn-pop flex h-9 items-center gap-1 rounded-lg bg-amber-300 px-3 text-xs font-bold text-slate-900 hover:bg-amber-200"
                    >
                      View <ArrowUpRight className="size-3.5" />
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {(dirOrders ?? []).length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Directory submissions
          </h2>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {(dirOrders ?? []).map((o) => {
              const pkg = getDirectoryPackage(o.package);
              const label =
                o.status === "done"
                  ? "Done · report sent"
                  : o.status === "in_progress"
                    ? "In progress"
                    : o.status === "refunded"
                      ? "Refunded"
                      : "Paid · starting soon";
              return (
                <li key={o.id} className="flex items-center gap-3 p-4">
                  <span className="badge-pop flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-300 text-slate-900">
                    <Send className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {o.product_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {pkg?.count} directories · {label}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {upgrade && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 p-5 text-white">
          <span className="badge-pop flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-300 text-slate-900">
            <Crown className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">
              Upgrade {upgrade.product.name} to Premium
            </span>
            <span className="block text-sm text-white/75">
              Get pinned at the top of Week {upgrade.product.week} for $
              {PREMIUM_PRICE}.
            </span>
          </span>
          <PayButton
            productId={upgrade.product.id}
            premium
            className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-amber-300 px-4 text-sm font-bold text-slate-900 hover:bg-amber-200"
          >
            Upgrade
          </PayButton>
        </div>
      )}
    </>
  );
}
