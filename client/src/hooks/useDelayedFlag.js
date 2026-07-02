import { useEffect, useState } from "react";

/**
 * Returns true only after `active` has stayed true for `delay` ms, and resets
 * to false immediately when `active` clears. Use it to suppress loading
 * indicators that would otherwise flash on fast (sub-`delay`) responses.
 */
export function useDelayedFlag(active, delay = 400) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) {
      setShown(false);
      return undefined;
    }
    const id = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(id);
  }, [active, delay]);

  return shown;
}
