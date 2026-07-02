import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Flag } from "lucide-react";

import { Select } from "./Select";

const OPTIONS = [
  { value: "a", label: "Alpha", dot: "bg-prio-high" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", icon: Flag },
];

function renderSelect(props = {}) {
  const onValueChange = vi.fn();
  render(
    <Select
      value={props.value ?? "a"}
      onValueChange={onValueChange}
      options={OPTIONS}
      ariaLabel="Pick one"
      {...props}
    />,
  );
  return {
    onValueChange,
    trigger: screen.getByRole("button", { name: /Pick one/ }),
  };
}

async function open(trigger) {
  await userEvent.click(trigger);
  return await screen.findByRole("listbox", { name: "Pick one" });
}

describe("Select", () => {
  it("shows the selected label, or a placeholder when unset", () => {
    const { trigger } = renderSelect();
    expect(trigger).toHaveTextContent("Alpha");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    renderSelect({ value: "", ariaLabel: "Empty one" });
    expect(screen.getByRole("button", { name: "Empty one" })).toHaveTextContent(
      "Select…",
    );
  });

  it("shows the selected option's icon on the trigger", () => {
    const { trigger } = renderSelect({ value: "c" });
    expect(trigger).toHaveTextContent("Gamma");
    expect(trigger.querySelector("svg:not(:last-child)")).not.toBeNull();
  });

  it("opens a portaled listbox with dots, icons and the selected check", async () => {
    const { trigger } = renderSelect();
    const listbox = await open(trigger);

    expect(listbox.parentElement).toBe(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
    // dot span for Alpha, svg icon for Gamma
    expect(options[0].querySelector(".bg-prio-high")).not.toBeNull();
    expect(options[2].querySelector("svg")).not.toBeNull();
  });

  it("selects an option on click, closes and refocuses the trigger", async () => {
    const { onValueChange, trigger } = renderSelect();
    await open(trigger);

    // The click handler lives on the button inside the option <li>.
    await userEvent.click(
      screen.getByRole("option", { name: /Beta/ }).querySelector("button"),
    );
    expect(onValueChange).toHaveBeenCalledWith("b");
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("closes on an outside mousedown but not on one inside the menu", async () => {
    const { trigger } = renderSelect();
    const listbox = await open(trigger);

    fireEvent.mouseDown(listbox);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
  });

  it("supports full keyboard interaction", async () => {
    const { onValueChange, trigger } = renderSelect();

    // Closed: ArrowDown opens.
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await screen.findByRole("listbox");

    // Escape closes and refocuses.
    fireEvent.keyDown(trigger, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();

    // Enter reopens; navigate End -> Home -> ArrowDown, then select with Enter.
    fireEvent.keyDown(trigger, { key: "Enter" });
    await screen.findByRole("listbox");
    fireEvent.keyDown(trigger, { key: "End" });
    fireEvent.keyDown(trigger, { key: "Home" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("clamps keyboard navigation at both ends", async () => {
    const { onValueChange, trigger } = renderSelect({ value: "c" });
    fireEvent.keyDown(trigger, { key: " " }); // Space opens
    await screen.findByRole("listbox");

    // Already on the last option (selected sync) — ArrowDown must clamp.
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: " " });
    expect(onValueChange).toHaveBeenCalledWith("c");

    // ArrowUp clamps at the top.
    fireEvent.keyDown(trigger, { key: "ArrowUp" });
    await screen.findByRole("listbox");
    fireEvent.keyDown(trigger, { key: "Home" });
    fireEvent.keyDown(trigger, { key: "ArrowUp" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith("a");
  });

  it("drops down by default and flips up when space below is tight", async () => {
    const { trigger } = renderSelect();
    let listbox = await open(trigger);
    expect(listbox.style.top).not.toBe("");
    expect(listbox.style.bottom).toBe("");
    fireEvent.mouseDown(document.body);
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
    );

    // Trigger sits near the bottom of the viewport -> menu must flip up.
    trigger.getBoundingClientRect = () => ({
      top: 700,
      bottom: 740,
      left: 10,
      right: 200,
      width: 190,
      height: 40,
      x: 10,
      y: 700,
    });
    listbox = await open(trigger);
    expect(listbox.style.bottom).not.toBe("");
    expect(listbox.style.top).toBe("");
  });

  it("aligns right when requested and repositions on window resize", async () => {
    const { trigger } = renderSelect({ align: "right" });
    const listbox = await open(trigger);
    expect(listbox.style.right).not.toBe("");
    expect(listbox.style.left).toBe("");

    // Repositioning listeners stay wired while open.
    fireEvent(window, new Event("resize"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
