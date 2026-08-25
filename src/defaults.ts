import type { CalendarSettings } from "./types";

const ENGLISH_PROPERTIES = ["created", "updated", "date", "review", "start", "end", "deadline", "due"];
const PORTUGUESE_PROPERTIES = [
  "criado",
  "atualizado",
  "data",
  "proxima_revisao",
  "data_inicio",
  "data_fim",
  "inicio",
  "fim",
  "prazo",
  "vencimento",
];

export function createDefaultSettings(language: string): CalendarSettings {
  const portuguese = language.toLowerCase().startsWith("pt");

  return {
    calendarFolder: "00 - Progresso/Calendario",
    excludedFolders: [".obsidian", "00 - Progresso/Calendario"],
    recognizedProperties: portuguese ? PORTUGUESE_PROPERTIES : ENGLISH_PROPERTIES,
    includeCtime: false,
    includeMtime: true,
    includeTaskDates: true,
    automaticSync: true,
    debounceMs: 900,
  };
}

export function loadSettings(value: unknown, language: string): CalendarSettings {
  const defaults = createDefaultSettings(language);
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;

  const saved = value as Record<string, unknown>;
  return {
    calendarFolder: stringValue(saved.calendarFolder, defaults.calendarFolder),
    excludedFolders: stringArray(saved.excludedFolders, defaults.excludedFolders),
    recognizedProperties: stringArray(saved.recognizedProperties, defaults.recognizedProperties),
    includeCtime: booleanValue(saved.includeCtime, defaults.includeCtime),
    includeMtime: booleanValue(saved.includeMtime, defaults.includeMtime),
    includeTaskDates: booleanValue(saved.includeTaskDates, defaults.includeTaskDates),
    automaticSync: booleanValue(saved.automaticSync, defaults.automaticSync),
    debounceMs: debounceValue(saved.debounceMs, defaults.debounceMs),
  };
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function stringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? [...new Set(value.map((item) => item.trim()).filter(Boolean))]
    : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function debounceValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 100 && value <= 60_000
    ? value
    : fallback;
}
