import type { Product } from "./data";

// Real rank by votes, whatever is pinned or paid for. Ties share a rank, and a
// launch with no votes yet has no rank.
export function voteRanks(products: Product[]) {
  return new Map(
    products.map((p) => [
      p.slug,
      p.upvotes > 0
        ? products.filter((other) => other.upvotes > p.upvotes).length + 1
        : null,
    ]),
  );
}
