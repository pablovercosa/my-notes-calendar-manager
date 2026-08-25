import type { CalendarEvent, EventKind, LocaleText } from "../types";
import { MANAGED_END, MANAGED_START } from "./managed-content";

const EVENT_ORDER: Record<EventKind, number> = {
  "note-created": 10,
  "note-updated": 20,
  "task-completed": 30,
  "task-overdue": 40,
  "task-due": 50,
  "task-cancelled": 60,
  review: 70,
  start: 80,
  end: 90,
  deadline: 100,
  "task-start": 110,
  "task-scheduled": 120,
  "task-created": 130,
  "generic-date": 140,
};

const EVENT_CLASS: Record<EventKind, string> = {
  "note-created": "created",
  "note-updated": "updated",
  "task-completed": "completed",
  "task-overdue": "overdue",
  "task-due": "due",
  "task-cancelled": "cancelled",
  review: "review",
  start: "start",
  end: "end",
  deadline: "due",
  "task-start": "start",
  "task-scheduled": "review",
  "task-created": "generic",
  "generic-date": "generic",
};

export function renderCalendar(
  monthKey: string,
  events: CalendarEvent[],
  availableMonths: string[],
  locale: LocaleText,
): string {
  const parsedMonth = parseMonth(monthKey);
  if (!parsedMonth) throw new Error(`Invalid month: ${monthKey}`);

  const { month, year } = parsedMonth;
  const eventsByDate = groupByDate(events);
  const lines = [
    MANAGED_START,
    `<!-- ${locale.calendar.generatedWarning} -->`,
    "",
    `# ${locale.months[month - 1]} ${year}`,
    "",
  ];

  const navigation = renderNavigation(monthKey, availableMonths, locale);
  if (navigation) lines.push(navigation, "");

  lines.push(...renderMonthTable(year, month, eventsByDate, locale));
  lines.push("", `## ${locale.calendar.activity}`, "");
  lines.push(...renderEventDetails(eventsByDate, locale));
  lines.push("", MANAGED_END);

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderMonthTable(
  year: number,
  month: number,
  eventsByDate: Map<string, CalendarEvent[]>,
  locale: LocaleText,
): string[] {
  const cells: string[] = [];
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  for (let index = 0; index < mondayOffset; index += 1) cells.push("");

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const badges = groupByKind(eventsByDate.get(date) ?? []).map(([kind, grouped]) =>
      renderBadge(kind, grouped.length, locale));
    const badgeRow = badges.length > 0
      ? `<span class="mncm-calendar-badges">${badges.join("")}</span>`
      : "";

    cells.push([`**${day}**`, badgeRow].filter(Boolean).join("<br>"));
  }

  while (cells.length % 7 !== 0) cells.push("");

  const lines = [
    `| ${locale.weekdays.join(" | ")} |`,
    `| ${locale.weekdays.map(() => "---").join(" | ")} |`,
  ];

  for (let index = 0; index < cells.length; index += 7) {
    lines.push(`| ${cells.slice(index, index + 7).join(" | ")} |`);
  }

  return lines;
}

function renderEventDetails(eventsByDate: Map<string, CalendarEvent[]>, locale: LocaleText): string[] {
  if (eventsByDate.size === 0) return [locale.calendar.empty];

  const lines: string[] = [];
  for (const date of [...eventsByDate.keys()].sort()) {
    lines.push(`### ${date}`, "");

    for (const [kind, events] of groupByKind(eventsByDate.get(date) ?? [])) {
      lines.push(`- ${renderDot(kind, locale)} **${locale.eventLabels[kind]} (${events.length})**`);
      for (const event of events) {
        const detail = event.detail ? ` - ${escapeHtml(event.detail)}` : "";
        lines.push(`  - ${event.link}${detail}`);
      }
    }

    lines.push("");
  }

  return lines;
}

function renderNavigation(monthKey: string, months: string[], locale: LocaleText): string {
  const position = months.indexOf(monthKey);
  if (position === -1) return "";

  const previous = months[position - 1];
  const next = months[position + 1];
  return [
    previous ? `[[${previous}|← ${monthLabel(previous, locale)}]]` : "",
    next ? `[[${next}|${monthLabel(next, locale)} →]]` : "",
  ].filter(Boolean).join(" · ");
}

function monthLabel(monthKey: string, locale: LocaleText): string {
  const parsed = parseMonth(monthKey);
  return parsed ? `${locale.months[parsed.month - 1]} ${parsed.year}` : monthKey;
}

function parseMonth(monthKey: string): { month: number; year: number } | null {
  const match = monthKey.match(/^(\d{4})-(\d{2})$/u);
  if (!match?.[1] || !match[2]) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  return year > 0 && month >= 1 && month <= 12 ? { year, month } : null;
}

function groupByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const group = groups.get(event.date) ?? [];
    group.push(event);
    groups.set(event.date, group);
  }
  return groups;
}

function groupByKind(events: CalendarEvent[]): Array<[EventKind, CalendarEvent[]]> {
  const groups = new Map<EventKind, CalendarEvent[]>();
  for (const event of events) {
    const group = groups.get(event.kind) ?? [];
    group.push(event);
    groups.set(event.kind, group);
  }
  return [...groups.entries()].sort(([left], [right]) => EVENT_ORDER[left] - EVENT_ORDER[right]);
}

function renderBadge(kind: EventKind, count: number, locale: LocaleText): string {
  const label = locale.eventLabels[kind];
  const className = EVENT_CLASS[kind];
  return `<span class="mncm-calendar-badge mncm-${className}" title="${label}: ${count}"><span class="mncm-calendar-dot"></span>${count}</span>`;
}

function renderDot(kind: EventKind, locale: LocaleText): string {
  const label = locale.eventLabels[kind];
  return `<span class="mncm-calendar-dot mncm-${EVENT_CLASS[kind]}" aria-label="${label}"></span>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;");
}
