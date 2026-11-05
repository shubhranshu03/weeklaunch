export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  website: string;
  tags: string[];
  upvotes: number;
  comments: number;
  rating?: { score: number; count: number };
  verified?: boolean;
  premium?: boolean;
  boosted?: boolean;
  logo: { glyph: string; from: string; to: string; fg?: string; url?: string };
  screenshots: string[];
  // Premium only: "Why choose us" points and the maker's own FAQ
  highlights: string[];
  faqs: { q: string; a: string }[];
  week: number;
  year: number;
  maker: { name: string; handle?: string; avatar?: string; verified?: boolean };
};

export type LaunchStatus =
  "pending_payment" | "pending_review" | "approved" | "rejected";

// Pricing, in US dollars
export const PREMIUM_PRICE = 29;
export const BOOST_PRICE = 19;
// Launches allowed in one week, free and Premium together
export const WEEK_CAPACITY = 25;
// Of those, how many can be Premium
export const PREMIUM_CAPACITY = 5;
// How many weeks ahead free launches are queued
export const FREE_QUEUE_WEEKS = 3;

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
