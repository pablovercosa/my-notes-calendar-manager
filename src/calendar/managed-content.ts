export const MANAGED_START = "<!-- my-notes-calendar-manager:start -->";
export const MANAGED_END = "<!-- my-notes-calendar-manager:end -->";

export type ManagedContentResult =
  | { ok: true; content: string }
  | { ok: false; reason: "corrupt" | "unmanaged" };

export function mergeManagedContent(existing: string, managedBlock: string): ManagedContentResult {
  const start = existing.indexOf(MANAGED_START);
  const end = existing.indexOf(MANAGED_END);

  if (start === -1 && end === -1) return { ok: false, reason: "unmanaged" };
  if (start === -1 || end === -1 || end < start) return { ok: false, reason: "corrupt" };

  const duplicateStart = existing.indexOf(MANAGED_START, start + MANAGED_START.length);
  const duplicateEnd = existing.indexOf(MANAGED_END, end + MANAGED_END.length);
  if (duplicateStart !== -1 || duplicateEnd !== -1) return { ok: false, reason: "corrupt" };

  const suffixStart = end + MANAGED_END.length;
  let suffix = existing.slice(suffixStart);
  if (managedBlock.endsWith("\n")) {
    suffix = suffix.replace(/^\r?\n/u, "");
  }

  return {
    ok: true,
    content: `${existing.slice(0, start)}${managedBlock}${suffix}`,
  };
}
