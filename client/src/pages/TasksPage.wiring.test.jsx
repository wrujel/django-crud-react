import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { tasksApi } from "../api/tasks.api";
import TasksPage from "./TasksPage";

// TasksPage hands the collection a set of callbacks that the real list can
// only fire from a pointer drag (motion's Reorder) or from arrow buttons it
// disables at the ends of the list — neither of which jsdom can produce.
// Standing in for the list lets those handlers be driven directly; the real
// integration is covered in TasksPage.test.jsx.
vi.mock("../components/TaskList", () => ({
  TaskList: ({ tasks, onReorder, onReorderCommit, onMoveUp }) => (
    <div>
      <ol data-testid="rows">
        {tasks.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ol>
      <button type="button" onClick={() => onReorder([...tasks].reverse())}>
        drag-reorder
      </button>
      <button type="button" onClick={onReorderCommit}>
        drag-drop
      </button>
      <button type="button" onClick={() => onMoveUp(tasks[0])}>
        move-first-up
      </button>
    </div>
  ),
}));

// The real dialog unmounts its buttons when closed, and motion keeps the
// exiting subtree's stale props alive — so a confirm can never arrive with a
// cleared target. This stub keeps the button live to exercise that guard.
vi.mock("../components/ConfirmDialog", () => ({
  ConfirmDialog: ({ open, onConfirm }) => (
    <button type="button" data-open={String(Boolean(open))} onClick={onConfirm}>
      always-confirm
    </button>
  ),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../api/tasks.api", () => ({
  tasksApi: {
    path: "/tasks/api/v1/tasks/",
    list: vi.fn(),
    retrieve: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    patch: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
    stats: vi.fn(),
  },
}));

const TASKS = [
  { id: 1, title: "Alpha task", completed: false, priority: 3, position: 0 },
  { id: 2, title: "Beta task", completed: false, priority: 2, position: 1 },
];

const STATS = {
  total: 2,
  active: 2,
  completed: 0,
  overdue: 0,
  completion_rate: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("taskView", JSON.stringify("list"));
  tasksApi.list.mockResolvedValue({
    results: TASKS,
    count: TASKS.length,
    next: null,
  });
  tasksApi.stats.mockResolvedValue(STATS);
  tasksApi.remove.mockResolvedValue(1);
  tasksApi.reorder.mockResolvedValue({ updated: 2 });
});

async function renderPage() {
  render(<TasksPage />, { wrapper: MemoryRouter });
  await screen.findByText("Alpha task");
}

const rowTitles = () =>
  Array.from(screen.getByTestId("rows").children).map((li) => li.textContent);

describe("TasksPage collection wiring", () => {
  it("applies a drag reorder locally without a request", async () => {
    await renderPage();

    await userEvent.click(screen.getByRole("button", { name: "drag-reorder" }));

    expect(rowTitles()).toEqual(["Beta task", "Alpha task"]);
    expect(tasksApi.reorder).not.toHaveBeenCalled();
  });

  it("persists the dragged order once the drag drops", async () => {
    await renderPage();

    await userEvent.click(screen.getByRole("button", { name: "drag-reorder" }));
    await userEvent.click(screen.getByRole("button", { name: "drag-drop" }));

    await waitFor(() => expect(tasksApi.reorder).toHaveBeenCalledWith([2, 1]));
    expect(localStorage.getItem("taskSort")).toBe(JSON.stringify("position"));
  });

  it("ignores a move that would fall off the end of the list", async () => {
    await renderPage();

    // Moving the first row up lands out of bounds — no reorder, no reshuffle.
    await userEvent.click(
      screen.getByRole("button", { name: "move-first-up" }),
    );

    expect(tasksApi.reorder).not.toHaveBeenCalled();
    expect(rowTitles()).toEqual(["Alpha task", "Beta task"]);
  });

  it("ignores a confirm that arrives with no delete target", async () => {
    await renderPage();

    const confirm = screen.getByRole("button", { name: "always-confirm" });
    expect(confirm).toHaveAttribute("data-open", "false");
    await userEvent.click(confirm);

    expect(tasksApi.remove).not.toHaveBeenCalled();
  });

  it("keeps the sort as-is when it is already manual", async () => {
    localStorage.setItem("taskSort", JSON.stringify("position"));
    await renderPage();

    await userEvent.click(screen.getByRole("button", { name: "drag-reorder" }));
    await userEvent.click(screen.getByRole("button", { name: "drag-drop" }));

    await waitFor(() => expect(tasksApi.reorder).toHaveBeenCalledWith([2, 1]));
    expect(localStorage.getItem("taskSort")).toBe(JSON.stringify("position"));
  });
});
