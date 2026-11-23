// The engraved-print scene behind the footer: a rising sun (a moon in the
// night edition) with sunburst rays, a halftone city and launches heading up.
// Drawn in the theme's ink, paper and press colors, so it follows night mode.

// Same buildings on every render (no hydration surprises)
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Building = {
  x: number;
  w: number;
  h: number;
  tower: boolean;
  spire: boolean;
};

function skyline(seed: number, minH: number, maxH: number, gapChance: number) {
  const rand = seeded(seed);
  const out: Building[] = [];
  for (let x = -20; x < 1460;) {
    const w = 34 + Math.floor(rand() * 70);
    if (rand() > gapChance)
      out.push({
        x,
        w,
        h: minH + Math.floor(rand() * (maxH - minH)),
        tower: rand() > 0.78,
        spire: rand() > 0.9,
      });
    x += w + Math.floor(rand() * 6);
  }
  return out;
}

const back = skyline(7, 70, 170, 0.08);
const front = skyline(21, 40, 120, 0.22);

// Lit windows on the front row, in a grid
function windows(b: Building, rand: () => number) {
  const out: { x: number; y: number }[] = [];
  for (let y = 420 - b.h + 12; y < 404; y += 14)
    for (let x = b.x + 7; x < b.x + b.w - 9; x += 12)
      if (rand() > 0.55) out.push({ x, y });
  return out;
}
const lit = (() => {
  const rand = seeded(99);
  return front.flatMap((b) => windows(b, rand));
})();

const rays = Array.from({ length: 28 }, (_, i) => (i / 28) * Math.PI);

export function FooterScene() {
  const cx = 900;
  const cy = 330;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_45%)]"
    >
      <svg
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-[300px] w-full sm:h-[420px]"
      >
        <defs>
          <pattern
            id="fs-dots"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="3" cy="3" r="1.3" className="fill-ink" />
          </pattern>
          <pattern
            id="fs-dots-fine"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="0.8" className="fill-ink" />
          </pattern>
          <radialGradient
            id="fs-ray-fade"
            cx={cx}
            cy={cy}
            r="520"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.2" stopColor="white" stopOpacity="1" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="fs-rays-mask">
            <rect width="1440" height="420" fill="url(#fs-ray-fade)" />
          </mask>
        </defs>

        {/* Stars, only at night */}
        <g className="hidden [[data-theme=night]_&]:inline">
          {Array.from({ length: 40 }, (_, i) => {
            const r = seeded(500 + i);
            return (
              <circle
                key={i}
                cx={r() * 1440}
                cy={20 + r() * 220}
                r={r() > 0.85 ? 1.6 : 0.9}
                className="fill-ink"
                opacity={0.5}
              />
            );
          })}
        </g>

        {/* Sunburst */}
        <g mask="url(#fs-rays-mask)" className="stroke-rule" opacity="0.7">
          {rays.map((a) => (
            <line
              key={a}
              x1={cx}
              y1={cy}
              x2={cx - Math.cos(a) * 900}
              y2={cy - Math.sin(a) * 900}
              strokeWidth="2"
            />
          ))}
        </g>

        {/* Sun (moon at night), with engraved bands */}
        <circle
          cx={cx}
          cy={cy}
          r="118"
          className="fill-press [[data-theme=night]_&]:fill-ink"
          opacity="0.9"
        />
        <circle
          cx={cx}
          cy={cy}
          r="118"
          fill="url(#fs-dots-fine)"
          opacity="0.18"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={cx - 130}
            y={cy - 10 + i * 16}
            width="260"
            height={3 + i * 1.6}
            className="fill-paper-dark"
          />
        ))}

        {/* Launches heading up, with dotted trails */}
        {[
          { x: 560, y: 190, s: 0.9 },
          { x: 1180, y: 170, s: 0.75 },
        ].map((r, i) => (
          <g
            key={i}
            transform={`translate(${r.x} ${r.y}) scale(${r.s}) rotate(28)`}
          >
            <line
              x1="0"
              y1="22"
              x2="0"
              y2="140"
              className="stroke-ink"
              strokeWidth="2"
              strokeDasharray="2 7"
              strokeLinecap="round"
              opacity="0.45"
            />
            <path
              d="M0 -22 C9 -12 10 4 8 18 L-8 18 C-10 4 -9 -12 0 -22 Z"
              className="fill-ink"
            />
            <path
              d="M-8 8 L-15 22 L-8 18 Z M8 8 L15 22 L8 18 Z"
              className="fill-ink"
            />
            <circle cx="0" cy="-2" r="3.2" className="fill-paper-dark" />
            <path d="M-4 20 L0 32 L4 20 Z" className="fill-press" />
          </g>
        ))}

        {/* Birds */}
        {[
          [180, 200],
          [205, 188],
          [760, 150],
          [785, 162],
          [1380, 210],
        ].map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y} q6 -6 12 0 q6 -6 12 0`}
            className="stroke-ink"
            fill="none"
            strokeWidth="1.6"
            opacity="0.55"
          />
        ))}

        {/* Back row: halftone */}
        <g>
          {back.map((b, i) => (
            <g key={i}>
              <rect
                x={b.x}
                y={420 - b.h}
                width={b.w}
                height={b.h}
                fill="url(#fs-dots)"
                className="opacity-50 [[data-theme=night]_&]:opacity-30"
              />
              {b.spire && (
                <path
                  d={`M${b.x + b.w / 2 - 6} ${420 - b.h} L${b.x + b.w / 2} ${420 - b.h - 40} L${b.x + b.w / 2 + 6} ${420 - b.h} Z`}
                  fill="url(#fs-dots)"
                  className="opacity-50 [[data-theme=night]_&]:opacity-30"
                />
              )}
            </g>
          ))}
        </g>

        {/* Front row: solid ink with lit windows and water towers */}
        <g>
          {front.map((b, i) => (
            <g key={i}>
              <rect
                x={b.x}
                y={420 - b.h}
                width={b.w}
                height={b.h}
                // Ink by day; at night a dark silhouette with lit windows
                className="fill-ink opacity-[0.82] [[data-theme=night]_&]:fill-[#2b261f] [[data-theme=night]_&]:opacity-100"
              />
              {b.tower && (
                <g className="fill-ink opacity-[0.82] [[data-theme=night]_&]:fill-[#2b261f] [[data-theme=night]_&]:opacity-100">
                  <rect
                    x={b.x + 10}
                    y={420 - b.h - 22}
                    width="18"
                    height="16"
                    rx="2"
                  />
                  <path
                    d={`M${b.x + 8} ${420 - b.h - 22} L${b.x + 19} ${420 - b.h - 31} L${b.x + 30} ${420 - b.h - 22} Z`}
                  />
                  <rect x={b.x + 12} y={420 - b.h - 6} width="2" height="6" />
                  <rect x={b.x + 24} y={420 - b.h - 6} width="2" height="6" />
                </g>
              )}
            </g>
          ))}
          {lit.map((w, i) => (
            <rect
              key={i}
              x={w.x}
              y={w.y}
              width="4"
              height="6"
              className="fill-paper-dark opacity-75 [[data-theme=night]_&]:fill-amber-200 [[data-theme=night]_&]:opacity-80"
            />
          ))}
        </g>

        {/* The press line along the street */}
        <rect x="0" y="414" width="1440" height="6" className="fill-ink" />
      </svg>
    </div>
  );
}
