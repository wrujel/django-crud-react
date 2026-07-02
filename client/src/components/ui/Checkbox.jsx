import { motion } from "motion/react";

import { cn } from "../../lib/cn";

/** Animated check with a drawn-on tick. Acts as an accessible checkbox. */
export function Checkbox({ checked, onChange, label, className }) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      whileTap={{ scale: 0.85 }}
      className={cn(
        "relative flex size-6 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
        "ring-1 focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none",
        checked
          ? "bg-accent ring-transparent"
          : "bg-surface-2 ring-line hover:ring-line-strong",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-3 text-white">
        <motion.path
          d="M5 12.5l4 4L19 7"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            pathLength: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </svg>
    </motion.button>
  );
}
