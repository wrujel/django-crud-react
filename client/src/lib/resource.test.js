import { beforeEach, describe, expect, it, vi } from "vitest";

import { http } from "./http";
import { createResource, unwrapPage } from "./resource";

vi.mock("./http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const PATH = "/things/";

describe("createResource", () => {
  const resource = createResource(PATH);

  beforeEach(() => {
    http.get.mockResolvedValue({ data: { ok: true } });
    http.post.mockResolvedValue({ data: { id: 1 } });
    http.put.mockResolvedValue({ data: { id: 1 } });
    http.patch.mockResolvedValue({ data: { id: 1 } });
    http.delete.mockResolvedValue({});
  });

  it("exposes the collection path", () => {
    expect(resource.path).toBe(PATH);
  });

  it("list forwards params and config and unwraps data", async () => {
    const signal = new AbortController().signal;
    const data = await resource.list({ search: "x" }, { signal });
    expect(http.get).toHaveBeenCalledWith(PATH, {
      params: { search: "x" },
      signal,
    });
    expect(data).toEqual({ ok: true });
  });

  it("retrieve GETs the detail url", async () => {
    await resource.retrieve(7);
    expect(http.get).toHaveBeenCalledWith(`${PATH}7/`);
  });

  it("create POSTs to the collection", async () => {
    await resource.create({ title: "T" });
    expect(http.post).toHaveBeenCalledWith(PATH, { title: "T" });
  });

  it("update PUTs to the detail url", async () => {
    await resource.update(7, { title: "T" });
    expect(http.put).toHaveBeenCalledWith(`${PATH}7/`, { title: "T" });
  });

  it("patch PATCHes the detail url", async () => {
    await resource.patch(7, { completed: true });
    expect(http.patch).toHaveBeenCalledWith(`${PATH}7/`, { completed: true });
  });

  it("remove DELETEs and resolves with the id", async () => {
    await expect(resource.remove(7)).resolves.toBe(7);
    expect(http.delete).toHaveBeenCalledWith(`${PATH}7/`);
  });

  it("reorder POSTs the id list to the reorder action", async () => {
    http.post.mockResolvedValue({ data: { updated: 2 } });
    const data = await resource.reorder([2, 1]);
    expect(http.post).toHaveBeenCalledWith(`${PATH}reorder/`, {
      order: [2, 1],
    });
    expect(data).toEqual({ updated: 2 });
  });
});

describe("unwrapPage", () => {
  it("normalizes a bare array", () => {
    expect(unwrapPage([{ id: 1 }])).toEqual({
      items: [{ id: 1 }],
      count: 1,
      next: null,
    });
  });

  it("normalizes a paginated object", () => {
    expect(
      unwrapPage({ results: [{ id: 1 }], count: 40, next: "http://x/?page=2" }),
    ).toEqual({ items: [{ id: 1 }], count: 40, next: "http://x/?page=2" });
  });

  it("defaults missing fields", () => {
    expect(unwrapPage({})).toEqual({ items: [], count: 0, next: null });
    expect(unwrapPage(undefined)).toEqual({ items: [], count: 0, next: null });
  });
});
