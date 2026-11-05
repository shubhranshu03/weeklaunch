import { productCategories } from "@/lib/data";
import { getAllProducts } from "@/lib/products";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import { toolHref, tools } from "@/lib/tools";

// Plain-language guide to the site for AI assistants (https://llmstxt.org)
export async function GET() {
  const allProducts = await getAllProducts();
  const byCategory = productCategories
    .map((c) => {
      const items = allProducts.filter((p) => p.tags[0] === c.name);
      if (items.length === 0) return "";
      return [
        `### ${c.name}`,
        ...items.map(
          (p) => `- [${p.name}](${SITE_URL}/products/${p.slug}): ${p.tagline}`,
        ),
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n\n");

  const body = `# WeekLaunch

> ${SITE_DESCRIPTION}

WeekLaunch publishes a new launch leaderboard every Monday at 00:00 UTC. Makers submit a product, pick a launch week and collect upvotes and comments for that week. Every launch keeps a permanent product page with a link to the product's website.

## Key pages

- [This week's launches](${SITE_URL}/): the current weekly leaderboard
- [All products](${SITE_URL}/products): every product, grouped by category
- [Submit a product](${SITE_URL}/submit): launch for free or with Premium
- [Pricing](${SITE_URL}/pricing): plans for launches and ads
- [Launch badges](${SITE_URL}/badges): embeddable "Launched on WeekLaunch" badges
- [Free tools](${SITE_URL}/tools): free tools for founders
- [About](${SITE_URL}/about)
- [Contact](${SITE_URL}/contact)

## Pricing

- Free launch: $0. Listed on a weekly board, own product page, upvotes and comments; free launches join a queue.
- Premium launch: $29 one-time. Pick any launch week, pinned at the top for the whole week, PREMIUM tag, a verified maker tick, dofollow backlink and a Monday newsletter mention.
- Center feed ad: $19 per week. A sponsor card in the launch list after the top 3.
- Right sidebar ad: $49 per month. One of two promo boxes in the right column on every page.

## Free tools

${tools.map((t) => `- [${t.name}](${SITE_URL}${toolHref(t)}): ${t.summary}`).join("\n")}

## Products

${byCategory}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
