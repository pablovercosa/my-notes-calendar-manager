import { describe, expect, it } from "vitest";
import { renderCalendar } from "../src/calendar/render-calendar";
import { en } from "../src/locales/en";

describe("renderCalendar", () => {
  it("renders deterministic monthly output with managed markers", () => {
    const events = [{
      date: "2026-08-25",
      path: "Projects/Plan.md",
      link: "[[Projects/Plan|Plan]]",
      kind: "note-updated" as const,
      detail: "",
    }];

    const first = renderCalendar("2026-08", events, ["2026-08"], en);
    const second = renderCalendar("2026-08", events, ["2026-08"], en);

    expect(first).toBe(second);
    expect(first).toContain("<!-- my-notes-calendar-manager:start -->");
    expect(first).toContain("[[Projects/Plan|Plan]]");
    expect(first).toContain("<!-- my-notes-calendar-manager:end -->");
  });
});
