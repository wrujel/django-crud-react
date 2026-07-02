import { MemoryRouter } from "react-router-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { tasksApi } from "../api/tasks.api";
import TasksPage from "./TasksPage";

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
  {
    id: 1,
    title: "Alpha task",
    description: "First one",
    completed: false,
    priority: 3,
    due_date: null,
    position: 0,
  },
  {
    id: 2,
    title: "Beta task",
    description: "Second one",
    completed: false,
    priority: 2,
    due_date: null,
    position: 1,
  },
];

const STATS = {
  total: 2,
  active: 2,
  completed: 0,
  overdue: 0,
  completion_rate: 0,
};

const page = (items, extra = {}) => ({
  results: items,
  count: items.length,
  next: null,
  ...extra,
});

function renderPage() {
  return render(<TasksPage />, { wrapper: MemoryRouter });
}

async function untilLoaded() {
  await screen.findByRole("heading", { name: "Alpha task" });
}

beforeEach(() => {
  vi.clearAllMocks();
  tasksApi.list.mockResolvedValue(page(TASKS));
  tasksApi.stats.mockResolvedValue(STATS);
  tasksApi.create.mockResolvedValue(TASKS[0]);
  tasksApi.update.mockResolvedValue(TASKS[0]);
  tasksApi.patch.mockResolvedValue(TASKS[0]);
  tasksApi.remove.mockResolvedValue(1);
  tasksApi.reorder.mockResolvedValue({ updated: 2 });
});

describe("TasksPage", () => {
  it("renders tasks and the stats dashboard", async () => {
    renderPage();
    await untilLoaded();

    expect(
      screen.getByRole("heading", { name: "Your tasks" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Beta task" }),
    ).toBeInTheDocument();
    for (const label of [
      "Total",
      "Active", // also matches the status tab — hence getAllByText
      "Completed",
      "Overdue",
      "Completion",
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("shows the error state and recovers via Retry", async () => {
    tasksApi.list.mockRejectedValueOnce(new Error("down"));
    renderPage();

    await screen.findByText("Couldn't load tasks");
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await untilLoaded();
  });

  it("sends the debounced search to the API", async () => {
    renderPage();
    await untilLoaded();

    fireEvent.change(screen.getByLabelText("Search tasks"), {
      target: { value: "alpha" },
    });
    await waitFor(() =>
      expect(tasksApi.list).toHaveBeenLastCalledWith(
        { search: "alpha" },
        expect.anything(),
      ),
    );
  });

  it("filters by status via the segmented control", async () => {
    renderPage();
    await untilLoaded();

    await userEvent.click(screen.getByRole("tab", { name: "Active" }));
    await waitFor(() =>
      expect(tasksApi.list).toHaveBeenLastCalledWith(
        { completed: false },
        expect.anything(),
      ),
    );

    await userEvent.click(screen.getByRole("tab", { name: "Done" }));
    await waitFor(() =>
      expect(tasksApi.list).toHaveBeenLastCalledWith(
        { completed: true },
        expect.anything(),
      ),
    );
  });

  it("filters by priority via the dropdown", async () => {
    renderPage();
    await untilLoaded();

    await userEvent.click(
      screen.getByRole("button", { name: "Filter by priority" }),
    );
    const option = await screen.findByRole("option", { name: /High priority/ });
    await userEvent.click(option.querySelector("button"));

    await waitFor(() =>
      expect(tasksApi.list).toHaveBeenLastCalledWith(
        { priority: "3" },
        expect.anything(),
      ),
    );
  });

  it("sorts via the dropdown and persists the choice", async () => {
    renderPage();
    await untilLoaded();

    await userEvent.click(screen.getByRole("button", { name: "Sort tasks" }));
    const option = await screen.findByRole("option", { name: /Newest first/ });
    await userEvent.click(option.querySelector("button"));

    await waitFor(() =>
      expect(tasksApi.list).toHaveBeenLastCalledWith(
        { ordering: "-created_at" },
        expect.anything(),
      ),
    );
    expect(localStorage.getItem("taskSort")).toBe(
      JSON.stringify("-created_at"),
    );
  });

  it("switches to the list view and persists it", async () => {
    renderPage();
    await untilLoaded();
    expect(screen.getAllByRole("article")).toHaveLength(2);

    await userEvent.click(screen.getByRole("button", { name: "List view" }));
    await waitFor(() =>
      expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0),
    );
    expect(localStorage.getItem("taskView")).toBe(JSON.stringify("list"));
  });

  it("creates a task through the modal", async () => {
    renderPage();
    await untilLoaded();

    await userEvent.click(screen.getByRole("button", { name: "New" }));
    await screen.findByRole("dialog", { name: "New task" });

    await userEvent.type(screen.getByPlaceholderText("Title"), "Fresh task");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(tasksApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Fresh task" }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("Task created");
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "New task" })).toBeNull(),
    );
    expect(tasksApi.stats.mock.calls.length).toBeGreaterThan(1);
  });

  it("keeps the modal open and toasts when creation fails", async () => {
    tasksApi.create.mockRejectedValue({ message: "boom" });
    renderPage();
    await untilLoaded();

    await userEvent.click(screen.getByRole("button", { name: "New" }));
    await userEvent.type(screen.getByPlaceholderText("Title"), "Fresh task");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(
      screen.getByRole("dialog", { name: "New task" }),
    ).toBeInTheDocument();
  });

  it("edits a task by clicking its card", async () => {
    renderPage();
    await untilLoaded();

    await userEvent.click(screen.getByRole("heading", { name: "Alpha task" }));
    await screen.findByRole("dialog", { name: "Edit task" });
    expect(screen.getByPlaceholderText("Title")).toHaveValue("Alpha task");

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(tasksApi.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ title: "Alpha task" }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("Task updated");
  });

  it("toggles completion from the card checkbox", async () => {
    renderPage();
    await untilLoaded();

    const card = screen
      .getByRole("heading", { name: "Alpha task" })
      .closest("article");
    await userEvent.click(within(card).getByRole("checkbox"));

    await waitFor(() =>
      expect(tasksApi.patch).toHaveBeenCalledWith(1, { completed: true }),
    );
  });

  it("toasts when the toggle fails", async () => {
    tasksApi.patch.mockRejectedValue({ message: "nope" });
    renderPage();
    await untilLoaded();

    const card = screen
      .getByRole("heading", { name: "Alpha task" })
      .closest("article");
    await userEvent.click(within(card).getByRole("checkbox"));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it("deletes after confirming", async () => {
    renderPage();
    await untilLoaded();

    const card = screen
      .getByRole("heading", { name: "Alpha task" })
      .closest("article");
    await userEvent.click(
      within(card).getByRole("button", { name: "Delete task" }),
    );

    await screen.findByRole("heading", { name: "Delete task?" });
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(tasksApi.remove).toHaveBeenCalledWith(1));
    expect(toast.success).toHaveBeenCalledWith("Task deleted");
  });

  it("toasts when deletion fails", async () => {
    tasksApi.remove.mockRejectedValue({ message: "locked" });
    renderPage();
    await untilLoaded();

    const card = screen
      .getByRole("heading", { name: "Alpha task" })
      .closest("article");
    await userEvent.click(
      within(card).getByRole("button", { name: "Delete task" }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete" }),
    );

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it("offers Clear filters on a filtered empty result", async () => {
    renderPage();
    await untilLoaded();

    tasksApi.list.mockResolvedValue(page([]));
    fireEvent.change(screen.getByLabelText("Search tasks"), {
      target: { value: "zzz" },
    });

    await screen.findByText("No matching tasks");
    tasksApi.list.mockResolvedValue(page(TASKS));
    await userEvent.click(
      screen.getByRole("button", { name: "Clear filters" }),
    );
    await untilLoaded();
  });

  it("shows the unfiltered empty state", async () => {
    tasksApi.list.mockResolvedValue(page([]));
    renderPage();

    await screen.findByText("No tasks yet");
    expect(
      screen.getByRole("button", { name: "New task" }),
    ).toBeInTheDocument();
  });

  it("loads the next page on demand", async () => {
    tasksApi.list.mockResolvedValueOnce(
      page([TASKS[0]], { count: 2, next: "http://x/api/?page=2" }),
    );
    renderPage();
    await untilLoaded();

    tasksApi.list.mockResolvedValueOnce(page([TASKS[1]], { count: 2 }));
    await userEvent.click(screen.getByRole("button", { name: "Load more" }));

    await waitFor(() =>
      expect(tasksApi.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: "2" }),
        expect.anything(),
      ),
    );
    await screen.findByRole("heading", { name: "Beta task" });
  });

  it("reorders with the arrows and switches to manual sort", async () => {
    localStorage.setItem("taskView", JSON.stringify("list"));
    renderPage();
    await untilLoaded();

    const downs = await screen.findAllByRole("button", { name: "Move down" });
    await userEvent.click(downs[0]);

    await waitFor(() => expect(tasksApi.reorder).toHaveBeenCalledWith([2, 1]));
    expect(localStorage.getItem("taskSort")).toBe(JSON.stringify("position"));
  });

  it("toasts when reordering fails", async () => {
    localStorage.setItem("taskView", JSON.stringify("list"));
    tasksApi.reorder.mockRejectedValue({ message: "no" });
    renderPage();
    await untilLoaded();

    const downs = await screen.findAllByRole("button", { name: "Move down" });
    await userEvent.click(downs[0]);
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
