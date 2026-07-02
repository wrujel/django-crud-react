import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "./Modal";

function renderModal(props = {}) {
  const onClose = vi.fn();
  const view = render(
    <Modal
      open
      title="New task"
      description="Add one."
      onClose={onClose}
      {...props}
    >
      <input placeholder="Title" />
      <button type="button">Save</button>
    </Modal>,
  );
  return { onClose, ...view };
}

describe("Modal", () => {
  it("renders nothing while closed", () => {
    render(
      <Modal open={false} title="Hidden" onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("skips the header entirely when title and onClose are omitted", () => {
    render(
      <Modal open>
        <p>Bare body</p>
      </Modal>,
    );
    expect(screen.getByText("Bare body")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("renders a title without a description", () => {
    render(
      <Modal open title="Only title" onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    );
    expect(
      screen.getByRole("heading", { name: "Only title" }),
    ).toBeInTheDocument();
  });

  it("falls back to the first focusable when there is only one", async () => {
    render(
      <Modal open title="Single" onClose={() => {}}>
        <p>No controls in the body</p>
      </Modal>,
    );
    // Only the header close button is focusable -> focusables[1] ?? [0].
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Close" })).toHaveFocus(),
    );
  });

  it("portals an accessible dialog with header content", () => {
    renderModal();
    const dialog = screen.getByRole("dialog", { name: "New task" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog.closest("body")).toBe(document.body);
    expect(
      screen.getByRole("heading", { name: "New task" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Add one.")).toBeInTheDocument();
  });

  it("moves focus to the first meaningful control", async () => {
    renderModal();
    // focusables[0] is the header close button; [1] is the first child control.
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Title")).toHaveFocus(),
    );
  });

  it("locks body scroll while open and restores it on close", async () => {
    const { rerender } = renderModal();
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal open={false} title="New task" onClose={() => {}}>
        <p>Body</p>
      </Modal>,
    );
    await waitFor(() => expect(document.body.style.overflow).toBe(""));
  });

  it("closes via Escape, the close button, and the backdrop", async () => {
    const { onClose } = renderModal();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(2);

    const dialog = screen.getByRole("dialog", { name: "New task" });
    fireEvent.click(dialog.previousSibling); // backdrop
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("traps Tab focus inside the dialog", async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Title")).toHaveFocus(),
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    const save = screen.getByRole("button", { name: "Save" });

    // Tab past the last focusable wraps to the first.
    save.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    // Shift+Tab from the first wraps to the last.
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(save).toHaveFocus();
  });

  it("returns focus to the previously focused element on close", async () => {
    render(<button type="button">Opener</button>);
    const opener = screen.getByRole("button", { name: "Opener" });
    opener.focus();

    const { rerender } = render(
      <Modal open title="Focus test" onClose={() => {}}>
        <button type="button">Inside</button>
      </Modal>,
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Inside" })).toHaveFocus(),
    );

    rerender(
      <Modal open={false} title="Focus test" onClose={() => {}}>
        <button type="button">Inside</button>
      </Modal>,
    );
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
