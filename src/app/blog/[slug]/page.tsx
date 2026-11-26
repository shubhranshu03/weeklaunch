import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  BrowseShell,
  BrowseShellFallback,
} from "@/components/home/BrowseShell";
import { JsonLd } from "@/components/JsonLd";
import { getPost, postDate, posts, type BlogBlock } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", publishedTime: post.date },
  };
}

export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<BrowseShellFallback />}>
        <Post params={params} />
      </Suspense>
      <Footer cta={false} />
    </div>
  );
}

function Block({ b }: { b: BlogBlock }) {
  if (b.type === "h2")
    return (
      <h2 className="mt-8 text-xl font-semibold tracking-tight text-slate-900">
        {b.text}
      </h2>
    );
  if (b.type === "p")
    return <p className="mt-4 leading-relaxed text-slate-700">{b.text}</p>;
  if (b.type === "list")
    return (
      <ul className="mt-4 space-y-2">
        {b.items.map((t) => (
          <li key={t} className="flex gap-2.5 leading-relaxed text-slate-700">
            <Check className="mt-1 size-4 shrink-0 text-emerald-600" />
            {t}
          </li>
        ))}
      </ul>
    );
  return (
    <ol className="mt-4 space-y-4">
      {b.items.map((s, i) => (
        <li key={s.title} className="flex gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {i + 1}
          </span>
          <span>
            <span className="block font-semibold text-slate-900">
              {s.title}
            </span>
            <span className="mt-0.5 block leading-relaxed text-slate-700">
              {s.text}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

// Reads the address inside Suspense, so the frame can show instantly
async function Post({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { "@type": "Organization", name: post.author },
          url: `${SITE_URL}/blog/${post.slug}`,
        }}
      />
      <BrowseShell>
        <article className="rounded-2xl border border-slate-200 bg-white px-5 py-7 sm:px-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            Blog
          </Link>
          <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            {postDate(post.date)} · {post.readMinutes} min read · {post.author}
            {post.sponsored && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                Sponsored
              </span>
            )}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-slate-900">
            {post.title}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-slate-600">
            {post.description}
          </p>
          <div className="mt-4 border-t border-slate-100 pt-2">
            {post.body.map((b, i) => (
              <Block key={i} b={b} />
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start gap-3 rounded-xl bg-brand-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-slate-900">
              Ready to launch your product?
            </p>
            <Link
              href="/submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Launch on IndieShip <ArrowRight className="size-4" />
            </Link>
          </div>
        </article>
      </BrowseShell>
    </>
  );
}
