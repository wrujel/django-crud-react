import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDelayedFlag } from "./useDelayedFlag";

describe("useDelayedFlag", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("stays false until the delay elapses", () => {
    const { result } = renderHook(() => useDelayedFlag(true, 400));
    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(399));
    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it("never turns on for short-lived activity", () => {
    const { result, rerender } = renderHook(
      ({ active }) => useDelayedFlag(active, 400),
      { initialProps: { active: true } },
    );

    act(() => vi.advanceTimersByTime(200));
    rerender({ active: false });
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe(false);
  });

  it("clears immediately when the activity ends", () => {
    const { result, rerender } = renderHook(
      ({ active }) => useDelayedFlag(active, 400),
      { initialProps: { active: true } },
    );
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe(true);

    rerender({ active: false });
    expect(result.current).toBe(false);
  });

  it("is false while inactive", () => {
    const { result } = renderHook(() => useDelayedFlag(false));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
  });
});
