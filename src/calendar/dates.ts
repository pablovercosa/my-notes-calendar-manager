export function normalizeDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatLocalDate(value);
  }

  if (typeof value !== "string") return null;

  const match = value.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+\-](\d{2}):(\d{2}))?)?$/u,
  );
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  if (!yearText || !monthText || !dayText) return null;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = match[4] === undefined ? null : Number(match[4]);
  const minute = match[5] === undefined ? null : Number(match[5]);
  const second = match[6] === undefined ? null : Number(match[6]);
  const offsetHour = match[7] === undefined ? null : Number(match[7]);
  const offsetMinute = match[8] === undefined ? null : Number(match[8]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year
    || candidate.getUTCMonth() !== month - 1
    || candidate.getUTCDate() !== day
    || (hour !== null && (hour > 23 || minute === null || minute > 59))
    || (second !== null && second > 59)
    || (offsetHour !== null && (
      offsetHour > 14
      || offsetMinute === null
      || offsetMinute > 59
      || (offsetHour === 14 && offsetMinute !== 0)
    ))
  ) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
}

export function dateFromTimestamp(timestamp: number): string | null {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : formatLocalDate(date);
}

export function today(now = new Date()): string {
  return formatLocalDate(now);
}

export function collectDateValues(value: unknown): string[] {
  const dates: string[] = [];
  walkValue(value, (date) => dates.push(date));
  return dates;
}

function walkValue(value: unknown, addDate: (date: string) => void): void {
  const date = normalizeDate(value);
  if (date) {
    addDate(date);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) walkValue(item, addDate);
    return;
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    for (const item of Object.values(value)) walkValue(item, addDate);
  }
}

function formatLocalDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
