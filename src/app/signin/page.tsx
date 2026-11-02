import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Sign in — WeekLaunch",
};

export default function SignInPage() {
  return (
    <SiteShell sidebars={false}>
      <div className="py-6">
        <AuthForm mode="signin" />
      </div>
    </SiteShell>
  );
}
