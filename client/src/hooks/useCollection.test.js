import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCollection } from "./useCollection";

function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function makeResource(overrides = {}) {
  return {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    patch: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
    ...overrides,
  };
}

const task = (id, extra = {}) => ({
  id,
  title: `Task ${id}`,
  completed: false,
  ...extra,
});

const page = (items, extra = {}) => ({
  results: items,
  count: items.length,
  next: null,
  ...extra,
});

function renderCollection(resource, initialParams = {}) {
  return renderHook(({ params }) => useCollection(resource, params), {
    initialProps: { params: initialParams },
  });
}

describe("useCollection", () => {
  it("loads a paginated page", async () => {
    const resource = makeResource();
    resource.list.mockResolvedValue(
      page([task(1), task(2)], { count: 40, next: "http://x/?page=2" }),
    );

    const { result } = renderCollection(resource);
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.count).toBe(40);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it("accepts a bare array response", async () => {
    const resource = makeResource();
    resource.list.mockResolvedValue([task(1)]);

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toEqual([task(1)]);
    expect(result.current.count).toBe(1);
    expect(result.current.hasMore).toBe(false);
  });

  it("surfaces load failures", async () => {
    const resource = makeResource();
    const boom = new Error("boom");
    resource.list.mockRejectedValue(boom);

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(boom);
    expect(result.current.items).toEqual([]);
  });

  it("passes an abort signal and aborts it on unmount", async () => {
    const resource = makeResource();
    resource.list.mockResolvedValue(page([task(1)]));

    const { result, unmount } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));

    const signal = resource.list.mock.calls[0][1].signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);

    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("aborts the in-flight request when params change", async () => {
    const resource = makeResource();
    const first = deferred();
    resource.list
      .mockImplementationOnce(() => first.promise)
      .mockResolvedValueOnce(page([task(2)]));

    const { result, rerender } = renderCollection(resource, {});
    rerender({ params: { search: "x" } });

    await waitFor(() => expect(resource.list).toHaveBeenCalledTimes(2));
    expect(resource.list.mock.calls[0][1].signal.aborted).toBe(true);

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toEqual([task(2)]);
  });

  it("ignores a superseded response that settles late", async () => {
    const resource = makeResource();
    const slow = deferred();
    const fast = deferred();
    resource.list
      .mockImplementationOnce(() => slow.promise)
      .mockImplementationOnce(() => fast.promise);

    const { result, rerender } = renderCollection(resource, {});
    rerender({ params: { search: "x" } });

    await act(async () => fast.resolve(page([task(2)])));
    await waitFor(() => expect(result.current.items).toEqual([task(2)]));

    await act(async () => slow.resolve(page([task(1)])));
    expect(result.current.items).toEqual([task(2)]); // stale data ignored
  });

  it("treats cancellations as non-errors", async () => {
    const resource = makeResource();
    resource.list.mockRejectedValue({ code: "ERR_CANCELED" });

    const { result } = renderCollection(resource);
    await waitFor(() => expect(resource.list).toHaveBeenCalled());
    expect(result.current.isError).toBe(false);
  });

  it("keeps showing data during a silent refresh", async () => {
    const resource = makeResource();
    const second = deferred();
    resource.list
      .mockResolvedValueOnce(page([task(1)]))
      .mockImplementationOnce(() => second.promise);

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));

    act(() => {
      result.current.refresh(true);
    });
    expect(result.current.status).toBe("success"); // no loading flash
    expect(result.current.isRefreshing).toBe(false);

    await act(async () => second.resolve(page([task(1), task(2)])));
    expect(result.current.items).toHaveLength(2);
  });

  it("flags a non-silent refetch of an existing list as refreshing", async () => {
    const resource = makeResource();
    const second = deferred();
    resource.list
      .mockResolvedValueOnce(page([task(1)]))
      .mockImplementationOnce(() => second.promise);

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));

    act(() => {
      result.current.refresh();
    });
    expect(result.current.isRefreshing).toBe(true);

    await act(async () => second.resolve(page([task(1)])));
    expect(result.current.isRefreshing).toBe(false);
  });

  it("loads the next page and appends", async () => {
    const resource = makeResource();
    const more = deferred();
    resource.list
      .mockResolvedValueOnce(
        page([task(1)], { count: 2, next: "http://x/api/?page=2" }),
      )
      .mockImplementationOnce(() => more.promise);

    const { result } = renderCollection(resource, { search: "q" });
    await waitFor(() => expect(result.current.hasMore).toBe(true));

    act(() => {
      result.current.loadMore();
    });
    expect(result.current.isLoadingMore).toBe(true);
    expect(resource.list).toHaveBeenLastCalledWith(
      { search: "q", page: "2" },
      { signal: undefined },
    );

    await act(async () => more.resolve(page([task(2)], { count: 2 })));
    expect(result.current.items).toEqual([task(1), task(2)]);
    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.hasMore).toBe(false);
  });

  it("loadMore is a no-op without a next page", async () => {
    const resource = makeResource();
    resource.list.mockResolvedValue(page([task(1)]));

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));

    act(() => {
      result.current.loadMore();
    });
    expect(resource.list).toHaveBeenCalledTimes(1);
  });

  it("create hits the resource then reconciles silently", async () => {
    const resource = makeResource();
    resource.list.mockResolvedValue(page([task(1)]));
    resource.create.mockResolvedValue(task(9));

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));

    let created;
    await act(async () => {
      created = await result.current.create({ title: "New" });
    });
    expect(created).toEqual(task(9));
    expect(resource.create).toHaveBeenCalledWith({ title: "New" });
    await waitFor(() => expect(resource.list).toHaveBeenCalledTimes(2));
    expect(result.current.status).toBe("success");
  });

  it("update applies optimistically and rolls back on failure", async () => {
    const resource = makeResource();
    resource.list.mockResolvedValue(page([task(1), task(2)]));
    const saving = deferred();
    resource.update.mockReturnValue(saving.promise);

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));

    let updatePromise;
    act(() => {
      updatePromise = result.current.update(1, { title: "Renamed" });
      updatePromise.catch(() => {}); // observed below
    });
    expect(result.current.items[0].title).toBe("Renamed"); // optimistic

    const boom = new Error("save failed");
    await act(async () => saving.reject(boom));
    await expect(updatePromise).rejects.toBe(boom);
    expect(result.current.items[0].title).toBe("Task 1"); // rolled back
  });

  it("patch persists and reconciles silently", async () => {
    const resource = makeResource();
    resource.list
      .mockResolvedValueOnce(page([task(1)]))
      // The silent refresh returns the server's post-patch truth.
      .mockResolvedValueOnce(page([task(1, { completed: true })]));
    resource.patch.mockResolvedValue(task(1, { completed: true }));

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));

    await act(async () => {
      await result.current.patch(1, { completed: true });
    });
    expect(result.current.items[0].completed).toBe(true);
    expect(resource.patch).toHaveBeenCalledWith(1, { completed: true });
    await waitFor(() => expect(resource.list).toHaveBeenCalledTimes(2));
  });

  it("remove applies optimistically and restores items on failure", async () => {
    const resource = makeResource();
    resource.list.mockResolvedValue(page([task(1), task(2)], { count: 2 }));
    const removing = deferred();
    resource.remove.mockReturnValue(removing.promise);

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));

    let removePromise;
    act(() => {
      removePromise = result.current.remove(1);
      removePromise.catch(() => {});
    });
    expect(result.current.items).toEqual([task(2)]);
    expect(result.current.count).toBe(1);

    const boom = new Error("delete failed");
    await act(async () => removing.reject(boom));
    await expect(removePromise).rejects.toBe(boom);
    expect(result.current.items).toEqual([task(1), task(2)]); // restored
    // Known quirk pinned here: the eager count decrement is not rolled back.
    expect(result.current.count).toBe(1);
  });

  it("reorder persists the new order", async () => {
    const resource = makeResource();
    resource.list.mockResolvedValue(page([task(1), task(2)]));
    resource.reorder.mockResolvedValue({ updated: 2 });

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));

    await act(async () => {
      await result.current.reorder([task(2), task(1)]);
    });
    expect(result.current.items).toEqual([task(2), task(1)]);
    expect(resource.reorder).toHaveBeenCalledWith([2, 1]);
  });

  it("reorder failure reloads the authoritative order and rethrows", async () => {
    const resource = makeResource();
    resource.list.mockResolvedValue(page([task(1), task(2)]));
    const boom = new Error("reorder failed");
    resource.reorder.mockRejectedValue(boom);

    const { result } = renderCollection(resource);
    await waitFor(() => expect(result.current.status).toBe("success"));

    let reorderPromise;
    act(() => {
      reorderPromise = result.current.reorder([task(2), task(1)]);
      reorderPromise.catch(() => {});
    });
    await expect(reorderPromise).rejects.toBe(boom);
    await waitFor(() => expect(resource.list).toHaveBeenCalledTimes(2));
  });
});
