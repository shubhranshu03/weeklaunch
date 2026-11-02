export type Tool = {
  slug: string;
  name: string;
  // Short line for cards and llms.txt
  summary: string;
  // Search-focused title and description for the tool page
  seoTitle: string;
  seoDescription: string;
  icon: "checklist" | "tagline" | "meta" | "badge";
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
