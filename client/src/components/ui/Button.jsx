import { forwardRef } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";
import { Spinner } from "./Spinner";

const VARIANTS = {
  primary:
    "bg-accent text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-accent-strong",
  secondary:
    "bg-surface-2 text-fg ring-1 ring-line hover:bg-elevated hover:ring-line-strong",
  ghost: "text-muted hover:text-fg hover:bg-surface-2",
  danger: "bg-danger/10 text-danger ring-1 ring-danger/25 hover:bg-danger/20",
  subtle: "bg-white/5 text-fg ring-1 ring-line hover:bg-white/10",
};

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-base gap-2 rounded-xl",
};

export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    className,
    children,
    loading = false,
    disabled,
    icon: Icon,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center font-medium whitespace-nowrap",
        "transition-[background-color,box-shadow,color,filter,opacity] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner className="size-4" />
      ) : Icon ? (
        <Icon className="size-4" />
      ) : null}
      {children}
    </motion.button>
  );
});
