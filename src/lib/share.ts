// Social platforms makers can share their launch on, and how to recognise a
// link to a post on each one. Used by the share kit and the server check.

export type SharePlatform = {
  id: string;
  name: string;
  hosts: string[];
  // Opens the platform's "new post" screen, filled in where it allows
  intent?: (text: string, link: string) => string;
};

const enc = encodeURIComponent;

export const sharePlatforms: SharePlatform[] = [
  {
    id: "x",
    name: "X",
    hosts: ["x.com", "twitter.com"],
    intent: (text, link) =>
      `https://x.com/intent/post?text=${enc(text)}&url=${enc(link)}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    hosts: ["linkedin.com"],
    // LinkedIn only takes the link; the copied text is pasted by the maker
    intent: (_text, link) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${enc(link)}`,
  },
  {
    id: "facebook",
    name: "Facebook",
    hosts: ["facebook.com", "fb.com", "fb.watch"],
    intent: (_text, link) =>
      `https://www.facebook.com/sharer/sharer.php?u=${enc(link)}`,
  },
  {
    id: "reddit",
    name: "Reddit",
    hosts: ["reddit.com", "redd.it"],
    intent: (text, link) =>
      `https://www.reddit.com/submit?url=${enc(link)}&title=${enc(text.split("\n")[0])}`,
  },
  {
    id: "threads",
    name: "Threads",
    hosts: ["threads.net", "threads.com"],
    intent: (text, link) =>
      `https://www.threads.net/intent/post?text=${enc(`${text}\n${link}`)}`,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    hosts: [],
    intent: (text, link) => `https://wa.me/?text=${enc(`${text}\n${link}`)}`,
  },
  { id: "instagram", name: "Instagram", hosts: ["instagram.com"] },
  { id: "bluesky", name: "Bluesky", hosts: ["bsky.app"] },
  { id: "indiehackers", name: "Indie Hackers", hosts: ["indiehackers.com"] },
];

// Posts on this many different platforms move a launch up
export const SHARES_NEEDED = 3;

// Which platform a post link is on, or null if it isn't a post on a known platform
export function platformOf(raw: string): SharePlatform | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^(www|m|mobile)\./, "");
  // A post has a path; the bare home page doesn't count
  if (url.pathname.replace(/\/+$/, "").length < 2) return null;
  return (
    sharePlatforms.find((p) =>
      p.hosts.some((h) => host === h || host.endsWith(`.${h}`)),
    ) ?? null
  );
}

// The post makers start from; they can edit it before posting. It links to
// their own product, and their WeekLaunch page is added after it.
export function sharePost(
  name: string,
  tagline: string,
  date: string,
  website: string,
) {
  return `🚀 I'm launching ${name} on WeekLaunch!\n\n${tagline}\n\n🔗 Try it: ${website}\n\nIt goes live on ${date}. I'd love your upvote and feedback 👇`;
}
