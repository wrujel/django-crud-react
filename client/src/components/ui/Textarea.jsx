import { forwardRef } from "react";

import { cn } from "../../lib/cn";

export const Textarea = forwardRef(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full resize-none rounded-xl bg-surface-2 px-3.5 py-3 text-sm text-fg placeholder:text-faint",
        "ring-1 ring-line transition-shadow duration-200",
        "focus:ring-2 focus:ring-accent/60 focus:outline-none",
        invalid && "ring-danger/60 focus:ring-danger/70",
        className,
      )}
      {...props}
    />
  );
});
