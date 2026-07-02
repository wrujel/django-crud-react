import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatDueDate, todayISO } from "./format";

describe("format", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Local noon avoids any UTC/local date boundary flakiness.
    vi.setSystemTime(new Date(2026, 6, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("todayISO", () => {
    it("returns the local date as YYYY-MM-DD", () => {
      expect(todayISO()).toBe("2026-07-15");
    });
  });

  describe("formatDueDate", () => {
    it("returns null for empty values", () => {
      expect(formatDueDate(null)).toBeNull();
      expect(formatDueDate("")).toBeNull();
      expect(formatDueDate(undefined)).toBeNull();
    });

    it("returns null for unparseable dates", () => {
      expect(formatDueDate("not-a-date")).toBeNull();
    });

    it("labels today", () => {
      const due = formatDueDate("2026-07-15");
      expect(due.label).toBe("Today");
      expect(due.iso).toBe("2026-07-15");
      expect(due.isOverdue).toBe(false);
      expect(due.isSoon).toBe(true);
    });

    it("labels tomorrow and yesterday", () => {
      expect(formatDueDate("2026-07-16").label).toBe("Tomorrow");
      expect(formatDueDate("2026-07-14").label).toBe("Yesterday");
    });

    it("labels overdue dates with day count", () => {
      const due = formatDueDate("2026-07-12");
      expect(due.label).toBe("3d overdue");
      expect(due.isOverdue).toBe(true);
      expect(due.isSoon).toBe(false);
    });

    it("labels near-future dates relatively", () => {
      const due = formatDueDate("2026-07-20");
      expect(due.label).toBe("In 5d");
      expect(due.isOverdue).toBe(false);
    });

    it("marks dates within two days as soon", () => {
      expect(formatDueDate("2026-07-17").isSoon).toBe(true);
      expect(formatDueDate("2026-07-18").isSoon).toBe(false);
    });

    it("falls back to the absolute label beyond a week", () => {
      const due = formatDueDate("2026-07-30");
      // Locale-dependent (e.g. "Jul 30"); the label must equal the absolute form.
      expect(due.label).toBe(due.abs);
      expect(due.abs).toMatch(/30/);
    });
  });
});
