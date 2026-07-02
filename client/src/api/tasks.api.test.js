import { describe, expect, it, vi } from "vitest";

import { http } from "../lib/http";
import { tasksApi } from "./tasks.api";

vi.mock("../lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("tasksApi", () => {
  it("is a resource rooted at the tasks endpoint", () => {
    expect(tasksApi.path).toBe("/tasks/api/v1/tasks/");
    for (const method of [
      "list",
      "retrieve",
      "create",
      "update",
      "patch",
      "remove",
      "reorder",
      "stats",
    ]) {
      expect(tasksApi[method]).toBeTypeOf("function");
    }
  });

  it("stats GETs the aggregate endpoint and unwraps data", async () => {
    http.get.mockResolvedValue({ data: { total: 3 } });
    await expect(tasksApi.stats()).resolves.toEqual({ total: 3 });
    expect(http.get).toHaveBeenCalledWith("/tasks/api/v1/tasks/stats/");
  });
});
