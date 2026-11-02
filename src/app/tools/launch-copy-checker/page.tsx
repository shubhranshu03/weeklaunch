import type { Metadata } from "next";
import Link from "next/link";
import { LaunchCopyChecker } from "@/components/tools/LaunchCopyChecker";
import { ToolLayout } from "@/components/ToolLayout";
import { tools } from "@/lib/tools";

const tool = tools.find((t) => t.slug === "launch-copy-checker")!;

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: `/tools/${tool.slug}` },
};

const faqs = [
  {
    q: "How is the score calculated?",
    a: "Your tagline and description are checked against 9 simple rules — length, audience, readability, buzzwords and more. Each rule is worth points, adding up to 100.",
  },
  {
    q: "What score should I aim for?",
    a: "85 or higher means your copy is clear and ready to launch. Between 65 and 84 is close — fix the items marked with an amber icon.",
  },
  {
    q: "Why are buzzwords bad?",
    a: 'Words like "revolutionary" or "cutting-edge" are used so often that readers skip over them. A concrete benefit, like "saves 2 hours a week", is more convincing.',
  },
  {
    q: "Is my text stored anywhere?",
    a: "No. The checker runs in your browser and nothing you paste is sent to our servers.",
  },
  {
    q: "Can I use it for app store or landing page copy?",
    a: "Yes. The same rules — short, clear, specific and audience-focused — work for app store listings, landing pages and social bios.",
  },
];

export default function LaunchCopyCheckerPage() {
  return (
    <ToolLayout
      tool={tool}
      intro="Paste your tagline and description to get a score out of 100, plus simple tips to make your launch copy clearer and more convincing."
      steps={[
        "Enter your product name, tagline and description — or press Try an example.",
        "Your score updates instantly as you type.",
        "Read the tips next to each amber icon and fix them one by one.",
        "Aim for 85 or higher, then use the same copy everywhere you launch.",
      ]}
      faqs={faqs}
      guide={
        <>
          <h2>Why launch copy matters</h2>
          <p>
            On a launch board, your tagline and first two sentences decide
            whether someone clicks. Clear copy that names the audience and the
            result beats clever wordplay almost every time.
          </p>
          <h2>A simple formula</h2>
          <ul>
            <li>
              <strong>Tagline:</strong> what it does + who it&apos;s for, under
              60 characters.
            </li>
            <li>
              <strong>Description:</strong> the problem, how you solve it, and
              one thing that makes you different.
            </li>
            <li>
              <strong>Tone:</strong> plain words, short sentences, no hype.
            </li>
          </ul>
          <h2>Next steps</h2>
          <p>
            Need fresh ideas? Try the{" "}
            <Link
              href="/tools/tagline-generator"
              className="font-medium text-brand-700 underline"
            >
              tagline generator
            </Link>
            . Happy with your score?{" "}
            <Link
              href="/submit"
              className="font-medium text-brand-700 underline"
            >
              Submit your product
            </Link>
            .
          </p>
        </>
      }
    >
      <LaunchCopyChecker />
    </ToolLayout>
  );
}
