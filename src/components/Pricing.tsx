import Link from "next/link";
import { ReviewGrid } from "./Testimonials";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Crown,
  Megaphone,
  PanelRight,
  Rocket,
  Rows3,
  Star,
} from "lucide-react";

const launchPlans = [
  {
    name: "Free launch",
    price: "$0",
    period: "forever",
    blurb: "List your product on a weekly board.",
    icon: Rocket,
    features: [
      "Listed on a weekly launch board",
      "Your own product page",
      "Upvotes and comments",
      "Backlink when you add our badge",
    ],
    cta: "Launch for free",
    featured: false,
  },
  {
    name: "Premium launch",
    price: "$29",
    period: "one-time",
    blurb: "Get seen first and skip the queue.",
    icon: Crown,
    features: [
      "Skip the queue — pick any launch week",
      "FEATURED tag and a Visit button",
      "Pinned at the top for your whole week",
      "Permanent dofollow backlink",
      "Shared in the Monday newsletter",
      "Priority support",
    ],
    cta: "Get Premium launch",
    featured: true,
  },
];

const adPlans = [
  {
    id: "center",
    name: "Center feed ad",
    price: "$19",
    period: "per week",
    blurb: "A sponsor card inside the launch list, right after the top 3.",
    icon: Rows3,
    features: [
      "Seen by every visitor to the board",
      "Your logo, headline and link",
      "Shows on desktop and phone",
      "Click stats at the end of the week",
    ],
    cta: "Book a week",
  },
  {
    id: "sidebar",
    name: "Right sidebar ad",
    price: "$49",
    period: "per month",
    blurb: "Your promo box in the right column on every page.",
    icon: PanelRight,
    features: [
      "On every page for 30 days",
      "Your logo, one line and a link",
      "Stays on screen while people scroll",
      "Click stats every week",
    ],
    cta: "Book a month",
  },
];

const faqs = [
  {
    q: "Is the free launch really free?",
    a: "Yes. You get a spot on a weekly board, your own product page, upvotes and comments — no card needed. Free launches join a queue, so your week may be a few weeks out.",
  },
  {
    q: "What's the difference between Free and Premium?",
    a: "Premium skips the queue so you pick your exact week, pins you at the top of the board all week, adds the FEATURED tag and Visit button, and gives you a permanent dofollow backlink plus a mention in our Monday newsletter.",
  },
  {
    q: "When does my Premium launch go live?",
    a: "You choose the week. Your product goes live on Monday at 00:00 UTC and stays pinned at the top until Sunday night.",
  },
  {
    q: "Is the backlink dofollow?",
    a: "Premium launches always get a dofollow link. Free launches get one too once you add our small launch badge to your website.",
  },
  {
    q: "Can I upgrade from Free to Premium later?",
    a: "Yes, any time before your launch week starts. You only pay the $29 Premium price and keep everything you've already set up.",
  },
  {
    q: "Can I launch the same product again?",
    a: "Yes, for a big update or new version. We ask for at least 3 months between launches of the same product so the board stays fresh.",
  },
  {
    q: "Can I buy an ad without launching a product?",
    a: "Yes. Ads are separate from launches — any product, newsletter or service can book the center feed or the right sidebar.",
  },
  {
    q: "How many ad spots are there?",
    a: "One center feed spot per week and one right sidebar spot per month, so your ad is never shared with anyone else.",
  },
  {
    q: "What do I need to send for an ad?",
    a: "Your logo, a short headline (up to 60 characters) and the link. We set it up and send you a preview before it goes live.",
  },
  {
    q: "Are there products you don't accept?",
    a: "We don't list or advertise gambling, adult content, scams or anything illegal. Every launch and ad is checked by a person before it goes live.",
  },
  {
    q: "How do I pay?",
    a: "By card through our secure checkout. You'll get an invoice by email straight away.",
  },
  {
    q: "Can I get a refund?",
    a: "If your launch or ad hasn't gone live yet, you can cancel for a full refund.",
  },
];

// Tiny page map showing where an ad appears
function Placement({ spot }: { spot: string }) {
  const block = "rounded-[3px] bg-slate-200";
  const hot = "rounded-[3px] bg-brand-500";
  return (
    <div
      aria-hidden
      className="grid h-24 w-full grid-cols-[1fr_2.2fr_1.2fr] gap-1.5 rounded-xl border-[1.5px] border-slate-900 bg-slate-50 p-2"
    >
      <div className={block} />
      <div className="flex flex-col gap-1">
        <div className={`h-2 ${block}`} />
        <div className={`h-2 ${block}`} />
        <div className={`h-3.5 ${spot === "center" ? hot : block}`} />
        <div className={`h-2 ${block}`} />
        <div className={`h-2 ${block}`} />
      </div>
      <div className="flex flex-col gap-1">
        <div className={`h-6 ${spot === "sidebar" ? hot : block}`} />
        <div className={`flex-1 ${block}`} />
      </div>
    </div>
  );
}

function Feature({
  children,
  light,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <li className="flex gap-2.5 text-sm">
      <span
        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
          light ? "bg-white text-brand-600" : "bg-brand-100 text-brand-700"
        }`}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
      <span className={light ? "text-white/90" : "text-slate-600"}>
        {children}
      </span>
    </li>
  );
}

export function Pricing() {
  return (
    <div>
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center sm:p-8">
        <span className="badge-pop inline-flex items-center gap-1.5 rounded-md bg-amber-300 px-2 py-0.5 text-xs font-bold text-slate-900">
          Simple pricing
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          Launch it. Promote it.
        </h1>
        <p className="mx-auto mt-2 max-w-md text-slate-500">
          Launching is free. Pay only when you want more eyes on your product.
        </p>
      </div>

      {/* Launch plans */}
      <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Launch plans
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {launchPlans.map((p) => (
          <article
            key={p.name}
            className={`relative flex flex-col rounded-3xl p-6 ${
              p.featured
                ? "badge-pop bg-gradient-to-br from-brand-500 to-indigo-600 text-white"
                : "border border-slate-200 bg-white"
            }`}
          >
            {p.featured && (
              <span className="badge-pop absolute -top-3 right-5 rounded-md bg-amber-300 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-900">
                Most popular
              </span>
            )}
            <div className="flex items-center gap-2">
              <p.icon
                className={`size-5 ${p.featured ? "text-amber-300" : "text-brand-600"}`}
              />
              <h3 className="font-semibold">{p.name}</h3>
            </div>
            <p
              className={`mt-1 text-sm ${p.featured ? "text-white/75" : "text-slate-500"}`}
            >
              {p.blurb}
            </p>
            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl font-bold tracking-tight">
                {p.price}
              </span>
              <span
                className={`text-sm ${p.featured ? "text-white/70" : "text-slate-500"}`}
              >
                {p.period}
              </span>
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <Feature key={f} light={p.featured}>
                  {f}
                </Feature>
              ))}
            </ul>
            <Link
              href="/submit"
              className={`btn-pop mt-6 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold ${
                p.featured
                  ? "bg-amber-300 text-slate-900 hover:bg-amber-200"
                  : "bg-white text-slate-900 hover:bg-slate-50"
              }`}
            >
              {p.cta} <ArrowRight className="size-4" />
            </Link>
          </article>
        ))}
      </div>

      {/* Advertising */}
      <div id="ads" className="scroll-mt-6">
        <h2 className="mb-3 mt-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Megaphone className="size-3.5" />
          Advertise
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {adPlans.map((p) => (
            <article
              key={p.id}
              className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6"
            >
              <Placement spot={p.id} />
              <div className="mt-5 flex items-center gap-2">
                <p.icon className="size-5 text-brand-600" />
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">{p.blurb}</p>
              <p className="mt-5 flex items-baseline gap-1.5 text-slate-900">
                <span className="text-4xl font-bold tracking-tight">
                  {p.price}
                </span>
                <span className="text-sm text-slate-500">{p.period}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <Feature key={f}>{f}</Feature>
                ))}
              </ul>
              <Link
                href="/contact"
                className="btn-pop mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-bold text-white hover:bg-brand-600"
              >
                {p.cta} <ArrowRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <h2 className="mb-3 mt-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Star className="size-3.5" />
        What makers say
      </h2>
      <ReviewGrid />

      {/* FAQ */}
      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Questions
      </h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        {faqs.map((f) => (
          <details key={f.q} className="group px-5 py-4 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="size-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
