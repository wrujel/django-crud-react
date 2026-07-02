import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Inbox } from "lucide-react";

import { Badge } from "./Badge";
import { EmptyState } from "./EmptyState";
import { ProgressBar } from "./ProgressBar";
import { Skeleton } from "./Skeleton";
import { Spinner } from "./Spinner";
import { Button } from "./Button";

describe("Badge", () => {
  it("renders children and merges classes", () => {
    render(<Badge className="custom">High</Badge>);
    const badge = screen.getByText("High");
    expect(badge).toHaveClass("custom");
    expect(badge.tagName).toBe("SPAN");
  });
});

describe("Skeleton", () => {
  it("renders a shimmer block with custom classes", () => {
    const { container } = render(<Skeleton className="h-4" />);
    expect(container.firstChild).toHaveClass("skeleton", "h-4");
  });
});

describe("Spinner", () => {
  it("renders a spinning, decorative svg", () => {
    const { container } = render(<Spinner className="size-4" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("animate-spin", "size-4");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});

describe("EmptyState", () => {
  it("renders title only", () => {
    render(<EmptyState title="Nothing here" />);
    expect(
      screen.getByRole("heading", { name: "Nothing here" }),
    ).toBeInTheDocument();
  });

  it("renders icon, description and action when provided", () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={Inbox}
        title="No tasks yet"
        description="Create your first task."
        action={<Button onClick={onClick}>New task</Button>}
      />,
    );
    expect(screen.getByText("Create your first task.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New task" }),
    ).toBeInTheDocument();
  });
});

describe("ProgressBar", () => {
  it("exposes the clamped value via aria", () => {
    render(<ProgressBar value={42.4} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps out-of-range values", () => {
    const { rerender } = render(<ProgressBar value={140} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );

    rerender(<ProgressBar value={-10} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("defaults to zero", () => {
    render(<ProgressBar />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });
});
