import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// With `globals: false`, Testing Library's auto-cleanup doesn't run — do it
// explicitly, and keep localStorage isolated between tests.
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// ---- jsdom gaps needed by motion (framer-motion) and the portal widgets ----

// Select scrolls the active option into view during keyboard navigation.
Element.prototype.scrollIntoView = vi.fn();

// motion checks prefers-reduced-motion via matchMedia.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// motion's layout animations observe element resizes.
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Pointer-capture APIs used by motion drag + user-event are absent in jsdom.
Element.prototype.hasPointerCapture =
  Element.prototype.hasPointerCapture ?? (() => false);
Element.prototype.setPointerCapture =
  Element.prototype.setPointerCapture ?? (() => {});
Element.prototype.releasePointerCapture =
  Element.prototype.releasePointerCapture ?? (() => {});
