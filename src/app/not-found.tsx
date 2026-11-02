import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

export default function NotFound() {
  return (
    <SiteShell sidebars={false}>
      <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center">
        <span className="badge-pop flex size-16 items-center justify-center rounded-2xl bg-amber-300 text-3xl font-bold text-slate-900">
          ?
        </span>
        <p className="mt-6 text-sm font-semibold text-brand-600">404</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          This page didn&apos;t launch
        </h1>
        <p className="mt-2 max-w-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-6 flex gap-2">
          <Link
            href="/"
            className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>
          <Link
            href="/products"
            className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900"
          >
            <Compass className="size-4" />
            Browse products
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
