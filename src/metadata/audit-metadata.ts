import type { App } from "obsidian";
import type { CalendarSettings, MetadataAuditResult } from "../types";
import { collectDateValues } from "../calendar/dates";
import { normalizeProperty } from "../calendar/event-kind";
import { shouldIgnore } from "../calendar/collect-events";

export function auditMetadata(app: App, settings: CalendarSettings): MetadataAuditResult {
  const recognized = new Set(settings.recognizedProperties.map(normalizeProperty));
  let invalidMetadata = 0;
  let missingMetadata = 0;
  let notesScanned = 0;

  for (const file of app.vault.getMarkdownFiles()) {
    if (shouldIgnore(file.path, settings)) continue;
    notesScanned += 1;

    const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
    const values = Object.entries(frontmatter)
      .filter(([property]) => recognized.has(normalizeProperty(property)))
      .map(([, value]) => value);

    if (values.length === 0) {
      missingMetadata += 1;
    } else if (values.some((value) => collectDateValues(value).length === 0)) {
      invalidMetadata += 1;
    }
  }

  return { invalidMetadata, missingMetadata, notesScanned };
}
