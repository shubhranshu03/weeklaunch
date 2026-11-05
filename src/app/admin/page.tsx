import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRight, Crown, Zap } from "lucide-react";
import { ProductLogo } from "@/components/ProductRow";
import { ReviewButtons } from "@/components/ReviewButtons";
import { SiteShell } from "@/components/SiteShell";
import { isAdmin, requireUser } from "@/lib/auth";
import { toProduct, type ProductRowDb } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Review launches",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <SiteShell>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Review launches
      </h1>
      <p className="mt-0.5 text-sm text-slate-500">
        Approved launches go live on Monday of their week.
      </p>
      <Suspense
        fallback={
          <div className="mt-6 h-64 animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <Queue />
      </Suspense>
    </SiteShell>
  );
}

async function Queue() {
  const user = await requireUser("/admin");
  if (!isAdmin(user.email)) notFound();

  const { data } = await supabaseAdmin()
    .from("products")
    .select(
      "*, maker:profiles!products_maker_id_fkey(name, handle, avatar_url, verified)",
    )
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });
  const queue = ((data ?? []) as ProductRowDb[]).map(toProduct);

  if (queue.length === 0)
    return (
      <p className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        Nothing waiting for review. 🎉
      </p>
    );

  return (
    <ul className="mt-6 space-y-3">
      {queue.map((p) => (
        <li
          key={p.id}
          className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start gap-3 sm:gap-4">
            <ProductLogo logo={p.logo} name={p.name} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                {p.name}
                {p.premium && <Crown className="size-3.5 text-amber-500" />}
                {p.boosted && <Zap className="size-3.5 text-brand-600" />}
              </p>
              <p className="text-sm text-slate-500">{p.tagline}</p>
              <p className="mt-1 text-xs text-slate-400">
                Week {p.week}, {p.year} · {p.tags.join(", ")} · by{" "}
                {p.maker.name}
                {p.maker.handle && ` (@${p.maker.handle})`}
              </p>
            </div>
            <ReviewButtons productId={p.id} />
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-slate-600">
            {p.description}
          </p>
          <Link
            href={p.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
          >
            {p.website.replace(/^https?:\/\//, "")}
            <ArrowUpRight className="size-3.5" />
          </Link>
          {p.screenshots.length > 0 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {p.screenshots.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element -- maker-uploaded screenshot
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-28 shrink-0 rounded-xl border border-slate-200 object-cover"
                />
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
