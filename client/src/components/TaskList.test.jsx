import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskList } from "./TaskList";

const TASKS = [
  { id: 1, title: "First", description: "", completed: false, priority: 2 },
  { id: 2, title: "Second", description: "", completed: false, priority: 1 },
];

const BASE = {
  tasks: TASKS,
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  onLoadMore: vi.fn(),
  onToggle: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  emptyState: <p>Empty!</p>,
  reorderable: false,
  onReorder: vi.fn(),
  onReorderCommit: vi.fn(),
  onMoveUp: vi.fn(),
  onMoveDown: vi.fn(),
};

describe("TaskList", () => {
  it("shows skeleton rows on first load", () => {
    const { container } = render(<TaskList {...BASE} tasks={[]} isLoading />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(container.querySelectorAll(".skeleton").length).toBeGreaterThan(5);
  });

  it("renders the provided empty state", () => {
    render(<TaskList {...BASE} tasks={[]} />);
    expect(screen.getByText("Empty!")).toBeInTheDocument();
  });

  it("renders plain rows without reorder controls", () => {
    render(<TaskList {...BASE} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Drag to reorder" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Move up" })).toBeNull();
  });

  it("renders draggable rows with grips and arrows when reorderable", () => {
    render(<TaskList {...BASE} reorderable />);
    expect(
      screen.getAllByRole("button", { name: "Drag to reorder" }),
    ).toHaveLength(2);
    // First row's up arrow and last row's down arrow are disabled.
    const ups = screen.getAllByRole("button", { name: "Move up" });
    const downs = screen.getAllByRole("button", { name: "Move down" });
    expect(ups[0]).toBeDisabled();
    expect(downs[1]).toBeDisabled();
    expect(ups[1]).toBeEnabled();
  });

  it("forwards arrow presses with the row's task", async () => {
    render(<TaskList {...BASE} reorderable />);
    await userEvent.click(
      screen.getAllByRole("button", { name: "Move down" })[0],
    );
    expect(BASE.onMoveDown).toHaveBeenCalledWith(TASKS[0]);
  });

  it("shows Load more only when there are more pages", async () => {
    const { rerender } = render(<TaskList {...BASE} />);
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();

    rerender(<TaskList {...BASE} hasMore />);
    await userEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(BASE.onLoadMore).toHaveBeenCalled();
  });
});
