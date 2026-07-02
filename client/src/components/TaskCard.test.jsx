import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskCard } from "./TaskCard";

const TASK = {
  id: 1,
  title: "Write the report",
  description: "Q2 numbers",
  completed: false,
  priority: 3,
  due_date: null,
};

function renderCard(task = TASK) {
  const handlers = { onToggle: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };
  render(<TaskCard task={task} {...handlers} />);
  return handlers;
}

describe("TaskCard", () => {
  it("renders title, description and the priority edge", () => {
    const { container } = render(
      <TaskCard
        task={TASK}
        onToggle={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Write the report" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Q2 numbers")).toBeInTheDocument();
    expect(container.querySelector(".bg-prio-high")).not.toBeNull();
    expect(screen.getByText("High priority")).toHaveClass("sr-only");
  });

  it("shows the due date badge only when set", () => {
    renderCard({ ...TASK, due_date: "2099-01-01" });
    expect(screen.getByText(/Jan|1/)).toBeInTheDocument();
  });

  it("applies completed styling", () => {
    renderCard({ ...TASK, completed: true });
    expect(
      screen.getByRole("heading", { name: TASK.title }).className,
    ).toContain("line-through");
    expect(
      screen.getByRole("checkbox", { name: "Mark as active" }),
    ).toBeInTheDocument();
  });

  it("opens the editor when the card is clicked", async () => {
    const handlers = renderCard();
    await userEvent.click(screen.getByRole("heading", { name: TASK.title }));
    expect(handlers.onEdit).toHaveBeenCalledWith(TASK);
  });

  it("toggles without opening the editor", async () => {
    const handlers = renderCard();
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Mark as complete" }),
    );
    expect(handlers.onToggle).toHaveBeenCalledWith(TASK);
    expect(handlers.onEdit).not.toHaveBeenCalled();
  });

  it("deletes without opening the editor", async () => {
    const handlers = renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Delete task" }));
    expect(handlers.onDelete).toHaveBeenCalledWith(TASK);
    expect(handlers.onEdit).not.toHaveBeenCalled();
  });

  it("falls back to medium styling for unknown priorities", () => {
    const { container } = render(
      <TaskCard
        task={{ ...TASK, priority: 42 }}
        onToggle={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(container.querySelector(".bg-prio-medium")).not.toBeNull();
  });
});
