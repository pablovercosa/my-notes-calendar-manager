import { describe, expect, it } from "vitest";
import {
  MANAGED_END,
  MANAGED_START,
  mergeManagedContent,
} from "../src/calendar/managed-content";

describe("mergeManagedContent", () => {
  it("preserves content outside the managed markers", () => {
    const existing = `Before\n${MANAGED_START}\nOld\n${MANAGED_END}\nAfter\n`;
    const replacement = `${MANAGED_START}\nNew\n${MANAGED_END}\n`;

    expect(mergeManagedContent(existing, replacement)).toEqual({
      ok: true,
      content: `Before\n${replacement}After\n`,
    });
  });

  it("is idempotent when the managed block ends with a newline", () => {
    const block = `${MANAGED_START}\nGenerated\n${MANAGED_END}\n`;
    const first = mergeManagedContent(block, block);
    expect(first).toEqual({ ok: true, content: block });
    if (!first.ok) throw new Error("Expected managed content");
    expect(mergeManagedContent(first.content, block)).toEqual(first);
  });

  it("does not duplicate a CRLF boundary", () => {
    const existing = `${MANAGED_START}\r\nOld\r\n${MANAGED_END}\r\nManual\r\n`;
    const block = `${MANAGED_START}\nNew\n${MANAGED_END}\n`;
    expect(mergeManagedContent(existing, block)).toEqual({
      ok: true,
      content: `${block}Manual\r\n`,
    });
  });

  it("refuses unmanaged and corrupt files", () => {
    expect(mergeManagedContent("Manual note\n", "generated")).toEqual({
      ok: false,
      reason: "unmanaged",
    });
    expect(mergeManagedContent(`${MANAGED_START}\nBroken`, "generated")).toEqual({
      ok: false,
      reason: "corrupt",
    });
  });
});
