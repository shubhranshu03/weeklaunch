import type { Metadata } from "next";
import Link from "next/link";
import { TaglineGenerator } from "@/components/tools/TaglineGenerator";
import { ToolLayout } from "@/components/ToolLayout";
import { tools } from "@/lib/tools";

const tool = tools.find((t) => t.slug === "tagline-generator")!;

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: `/tools/${tool.slug}` },
};

const faqs = [
  {
    q: "What makes a good startup tagline?",
    a: "A good tagline says what your product does and who it's for in plain words. Keep it under 60 characters, avoid buzzwords, and focus on the result people get.",
  },
  {
    q: "How long should a tagline be?",
    a: "Aim for 30–60 characters. Most launch directories, including WeekLaunch, cut taglines at 60 characters, and short lines are easier to remember.",
  },
  {
    q: "Is this tagline generator free?",
    a: "Yes, it's completely free with no sign-up. Everything runs in your browser and nothing you type is sent to our servers.",
  },
  {
    q: "What's the difference between a tagline and a slogan?",
    a: "A tagline explains what your product does, so new visitors understand it fast. A slogan is a catchy brand line used in ads. For a launch, a clear tagline works better.",
  },
];

export default function TaglineGeneratorPage() {
  return (
    <ToolLayout
      tool={tool}
      intro="Describe your product in a few words and get ready-to-use taglines in three tones. Each one shows its length so it fits launch directories."
      steps={[
        "Enter your product name and what it does, starting with a verb.",
        "Add who it's for and the main benefit people get.",
        "Switch between Simple, Bold and Friendly to see different styles.",
        "Copy the one you like, then tweak a word or two to make it yours.",
      ]}
      faqs={faqs}
      guide={
        <>
          <h2>How to write a tagline that gets clicks</h2>
          <p>
            On a launch board, people decide in a second whether to click. A
            clear tagline wins over a clever one. Say what the product does, for
            whom, and why it&apos;s better — in that order.
          </p>
          <h2>Tagline tips</h2>
          <ul>
            <li>
              Start with a verb: &ldquo;Turn&rdquo;, &ldquo;Track&rdquo;,
              &ldquo;Build&rdquo;.
            </li>
            <li>
              Name the audience if it&apos;s specific: &ldquo;for
              freelancers&rdquo;.
            </li>
            <li>Promise one result, not five features.</li>
            <li>Read it out loud — if it sounds stiff, simplify it.</li>
          </ul>
          <h2>Use it everywhere</h2>
          <p>
            Put the same tagline on your landing page, your page title and your
            launch listings so people recognise you. Check how it looks in
            Google with the{" "}
            <Link
              href="/tools/meta-tag-generator"
              className="font-medium text-brand-700 underline"
            >
              meta tag generator
            </Link>
            , then{" "}
            <Link
              href="/submit"
              className="font-medium text-brand-700 underline"
            >
              launch on WeekLaunch
            </Link>
            .
          </p>
        </>
      }
    >
      <TaglineGenerator />
    </ToolLayout>
  );
}
