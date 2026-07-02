import { cn } from "../../lib/cn";

export function Skeleton({ className }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}
