// Paid ways to promote a product, offered from the Advertise option on /submit.
// Ordering sends a request to the admin inbox; we reply with a payment link.

export type GrowthService = {
  id: "sidebar" | "center" | "blog" | "directories" | "social";
  name: string;
  price: number;
  // Shown after the price, like "per month"
  unit: string;
  blurb: string;
  features: string[];
  badge?: string;
};

export const growthServices: GrowthService[] = [
  {
    id: "sidebar",
    name: "Sidebar ad",
    price: 49,
    unit: "per month",
    blurb: "Your card in the sponsor spots beside the feed, on every page.",
    features: [
      "Seen on every page for 30 days",
      "Logo, one line and a link",
      "Stays on screen while people scroll",
      "Click stats every week",
    ],
  },
  {
    id: "center",
    name: "In-feed ad",
    price: 19,
    unit: "per week",
    blurb: "A sponsor card in the middle of the home page launch list.",
    features: [
      "Seen by every visitor for 7 days",
      "Logo, headline and link",
      "Desktop and phone",
      "Click stats every day",
    ],
  },
  {
    id: "blog",
    name: "Blog post about you",
    price: 49,
    unit: "one-time",
    blurb: "We write and publish a post about your product on our blog.",
    features: [
      "Written by us from your details",
      "Dofollow backlink to your site",
      "Stays up for good",
      "Shared in our newsletter",
    ],
  },
  {
    id: "directories",
    name: "Directory submission",
    price: 149,
    unit: "one-time",
    blurb: "We submit your product to 50+ directories for you, by hand.",
    features: [
      "50+ directories, strongest first",
      "Listing copy written for you",
      "Report with every live link",
      "DR goes up, or your money back",
    ],
    badge: "DR guarantee",
  },
  {
    id: "social",
    name: "Founder social post",
    price: 40,
    unit: "one-time",
    blurb: "Our founder shares your product from their own profile.",
    features: [
      "A post written to get clicks",
      "Your link and screenshots",
      "Posted at the best time of day",
      "Link to the post when it's live",
    ],
  },
];

export const growthServiceIds = growthServices.map((s) => s.id);
