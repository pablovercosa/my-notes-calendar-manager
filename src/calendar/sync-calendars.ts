import { normalizePath, TFile, TFolder, type App } from "obsidian";
import type { CalendarEvent, CalendarSettings, LocaleText, SyncResult } from "../types";
import { collectEvents } from "./collect-events";
import { today } from "./dates";
import { mergeManagedContent } from "./managed-content";
import { renderCalendar } from "./render-calendar";

export async function syncCalendars(
  app: App,
  settings: CalendarSettings,
  locale: LocaleText,
): Promise<SyncResult> {
  const folder = normalizePath(settings.calendarFolder.trim());
  if (!folder || folder === "/") throw new Error("Invalid calendar folder");

  await ensureFolder(app, folder);
  const { events, notesScanned } = await collectEvents(app, settings);
  const months = collectMonths(app, folder, events);
  const eventsByMonth = groupEventsByMonth(events);
  const errors: string[] = [];
  let calendarsChanged = 0;

  for (const month of months) {
    const path = normalizePath(`${folder}/${month}.md`);

    try {
      const block = renderCalendar(month, eventsByMonth.get(month) ?? [], months, locale);
      if (await writeCalendar(app, path, block)) calendarsChanged += 1;
    } catch (error) {
      errors.push(`${path}: ${errorMessage(error)}`);
    }
  }

  return {
    calendarsChanged,
    errors,
    eventsFound: events.length,
    notesScanned,
  };
}

async function ensureFolder(app: App, folder: string): Promise<void> {
  const parts = folder.split("/");
  let current = "";

  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    const existing = app.vault.getAbstractFileByPath(current);
    if (existing instanceof TFile) throw new Error(`Calendar folder conflicts with file: ${current}`);
    if (!existing) await app.vault.createFolder(current);
  }
}

function collectMonths(app: App, folder: string, events: CalendarEvent[]): string[] {
  const months = new Set(events.map(({ date }) => date.slice(0, 7)));
  months.add(today().slice(0, 7));

  for (const file of app.vault.getMarkdownFiles()) {
    if (file.parent?.path === folder && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/u.test(file.basename)) {
      months.add(file.basename);
    }
  }

  return [...months].sort();
}

function groupEventsByMonth(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const month = event.date.slice(0, 7);
    const group = groups.get(month) ?? [];
    group.push(event);
    groups.set(month, group);
  }
  return groups;
}

async function writeCalendar(app: App, path: string, managedBlock: string): Promise<boolean> {
  const existing = app.vault.getAbstractFileByPath(path);
  if (existing instanceof TFolder) throw new Error("A folder already uses the calendar path");

  if (!(existing instanceof TFile)) {
    await app.vault.create(path, managedBlock);
    return true;
  }

  const snapshot = await app.vault.cachedRead(existing);
  const preview = mergeOrThrow(snapshot, managedBlock);
  if (preview === snapshot) return false;

  let changed = false;
  await app.vault.process(existing, (current) => {
    const merged = mergeOrThrow(current, managedBlock);
    changed = merged !== current;
    return merged;
  });
  return changed;
}

function mergeOrThrow(existing: string, managedBlock: string): string {
  const merged = mergeManagedContent(existing, managedBlock);
  if (merged.ok) return merged.content;

  const explanation = merged.reason === "unmanaged"
    ? "existing file is not managed by this plugin"
    : "managed markers are missing, duplicated, or out of order";
  throw new Error(explanation);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
