import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskToolbar } from "./TaskToolbar";

function renderToolbar(overrides = {}) {
  const props = {
    search: "",
    onSearch: vi.fn(),
    status: "all",
    onStatus: vi.fn(),
    priority: "",
    onPriority: vi.fn(),
    sort: "",
    onSort: vi.fn(),
    view: "grid",
    onView: vi.fn(),
    onAddTask: vi.fn(),
    refreshing: false,
    ...overrides,
  };
  render(<TaskToolbar {...props} />);
  return props;
}

async function pickOption(triggerName, optionMatcher) {
  await userEvent.click(screen.getByRole("button", { name: triggerName }));
  const option = await screen.findByRole("option", { name: optionMatcher });
  await userEvent.click(option.querySelector("button"));
}

describe("TaskToolbar", () => {
  it("renders search, create, filters, sort and view controls", () => {
    renderToolbar();
    expect(screen.getByLabelText("Search tasks")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "All" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Filter by priority" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sort tasks" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "View" })).toBeInTheDocument();
  });

  it("creates from the New button", async () => {
    const props = renderToolbar();
    await userEvent.click(screen.getByRole("button", { name: "New" }));
    expect(props.onAddTask).toHaveBeenCalled();
  });

  it("changes status via the segmented control", async () => {
    const props = renderToolbar();
    await userEvent.click(screen.getByRole("tab", { name: "Active" }));
    expect(props.onStatus).toHaveBeenCalledWith("active");
  });

  it("filters by priority via the dropdown", async () => {
    const props = renderToolbar();
    await pickOption("Filter by priority", /High priority/);
    expect(props.onPriority).toHaveBeenCalledWith("3");
  });

  it("sorts via the dropdown", async () => {
    const props = renderToolbar();
    await pickOption("Sort tasks", /Manual/);
    expect(props.onSort).toHaveBeenCalledWith("position");
  });

  it("switches views", async () => {
    const props = renderToolbar();
    await userEvent.click(screen.getByRole("button", { name: "List view" }));
    expect(props.onView).toHaveBeenCalledWith("list");
  });
});
