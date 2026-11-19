import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/PasswordForms";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <SiteShell sidebars={false}>
      <div className="py-6">
        <ForgotPasswordForm />
      </div>
    </SiteShell>
  );
}
