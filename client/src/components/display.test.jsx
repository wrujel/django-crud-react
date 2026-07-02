import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AnimatedNumber } from "./AnimatedNumber";
import { DueDateBadge } from "./DueDateBadge";
import { Navbar } from "./Navbar";
import { PriorityBadge } from "./PriorityBadge";
import { TaskCardSkeleton } from "./TaskCardSkeleton";

describe("AnimatedNumber", () => {
  it("counts up to the target value", async () => {
    render(<AnimatedNumber value={42} />);
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument(), {
      timeout: 3000,
    });
  });
});

describe("PriorityBadge", () => {
  it("shows the label with a color dot", () => {
    const { container } = render(<PriorityBadge priority={3} />);
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(container.querySelector(".bg-prio-high")).not.toBeNull();
  });

  it("falls back to Medium for unknown priorities", () => {
    render(<PriorityBadge priority={99} />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });
});

describe("DueDateBadge", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 6, 15, 12, 0, 0));
  });

  afterEach(() => vi.useRealTimers());

  it("renders nothing without a date", () => {
    const { container } = render(<DueDateBadge value={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("highlights overdue active tasks in danger", () => {
    render(<DueDateBadge value="2026-07-12" completed={false} />);
    const badge = screen.getByText("3d overdue").closest("span");
    expect(badge.className).toContain("text-danger");
  });

  it("mutes overdue completed tasks", () => {
    render(<DueDateBadge value="2026-07-12" completed />);
    const badge = screen.getByText("3d overdue").closest("span");
    expect(badge.className).toContain("text-faint");
  });

  it("warns about imminent due dates", () => {
    render(<DueDateBadge value="2026-07-16" completed={false} />);
    const badge = screen.getByText("Tomorrow").closest("span");
    expect(badge.className).toContain("text-warning");
  });
});

describe("Navbar", () => {
  it("brands a link back to the task list", () => {
    render(<Navbar />, { wrapper: MemoryRouter });
    const link = screen.getByRole("link", { name: "Task Manager" });
    expect(link).toHaveAttribute("href", "/tasks");
  });
});

describe("TaskCardSkeleton", () => {
  it("renders shimmer placeholders", () => {
    const { container } = render(<TaskCardSkeleton />);
    expect(container.querySelectorAll(".skeleton").length).toBeGreaterThan(2);
  });
});
