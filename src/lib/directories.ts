// Done-for-you directory submissions: we list a maker's product on launch
// directories for them, strongest sites first.

export type DirectoryPackage = {
  id: "30" | "50" | "100";
  name: string;
  count: string;
  price: number;
  blurb: string;
  features: string[];
  // Environment variable holding the Dodo product id for this package
  env: string;
  popular?: boolean;
};

export const directoryPackages: DirectoryPackage[] = [
  {
    id: "30",
    name: "Starter",
    count: "30+",
    price: 49,
    blurb: "The strongest launch sites, to get your first backlinks fast.",
    features: [
      "30+ directories from the top tier",
      "Listing copy written from your details",
      "Report with every live link",
      "Done within 7 working days",
    ],
    env: "DODO_DIR_30_PRODUCT_ID",
  },
  {
    id: "50",
    name: "Growth",
    count: "50+",
    price: 99,
    blurb: "Top-tier sites plus popular SaaS and AI directories.",
    features: [
      "50+ directories, top two tiers",
      "Listing copy written from your details",
      "Logo and screenshots uploaded for you",
      "Report with every live link",
      "Done within 10 working days",
    ],
    env: "DODO_DIR_50_PRODUCT_ID",
    popular: true,
  },
  {
    id: "100",
    name: "Pro",
    count: "100+",
    price: 149,
    blurb: "Every directory we know, for the biggest boost in authority.",
    features: [
      "100+ directories across all tiers",
      "Listing copy written from your details",
      "Logo and screenshots uploaded for you",
      "Report with every live link",
      "Done within 14 working days",
    ],
    env: "DODO_DIR_100_PRODUCT_ID",
  },
];

export const getDirectoryPackage = (id: string) =>
  directoryPackages.find((p) => p.id === id);

export type Directory = { name: string; domain: string };

// Sorted from the highest authority down. Tier 1 is in every package.
export const directoryTiers: {
  name: string;
  note: string;
  directories: Directory[];
}[] = [
  {
    name: "Tier 1 · highest authority",
    note: "In every package",
    directories: [
      { name: "Product Hunt", domain: "producthunt.com" },
      { name: "Hacker News", domain: "news.ycombinator.com" },
      { name: "Reddit", domain: "reddit.com" },
      { name: "G2", domain: "g2.com" },
      { name: "Capterra", domain: "capterra.com" },
      { name: "Crunchbase", domain: "crunchbase.com" },
      { name: "GetApp", domain: "getapp.com" },
      { name: "Software Advice", domain: "softwareadvice.com" },
      { name: "Trustpilot", domain: "trustpilot.com" },
      { name: "Wellfound", domain: "wellfound.com" },
      { name: "F6S", domain: "f6s.com" },
      { name: "AlternativeTo", domain: "alternativeto.net" },
      { name: "Indie Hackers", domain: "indiehackers.com" },
      { name: "DEV Community", domain: "dev.to" },
      { name: "StackShare", domain: "stackshare.io" },
    ],
  },
  {
    name: "Tier 2 · popular launch platforms",
    note: "Growth and Pro",
    directories: [
      { name: "BetaList", domain: "betalist.com" },
      { name: "SaaSHub", domain: "saashub.com" },
      { name: "Slant", domain: "slant.co" },
      { name: "SaaSworthy", domain: "saasworthy.com" },
      { name: "Peerlist", domain: "peerlist.io" },
      { name: "Uneed", domain: "uneed.best" },
      { name: "DevHunt", domain: "devhunt.org" },
      { name: "Microlaunch", domain: "microlaunch.net" },
      { name: "Fazier", domain: "fazier.com" },
      { name: "Launching Next", domain: "launchingnext.com" },
      { name: "SideProjectors", domain: "sideprojectors.com" },
      { name: "Startup Stash", domain: "startupstash.com" },
      { name: "Tiny Launch", domain: "tinylaunch.com" },
    ],
  },
  {
    name: "Tier 3 · AI and SaaS directories",
    note: "Pro",
    directories: [
      { name: "There's An AI For That", domain: "theresanaiforthat.com" },
      { name: "Futurepedia", domain: "futurepedia.io" },
      { name: "Toolify", domain: "toolify.ai" },
      { name: "Future Tools", domain: "futuretools.io" },
      { name: "TopAI.tools", domain: "topai.tools" },
      { name: "AI Tool Hunt", domain: "aitoolhunt.com" },
      { name: "SaaS AI Tools", domain: "saasaitools.com" },
      { name: "OpenHunts", domain: "openhunts.com" },
      { name: "Startups.fyi", domain: "startups.fyi" },
      { name: "10words", domain: "10words.io" },
    ],
  },
];

export const directoryFaqs = [
  {
    q: "What is a directory submission service?",
    a: "We list your product on launch and software directories for you. Each listing links back to your website, which raises your domain rating (DR), helps you rank on Google and gets you found by people browsing those sites and by AI assistants that read them.",
  },
  {
    q: "Which directories do you submit to?",
    a: "We start with the strongest sites (Tier 1) and work down. Starter covers the top 30+, Growth the top 50+ and Pro every directory we know, 100+ in total. The logos on this page are a sample.",
  },
  {
    q: "Is it safe for my SEO?",
    a: "Yes. We only use real, well-known directories that people actually browse, and we submit by hand. We never use link farms, private blog networks or spam sites, which are the things that can hurt rankings.",
  },
  {
    q: "Who is this for?",
    a: "SaaS products, AI tools, apps, Chrome extensions and other online products, especially new ones with few backlinks. If you sell something illegal, adult or gambling-related, we can't take the order.",
  },
  {
    q: "Which package should I pick?",
    a: "Growth (50+) suits most new products: it covers the strongest sites and the popular SaaS and AI directories. Pick Starter if you want to try it first, or Pro if you want the biggest boost.",
  },
  {
    q: "How long does it take?",
    a: "Starter is done within 7 working days, Growth within 10 and Pro within 14. Some directories review listings themselves, so a few may go live a little later.",
  },
  {
    q: "What do I need to give you?",
    a: "Your product name, website, a one-line tagline and a short description. We write each listing from that, and you can add your logo and screenshots on your WeekLaunch launch.",
  },
  {
    q: "Will my domain rating really go up?",
    a: "Backlinks from trusted sites are one of the biggest factors in DR, so it usually rises over the following weeks. We can't promise an exact number, because some directories use nofollow links and every site is different.",
  },
  {
    q: "Do I get a report?",
    a: "Yes. When we're done you get a list of every directory with a link to your live listing.",
  },
  {
    q: "Do I have to do anything after paying?",
    a: "No. If a directory asks to confirm your email, you may get a message from them; just click the link. Everything else is done for you.",
  },
  {
    q: "Can I get a refund?",
    a: "If we haven't started your submissions yet, you can cancel for a full refund.",
  },
];
