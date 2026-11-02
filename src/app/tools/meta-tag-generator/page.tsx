import type { Metadata } from "next";
import Link from "next/link";
import { MetaTagGenerator } from "@/components/tools/MetaTagGenerator";
import { ToolLayout } from "@/components/ToolLayout";
import { tools } from "@/lib/tools";

const tool = tools.find((t) => t.slug === "meta-tag-generator")!;

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: `/tools/${tool.slug}` },
};

const faqs = [
  {
    q: "How long should a meta title be?",
    a: "Keep it between 30 and 60 characters. Google usually shows about 60 characters, so anything longer gets cut off with an ellipsis.",
  },
  {
    q: "How long should a meta description be?",
    a: "Aim for 70–160 characters. It should summarise the page and give people a reason to click. Google may rewrite it, but a good one is often used as-is.",
  },
  {
    q: "What size should my share image be?",
    a: "Use 1200×630 pixels. That size looks sharp on X, LinkedIn, Facebook and WhatsApp. Keep important text away from the edges.",
  },
  {
    q: "Do meta tags help SEO?",
    a: "The title tag is one of the strongest on-page signals. The description doesn't change rankings directly, but a clear one gets more clicks, which brings more visitors.",
  },
  {
    q: "Is this meta tag generator free?",
    a: "Yes, it's free with no sign-up. Everything runs in your browser.",
  },
];

export default function MetaTagGeneratorPage() {
  return (
    <ToolLayout
      tool={tool}
      intro="See how your page looks on Google, X and LinkedIn before you publish. Check the length of your title and description, then copy ready-to-paste HTML."
      steps={[
        "Type your page title and description — the colored hints show if the length is right.",
        "Add your page URL and a 1200×630 share image URL.",
        "Check the Google, X and LinkedIn previews and adjust until they look right.",
        "Copy the meta tags and paste them inside the <head> of your page.",
      ]}
      faqs={faqs}
      guide={
        <>
          <h2>What are meta tags?</h2>
          <p>
            Meta tags are small pieces of HTML that tell search engines and
            social networks what your page is about. The title and description
            appear in Google results, and the Open Graph tags control the card
            people see when your link is shared.
          </p>
          <h2>Tips for a title and description that get clicks</h2>
          <ul>
            <li>Put your main keyword near the start of the title.</li>
            <li>Make each page&apos;s title unique.</li>
            <li>Write the description like an ad: what it is and why click.</li>
            <li>Use a share image with large, readable text.</li>
          </ul>
          <h2>Launching soon?</h2>
          <p>
            Good meta tags make every link to your launch look professional.
            Write a strong one-liner with the{" "}
            <Link
              href="/tools/tagline-generator"
              className="font-medium text-brand-700 underline"
            >
              tagline generator
            </Link>
            , follow the{" "}
            <Link
              href="/tools/launch-checklist"
              className="font-medium text-brand-700 underline"
            >
              launch checklist
            </Link>{" "}
            and{" "}
            <Link
              href="/submit"
              className="font-medium text-brand-700 underline"
            >
              submit your product
            </Link>
            .
          </p>
        </>
      }
    >
      <MetaTagGenerator />
    </ToolLayout>
  );
}
