import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { EditLaunchForm } from "@/components/EditLaunchForm";
import { SiteShell } from "@/components/SiteShell";
import { requireUser } from "@/lib/auth";
import type { ProductRowDb } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit launch",
  robots: { index: false, follow: false },
};

// Cache Components needs one example; real launch ids are handled per request
export function generateStaticParams() {
  return [{ id: "00000000-0000-0000-0000-000000000000" }];
}

export default function EditLaunchPage({
  params,
}: PageProps<"/dashboard/launches/[id]">) {
  return (
    <SiteShell>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        My launches
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        Edit launch
      </h1>
      <p className="mt-0.5 mb-5 text-sm text-slate-500">
        Fix details, change your logo and screenshots, or update your FAQ.
      </p>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <Edit params={params} />
      </Suspense>
    </SiteShell>
  );
}

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/dashboard/launches/${id}`);
  // Only the maker's own launch; anything else looks like it doesn't exist
  const { data } = /^[0-9a-f-]{36}$/.test(id)
    ? await supabaseAdmin()
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("maker_id", user.id)
        .maybeSingle<ProductRowDb>()
    : { data: null };
  if (!data) notFound();

  if (data.status === "rejected")
    return (
      <p className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        This launch wasn&apos;t approved, so it can&apos;t be edited. You can
        submit it again from{" "}
        <Link
          href="/submit"
          className="font-semibold text-brand-700 hover:underline"
        >
          Launch product
        </Link>
        .
      </p>
    );

  return (
    <EditLaunchForm
      productId={data.id}
      userId={user.id}
      slug={data.slug}
      premium={data.plan === "premium"}
      approved={data.status === "approved"}
      initial={{
        name: data.name,
        website: data.website,
        tagline: data.tagline,
        description: data.description,
        categories: data.tags,
        logo: data.logo_url,
        shots: data.screenshots,
        highlights: data.highlights ?? [],
        faqs: data.faqs ?? [],
      }}
    />
  );
}
