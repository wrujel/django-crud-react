import { describe, expect, it } from "vitest";

import {
  PRIORITIES,
  PRIORITY_FILTER_OPTIONS,
  PRIORITY_OPTIONS,
  PRIORITY_STYLES,
  SORT_OPTIONS,
  STATUS_FILTERS,
} from "./tasks";

describe("task constants", () => {
  it("orders priorities high to low", () => {
    expect(PRIORITIES.map((p) => p.value)).toEqual([3, 2, 1]);
    expect(PRIORITIES.map((p) => p.label)).toEqual(["High", "Medium", "Low"]);
  });

  it("defines full style sets per priority", () => {
    for (const value of [1, 2, 3]) {
      const style = PRIORITY_STYLES[value];
      expect(style.label).toBeTypeOf("string");
      for (const key of ["text", "chip", "dot", "bar"]) {
        expect(style[key]).toBeTypeOf("string");
      }
    }
  });

  it("derives form options with numeric values and dots", () => {
    expect(PRIORITY_OPTIONS).toEqual([
      { value: 3, label: "High", dot: PRIORITY_STYLES[3].dot },
      { value: 2, label: "Medium", dot: PRIORITY_STYLES[2].dot },
      { value: 1, label: "Low", dot: PRIORITY_STYLES[1].dot },
    ]);
  });

  it("derives filter options with string values and an all-priorities head", () => {
    expect(PRIORITY_FILTER_OPTIONS[0]).toEqual({
      value: "",
      label: "All priorities",
    });
    expect(PRIORITY_FILTER_OPTIONS.slice(1).map((o) => o.value)).toEqual([
      "3",
      "2",
      "1",
    ]);
  });

  it("exposes the status filters used by the segmented control", () => {
    expect(STATUS_FILTERS.map((s) => s.value)).toEqual([
      "all",
      "active",
      "completed",
    ]);
  });

  it("exposes sort options mapping to DRF ordering values", () => {
    const values = SORT_OPTIONS.map((s) => s.value);
    expect(values).toContain(""); // smart order
    expect(values).toContain("position"); // manual
    expect(values).toContain("-created_at");
    expect(values).toContain("title");
  });
});
