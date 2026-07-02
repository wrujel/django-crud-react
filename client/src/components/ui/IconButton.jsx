import { forwardRef } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";

const TONES = {
  default: "text-muted hover:text-fg hover:bg-surface-2",
  danger: "text-muted hover:text-danger hover:bg-danger/10",
  accent: "text-muted hover:text-accent hover:bg-accent/10",
};

export const IconButton = forwardRef(function IconButton(
  { className, children, label, tone = "default", ...props },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});
