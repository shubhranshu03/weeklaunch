import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/PasswordForms";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Pick a new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <SiteShell sidebars={false}>
      <div className="py-6">
        <ResetPasswordForm />
      </div>
    </SiteShell>
  );
}
