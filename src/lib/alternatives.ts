import type { Product } from "./data";

// Launches like this one: those sharing the most categories first, then by
// upvotes. Sample launches only stand in for samples.
export function alternativesTo(product: Product, all: Product[], limit = 12) {
  return all
    .filter((p) => p.slug !== product.slug && (product.sample || !p.sample))
    .map((p) => ({
      p,
      shared: p.tags.filter((t) => product.tags.includes(t)).length,
      sameMain: p.tags[0] === product.tags[0] ? 1 : 0,
    }))
    .filter((x) => x.shared > 0)
    .sort(
      (a, b) =>
        b.sameMain - a.sameMain ||
        b.shared - a.shared ||
        b.p.upvotes - a.p.upvotes,
    )
    .slice(0, limit)
    .map((x) => x.p);
}

export const alternativesHref = (slug: string) => `/alternatives/${slug}`;
