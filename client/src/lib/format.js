const DAY_MS = 86_400_000;

/** Today's date as a `YYYY-MM-DD` string in the user's local timezone. */
export function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/**
 * Turn a `YYYY-MM-DD` due date into a friendly, relative descriptor.
 * Returns null when there is no date.
 */
export function formatDueDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / DAY_MS);

  const abs = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  let label = abs;
  if (diffDays === 0) label = "Today";
  else if (diffDays === 1) label = "Tomorrow";
  else if (diffDays === -1) label = "Yesterday";
  else if (diffDays < 0) label = `${Math.abs(diffDays)}d overdue`;
  else if (diffDays <= 7) label = `In ${diffDays}d`;

  return {
    label,
    abs,
    iso: value,
    isOverdue: diffDays < 0,
    isSoon: diffDays >= 0 && diffDays <= 2,
  };
}
