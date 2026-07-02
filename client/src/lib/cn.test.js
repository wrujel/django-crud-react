import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy conditional values", () => {
    const isActive = false;
    expect(cn("a", isActive && "b", undefined, null, "c")).toBe("a c");
  });

  it("resolves tailwind conflicts with the last utility winning", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-fg", "text-muted")).toBe("text-muted");
  });

  it("merges object and array syntaxes", () => {
    expect(cn(["a", { b: true, c: false }])).toBe("a b");
  });
});
