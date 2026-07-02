import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskGrid } from "./TaskGrid";

const TASKS = [
  { id: 1, title: "First", description: "", completed: false, priority: 2 },
  { id: 2, title: "Second", description: "", completed: true, priority: 1 },
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
  emptyState: <p>Empty grid</p>,
};

describe("TaskGrid", () => {
  it("shows a skeleton grid on first load", () => {
    const { container } = render(<TaskGrid {...BASE} tasks={[]} isLoading />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(container.querySelectorAll(".skeleton").length).toBeGreaterThan(5);
  });

  it("renders the provided empty state", () => {
    render(<TaskGrid {...BASE} tasks={[]} />);
    expect(screen.getByText("Empty grid")).toBeInTheDocument();
  });

  it("renders a card per task", () => {
    render(<TaskGrid {...BASE} />);
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();
  });

  it("loads more on demand", async () => {
    render(<TaskGrid {...BASE} hasMore />);
    await userEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(BASE.onLoadMore).toHaveBeenCalled();
  });
});
