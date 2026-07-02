import { Reorder } from "motion/react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DraggableTaskRow } from "./DraggableTaskRow";
import { TaskRow } from "./TaskRow";
import { TaskRowInner } from "./TaskRowInner";

const TASK = {
  id: 1,
  title: "Row task",
  description: "Row description",
  completed: false,
  priority: 2,
  due_date: "2099-01-01",
};

describe("TaskRow", () => {
  function renderRow(task = TASK) {
    const handlers = { onToggle: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };
    render(
      <ul>
        <TaskRow task={task} {...handlers} />
      </ul>,
    );
    return handlers;
  }

  it("renders content with priority edge and due date", () => {
    renderRow();
    expect(
      screen.getByRole("heading", { name: "Row task" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Row description")).toBeInTheDocument();
    expect(screen.getByText("Medium priority")).toHaveClass("sr-only");
  });

  it("clicking the row edits; checkbox and delete stay isolated", async () => {
    const handlers = renderRow();

    await userEvent.click(screen.getByRole("heading", { name: "Row task" }));
    expect(handlers.onEdit).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("checkbox"));
    expect(handlers.onToggle).toHaveBeenCalledWith(TASK);
    expect(handlers.onEdit).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "Delete task" }));
    expect(handlers.onDelete).toHaveBeenCalledWith(TASK);
    expect(handlers.onEdit).toHaveBeenCalledTimes(1);
  });

  it("mutes completed rows", () => {
    renderRow({ ...TASK, completed: true });
    expect(
      screen.getByRole("heading", { name: "Row task" }).className,
    ).toContain("line-through");
  });

  it("falls back to medium styling for unknown priorities", () => {
    renderRow({ ...TASK, priority: 42 });
    expect(screen.getByText("Medium priority")).toHaveClass("sr-only");
  });
});

describe("TaskRowInner", () => {
  it("renders leading and trailing slots", () => {
    render(
      <ul>
        <li className="relative">
          <TaskRowInner
            task={TASK}
            onToggle={() => {}}
            onDelete={() => {}}
            leading={<span data-testid="lead" />}
            trailing={<span data-testid="trail" />}
          />
        </li>
      </ul>,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(screen.getByTestId("trail")).toBeInTheDocument();
  });

  it("omits description and due date when absent", () => {
    render(
      <ul>
        <li className="relative">
          <TaskRowInner
            task={{ ...TASK, description: "", due_date: null }}
            onToggle={() => {}}
            onDelete={() => {}}
          />
        </li>
      </ul>,
    );
    expect(screen.queryByText("Row description")).toBeNull();
  });
});

describe("DraggableTaskRow", () => {
  function renderDraggable(props = {}) {
    const handlers = {
      onToggle: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onMoveUp: vi.fn(),
      onMoveDown: vi.fn(),
      onCommit: vi.fn(),
    };
    render(
      <Reorder.Group axis="y" values={[TASK]} onReorder={() => {}}>
        <DraggableTaskRow
          task={TASK}
          isFirst={props.isFirst ?? false}
          isLast={props.isLast ?? false}
          {...handlers}
        />
      </Reorder.Group>,
    );
    return handlers;
  }

  it("renders a drag handle that does not open the editor", () => {
    const handlers = renderDraggable();
    const grip = screen.getByRole("button", { name: "Drag to reorder" });

    fireEvent.pointerDown(grip);
    fireEvent.click(grip);
    expect(handlers.onEdit).not.toHaveBeenCalled();
  });

  it("disables the arrows at the list edges", () => {
    renderDraggable({ isFirst: true, isLast: true });
    expect(screen.getByRole("button", { name: "Move up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move down" })).toBeDisabled();
  });

  it("fires the arrow callbacks without opening the editor", async () => {
    const handlers = renderDraggable();

    await userEvent.click(screen.getByRole("button", { name: "Move up" }));
    expect(handlers.onMoveUp).toHaveBeenCalledWith(TASK);

    await userEvent.click(screen.getByRole("button", { name: "Move down" }));
    expect(handlers.onMoveDown).toHaveBeenCalledWith(TASK);
    expect(handlers.onEdit).not.toHaveBeenCalled();
  });

  it("opens the editor when the row body is clicked", async () => {
    const handlers = renderDraggable();
    await userEvent.click(screen.getByRole("heading", { name: "Row task" }));
    expect(handlers.onEdit).toHaveBeenCalledWith(TASK);
  });

  it("mutes completed draggable rows", () => {
    const done = { ...TASK, completed: true };
    render(
      <Reorder.Group axis="y" values={[done]} onReorder={() => {}}>
        <DraggableTaskRow
          task={done}
          isFirst
          isLast
          onToggle={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onMoveUp={vi.fn()}
          onMoveDown={vi.fn()}
          onCommit={vi.fn()}
        />
      </Reorder.Group>,
    );
    expect(screen.getByRole("listitem").className).toContain("opacity-65");
  });
});
