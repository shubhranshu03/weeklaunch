import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using WeekLaunch, launching products and buying ads.",
  alternates: { canonical: "/terms" },
};

// Starter text only — have a lawyer review before going live
export default function TermsPage() {
  return (
    <InfoPage path="/terms" title="Terms of Service" updated="November 2026">
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        Draft for review — replace with terms checked by a lawyer before launch.
      </p>
      <section>
        <h2>1. Using WeekLaunch</h2>
        <p>
          By using WeekLaunch you agree to these terms. You must be at least 16
          years old and give accurate information when you create an account or
          submit a product.
        </p>
      </section>
      <section>
        <h2>2. Your products and content</h2>
        <ul>
          <li>You own what you submit and are responsible for it.</li>
          <li>
            You give us permission to show your product name, logo, images and
            description on WeekLaunch and in our newsletter.
          </li>
          <li>
            We may decline or remove any launch, comment or ad that breaks these
            terms.
          </li>
        </ul>
      </section>
      <section>
        <h2>3. Not allowed</h2>
        <ul>
          <li>Fake upvotes, fake accounts or paid voting.</li>
          <li>Spam, scams, malware, adult content or illegal products.</li>
          <li>Copying other people&apos;s work or trademarks.</li>
        </ul>
      </section>
      <section>
        <h2>4. Payments and refunds</h2>
        <p>
          Premium launches and ads are paid in advance. If your launch or ad has
          not gone live yet, you can cancel for a full refund. Once it is live,
          payments are not refundable.
        </p>
      </section>
      <section>
        <h2>5. Changes</h2>
        <p>
          We may update these terms. If the changes are important, we will let
          you know by email or on the site.
        </p>
      </section>
    </InfoPage>
  );
}
