import type { EventKind, TaskDate } from "../types";

const TASK_MARKERS: ReadonlyArray<readonly [string, EventKind]> = [
  ["➕", "task-created"],
  ["🛫", "task-start"],
  ["⏳", "task-scheduled"],
  ["📅", "task-due"],
  ["✅", "task-completed"],
  ["❌", "task-cancelled"],
];

export function collectTaskDates(content: string, currentDate: string): TaskDate[] {
  const events: TaskDate[] = [];
  let fence: { marker: "`" | "~"; length: number } | null = null;

  for (const line of content.split(/\r?\n/u)) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/u);
    if (fenceMatch?.[1]) {
      const marker = fenceMatch[1].startsWith("`") ? "`" : "~";
      if (!fence) {
        fence = { marker, length: fenceMatch[1].length };
      } else if (fence.marker === marker && fenceMatch[1].length >= fence.length) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;

    const task = line.match(/^\s*[-*+]\s+\[([^\]])\]\s+(.*)$/u);
    if (!task) continue;

    const status = task[1]?.toLowerCase() ?? " ";
    const taskText = task[2] ?? "";
    const dates = datesFromTask(taskText, currentDate);
    const completed = dates.filter(({ kind }) => kind === "task-completed");
    const cancelled = dates.filter(({ kind }) => kind === "task-cancelled");

    if (status === "x" || completed.length > 0) {
      events.push(...completed);
    } else if (status === "-" || cancelled.length > 0) {
      events.push(...cancelled);
    } else {
      events.push(...dates.filter(({ kind }) => kind !== "task-completed" && kind !== "task-cancelled"));
    }
  }

  return events;
}

function datesFromTask(taskText: string, currentDate: string): TaskDate[] {
  const detail = cleanTaskDetail(taskText);
  const events: TaskDate[] = [];

  for (const [marker, markerKind] of TASK_MARKERS) {
    const pattern = new RegExp(`${escapeRegExp(marker)}\\s*(\\d{4}-\\d{2}-\\d{2})`, "gu");

    for (const match of taskText.matchAll(pattern)) {
      const date = match[1];
      if (!date) continue;

      const kind = markerKind === "task-due" && date < currentDate ? "task-overdue" : markerKind;
      events.push({ date, detail, kind });
    }
  }

  return events;
}

function cleanTaskDetail(taskText: string): string {
  let detail = taskText;

  for (const [marker] of TASK_MARKERS) {
    detail = detail.replace(new RegExp(`${escapeRegExp(marker)}\\s*\\d{4}-\\d{2}-\\d{2}`, "gu"), "");
  }

  const normalized = detail.replace(/\s+/gu, " ").replace(/\|/gu, "\\|").trim();
  return normalized.length > 120 ? `${normalized.slice(0, 117)}...` : normalized;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
