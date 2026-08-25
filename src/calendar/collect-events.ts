import { normalizePath, type App, type TFile } from "obsidian";
import type { CalendarEvent, CalendarSettings, CollectedEvents, EventKind } from "../types";
import { collectDateValues, dateFromTimestamp, normalizeDate, today } from "./dates";
import { eventKindForProperty, normalizeProperty } from "./event-kind";
import { collectTaskDates } from "./tasks";

export async function collectEvents(app: App, settings: CalendarSettings): Promise<CollectedEvents> {
  const events: CalendarEvent[] = [];
  const seen = new Set<string>();
  const properties = new Set(settings.recognizedProperties.map(normalizeProperty));
  let notesScanned = 0;

  const addEvent = (date: unknown, file: TFile, kind: EventKind, detail = ""): void => {
    const normalizedDate = normalizeDate(date);
    if (!normalizedDate) return;

    const key = `${normalizedDate}|${file.path}|${kind}|${detail}`;
    if (seen.has(key)) return;

    seen.add(key);
    const calendarPath = normalizePath(`${settings.calendarFolder}/${normalizedDate.slice(0, 7)}.md`);
    events.push({
      date: normalizedDate,
      path: file.path,
      link: app.fileManager.generateMarkdownLink(file, calendarPath, undefined, file.basename),
      kind,
      detail,
    });
  };

  for (const file of app.vault.getMarkdownFiles()) {
    if (shouldIgnore(file.path, settings)) continue;
    notesScanned += 1;

    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
    for (const [property, value] of Object.entries(frontmatter)) {
      if (!properties.has(normalizeProperty(property))) continue;

      for (const date of collectDateValues(value)) {
        addEvent(date, file, eventKindForProperty(property));
      }
    }

    if (settings.includeCtime) {
      addEvent(dateFromTimestamp(file.stat.ctime), file, "note-created");
    }

    if (settings.includeMtime) {
      addEvent(dateFromTimestamp(file.stat.mtime), file, "note-updated");
    }

    if (settings.includeTaskDates) {
      const content = await app.vault.cachedRead(file);
      for (const taskDate of collectTaskDates(content, today())) {
        addEvent(taskDate.date, file, taskDate.kind, taskDate.detail);
      }
    }
  }

  return {
    events: removeRedundantUpdates(sortEvents(events)),
    notesScanned,
  };
}

export function shouldIgnore(path: string, settings: CalendarSettings): boolean {
  const normalizedPath = normalizePath(path);
  const folders = [settings.calendarFolder, ...settings.excludedFolders];

  return folders.some((folder) => {
    const normalizedFolder = normalizePath(folder.trim());
    return normalizedFolder !== ""
      && (normalizedPath === normalizedFolder || normalizedPath.startsWith(`${normalizedFolder}/`));
  });
}

function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.sort((left, right) =>
    left.date.localeCompare(right.date)
    || left.path.localeCompare(right.path)
    || left.kind.localeCompare(right.kind)
    || left.detail.localeCompare(right.detail));
}

function removeRedundantUpdates(events: CalendarEvent[]): CalendarEvent[] {
  const created = new Set(
    events
      .filter(({ kind }) => kind === "note-created")
      .map(({ date, path }) => `${date}|${path}`),
  );

  return events.filter(({ date, kind, path }) =>
    kind !== "note-updated" || !created.has(`${date}|${path}`));
}
