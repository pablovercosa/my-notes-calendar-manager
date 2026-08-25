import type { TFile } from "obsidian";

export type EventKind =
  | "note-created"
  | "note-updated"
  | "task-completed"
  | "task-overdue"
  | "task-due"
  | "task-cancelled"
  | "review"
  | "start"
  | "end"
  | "deadline"
  | "task-start"
  | "task-scheduled"
  | "task-created"
  | "generic-date";

export interface CalendarEvent {
  date: string;
  path: string;
  link: string;
  kind: EventKind;
  detail: string;
}

export interface CalendarSettings {
  calendarFolder: string;
  excludedFolders: string[];
  recognizedProperties: string[];
  includeCtime: boolean;
  includeMtime: boolean;
  includeTaskDates: boolean;
  automaticSync: boolean;
  debounceMs: number;
}

export interface CollectedEvents {
  events: CalendarEvent[];
  notesScanned: number;
}

export interface SyncResult {
  calendarsChanged: number;
  errors: string[];
  eventsFound: number;
  notesScanned: number;
}

export interface MetadataAuditResult {
  invalidMetadata: number;
  missingMetadata: number;
  notesScanned: number;
}

export interface TaskDate {
  date: string;
  detail: string;
  kind: EventKind;
}

export interface DatedFile {
  date: string;
  file: TFile;
  kind: EventKind;
  detail?: string;
}

export interface LocaleText {
  code: "en" | "pt-BR";
  months: readonly string[];
  weekdays: readonly string[];
  eventLabels: Record<EventKind, string>;
  settings: {
    title: string;
    calendarFolder: string;
    calendarFolderDescription: string;
    excludedFolders: string;
    excludedFoldersDescription: string;
    recognizedProperties: string;
    recognizedPropertiesDescription: string;
    includeCtime: string;
    includeMtime: string;
    includeTaskDates: string;
    automaticSync: string;
    sync: string;
    syncDescription: string;
    audit: string;
    auditDescription: string;
    running: string;
  };
  notices: {
    auditComplete: (result: MetadataAuditResult) => string;
    invalidFolder: string;
    syncAlreadyRunning: string;
    syncComplete: (result: SyncResult) => string;
    syncFailed: string;
  };
  calendar: {
    activity: string;
    empty: string;
    generatedWarning: string;
  };
}
