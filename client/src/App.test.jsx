import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("./pages/TasksPage", () => ({
  default: function TasksPageStub() {
    return <div data-testid="tasks-page" />;
  },
}));

describe("App", () => {
  it("redirects the root path to /tasks", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);
    expect(await screen.findByTestId("tasks-page")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/tasks");
  });

  it("redirects unknown paths to /tasks", async () => {
    window.history.pushState({}, "", "/nope/nothing-here");
    render(<App />);
    expect(await screen.findByTestId("tasks-page")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/tasks");
  });
});
