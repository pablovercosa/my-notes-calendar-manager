import type { EventKind } from "../types";

const PROPERTY_KINDS: Record<string, EventKind> = {
  created: "note-created",
  criado: "note-created",
  updated: "note-updated",
  atualizado: "note-updated",
  review: "review",
  revisao: "review",
  "proxima-revisao": "review",
  proxima_revisao: "review",
  start: "start",
  inicio: "start",
  data_inicio: "start",
  end: "end",
  fim: "end",
  data_fim: "end",
  deadline: "deadline",
  prazo: "deadline",
};

export function eventKindForProperty(property: string): EventKind {
  return PROPERTY_KINDS[normalizeProperty(property)] ?? "generic-date";
}

export function normalizeProperty(property: string): string {
  return property
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .trim()
    .toLowerCase();
}
