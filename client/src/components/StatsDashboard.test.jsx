import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatsDashboard } from "./StatsDashboard";

const STATS = {
  total: 9,
  active: 6,
  completed: 3,
  overdue: 1,
  completion_rate: 33.3,
};

describe("StatsDashboard", () => {
  it("renders skeleton tiles while stats are loading", () => {
    const { container } = render(<StatsDashboard stats={null} />);
    expect(container.querySelectorAll(".skeleton")).toHaveLength(5);
    expect(screen.queryByText("Total")).toBeNull();
  });

  it("renders the five metric tiles", async () => {
    render(<StatsDashboard stats={STATS} />);

    for (const label of [
      "Total",
      "Active",
      "Completed",
      "Overdue",
      "Completion",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    // AnimatedNumbers settle on their target values.
    await waitFor(() => expect(screen.getByText("9")).toBeInTheDocument(), {
      timeout: 3000,
    });
    await waitFor(() => expect(screen.getByText("6")).toBeInTheDocument());
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("renders the completion progress fill", () => {
    const { container } = render(<StatsDashboard stats={STATS} />);
    expect(container.querySelector(".absolute.bottom-0.left-0")).not.toBeNull();
  });

  it("defaults a missing completion rate to zero", async () => {
    render(<StatsDashboard stats={{ ...STATS, completion_rate: undefined }} />);
    expect(screen.getByText("Completion")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByText("0").length).toBeGreaterThan(0),
    );
  });
});
