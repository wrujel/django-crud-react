import { motion } from "motion/react";

import { cn } from "../../lib/cn";

/**
 * Segmented toggle with a sliding active indicator (shared-layout animation).
 * Pass a unique `layoutId` when rendering more than one on a page.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  layoutId = "segment-indicator",
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl bg-surface-2 p-1 ring-1 ring-line",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200",
              active ? "text-white" : "text-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-accent shadow-sm"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
