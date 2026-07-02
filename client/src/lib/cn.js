import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, resolving Tailwind conflicts so the last
 * utility wins (e.g. `cn("p-2", isLarge && "p-4")`).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
