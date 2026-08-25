import { describe, expect, it } from "vitest";
import { loadSettings } from "../src/defaults";

describe("loadSettings", () => {
  it("keeps defaults when persisted settings have invalid types", () => {
    const settings = loadSettings({
      calendarFolder: null,
      excludedFolders: "Archive",
      recognizedProperties: null,
      includeMtime: "yes",
      debounceMs: -1,
    }, "en");

    expect(settings.calendarFolder).toBe("00 - Progresso/Calendario");
    expect(settings.excludedFolders).toEqual([".obsidian", "00 - Progresso/Calendario"]);
    expect(settings.recognizedProperties).toContain("created");
    expect(settings.includeMtime).toBe(true);
    expect(settings.debounceMs).toBe(900);
  });
});
