import { useCallback, useEffect, useRef, useState } from "react";

import { isCanceled } from "../lib/http";
import { unwrapPage } from "../lib/resource";

/**
 * Generic, stateful collection hook for any resource built with
 * {@link createResource}. Handles fetching, server-side params
 * (filter/search/ordering), pagination ("load more"), and optimistic
 * create/update/patch/remove with rollback.
 *
 * The list is never blanked while refetching — callers render skeletons only
 * on the very first load (`isLoading && items.length === 0`), and a subtle
 * indicator (`isRefreshing`) otherwise.
 *
 * @param {object} resource - object returned by createResource()
 * @param {object} params   - query params (re-fetches when they change)
 */
export function useCollection(resource, params = {}) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState(null);

  // Re-run the effect only when params *content* changes, not identity.
  const [appending, setAppending] = useState(false);

  const paramsKey = JSON.stringify(params);
  const requestId = useRef(0);
  const abortRef = useRef(null);

  const fetchPage = useCallback(
    async ({ append = false, silent = false, page } = {}) => {
      const id = ++requestId.current;
      // A fresh (non-append) load supersedes any in-flight request: abort it so
      // a slow or hung request can't delay this one or settle on top of it.
      if (!append) {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
      }
      const signal = append ? undefined : abortRef.current.signal;

      if (append) setAppending(true);
      else if (!silent) setStatus("loading");
      try {
        const data = await resource.list(
          { ...params, ...(page ? { page } : {}) },
          { signal },
        );
        if (id !== requestId.current) return; // a newer request superseded us
        const result = unwrapPage(data);
        setItems((prev) =>
          append ? [...prev, ...result.items] : result.items,
        );
        setCount(result.count);
        setNext(result.next);
        setStatus("success");
        setError(null);
      } catch (err) {
        if (isCanceled(err)) return; // superseded/aborted — not a real failure
        if (id !== requestId.current) return;
        setError(err);
        setStatus("error");
      } finally {
        if (append && id === requestId.current) setAppending(false);
      }
    },
    // params is captured via paramsKey to avoid identity churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resource, paramsKey],
  );

  useEffect(() => {
    fetchPage();
    return () => abortRef.current?.abort();
  }, [fetchPage]);

  const refresh = useCallback(
    (silent = false) => fetchPage({ silent }),
    [fetchPage],
  );

  const loadMore = useCallback(() => {
    if (!next) return;
    const page = new URL(next).searchParams.get("page");
    fetchPage({ append: true, page });
  }, [next, fetchPage]);

  /** Optimistically mutate the in-memory list, rolling back on failure. */
  const optimistic = useCallback(
    async (mutator, request) => {
      const snapshot = items;
      setItems(mutator);
      try {
        return await request();
      } catch (err) {
        setItems(snapshot); // rollback
        throw err;
      }
    },
    [items],
  );

  const create = useCallback(
    async (payload) => {
      const created = await resource.create(payload);
      refresh(true); // reconcile ordering/pagination/filters silently
      return created;
    },
    [resource, refresh],
  );

  const update = useCallback(
    (id, payload) =>
      optimistic(
        (list) => list.map((it) => (it.id === id ? { ...it, ...payload } : it)),
        async () => {
          const saved = await resource.update(id, payload);
          refresh(true);
          return saved;
        },
      ),
    [optimistic, resource, refresh],
  );

  const patch = useCallback(
    (id, payload) =>
      optimistic(
        (list) => list.map((it) => (it.id === id ? { ...it, ...payload } : it)),
        async () => {
          const saved = await resource.patch(id, payload);
          refresh(true);
          return saved;
        },
      ),
    [optimistic, resource, refresh],
  );

  const remove = useCallback(
    (id) => {
      setCount((c) => Math.max(0, c - 1));
      return optimistic(
        (list) => list.filter((it) => it.id !== id),
        () => resource.remove(id),
      );
    },
    [optimistic, resource],
  );

  // Persist a manual order. `setItems` is exposed so callers can update the
  // order live during a drag (no request), then call `reorder` on drop.
  const reorder = useCallback(
    async (orderedItems) => {
      setItems(orderedItems);
      try {
        await resource.reorder(orderedItems.map((it) => it.id));
      } catch (err) {
        refresh(true); // reload the authoritative order on failure
        throw err;
      }
    },
    [resource, refresh],
  );

  return {
    items,
    count,
    status,
    error,
    isLoading: status === "loading",
    isError: status === "error",
    isRefreshing: status === "loading" && items.length > 0,
    isLoadingMore: appending,
    hasMore: Boolean(next),
    refresh,
    loadMore,
    create,
    update,
    patch,
    remove,
    reorder,
    setItems,
  };
}
