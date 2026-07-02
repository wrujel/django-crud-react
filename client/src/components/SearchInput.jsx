import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "../lib/cn";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useDelayedFlag } from "../hooks/useDelayedFlag";
import { Input } from "./ui/Input";
import { Spinner } from "./ui/Spinner";

/**
 * Self-contained debounced search box. The raw input value is kept in local
 * state so typing stays instant and doesn't re-render the page (or the
 * layout-animated task cards) on every keystroke — only the debounced value is
 * pushed up to the parent.
 */
export function SearchInput({
  value,
  onChange,
  refreshing,
  delay = 350,
  className,
}) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text, delay);
  const lastEmitted = useRef(value);
  const showSpinner = useDelayedFlag(refreshing);

  // Push debounced changes up to the parent.
  useEffect(() => {
    if (debounced !== lastEmitted.current) {
      lastEmitted.current = debounced;
      onChange(debounced);
    }
  }, [debounced, onChange]);

  // Accept external resets (e.g. "Clear filters") without clobbering typing.
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setText(value);
    }
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <Input
        icon={Search}
        placeholder="Search tasks…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Search tasks"
        className="h-10"
      />
      {showSpinner && (
        <Spinner className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint" />
      )}
    </div>
  );
}
