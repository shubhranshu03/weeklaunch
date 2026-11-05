import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <SiteShell sidebars={false}>
      <div className="py-6">
        {/* Reads ?next= from the address */}
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </SiteShell>
  );
}
