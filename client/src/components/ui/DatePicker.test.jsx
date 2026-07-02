import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DatePicker } from "./DatePicker";

// Locale-agnostic expected strings (CI is en-US; dev machines may differ).
const monthLabel = (year, monthIndex) =>
  new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

function renderPicker(props = {}) {
  const onChange = vi.fn();
  render(
    <DatePicker
      value={props.value ?? ""}
      onChange={onChange}
      ariaLabel="Due date"
      {...props}
    />,
  );
  return {
    onChange,
    trigger: screen.getByRole("button", { name: "Due date" }),
  };
}

async function open(trigger) {
  await userEvent.click(trigger);
  return await screen.findByRole("dialog", { name: "Due date" });
}

describe("DatePicker", () => {
  beforeEach(() => {
    // Fake only Date: real timers/rAF keep motion's exit animations running.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 6, 15, 12, 0, 0)); // July 15 2026, local noon
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the placeholder when unset and the formatted date when set", () => {
    const { trigger } = renderPicker();
    expect(trigger).toHaveTextContent("Set due date");

    const expected = new Date(2026, 6, 10).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    renderPicker({ value: "2026-07-10", ariaLabel: "Other date" });
    expect(
      screen.getByRole("button", { name: "Other date" }),
    ).toHaveTextContent(expected);
  });

  it("falls back to the placeholder for invalid values", () => {
    const { trigger } = renderPicker({ value: "garbage" });
    expect(trigger).toHaveTextContent("Set due date");
    expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
  });

  it("opens a portaled calendar on the current month with a today marker", async () => {
    const { trigger } = renderPicker();
    const dialog = await open(trigger);

    expect(dialog.parentElement).toBe(document.body);
    expect(screen.getByText(monthLabel(2026, 6))).toBeInTheDocument();

    const today = screen.getByRole("button", { name: "15" });
    expect(today.querySelector("span.bg-accent")).not.toBeNull();
  });

  it("navigates months in both directions", async () => {
    const { trigger } = renderPicker();
    await open(trigger);

    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText(monthLabel(2026, 7))).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Previous month" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Previous month" }),
    );
    expect(screen.getByText(monthLabel(2026, 5))).toBeInTheDocument();
  });

  it("opens at the selected month when a value is set", async () => {
    const { trigger } = renderPicker({ value: "2026-03-10" });
    await open(trigger);
    expect(screen.getByText(monthLabel(2026, 2))).toBeInTheDocument();
  });

  it("picks a day and closes", async () => {
    const { onChange, trigger } = renderPicker();
    await open(trigger);

    await userEvent.click(screen.getByRole("button", { name: "20" }));
    expect(onChange).toHaveBeenCalledWith("2026-07-20");
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Due date" })).toBeNull(),
    );
  });

  it("supports the Today and Clear footer shortcuts", async () => {
    const { onChange, trigger } = renderPicker({ value: "2026-07-10" });
    await open(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Today" }));
    expect(onChange).toHaveBeenCalledWith("2026-07-15");

    await open(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("clears from the trigger-adjacent button without opening", async () => {
    const { onChange } = renderPicker({ value: "2026-07-10" });
    await userEvent.click(screen.getByRole("button", { name: "Clear date" }));
    expect(onChange).toHaveBeenCalledWith("");
    expect(screen.queryByRole("dialog", { name: "Due date" })).toBeNull();
  });

  it("closes on Escape and on outside mousedown", async () => {
    const { trigger } = renderPicker();
    await open(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Due date" })).toBeNull(),
    );

    const dialog = await open(trigger);
    fireEvent.mouseDown(dialog);
    expect(
      screen.getByRole("dialog", { name: "Due date" }),
    ).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Due date" })).toBeNull(),
    );
  });

  it("flips upward when there is no room below the trigger", async () => {
    const { trigger } = renderPicker();
    trigger.getBoundingClientRect = () => ({
      top: 720,
      bottom: 760,
      left: 10,
      right: 200,
      width: 190,
      height: 40,
      x: 10,
      y: 720,
    });
    const dialog = await open(trigger);
    expect(dialog.style.bottom).not.toBe("");
    expect(dialog.style.top).toBe("");
  });
});
