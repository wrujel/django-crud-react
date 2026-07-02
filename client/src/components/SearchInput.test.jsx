import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function type(value) {
    fireEvent.change(screen.getByLabelText("Search tasks"), {
      target: { value },
    });
  }

  it("shows keystrokes immediately but emits only after the debounce", () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    type("a");
    type("ab");
    type("abc");
    expect(screen.getByLabelText("Search tasks")).toHaveValue("abc");
    expect(onChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(350));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("does not re-emit an unchanged debounced value", () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    type("abc");
    act(() => vi.advanceTimersByTime(350));
    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("syncs external resets without emitting", () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchInput value="" onChange={onChange} />);

    type("abc");
    act(() => vi.advanceTimersByTime(350));
    onChange.mockClear();

    // Parent accepts the emitted value, then clears it ("Clear filters").
    rerender(<SearchInput value="abc" onChange={onChange} />);
    expect(screen.getByLabelText("Search tasks")).toHaveValue("abc");

    rerender(<SearchInput value="" onChange={onChange} />);
    expect(screen.getByLabelText("Search tasks")).toHaveValue("");

    act(() => vi.advanceTimersByTime(1000));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows the refresh spinner only for sustained loading", () => {
    const { container, rerender } = render(
      <SearchInput value="" onChange={() => {}} refreshing />,
    );
    expect(container.querySelector(".animate-spin")).toBeNull();

    act(() => vi.advanceTimersByTime(400));
    expect(container.querySelector(".animate-spin")).not.toBeNull();

    rerender(<SearchInput value="" onChange={() => {}} refreshing={false} />);
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});
