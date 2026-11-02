import type { Metadata } from "next";
import { Clock, Mail, Megaphone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Contact — WeekLaunch",
};

const info = [
  { icon: Mail, title: "Email", text: "hello@weeklaunch.com" },
  { icon: Megaphone, title: "Advertising", text: "ads@weeklaunch.com" },
  { icon: Clock, title: "Reply time", text: "Usually within 1 working day" },
];

export default function ContactPage() {
  return (
    <SiteShell sidebars={false}>
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Contact us
          </h1>
          <p className="mb-6 mt-2 text-slate-500">
            Questions about launching, ads or anything else? Send us a note.
          </p>
          <ContactForm />
        </section>
        <aside className="space-y-3">
          {info.map((i) => (
            <div
              key={i.title}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <span className="badge-pop flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-300 text-slate-900">
                <i.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {i.title}
                </p>
                <p className="break-words text-sm text-slate-500">{i.text}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </SiteShell>
  );
}
