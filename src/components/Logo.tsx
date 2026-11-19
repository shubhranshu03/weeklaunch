import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="10" fill="#b3261e" />
      {/* A "W" whose last stroke launches upward */}
      <path
        d="M7 12l4 11 5-9 5 9 4.5-14"
        fill="none"
        stroke="#fff"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.3 10.5 25.5 7l1.4 4.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label="WeekLaunch home"
    >
      <LogoMark />
      <span className="font-display text-xl font-black tracking-tight text-ink">
        weeklaunch
      </span>
    </Link>
  );
}
