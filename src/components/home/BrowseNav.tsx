import Link from "next/link";
import {
  Apple,
  ChevronRight,
  Puzzle,
  Compass,
  Globe,
  Laptop,
  Newspaper,
  Shuffle,
  Smartphone,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { categoryHref } from "@/lib/categories";
import { productCategories } from "@/lib/data";
import { toolHref, tools } from "@/lib/tools";

export const browsePlatforms: {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { id: "web", label: "Web", href: "/platforms/web", icon: Globe },
  { id: "mac", label: "Mac", href: "/platforms/mac", icon: Laptop },
  { id: "ios", label: "iOS", href: "/platforms/ios", icon: Apple },
  {
    id: "android",
    label: "Android",
    href: "/platforms/android",
    icon: Smartphone,
  },
  {
    id: "chrome",
    label: "Chrome extension",
    href: "/platforms/chrome-extensions",
    icon: Puzzle,
  },
];

function Group({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="mb-1.5 flex items-center justify-between border-l-2 border-brand-200 pl-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          {title}
        </p>
        <Link
          href={href}
          className="flex items-center text-xs text-slate-400 hover:text-slate-700"
        >
          See all <ChevronRight className="size-3" />
        </Link>
      </div>
      <ul>{children}</ul>
    </div>
  );
}

const item =
  "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900";

// The left column of the home page: platforms, categories and free tools
export function BrowseNav() {
  return (
    <nav aria-label="Browse" className="text-sm">
      <p className="flex items-center gap-2 px-1 font-semibold text-slate-900">
        <span className="flex size-7 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Compass className="size-4" />
        </span>
        Browse
      </p>
      <Group title="Platforms" href="/platforms">
        {browsePlatforms.map((p) => (
          <li key={p.id}>
            <Link href={p.href} className={item}>
              <p.icon className="size-4 text-slate-400" />
              {p.label}
            </Link>
          </li>
        ))}
      </Group>
      <Group title="Categories" href="/categories">
        {productCategories.map((c) => (
          <li key={c.name}>
            <Link href={categoryHref(c.name)} className={item}>
              {c.name}
            </Link>
          </li>
        ))}
      </Group>
      <Group title="Discover" href="/deals">
        {[
          { label: "Deals", href: "/deals", icon: Tag },
          { label: "Alternatives", href: "/alternatives", icon: Shuffle },
          { label: "Blog", href: "/blog", icon: Newspaper },
        ].map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={item}>
              <l.icon className="size-4 text-slate-400" />
              {l.label}
            </Link>
          </li>
        ))}
      </Group>
      <Group title="Free tools" href="/tools">
        {tools.slice(0, 5).map((t) => (
          <li key={t.slug}>
            <Link href={toolHref(t)} className={item}>
              <span className="truncate">
                {t.name.replace(/^(Free |Startup |Product )/, "")}
              </span>
            </Link>
          </li>
        ))}
      </Group>
      <Group title="Awards" href="/hall-of-fame">
        {["Day", "Week", "Month"].map((p) => (
          <li key={p}>
            <Link href={`/hall-of-fame#${p.toLowerCase()}`} className={item}>
              Product of the {p}
            </Link>
          </li>
        ))}
      </Group>
    </nav>
  );
}
