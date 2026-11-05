import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "@/components/SettingsForm";
import { SiteShell } from "@/components/SiteShell";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <SiteShell>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Manage your profile, account and emails.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <Settings />
      </Suspense>
    </SiteShell>
  );
}

async function Settings() {
  const user = await requireUser("/settings");
  return <SettingsForm profile={user.profile} email={user.email} />;
}
