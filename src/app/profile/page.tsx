import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Settings } from "lucide-react";
import { Suspense } from "react";
import { MakerProfile } from "@/components/MakerProfile";
import { SiteShell } from "@/components/SiteShell";
import { requireUser } from "@/lib/auth";
import { getMakerLaunches } from "@/lib/products";
export const metadata: Metadata = {
  title: "My profile",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <ProfileDetail />
      </Suspense>
    </SiteShell>
  );
}

async function ProfileDetail() {
  const { id, profile } = await requireUser("/profile");
  const launches = (await getMakerLaunches(id))
    .filter((l) => l.status === "approved")
    .map((l) => l.product);

  return (
    <MakerProfile
      profile={profile}
      launches={launches}
      action={
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/makers/${profile.handle}`}
            aria-label="View your public profile"
            className="btn-pop flex size-9 items-center justify-center rounded-xl bg-white text-slate-900 sm:size-10"
          >
            <ExternalLink className="size-4" />
          </Link>
          <Link
            href="/settings"
            className="btn-pop flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-semibold text-slate-900 sm:h-10 sm:px-4"
          >
            <Settings className="size-4" />
            Edit profile
          </Link>
        </div>
      }
      empty={
        <>
          <p className="text-sm text-slate-500">No live launches yet.</p>
          <Link
            href="/submit"
            className="btn-pop mt-4 inline-flex h-10 items-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Launch your first product
          </Link>
        </>
      }
    />
  );
}
