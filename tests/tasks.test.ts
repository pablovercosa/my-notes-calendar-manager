import { describe, expect, it } from "vitest";
import { collectTaskDates } from "../src/calendar/tasks";

describe("collectTaskDates", () => {
  it("classifies open overdue tasks", () => {
    const events = collectTaskDates("- [ ] Submit report 📅 2026-08-20", "2026-08-25");
    expect(events).toEqual([{
      date: "2026-08-20",
      detail: "Submit report",
      kind: "task-overdue",
    }]);
  });

  it("keeps only completion dates for completed tasks", () => {
    const events = collectTaskDates(
      "- [x] Submit report 📅 2026-08-20 ✅ 2026-08-21",
      "2026-08-25",
    );
    expect(events).toEqual([{
      date: "2026-08-21",
      detail: "Submit report",
      kind: "task-completed",
    }]);
  });

  it("ignores task examples inside fenced code blocks", () => {
    const content = "```markdown\n- [ ] Example 📅 2026-08-20\n```";
    expect(collectTaskDates(content, "2026-08-25")).toEqual([]);
  });

  it("closes a fence only with the same marker and sufficient length", () => {
    const content = [
      "````markdown",
      "~~~",
      "```",
      "- [ ] Example 📅 2026-08-20",
      "````",
      "- [ ] Real task 📅 2026-08-26",
    ].join("\n");

    expect(collectTaskDates(content, "2026-08-25")).toEqual([{
      date: "2026-08-26",
      detail: "Real task",
      kind: "task-due",
    }]);
  });
});
