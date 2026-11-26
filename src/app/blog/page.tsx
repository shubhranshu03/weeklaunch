import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Newspaper } from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  BrowseShell,
  BrowseShellFallback,
} from "@/components/home/BrowseShell";
import { postDate, posts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog: launch guides for indie makers",
  description:
    "Guides for indie makers on launching a product, getting the first users and listing it in the right places.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<BrowseShellFallback />}>
        <BrowseShell>
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-brand-50/80 to-white px-5 py-9 text-center sm:px-10">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
              <Newspaper className="size-6" />
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Blog
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-slate-600">
              Launch guides and stories from indie makers.
            </p>
          </section>
          <ul className="mt-6 space-y-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group block rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg"
                >
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    {postDate(p.date)} · {p.readMinutes} min read
                    {p.sponsored && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                        Sponsored
                      </span>
                    )}
                  </p>
                  <h2 className="mt-1.5 text-lg font-semibold text-slate-900 group-hover:text-brand-700">
                    {p.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {p.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </BrowseShell>
      </Suspense>
      <Footer cta={false} />
    </div>
  );
}
