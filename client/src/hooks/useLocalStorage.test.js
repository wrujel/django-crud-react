import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  it("falls back to the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("view", "grid"));
    expect(result.current[0]).toBe("grid");
  });

  it("reads a previously stored value", () => {
    localStorage.setItem("view", JSON.stringify("list"));
    const { result } = renderHook(() => useLocalStorage("view", "grid"));
    expect(result.current[0]).toBe("list");
  });

  it("falls back when the stored value is invalid JSON", () => {
    localStorage.setItem("view", "{not json");
    const { result } = renderHook(() => useLocalStorage("view", "grid"));
    expect(result.current[0]).toBe("grid");
  });

  it("persists updates", () => {
    const { result } = renderHook(() => useLocalStorage("view", "grid"));
    act(() => result.current[1]("list"));
    expect(result.current[0]).toBe("list");
    expect(localStorage.getItem("view")).toBe(JSON.stringify("list"));
  });

  it("ignores write failures (private mode / quota)", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });

    const { result } = renderHook(() => useLocalStorage("view", "grid"));
    expect(() => act(() => result.current[1]("list"))).not.toThrow();
    expect(result.current[0]).toBe("list"); // state still updates

    setItem.mockRestore();
  });
});
