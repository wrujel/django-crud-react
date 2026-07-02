import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./SegmentedControl";
import { ViewToggle } from "./ViewToggle";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Done" },
];

describe("SegmentedControl", () => {
  it("marks the active option as selected", () => {
    render(
      <SegmentedControl options={OPTIONS} value="active" onChange={() => {}} />,
    );
    expect(screen.getByRole("tab", { name: "Active" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("renders the sliding indicator only inside the active tab", () => {
    render(
      <SegmentedControl options={OPTIONS} value="all" onChange={() => {}} />,
    );
    const active = screen.getByRole("tab", { name: "All" });
    const inactive = screen.getByRole("tab", { name: "Done" });
    expect(active.querySelector("span.absolute")).not.toBeNull();
    expect(inactive.querySelector("span.absolute")).toBeNull();
  });

  it("reports selections", async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl options={OPTIONS} value="all" onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("tab", { name: "Done" }));
    expect(onChange).toHaveBeenCalledWith("completed");
  });
});

describe("ViewToggle", () => {
  it("marks the active view as pressed", () => {
    render(<ViewToggle value="list" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "List view" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports view changes", async () => {
    const onChange = vi.fn();
    render(<ViewToggle value="grid" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "List view" }));
    expect(onChange).toHaveBeenCalledWith("list");
  });
});
