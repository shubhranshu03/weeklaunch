// Launch weeks run Monday 00:00 UTC to Sunday night, numbered from the
// first week of WeekLaunch: Week 1 is Nov 2 – 8, 2026, Week 2 the next, and so on.

export type Week = {
  number: number;
  // Calendar year of the week's Monday, for labels like "Nov 2 – 8, 2026"
  year: number;
  label: string;
  current?: boolean;
};

const DAY = 86_400_000;
const WEEK = 7 * DAY;

// Monday of Week 1
const FIRST_WEEK_START = Date.UTC(2026, 10, 2);

// Week number of a date (Week 1 for anything before launch)
export function weekNumber(date: Date) {
  return Math.max(
    1,
    Math.floor((date.getTime() - FIRST_WEEK_START) / WEEK) + 1,
  );
}

// Monday of a week
export function weekStart(number: number) {
  return new Date(FIRST_WEEK_START + (number - 1) * WEEK);
}

const month = (d: Date) =>
  d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });

function label(start: Date) {
  const end = new Date(start.getTime() + 6 * DAY);
  return month(start) === month(end)
    ? `${month(start)} ${start.getUTCDate()} – ${end.getUTCDate()}`
    : `${month(start)} ${start.getUTCDate()} – ${month(end)} ${end.getUTCDate()}`;
}

function week(number: number, current = false): Week {
  const start = weekStart(number);
  return {
    number,
    year: start.getUTCFullYear(),
    label: label(start),
    ...(current && { current: true }),
  };
}

// The current week of a date
export function currentWeek(now: Date) {
  return week(weekNumber(now), true);
}

// Up to `before` past weeks (never before Week 1), this week, then `after` upcoming weeks
export function weeksAround(now: Date, before: number, after: number): Week[] {
  const cur = weekNumber(now);
  const list: Week[] = [];
  for (let n = Math.max(1, cur - before); n <= cur + after; n++)
    list.push(week(n, n === cur));
  return list;
}

export const weekKey = (w: { year: number; number: number }) =>
  `${w.year}-${w.number}`;

export function weekLabel(number: number) {
  return label(weekStart(number));
}
