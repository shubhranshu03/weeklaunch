import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Create an account — WeekLaunch",
};

export default function SignUpPage() {
  return (
    <SiteShell sidebars={false}>
      <div className="py-6">
        <AuthForm mode="signup" />
      </div>
    </SiteShell>
  );
}
