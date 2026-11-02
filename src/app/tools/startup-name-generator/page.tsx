import type { Metadata } from "next";
import Link from "next/link";
import { StartupNameGenerator } from "@/components/tools/StartupNameGenerator";
import { ToolLayout } from "@/components/ToolLayout";
import { tools } from "@/lib/tools";

const tool = tools.find((t) => t.slug === "startup-name-generator")!;

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: `/tools/${tool.slug}` },
};

const faqs = [
  {
    q: "How do I come up with a good startup name?",
    a: "Start with 2–3 words that describe what your product does or how it feels. Mix them, add a short ending like -ly or -hub, and pick a name that's easy to say, spell and remember.",
  },
  {
    q: "Does this tool check if the domain is free?",
    a: "Each name has a Check button that opens a domain search for the .com in a new tab, so you can see right away if it's available.",
  },
  {
    q: "How long should a startup name be?",
    a: "Short is best — usually 4 to 10 letters. Short names are easier to remember, fit on a logo and make cleaner web addresses.",
  },
  {
    q: "Should I check trademarks before choosing a name?",
    a: "Yes. Before you commit, search your country's trademark office and do a quick web search to make sure no one in your field already uses the name.",
  },
  {
    q: "Is the startup name generator free?",
    a: "Yes, it's free with no sign-up. It runs in your browser, so your keywords aren't sent to our servers.",
  },
];

export default function StartupNameGeneratorPage() {
  return (
    <ToolLayout
      tool={tool}
      intro="Type a few keywords about your product and get brandable name ideas in seconds. Filter by style and check the .com with one click."
      steps={[
        "Type 1–5 simple keywords about your product, separated by commas.",
        "Pick a style, or keep All to see every kind of name.",
        "Press More ideas to shuffle and see new names.",
        "Use Check to see if the .com is free, and Copy to save your favorites.",
      ]}
      faqs={faqs}
      guide={
        <>
          <h2>What makes a great startup name?</h2>
          <p>
            The best names are short, easy to say out loud and hint at what the
            product does. If you have to spell it for people twice, it&apos;s
            probably too complicated.
          </p>
          <h2>Popular naming styles</h2>
          <ul>
            <li>
              <strong>Word + ending:</strong> a keyword with a short ending,
              like -ly, -ify or -hub.
            </li>
            <li>
              <strong>Action + word:</strong> a verb in front, like
              &ldquo;get&rdquo; or &ldquo;try&rdquo;, often used for domains.
            </li>
            <li>
              <strong>Blends:</strong> parts of two words joined into a new one.
            </li>
            <li>
              <strong>Two words:</strong> two simple words side by side.
            </li>
          </ul>
          <h2>Picked a name?</h2>
          <p>
            Write a one-liner with the{" "}
            <Link
              href="/tools/tagline-generator"
              className="font-medium text-brand-700 underline"
            >
              tagline generator
            </Link>
            , plan your big day with the{" "}
            <Link
              href="/tools/launch-date-planner"
              className="font-medium text-brand-700 underline"
            >
              launch date planner
            </Link>{" "}
            and{" "}
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
      <StartupNameGenerator />
    </ToolLayout>
  );
}
