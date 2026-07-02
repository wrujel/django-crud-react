import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Plus } from "lucide-react";

import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { IconButton } from "./IconButton";
import { Input } from "./Input";
import { Textarea } from "./Textarea";

describe("Button", () => {
  it("defaults to type=button and fires clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="danger" size="sm">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button.className).toContain("text-danger");
    expect(button.className).toContain("h-9");
  });

  it("renders a leading icon", () => {
    const { container } = render(<Button icon={Plus}>New</Button>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("shows a spinner and disables itself while loading", () => {
    const { container } = render(<Button loading>Save</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("respects an explicit disabled flag", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("IconButton", () => {
  it("uses the label for accessibility and tooltip", () => {
    render(
      <IconButton label="Delete task" tone="danger">
        <Plus />
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Delete task" });
    expect(button).toHaveAttribute("title", "Delete task");
    expect(button.className).toContain("hover:text-danger");
  });

  it("fires clicks", async () => {
    const onClick = vi.fn();
    render(
      <IconButton label="Go" onClick={onClick}>
        <Plus />
      </IconButton>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Input", () => {
  it("forwards the ref to the input element", () => {
    const ref = createRef();
    render(<Input ref={ref} placeholder="Title" />);
    expect(ref.current).toBe(screen.getByPlaceholderText("Title"));
  });

  it("renders a leading icon inside the wrapper", () => {
    const { container } = render(<Input icon={Plus} placeholder="Search" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search").className).toContain("pl-9");
  });

  it("marks invalid fields with the danger ring", () => {
    render(<Input invalid placeholder="Title" />);
    expect(screen.getByPlaceholderText("Title").className).toContain(
      "ring-danger",
    );
  });
});

describe("Textarea", () => {
  it("forwards the ref and invalid state", () => {
    const ref = createRef();
    render(<Textarea ref={ref} invalid placeholder="Description" />);
    const area = screen.getByPlaceholderText("Description");
    expect(ref.current).toBe(area);
    expect(area.className).toContain("ring-danger");
  });
});

describe("Checkbox", () => {
  it("exposes checkbox semantics", () => {
    render(<Checkbox checked={false} onChange={() => {}} label="Mark done" />);
    const box = screen.getByRole("checkbox", { name: "Mark done" });
    expect(box).toHaveAttribute("aria-checked", "false");
  });

  it("reflects the checked state and fires onChange", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Checkbox checked={false} onChange={onChange} label="Mark done" />,
    );
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledTimes(1);

    rerender(<Checkbox checked onChange={onChange} label="Mark done" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("checkbox").className).toContain("bg-accent");
  });
});
