import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit your product — WeekLaunch",
  description:
    "Launch your product on WeekLaunch. Add your details, pick a launch week and go live on Monday.",
};

export default function SubmitPage() {
  return (
    <SiteShell sidebars={false}>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Launch your product
        </h1>
        <p className="mt-1 text-slate-500">
          Takes about 3 minutes. Free launches go live on the next open Monday.
        </p>
      </div>
      <SubmitForm />
    </SiteShell>
  );
}
