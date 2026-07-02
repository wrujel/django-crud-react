import { forwardRef } from "react";

import { cn } from "../../lib/cn";

export const Input = forwardRef(function Input(
  { className, invalid, icon: Icon, ...props },
  ref,
) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
      )}
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl bg-surface-2 px-3.5 text-sm text-fg placeholder:text-faint",
          "ring-1 ring-line transition-shadow duration-200",
          "focus:ring-2 focus:ring-accent/60 focus:outline-none",
          Icon && "pl-9",
          invalid && "ring-danger/60 focus:ring-danger/70",
          className,
        )}
        {...props}
      />
    </div>
  );
});
