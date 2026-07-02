/** Priority choices, mirroring the backend `Task.Priority` IntegerChoices. */
export const PRIORITIES = [
  { value: 3, label: "High" },
  { value: 2, label: "Medium" },
  { value: 1, label: "Low" },
];

/**
 * Full Tailwind class strings per priority. Kept as literals (not built from
 * template strings) so Tailwind's content scanner can see and keep them.
 */
export const PRIORITY_STYLES = {
  3: {
    label: "High",
    text: "text-prio-high",
    chip: "bg-prio-high/10 text-prio-high",
    dot: "bg-prio-high ring-2 ring-prio-high/20",
    bar: "bg-prio-high",
  },
  2: {
    label: "Medium",
    text: "text-prio-medium",
    chip: "bg-prio-medium/10 text-prio-medium",
    dot: "bg-prio-medium ring-2 ring-prio-medium/20",
    bar: "bg-prio-medium",
  },
  1: {
    label: "Low",
    text: "text-prio-low",
    chip: "bg-prio-low/10 text-prio-low",
    dot: "bg-prio-low ring-2 ring-prio-low/20",
    bar: "bg-prio-low",
  },
};

/** Options for the form priority dropdown (numeric values + color dots). */
export const PRIORITY_OPTIONS = PRIORITIES.map((p) => ({
  value: p.value,
  label: p.label,
  dot: PRIORITY_STYLES[p.value].dot,
}));

/** Options for the toolbar priority filter (string values; "" = all). */
export const PRIORITY_FILTER_OPTIONS = [
  { value: "", label: "All priorities" },
  ...PRIORITIES.map((p) => ({
    value: String(p.value),
    label: `${p.label} priority`,
    dot: PRIORITY_STYLES[p.value].dot,
  })),
];

/** Status segmented-control options -> query params for the API. */
export const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Done" },
];

/** Sort options -> DRF `ordering` query values ("" = backend smart default). */
export const SORT_OPTIONS = [
  { value: "", label: "Smart order" },
  { value: "position", label: "Manual" },
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "due_date", label: "Due date" },
  { value: "-priority", label: "Priority" },
  { value: "title", label: "Title (A–Z)" },
];
