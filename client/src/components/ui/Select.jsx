import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "../../lib/cn";

const MENU_MAX_H = 288;

/**
 * Accessible, animated single-select dropdown (replaces the native <select>).
 *
 * Props:
 *  - value, onValueChange
 *  - options: [{ value, label, dot?, icon? }]  (dot = Tailwind bg-* class)
 *  - placeholder, ariaLabel, align ("left" | "right"), className
 *
 * The menu renders through a portal with fixed positioning so it never gets
 * clipped by scroll containers (e.g. inside a modal) and flips up when there
 * isn't room below.
 */
export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  ariaLabel,
  align = "left",
  className,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuStyle, setMenuStyle] = useState(null);

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value);

  const computePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < MENU_MAX_H + 24 && r.top > spaceBelow;
    const maxHeight =
      Math.min(MENU_MAX_H, (openUp ? r.top : spaceBelow) - 16) || MENU_MAX_H;

    setMenuStyle({
      position: "fixed",
      top: openUp ? undefined : r.bottom + 8,
      bottom: openUp ? window.innerHeight - r.top + 8 : undefined,
      left: align === "right" ? undefined : r.left,
      right: align === "right" ? window.innerWidth - r.right : undefined,
      minWidth: r.width,
      maxHeight,
      transformOrigin: openUp ? "bottom" : "top",
    });
  }, [align]);

  useLayoutEffect(() => {
    if (open) computePosition();
  }, [open, computePosition]);

  useEffect(() => {
    if (!open) return undefined;
    const onReposition = () => computePosition();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, computePosition]);

  // Close on outside click via a document listener (not a full-screen
  // backdrop) so clicking another trigger closes this one AND opens that one
  // in a single click.
  useEffect(() => {
    if (!open) return undefined;
    const onDocPointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocPointerDown);
    return () => document.removeEventListener("mousedown", onDocPointerDown);
  }, [open]);

  // Sync the active (highlighted) option with the current selection on open.
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [open, options, value]);

  // Keep the highlighted option scrolled into view during keyboard nav.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    menuRef.current?.children[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [open, activeIndex]);

  const choose = (option) => {
    onValueChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (event) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (options[activeIndex]) choose(options[activeIndex]);
        break;
      default:
        break;
    }
  };

  return (
    // Height comes from the wrapper (default h-11) so callers can override it
    // via `className` (e.g. h-10 to match a toolbar's other controls).
    <div className={cn("relative h-11", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-full w-full items-center justify-between gap-2 rounded-xl bg-surface-2 pr-3 pl-3.5 text-sm",
          "ring-1 transition-colors duration-200",
          open
            ? "text-fg ring-2 ring-accent/55"
            : "text-fg ring-line hover:ring-line-strong",
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selected?.dot && (
            <span
              className={cn("size-2 shrink-0 rounded-full", selected.dot)}
            />
          )}
          {selected?.icon && <selected.icon className="size-3.5 shrink-0" />}
          <span className={cn("truncate", !selected && "text-faint")}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && menuStyle && (
            <motion.ul
              ref={menuRef}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel}
              style={menuStyle}
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 460, damping: 32 }}
              className="z-[61] overflow-y-auto rounded-xl border border-line bg-elevated p-1 shadow-pop"
            >
              {options.map((option, i) => {
                const isSelected = option.value === value;
                const isActive = i === activeIndex;
                return (
                  <li
                    key={String(option.value)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => choose(option)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        isActive ? "bg-surface-2 text-fg" : "text-muted",
                        isSelected && "text-fg",
                      )}
                    >
                      {option.dot && (
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            option.dot,
                          )}
                        />
                      )}
                      {option.icon && (
                        <option.icon className="size-3.5 shrink-0" />
                      )}
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected && (
                        <Check className="size-4 shrink-0 text-accent" />
                      )}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
