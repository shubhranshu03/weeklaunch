export type Product = {
  slug: string;
  name: string;
  tagline: string;
  tags: string[];
  upvotes: number;
  comments: number;
  rating?: { score: number; count: number };
  verified?: boolean;
  premium?: boolean;
  logo: { glyph: string; from: string; to: string; fg?: string };
};

export type Week = {
  number: number;
  year: number;
  label: string;
  current?: boolean;
};

// Replace with the real domain before going live
export const SITE_URL = "https://weeklaunch.com";

export const CURRENT_WEEK = 45;

export const weeks: Week[] = [
  { number: 41, year: 2026, label: "Oct 5 – 11" },
  { number: 42, year: 2026, label: "Oct 12 – 18" },
  { number: 43, year: 2026, label: "Oct 19 – 25" },
  { number: 44, year: 2026, label: "Oct 26 – Nov 1" },
  { number: 45, year: 2026, label: "Nov 2 – 8", current: true },
  { number: 46, year: 2026, label: "Nov 9 – 15" },
  { number: 47, year: 2026, label: "Nov 16 – 22" },
  { number: 48, year: 2026, label: "Nov 23 – 29" },
];

export const products: Product[] = [
  {
    slug: "studyflow",
    name: "StudyFlow",
    tagline: "Turn any PDF, video or lecture into flashcards and smart notes",
    tags: ["Productivity", "AI", "Education"],
    upvotes: 128,
    comments: 24,
    rating: { score: 4.9, count: 18 },
    verified: true,
    premium: true,
    logo: { glyph: "SF", from: "#6366f1", to: "#a855f7" },
  },
  {
    slug: "shipkit",
    name: "ShipKit",
    tagline: "The Next.js boilerplate that gets your SaaS live in a weekend",
    tags: ["DevTool", "SaaS"],
    upvotes: 104,
    comments: 17,
    rating: { score: 4.8, count: 11 },
    verified: true,
    logo: { glyph: "⚡", from: "#0f172a", to: "#334155" },
  },
  {
    slug: "ledgerly",
    name: "Ledgerly",
    tagline: "Money in, money out — your finances in one menu bar",
    tags: ["Finance", "Productivity"],
    upvotes: 91,
    comments: 9,
    verified: true,
    logo: { glyph: "L", from: "#10b981", to: "#059669" },
  },
  {
    slug: "pixelpost",
    name: "PixelPost",
    tagline: "Generate on-brand social posts from a single product URL",
    tags: ["Marketing", "AI", "Design"],
    upvotes: 76,
    comments: 12,
    rating: { score: 4.7, count: 6 },
    logo: { glyph: "P", from: "#f43f5e", to: "#fb923c" },
  },
  {
    slug: "querypilot",
    name: "QueryPilot",
    tagline: "Ask your Postgres questions in plain English, get charts back",
    tags: ["Analytics", "AI", "DevTool"],
    upvotes: 63,
    comments: 8,
    verified: true,
    logo: { glyph: "Q", from: "#0ea5e9", to: "#2563eb" },
  },
  {
    slug: "deepcheck",
    name: "DeepCheck",
    tagline: "Spot AI-generated images and deepfakes in seconds",
    tags: ["AI", "Chrome Extension"],
    upvotes: 52,
    comments: 5,
    logo: { glyph: "◎", from: "#18181b", to: "#3f3f46", fg: "#a3e635" },
  },
  {
    slug: "netwise",
    name: "NetWise",
    tagline: "Family net-worth tracker with automatic goal projections",
    tags: ["Finance", "Productivity"],
    upvotes: 44,
    comments: 6,
    rating: { score: 5.0, count: 3 },
    logo: { glyph: "N", from: "#f59e0b", to: "#eab308" },
  },
  {
    slug: "focusbeat",
    name: "FocusBeat",
    tagline: "Adaptive soundscapes that help you stay in deep work longer",
    tags: ["Productivity", "Music"],
    upvotes: 37,
    comments: 4,
    logo: { glyph: "♪", from: "#8b5cf6", to: "#ec4899" },
  },
  {
    slug: "diffly",
    name: "Diffly",
    tagline: "Compare texts privately in your browser with highlighted changes",
    tags: ["DevTool", "Privacy"],
    upvotes: 29,
    comments: 2,
    logo: { glyph: "±", from: "#14b8a6", to: "#0d9488" },
  },
  {
    slug: "replybot",
    name: "ReplyBot",
    tagline: "Turn Instagram comments into customers, automatically",
    tags: ["Social Media", "Marketing"],
    upvotes: 22,
    comments: 3,
    logo: { glyph: "R", from: "#d946ef", to: "#f43f5e" },
  },
  {
    slug: "subtrack",
    name: "SubTrack",
    tagline: "Never forget a subscription renewal again",
    tags: ["Finance", "Productivity"],
    upvotes: 18,
    comments: 1,
    logo: { glyph: "S", from: "#64748b", to: "#475569" },
  },
  {
    slug: "canvasai",
    name: "Canvas IDE",
    tagline: "One infinite canvas for all your terminals, repos and agents",
    tags: ["DevTool", "AI"],
    upvotes: 14,
    comments: 2,
    logo: { glyph: "◇", from: "#1e293b", to: "#0f172a", fg: "#38bdf8" },
  },
];

export const categories = [
  { name: "AI", count: 412 },
  { name: "Productivity", count: 318 },
  { name: "DevTool", count: 241 },
  { name: "Marketing", count: 196 },
  { name: "Finance", count: 133 },
  { name: "Design", count: 121 },
  { name: "Analytics", count: 98 },
  { name: "SaaS", count: 87 },
];

export const makers = [
  { name: "Priya S.", handle: "@priyabuilds", launches: 6, color: "#6366f1" },
  { name: "Marco L.", handle: "@marcoships", launches: 4, color: "#f43f5e" },
  { name: "Aiko T.", handle: "@aikodev", launches: 3, color: "#10b981" },
];

export const lastWeekBest = [
  {
    name: "TripDesk",
    tagline: "Plan your next adventure effortlessly",
    upvotes: 40,
    logo: { glyph: "T", from: "#0ea5e9", to: "#6366f1" },
  },
  {
    name: "Keymode",
    tagline: "The keyboard cockpit for your Mac",
    upvotes: 34,
    logo: { glyph: "⌘", from: "#18181b", to: "#3f3f46" },
  },
  {
    name: "BulkPing",
    tagline: "Bulk WhatsApp, phone & email checks",
    upvotes: 32,
    logo: { glyph: "B", from: "#a855f7", to: "#ec4899" },
  },
];

// Sample reviews for the design — replace with real maker reviews before going live.
// `avatar` can be a real customer photo in /public (e.g. "/avatars/riya.jpg"), used with
// their permission; until then each review shows an illustrated placeholder avatar.
export type Testimonial = {
  name: string;
  role: string;
  result: string;
  quote: string;
  color: string;
  avatar?: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Riya Kapoor",
    role: "Founder, StudyFlow",
    result: "#1 of Week 41",
    quote:
      "We got 140 signups in launch week and still get traffic from our WeekLaunch page months later. The upvotes were nice, but the real win was the long tail: our product page ranks on Google for our main keyword, and people keep finding us through it. Easily the best launch we have done.",
    color: "#7c5cff",
  },
  {
    name: "Daniel Ortiz",
    role: "Maker, ShipKit",
    result: "#2 of Week 39",
    quote:
      "Submitting took five minutes. The weekly board gives smaller makers a real shot at the top.",
    color: "#0ea5e9",
  },
  {
    name: "Mei Tanaka",
    role: "Co-founder, Ledgerly",
    result: "Featured launch",
    quote:
      "The backlink and product page alone were worth it. Our first paying customers found us here.",
    color: "#ec4899",
  },
  {
    name: "Arjun Mehta",
    role: "Indie hacker, NetWise",
    result: "#4 of Week 43",
    quote:
      "Honest feedback from other makers in the comments helped us fix our onboarding in a day. Three people pointed out the same confusing step, we shipped a fix that night, and our trial-to-paid rate went up the next week. Launching here felt like a free user-testing session.",
    color: "#f59e0b",
  },
  {
    name: "Sofia Laurent",
    role: "Founder, PixelPost",
    result: "#3 of Week 40",
    quote:
      "Clean, fair and no pay-to-win nonsense. We launch every new feature here now.",
    color: "#10b981",
  },
  {
    name: "Tom Becker",
    role: "Developer, Diffly",
    result: "Launched Week 42",
    quote:
      "Got picked up by two newsletters after launching. Didn't expect that from a free listing. Totally worth it!",
    color: "#6366f1",
  },
];

// Older launches shown on the All products page (sample data)
export const pastProducts: Product[] = [
  {
    slug: "promptpal",
    name: "PromptPal",
    tagline: "Save, version and share your best AI prompts with your team",
    tags: ["AI", "Productivity"],
    upvotes: 212,
    comments: 31,
    rating: { score: 4.8, count: 22 },
    verified: true,
    logo: { glyph: "✦", from: "#7c3aed", to: "#c026d3" },
  },
  {
    slug: "documind",
    name: "DocuMind",
    tagline: "Chat with your contracts, invoices and reports in seconds",
    tags: ["AI", "Productivity"],
    upvotes: 167,
    comments: 19,
    verified: true,
    logo: { glyph: "D", from: "#2563eb", to: "#7c3aed" },
  },
  {
    slug: "voicenote",
    name: "VoiceNote AI",
    tagline: "Turn rambling voice memos into clean, organised notes",
    tags: ["AI", "Productivity"],
    upvotes: 98,
    comments: 7,
    logo: { glyph: "◉", from: "#f97316", to: "#ef4444" },
  },
  {
    slug: "palettely",
    name: "Palettely",
    tagline: "Generate accessible color palettes from any image or brand",
    tags: ["Design"],
    upvotes: 143,
    comments: 15,
    rating: { score: 4.9, count: 9 },
    verified: true,
    logo: { glyph: "◐", from: "#ec4899", to: "#f59e0b" },
  },
  {
    slug: "iconforge",
    name: "IconForge",
    tagline: "3,000 open-source icons you can tweak and export in one click",
    tags: ["Design", "DevTool"],
    upvotes: 88,
    comments: 6,
    logo: { glyph: "◆", from: "#0f172a", to: "#334155", fg: "#fbbf24" },
  },
  {
    slug: "mockshot",
    name: "MockShot",
    tagline: "Drop a screenshot, get a beautiful device mockup",
    tags: ["Design", "Marketing"],
    upvotes: 61,
    comments: 4,
    logo: { glyph: "▣", from: "#06b6d4", to: "#3b82f6" },
  },
  {
    slug: "mailsprout",
    name: "MailSprout",
    tagline: "Grow your newsletter with referral rewards that run themselves",
    tags: ["Marketing"],
    upvotes: 119,
    comments: 12,
    verified: true,
    logo: { glyph: "M", from: "#22c55e", to: "#15803d" },
  },
  {
    slug: "pulseboard",
    name: "PulseBoard",
    tagline: "One live dashboard for revenue, signups and churn",
    tags: ["Analytics", "SaaS"],
    upvotes: 104,
    comments: 9,
    rating: { score: 4.6, count: 5 },
    logo: { glyph: "∿", from: "#e11d48", to: "#9333ea" },
  },
  {
    slug: "tasktide",
    name: "TaskTide",
    tagline: "A calm to-do list that plans your day around your energy",
    tags: ["Productivity"],
    upvotes: 76,
    comments: 8,
    logo: { glyph: "T", from: "#0ea5e9", to: "#14b8a6" },
  },
  {
    slug: "threadcraft",
    name: "ThreadCraft",
    tagline: "Write, schedule and recycle your best X and Threads posts",
    tags: ["Social Media", "Marketing"],
    upvotes: 57,
    comments: 5,
    logo: { glyph: "@", from: "#18181b", to: "#52525b" },
  },
];

export const productCategories = [
  { name: "AI", blurb: "Assistants, agents and smart tools" },
  { name: "Productivity", blurb: "Get more done with less effort" },
  { name: "DevTool", blurb: "Built for developers and builders" },
  { name: "Design", blurb: "Colors, icons, mockups and more" },
  { name: "Marketing", blurb: "Grow your audience and sales" },
  { name: "Analytics", blurb: "Understand your numbers" },
  { name: "Finance", blurb: "Money, budgets and subscriptions" },
  { name: "Social Media", blurb: "Post, schedule and engage" },
];

export const allProducts: Product[] = [...products, ...pastProducts];

export function getProduct(slug: string) {
  return allProducts.find((p) => p.slug === slug);
}

const sampleMakers = ["Priya S.", "Marco L.", "Aiko T.", "Sam R.", "Lena K."];

// Sample launch details until products come from a database
export function launchInfo(product: Product) {
  const past = pastProducts.indexOf(product);
  const index = allProducts.indexOf(product);
  return {
    week: past === -1 ? CURRENT_WEEK : CURRENT_WEEK - 1 - (past % 4),
    maker: sampleMakers[index % sampleMakers.length],
    website: `https://${product.slug}.com`,
  };
}
