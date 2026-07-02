import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "../../lib/cn";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const POPOVER_W = 296;
const POPOVER_H = 348;

const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

function parseISO(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 6×7 grid of days for the given month, padded with adjacent-month days. */
function buildGrid(viewMonth) {
  const first = startOfMonth(viewMonth);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/**
 * Animated calendar date picker. Controlled via a `YYYY-MM-DD` string value
 * ("" / null = unset). Renders the calendar in a portal with fixed positioning
 * so it never gets clipped inside a modal, and flips up when low on space.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Set due date",
  ariaLabel = "Due date",
  className,
}) {
  const selected = useMemo(() => parseISO(value), [value]);
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selected ?? today),
  );
  const [dir, setDir] = useState(0); // slide direction for month transitions
  const [style, setStyle] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const compute = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < POPOVER_H + 24 && r.top > spaceBelow;
    setStyle({
      position: "fixed",
      top: openUp ? undefined : r.bottom + 8,
      bottom: openUp ? window.innerHeight - r.top + 8 : undefined,
      left: Math.min(Math.max(8, r.left), window.innerWidth - POPOVER_W - 8),
      width: POPOVER_W,
      transformOrigin: openUp ? "bottom" : "top",
    });
  }, []);

  useLayoutEffect(() => {
    if (open) compute();
  }, [open, compute]);

  useEffect(() => {
    if (!open) return undefined;
    // Jump to the selected month and clear any leftover slide direction.
    setViewMonth(startOfMonth(selected ?? today));
    setDir(0);
    const onMove = () => compute();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onDocPointerDown = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        panelRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocPointerDown);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocPointerDown);
    };
  }, [open, compute, selected, today]);

  const grid = useMemo(() => buildGrid(viewMonth), [viewMonth]);
  const monthLabel = viewMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (delta) => {
    setDir(delta);
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  const pick = (d) => {
    onChange(toISO(d));
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    setOpen(false);
  };

  return (
    <div className={cn("relative h-11", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-full w-full items-center gap-2 rounded-xl bg-surface-2 pr-9 pl-3.5 text-sm",
          "ring-1 transition-colors duration-200",
          open ? "ring-2 ring-accent/55" : "ring-line hover:ring-line-strong",
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-faint" />
        <span
          className={cn("flex-1 truncate text-left", !selected && "text-faint")}
        >
          {selected
            ? selected.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : placeholder}
        </span>
      </button>

      {selected && (
        <button
          type="button"
          aria-label="Clear date"
          onClick={clear}
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-faint transition-colors hover:bg-white/10 hover:text-fg"
        >
          <X className="size-3.5" />
        </button>
      )}

      {createPortal(
        <AnimatePresence>
          {open && style && (
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-label={ariaLabel}
              style={style}
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 460, damping: 32 }}
              className="z-[61] overflow-hidden rounded-2xl border border-line bg-elevated p-3 shadow-pop"
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => changeMonth(-1)}
                  className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div className="relative h-5 flex-1 overflow-hidden">
                  <motion.div
                    key={monthLabel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 text-center text-sm font-semibold text-fg"
                  >
                    {monthLabel}
                  </motion.div>
                </div>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => changeMonth(1)}
                  className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {WEEKDAYS.map((w) => (
                  <div
                    key={w}
                    className="grid h-7 place-items-center text-xs font-medium text-faint"
                  >
                    {w}
                  </div>
                ))}
              </div>

              <div className="relative overflow-hidden">
                <motion.div
                  key={monthLabel}
                  initial={{ opacity: 0, x: dir * 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-7 gap-0.5"
                >
                  {grid.map((d) => {
                    const inMonth = d.getMonth() === viewMonth.getMonth();
                    const isSel = sameDay(d, selected);
                    const isToday = sameDay(d, today);
                    return (
                      <motion.button
                        key={toISO(d)}
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={() => pick(d)}
                        className={cn(
                          "relative grid h-9 place-items-center rounded-lg text-sm transition-colors",
                          isSel
                            ? "bg-accent font-semibold text-white"
                            : inMonth
                              ? "text-fg hover:bg-surface-2"
                              : "text-faint/50 hover:bg-surface-2",
                        )}
                      >
                        {d.getDate()}
                        {isToday && !isSel && (
                          <span className="absolute bottom-1 size-1 rounded-full bg-accent" />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-line-soft pt-2">
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => pick(today)}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                >
                  Today
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
