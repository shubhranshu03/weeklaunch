import type { Metadata } from "next";
import Link from "next/link";
import { LaunchDatePlanner } from "@/components/tools/LaunchDatePlanner";
import { ToolLayout } from "@/components/ToolLayout";
import { tools } from "@/lib/tools";

const tool = tools.find((t) => t.slug === "launch-date-planner")!;

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: `/tools/${tool.slug}` },
};

const faqs = [
  {
    q: "How far ahead should I plan a product launch?",
    a: "About 4 weeks is a good amount of time for a small team. It leaves room to prepare visuals, test everything and line up the people you'll tell.",
  },
  {
    q: "What's the best day to launch?",
    a: "Early in the week works well because people are browsing and planning. WeekLaunch launches go live on Monday and stay on the board for the whole week.",
  },
  {
    q: "How does Add to calendar work?",
    a: "It downloads a small .ics calendar file with one all-day event for each step. Open it to add the plan to Google Calendar, Apple Calendar or Outlook.",
  },
  {
    q: "Can I change the plan?",
    a: "Use Copy plan to paste it into your notes or task app, then add or remove steps to fit your product.",
  },
  {
    q: "Is the launch date planner free?",
    a: "Yes, it's free with no sign-up, and it runs entirely in your browser.",
  },
];

export default function LaunchDatePlannerPage() {
  return (
    <ToolLayout
      tool={tool}
      intro="Pick your launch day and get a dated, step-by-step plan from 4 weeks before to 2 weeks after. Copy it or add every step to your calendar."
      steps={[
        "Pick your launch day — a Monday gives you a full week on WeekLaunch.",
        "Read the timeline: every step shows its date and what to do.",
        "Press Add to calendar to save each step as an all-day event.",
        "Or use Copy plan to paste the whole plan into your notes.",
      ]}
      faqs={faqs}
      guide={
        <>
          <h2>Why plan backwards from launch day?</h2>
          <p>
            Starting from a fixed date turns a big, fuzzy goal into small weekly
            tasks. You always know what to do this week, and nothing important
            is left for the last night.
          </p>
          <h2>The four phases of a launch timeline</h2>
          <ul>
            <li>
              <strong>4–3 weeks before:</strong> story, logo, screenshots and
              landing page.
            </li>
            <li>
              <strong>2–1 weeks before:</strong> technical checks, booking your
              launch and lining up people.
            </li>
            <li>
              <strong>Launch day:</strong> be online, share, and reply to
              everyone.
            </li>
            <li>
              <strong>After:</strong> thank people, fix what you learned and
              plan the next update.
            </li>
          </ul>
          <h2>Keep going</h2>
          <p>
            Tick off every detail with the{" "}
            <Link
              href="/tools/launch-checklist"
              className="font-medium text-brand-700 underline"
            >
              launch checklist
            </Link>
            , check your copy with the{" "}
            <Link
              href="/tools/launch-copy-checker"
              className="font-medium text-brand-700 underline"
            >
              launch copy checker
            </Link>{" "}
            and{" "}
            <Link
              href="/submit"
              className="font-medium text-brand-700 underline"
            >
              book your launch week
            </Link>
            .
          </p>
        </>
      }
    >
      <LaunchDatePlanner />
    </ToolLayout>
  );
}
