import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { todayISO } from "../lib/format";
import { TaskFormModal } from "./TaskFormModal";

const TASK = {
  id: 7,
  title: "Existing task",
  description: "Existing description",
  completed: false,
  priority: 3,
  due_date: "2099-05-20",
};

function renderForm(props = {}) {
  const handlers = {
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn(),
  };
  render(<TaskFormModal open task={null} {...handlers} {...props} />);
  return handlers;
}

describe("TaskFormModal (create)", () => {
  it("renders empty defaults", () => {
    renderForm();
    expect(
      screen.getByRole("dialog", { name: "New task" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Title")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Priority" })).toHaveTextContent(
      "Medium",
    );
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });

  it("requires a title", async () => {
    const { onSubmit } = renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("maps the payload: numeric priority and null empty due date", async () => {
    const { onSubmit } = renderForm();

    await userEvent.type(screen.getByPlaceholderText("Title"), "Ship it");
    await userEvent.type(
      screen.getByPlaceholderText("Description"),
      "All the details",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Ship it",
        description: "All the details",
        priority: 2,
        due_date: null,
      }),
    );
  });

  it("submits a picked priority and due date", async () => {
    const { onSubmit } = renderForm();

    await userEvent.type(screen.getByPlaceholderText("Title"), "Ship it");

    await userEvent.click(screen.getByRole("button", { name: "Priority" }));
    const high = await screen.findByRole("option", { name: /High/ });
    await userEvent.click(high.querySelector("button"));

    await userEvent.click(screen.getByRole("button", { name: "Due date" }));
    await userEvent.click(await screen.findByRole("button", { name: "Today" }));

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Ship it",
        description: "",
        priority: 3,
        due_date: todayISO(),
      }),
    );
  });

  it("stays open when the submit is rejected", async () => {
    const { onSubmit } = renderForm();
    onSubmit.mockRejectedValue(new Error("server said no"));

    await userEvent.type(screen.getByPlaceholderText("Title"), "Ship it");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(
      screen.getByRole("dialog", { name: "New task" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save" })).toBeEnabled(),
    );
  });

  it("cancels via the ghost button", async () => {
    const { onClose } = renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("TaskFormModal (edit)", () => {
  it("prefills fields from the task", () => {
    renderForm({ task: TASK });
    expect(
      screen.getByRole("dialog", { name: "Edit task" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Title")).toHaveValue("Existing task");
    expect(screen.getByPlaceholderText("Description")).toHaveValue(
      "Existing description",
    );
    expect(screen.getByRole("button", { name: "Priority" })).toHaveTextContent(
      "High",
    );
  });

  it("offers deletion of the task being edited", async () => {
    const { onDelete } = renderForm({ task: TASK });
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(TASK);
  });

  it("normalizes nullish fields when resetting", () => {
    renderForm({
      task: {
        ...TASK,
        title: null,
        description: null,
        priority: null,
        due_date: null,
      },
    });
    expect(screen.getByPlaceholderText("Title")).toHaveValue("");
    expect(screen.getByPlaceholderText("Description")).toHaveValue("");
  });
});
