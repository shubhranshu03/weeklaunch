// Launch days run midnight to midnight UTC, numbered from the first day of
// IndieShip: Day 1 is Mon, Nov 2, 2026, Day 2 the next day, and so on.
// Products launch on a day; awards also look at the week (Mon–Sun) and month.

export type Day = {
  number: number;
  // Calendar year of the day, kept with each launch
  year: number;
  // Like "Wed, Nov 25"
  label: string;
  current?: boolean;
};

const MS = 86_400_000;

// Day 1, Monday Nov 2, 2026
const FIRST_DAY = Date.UTC(2026, 10, 2);

// Day number of a date (Day 1 for anything before launch)
export function dayNumber(date: Date) {
  return Math.max(1, Math.floor((date.getTime() - FIRST_DAY) / MS) + 1);
}

// Midnight UTC at the start of a day
export function dayStart(number: number) {
  return new Date(FIRST_DAY + (number - 1) * MS);
}

export function dayLabel(number: number, opts: { weekday?: boolean } = {}) {
  return dayStart(number).toLocaleDateString("en-US", {
    ...(opts.weekday !== false && { weekday: "short" }),
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function day(number: number, current = false): Day {
  return {
    number,
    year: dayStart(number).getUTCFullYear(),
    label: dayLabel(number),
    ...(current && { current: true }),
  };
}

export function currentDay(now: Date) {
  return day(dayNumber(now), true);
}

// Up to `before` past days (never before Day 1), today, then `after` upcoming days
export function daysAround(now: Date, before: number, after: number): Day[] {
  const cur = dayNumber(now);
  const list: Day[] = [];
  for (let n = Math.max(1, cur - before); n <= cur + after; n++)
    list.push(day(n, n === cur));
  return list;
}

export const dayKey = (d: { year: number; number: number }) =>
  `${d.year}-${d.number}`;

// ─── Periods for the awards ─────────────────────────────────

export type Period = "day" | "week" | "month";
export type Range = { from: number; to: number; label: string };

// The Monday-to-Sunday week a day falls in
export function weekRange(n: number): Range {
  const weekday = (dayStart(n).getUTCDay() + 6) % 7; // Monday = 0
  const from = Math.max(1, n - weekday);
  const to = n - weekday + 6;
  return { from, to, label: `Week of ${dayLabel(from, { weekday: false })}` };
}

// The calendar month a day falls in
export function monthRange(n: number): Range {
  const d = dayStart(n);
  const first = dayNumber(
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)),
  );
  const last = dayNumber(
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)),
  );
  return {
    from: first,
    to: last,
    label: d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}

export function periodRange(period: Period, n: number): Range {
  if (period === "week") return weekRange(n);
  if (period === "month") return monthRange(n);
  return { from: n, to: n, label: dayLabel(n) };
}

// Converts an old launch week number to its Monday's day number
export const dayOfWeek = (week: number) => (week - 1) * 7 + 1;
