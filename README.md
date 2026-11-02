# weeklaunch

A weekly product launch directory for indie makers and startups. A fresh leaderboard every Monday, a permanent product page for every launch, and simple paid upgrades.

Built with Next.js, TypeScript and Tailwind CSS.

## Pages

- `/` — this week's launch board
- `/products` — all products, grouped by category
- `/products/[slug]` — product detail page
- `/submit` — submit a product (Free or Premium launch)
- `/pricing` — launch plans and ad spots
- `/dashboard` — maker dashboard
- `/badges` — embeddable launch badges
- `/signin`, `/signup`, `/about`, `/contact`, `/terms`, `/privacy`

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Status

The UI is complete but uses sample data in `src/lib/data.ts`. Not connected yet: database, sign-in, payments (Stripe) and email. Sample reviews, products and the Terms/Privacy text must be replaced before going live.
