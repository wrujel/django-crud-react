import { useCallback, useEffect, useState } from "react";

/**
 * Fetch a lightweight stats/summary object and expose a manual `reload`
 * (call it after mutations that change the totals). Failures are swallowed so
 * a flaky summary endpoint never blocks the main UI.
 */
export function useStats(fetcher) {
  const [stats, setStats] = useState(null);

  const reload = useCallback(async () => {
    try {
      setStats(await fetcher());
    } catch {
      /* keep the previous stats; the summary is non-critical */
    }
  }, [fetcher]);

  useEffect(() => {
    reload();
  }, [reload]);

  return [stats, reload];
}
