import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import axios from "axios";

vi.mock("axios", () => {
  const instance = { name: "mock-axios-instance" };
  return {
    default: {
      create: vi.fn(() => instance),
      isCancel: vi.fn(() => false),
    },
  };
});

// baseURL is computed at module load, so each branch needs a fresh import.
async function importHttp() {
  vi.resetModules();
  return await import("./http");
}

describe("http client", () => {
  beforeEach(() => {
    axios.create.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the local Django server in dev", async () => {
    vi.stubEnv("VITE_BACKEND_URL", undefined);
    vi.stubEnv("PROD", false);
    await importHttp();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "http://localhost:8000",
      timeout: 15000,
    });
  });

  it("uses same-origin in production", async () => {
    vi.stubEnv("VITE_BACKEND_URL", undefined);
    vi.stubEnv("PROD", true);
    await importHttp();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "",
      timeout: 15000,
    });
  });

  it("prefers an explicit VITE_BACKEND_URL", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://api.example.com");
    await importHttp();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "https://api.example.com",
      timeout: 15000,
    });
  });
});

describe("isCanceled", () => {
  it("is true when axios reports a cancel", async () => {
    const { isCanceled } = await importHttp();
    axios.isCancel.mockReturnValueOnce(true);
    expect(isCanceled(new Error("x"))).toBe(true);
  });

  it("is true for ERR_CANCELED codes", async () => {
    const { isCanceled } = await importHttp();
    expect(isCanceled({ code: "ERR_CANCELED" })).toBe(true);
  });

  it("is false for ordinary errors", async () => {
    const { isCanceled } = await importHttp();
    expect(isCanceled({ code: "EBOOM" })).toBe(false);
    expect(isCanceled(undefined)).toBe(false);
  });
});

describe("getErrorMessage", () => {
  let getErrorMessage;

  beforeEach(async () => {
    ({ getErrorMessage } = await importHttp());
  });

  it("maps timeouts to a friendly message", () => {
    expect(getErrorMessage({ code: "ECONNABORTED" })).toBe(
      "The server took too long to respond.",
    );
  });

  it("maps network failures to a friendly message", () => {
    expect(getErrorMessage({ code: "ERR_NETWORK" })).toBe(
      "Can't reach the server — is it running?",
    );
  });

  it("returns string response bodies directly", () => {
    expect(getErrorMessage({ response: { data: "Server exploded" } })).toBe(
      "Server exploded",
    );
  });

  it("returns the first message of a DRF field-error object", () => {
    expect(
      getErrorMessage({ response: { data: { title: ["Title is required"] } } }),
    ).toBe("Title is required");
  });

  it("returns a plain string field value", () => {
    expect(
      getErrorMessage({ response: { data: { detail: "Not found." } } }),
    ).toBe("Not found.");
  });

  it("falls back to the error message for unrecognized shapes", () => {
    expect(
      getErrorMessage({ response: { data: { weird: 42 } }, message: "boom" }),
    ).toBe("boom");
  });

  it("falls back to the default when nothing is usable", () => {
    expect(getErrorMessage(undefined)).toBe("Something went wrong");
    expect(getErrorMessage({}, "Custom fallback")).toBe("Custom fallback");
  });
});
