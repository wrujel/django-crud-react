import { Plus } from "lucide-react";

import {
  SORT_OPTIONS,
  STATUS_FILTERS,
  PRIORITY_FILTER_OPTIONS,
} from "../constants/tasks";
import { cn } from "../lib/cn";
import { SearchInput } from "./SearchInput";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { SegmentedControl } from "./ui/SegmentedControl";
import { ViewToggle } from "./ui/ViewToggle";

export function TaskToolbar({
  search,
  onSearch,
  status,
  onStatus,
  priority,
  onPriority,
  sort,
  onSort,
  view,
  onView,
  onAddTask,
  refreshing,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-center",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <SearchInput
          value={search}
          onChange={onSearch}
          refreshing={refreshing}
          className="flex-1 lg:w-72 lg:flex-none"
        />
        <Button onClick={onAddTask} icon={Plus} className="h-10 shrink-0">
          New
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
        <SegmentedControl
          options={STATUS_FILTERS}
          value={status}
          onChange={onStatus}
          layoutId="status-filter"
          className="h-10"
        />

        <Select
          value={priority}
          onValueChange={onPriority}
          options={PRIORITY_FILTER_OPTIONS}
          ariaLabel="Filter by priority"
          align="right"
          className="h-10 w-[9.5rem]"
        />

        <Select
          value={sort}
          onValueChange={onSort}
          options={SORT_OPTIONS}
          ariaLabel="Sort tasks"
          align="right"
          className="h-10 w-[10.5rem]"
        />

        <ViewToggle value={view} onChange={onView} />
      </div>
    </div>
  );
}
