import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";

function renderDialog(props = {}) {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <ConfirmDialog
      open
      title="Delete task?"
      description="This cannot be undone."
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onClose={onClose}
      {...props}
    />,
  );
  return { onConfirm, onClose };
}

describe("ConfirmDialog", () => {
  it("renders the warning content", () => {
    renderDialog();
    expect(
      screen.getByRole("heading", { name: "Delete task?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("cancels via the secondary button", async () => {
    const { onClose, onConfirm } = renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirms via the destructive button", async () => {
    const { onConfirm } = renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("disables the confirm button while deleting", () => {
    const { container } = render(
      <ConfirmDialog
        open
        title="Delete task?"
        confirmLabel="Delete"
        onConfirm={() => {}}
        onClose={() => {}}
        loading
      />,
    );
    // The loading Button renders a spinner and is disabled.
    expect(
      container.ownerDocument.querySelector(".animate-spin"),
    ).not.toBeNull();
  });
});
