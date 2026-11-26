// Blog posts, kept in code: newest first. A post bought through the $49
// blog-post service is marked `sponsored` and labeled on the page.

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: { title: string; text: string }[] };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  // ISO date, like 2026-11-26
  date: string;
  author: string;
  readMinutes: number;
  sponsored?: boolean;
  body: BlogBlock[];
};

export const posts: BlogPost[] = [
  {
    slug: "how-to-launch-on-indieship",
    title: "How to launch your product on IndieShip and get your first users",
    description:
      "A step-by-step guide to launching on IndieShip: what to prepare, how to pick your day, and what to do on launch day so people actually find you.",
    date: "2026-11-26",
    author: "IndieShip team",
    readMinutes: 5,
    body: [
      {
        type: "p",
        text: "A launch isn't one big moment. It's a few small things done well: a clear page, a good day, and a handful of people who care enough to try it. Here's how to do each of them on IndieShip.",
      },
      { type: "h2", text: "Before launch day" },
      {
        type: "steps",
        items: [
          {
            title: "Write one sentence that says what it does",
            text: 'Your tagline is the first thing people read on the launch card. Say what the product does and who it\'s for, in plain words. "Invoices for freelancers that chase late payments for you" beats "The future of billing".',
          },
          {
            title: "Show it working",
            text: "Add 3 to 5 screenshots of the real product. The first one is your cover, so pick the screen that explains the most at a glance.",
          },
          {
            title: "Describe the problem, then the fix",
            text: "In the description, start with the problem your users have, then how your product solves it. This also helps AI assistants understand and recommend your product.",
          },
          {
            title: "Add a deal (optional)",
            text: "A discount code for IndieShip visitors shows on your launch card and on the Deals page. It gives people one more reason to try you today.",
          },
        ],
      },
      { type: "h2", text: "Picking your day" },
      {
        type: "p",
        text: "Free launches join a short queue, about a week out. Premium launches go live today or on any day you pick in the next 30, and are featured at the top for 7 days. Pick a day when you can be around to reply to comments.",
      },
      { type: "h2", text: "On launch day" },
      {
        type: "list",
        items: [
          "Share your launch link with people who already know you: your newsletter, your X or LinkedIn followers, your users.",
          "Reply to every comment. People notice makers who show up.",
          "Ask for honest feedback, not just upvotes. The feedback is the useful part.",
          "Add the IndieShip badge to your site. Free launches need it for a dofollow backlink, and it shows visitors you launched.",
        ],
      },
      { type: "h2", text: "After launch day" },
      {
        type: "p",
        text: "Your product page stays up for good, with your link, reviews and comments. The top three launches of each day, week and month go into the Hall of Fame. Keep your page up to date, and add a deal later if you didn't at launch.",
      },
    ],
  },
  {
    slug: "where-to-launch-your-startup",
    title: "Where to launch your startup: a simple plan for launch directories",
    description:
      "Launch directories can bring your first visitors and backlinks. Here's how to pick them, what to prepare once, and how to avoid wasting a week on submissions.",
    date: "2026-11-24",
    author: "IndieShip team",
    readMinutes: 4,
    body: [
      {
        type: "p",
        text: "There are hundreds of sites where you can list a new product. A few send real visitors; many mostly give you a backlink. Both are useful, but they need different amounts of effort.",
      },
      { type: "h2", text: "Prepare your launch kit once" },
      {
        type: "p",
        text: "Almost every directory asks for the same things. Write them once and reuse them:",
      },
      {
        type: "list",
        items: [
          "Product name, website and a one-line tagline (under 60 characters)",
          "A short description (2 to 3 sentences) and a longer one (a paragraph)",
          "A square logo, at least 240 × 240",
          "3 to 5 screenshots, about 1270 × 760",
          "Your categories and pricing (free, freemium or paid)",
        ],
      },
      { type: "h2", text: "Start with the sites that have an audience" },
      {
        type: "p",
        text: "Launch platforms with a daily or weekly feed, like IndieShip, put you in front of people looking for new tools that day. Spend your time there first: write a good page, reply to comments and share your link.",
      },
      { type: "h2", text: "Then the long tail" },
      {
        type: "p",
        text: "Smaller directories mostly help with search: more sites linking to you, and more places your product is described. They take a few minutes each, which adds up quickly. If you'd rather not spend the days, our directory submission service does it by hand and sends you a report with every live link.",
      },
      { type: "h2", text: "Keep a list" },
      {
        type: "p",
        text: "Track where you submitted, when, and the live link once it's approved. It makes it easy to update your listings later when your product changes.",
      },
    ],
  },
];

export const getPost = (slug: string) =>
  posts.find((p) => p.slug === slug) ?? null;

export const postDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
