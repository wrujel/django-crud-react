import { Link } from "react-router-dom";
import { ListChecks } from "lucide-react";

export function Navbar() {
  return (
    <header className="glass sticky top-0 z-30 border-b border-line/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
        <Link
          to="/tasks"
          aria-label="Task Manager"
          className="flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent shadow-sm">
            <ListChecks className="size-5 text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-fg">
            Task Manager
          </span>
        </Link>
      </div>
    </header>
  );
}
