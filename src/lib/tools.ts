export type Tool = {
  slug: string;
  name: string;
  // Short line for cards and llms.txt
  summary: string;
  // Search-focused title and description for the tool page
  seoTitle: string;
  seoDescription: string;
  icon:
    "checklist" | "tagline" | "meta" | "badge" | "name" | "checker" | "planner";
};

export const tools: Tool[] = [
  {
    slug: "launch-checklist",
    name: "Product Launch Checklist",
    summary:
      "A step-by-step checklist for before, during and after your product launch. Saves your progress.",
    seoTitle: "Free Product Launch Checklist (2026) — 40 steps",
    seoDescription:
      "Free interactive product launch checklist for startups and indie makers: 40 steps for before, during and after launch day. Tick items off and your progress is saved.",
    icon: "checklist",
  },
  {
    slug: "tagline-generator",
    name: "Startup Tagline Generator",
    summary:
      "Turn what your product does into ready-to-use taglines that fit launch directories.",
    seoTitle: "Free Startup Tagline Generator for Your Product",
    seoDescription:
      "Generate short, clear taglines for your startup or SaaS in seconds. Free, no sign-up. Every tagline is checked against the 60-character limit launch directories use.",
    icon: "tagline",
  },
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator & Share Preview",
    summary:
      "Write your page title and description, see how they look on Google, X and LinkedIn, and copy the HTML.",
    seoTitle: "Free Meta Tag Generator & Social Preview",
    seoDescription:
      "Free meta tag generator: preview your page on Google, X (Twitter) and LinkedIn, check title and description length, and copy ready-to-paste HTML meta tags.",
    icon: "meta",
  },
  {
    slug: "startup-name-generator",
    name: "Startup Name Generator",
    summary:
      "Type a few keywords and get brandable names for your startup, each with a quick domain check.",
    seoTitle: "Free Startup Name Generator — brandable ideas",
    seoDescription:
      "Generate brandable startup and SaaS name ideas from your keywords. Free, no sign-up, with a one-click .com domain check for every name.",
    icon: "name",
  },
  {
    slug: "launch-copy-checker",
    name: "Launch Copy Checker",
    summary:
      "Score your tagline and description out of 100 and get simple tips to make them clearer.",
    seoTitle: "Free Tagline & Product Description Checker",
    seoDescription:
      "Check your product tagline and description before you launch. Get a score out of 100 with tips on length, clarity, buzzwords and audience. Free, no sign-up.",
    icon: "checker",
  },
  {
    slug: "launch-date-planner",
    name: "Launch Date Planner",
    summary:
      "Pick your launch day and get a dated, step-by-step plan you can copy or add to your calendar.",
    seoTitle: "Free Product Launch Timeline & Date Planner",
    seoDescription:
      "Pick your launch date and get a day-by-day product launch timeline, from 4 weeks before to 2 weeks after. Copy it or add it to your calendar. Free.",
    icon: "planner",
  },
  {
    slug: "launch-badge",
    name: "Launch Badge Generator",
    summary:
      "Pick a style and copy a 'Launched on WeekLaunch' badge for your website.",
    seoTitle: "Launch Badge Generator",
    seoDescription:
      "Free 'Launched on WeekLaunch' badges for your website in light, dark and violet styles.",
    icon: "badge",
  },
];

export function toolHref(t: Tool) {
  // The badge tool lives on the existing badges page
  return t.slug === "launch-badge" ? "/badges" : `/tools/${t.slug}`;
}
