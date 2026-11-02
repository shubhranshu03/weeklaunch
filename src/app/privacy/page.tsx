import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Privacy Policy — WeekLaunch",
};

// Starter text only — have a lawyer review before going live
export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" updated="November 2026">
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        Draft for review — update it to match the services you actually use and
        have it checked before launch.
      </p>
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Account details: your name, email and profile picture.</li>
          <li>Products you submit, your upvotes and your comments.</li>
          <li>
            Basic usage data, like pages visited, to keep the site working well.
          </li>
          <li>
            Payment details are handled by our payment provider — we never see
            or store your card number.
          </li>
        </ul>
      </section>
      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To run your account and show your launches.</li>
          <li>To send the Monday newsletter if you sign up for it.</li>
          <li>To stop spam, fake votes and abuse.</li>
        </ul>
      </section>
      <section>
        <h2>What we never do</h2>
        <p>We don&apos;t sell your personal data to anyone.</p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>
          You can update your details, unsubscribe from emails or ask us to
          delete your account at any time by contacting hello@weeklaunch.com.
        </p>
      </section>
    </InfoPage>
  );
}
