import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="wl-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9f85ff" />
          <stop offset="1" stopColor="#5a32db" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#wl-logo)" />
      <path d="M16.5 6.5v12h8.2zM14.5 9.5v9H9zM6.5 21h19l-2.8 4.5H9.3z" fill="#fff"/>
    </svg>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label="IndieShip home"
    >
      <LogoMark />
      <span className="text-xl font-bold tracking-tight text-slate-900">
        IndieShip
      </span>
    </Link>
  );
}
