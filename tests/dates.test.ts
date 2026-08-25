import { describe, expect, it } from "vitest";
import { collectDateValues, normalizeDate } from "../src/calendar/dates";

describe("normalizeDate", () => {
  it("accepts valid ISO dates and leap days", () => {
    expect(normalizeDate("2024-02-29")).toBe("2024-02-29");
    expect(normalizeDate("2026-08-25T14:30:00Z")).toBe("2026-08-25");
  });

  it("rejects impossible and ambiguous dates", () => {
    expect(normalizeDate("2025-02-29")).toBeNull();
    expect(normalizeDate("25/08/2026")).toBeNull();
    expect(normalizeDate("2026-13-01")).toBeNull();
    expect(normalizeDate("2026-08-25T99")).toBeNull();
    expect(normalizeDate("2026-08-25T99:99:99Z")).toBeNull();
    expect(normalizeDate("2026-08-25T12:30+14:01")).toBeNull();
  });

  it("collects dates from lists and nested objects", () => {
    expect(collectDateValues(["2026-08-25", { next: "2026-09-01" }])).toEqual([
      "2026-08-25",
      "2026-09-01",
    ]);
  });
});
