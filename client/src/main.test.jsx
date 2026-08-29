import { beforeEach, describe, expect, it, vi } from "vitest";

const render = vi.fn();
const createRoot = vi.fn(() => ({ render }));

vi.mock("react-dom/client", () => ({
  default: { createRoot },
  createRoot,
}));

vi.mock("./App.jsx", () => ({
  default: function App() {
    return null;
  },
}));

describe("main bootstrap", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  // Importing the real entrypoint pulls in index.css, so this test pays for
  // Tailwind's transform on a cold cache — well past the 5s default.
  it(
    "mounts the app into #root",
    async () => {
      await import("./main.jsx");
      expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
      expect(render).toHaveBeenCalledTimes(1);
    },
    30_000,
  );
});
