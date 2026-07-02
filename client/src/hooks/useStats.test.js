import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useStats } from "./useStats";

describe("useStats", () => {
  it("loads stats on mount", async () => {
    const fetcher = vi.fn().mockResolvedValue({ total: 3 });
    const { result } = renderHook(() => useStats(fetcher));

    expect(result.current[0]).toBeNull();
    await waitFor(() => expect(result.current[0]).toEqual({ total: 3 }));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("keeps the previous stats when a reload fails", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ total: 3 })
      .mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useStats(fetcher));
    await waitFor(() => expect(result.current[0]).toEqual({ total: 3 }));

    await act(() => result.current[1]()); // manual reload -> rejection swallowed
    expect(result.current[0]).toEqual({ total: 3 });
  });

  it("reload fetches fresh stats", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ total: 1 })
      .mockResolvedValueOnce({ total: 2 });

    const { result } = renderHook(() => useStats(fetcher));
    await waitFor(() => expect(result.current[0]).toEqual({ total: 1 }));

    await act(() => result.current[1]());
    expect(result.current[0]).toEqual({ total: 2 });
  });
});
