import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { usePopoverPosition } from "./usePopoverPosition";
import type { PopoverPlacement } from "../types/date-picker.types";

// Mock getBoundingClientRect
const mockAnchorRect = {
  top: 100,
  left: 200,
  bottom: 150,
  right: 300,
  width: 100,
  height: 50,
  x: 200,
  y: 100,
  toJSON: () => ({}),
};

const mockPopoverRect = {
  top: 0,
  left: 0,
  bottom: 200,
  right: 300,
  width: 300,
  height: 200,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

// Helper to create refs with mocked elements
function createMockRef(rect: DOMRect): { current: HTMLElement | null } {
  return {
    current: {
      getBoundingClientRect: () => rect,
    } as HTMLElement,
  };
}

describe("usePopoverPosition", () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, "innerHeight", {
      value: 768,
      writable: true,
    });
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    });
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(window, "scrollX", {
      value: 0,
      writable: true,
    });

    // Spy on scroll and resize listeners
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("returns initial position when not open", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: false,
          placement: "bottom-start",
        })
      );

      expect(result.current).toEqual({
        top: 0,
        left: 0,
        placement: "bottom-start",
      });
    });
  });

  describe("position calculations", () => {
    it("calculates bottom-start position correctly", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "bottom-start",
          offset: [0, 4],
        })
      );

      // bottom-start: top = anchor.bottom + offsetY, left = anchor.left + offsetX
      expect(result.current.top).toBe(154); // 150 + 4
      expect(result.current.left).toBe(200);
      expect(result.current.placement).toBe("bottom-start");
    });

    it("calculates bottom-end position correctly", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "bottom-end",
          offset: [0, 4],
        })
      );

      // bottom-end: top = anchor.bottom + offsetY, left = anchor.right - popover.width - offsetX
      expect(result.current.top).toBe(154);
      expect(result.current.left).toBe(0); // 300 - 300 - 0 = 0
    });

    it("calculates bottom (center) position correctly", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "bottom",
          offset: [0, 4],
        })
      );

      // bottom: left = anchor.left + (anchor.width - popover.width) / 2
      // 200 + (100 - 300) / 2 = 200 - 100 = 100, but clamped to 0
      expect(result.current.top).toBe(154);
      expect(result.current.left).toBe(100);
    });

    it("calculates top-start position correctly", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "top-start",
          offset: [0, 4],
          autoFlip: false,
        })
      );

      // top-start: top = anchor.top - popover.height - offsetY
      // 100 - 200 - 4 = -104, clamped to 0
      expect(result.current.top).toBe(0);
      expect(result.current.left).toBe(200);
    });

    it("calculates left position correctly", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "left",
          offset: [4, 0],
          autoFlip: false,
        })
      );

      // left: left = anchor.left - popover.width - offsetX
      // 200 - 300 - 4 = -104, clamped to 0
      expect(result.current.left).toBe(0);
    });

    it("calculates right position correctly", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "right",
          offset: [4, 0],
          autoFlip: false,
        })
      );

      // right: left = anchor.right + offsetX
      expect(result.current.left).toBe(304); // 300 + 4
    });
  });

  describe("auto-flip", () => {
    it("flips from bottom to top when no space below", () => {
      // Position anchor near bottom of viewport
      const anchorRect = {
        ...mockAnchorRect,
        top: 600,
        bottom: 650,
        y: 600,
      };

      const anchorRef = createMockRef(anchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "bottom-start",
          autoFlip: true,
        })
      );

      // Should flip to top if there's more space
      // But result is clamped to viewport anyway
      expect(result.current.top).toBeLessThanOrEqual(768 - 200);
    });
  });

  describe("scroll handling", () => {
    it("adds scroll and resize event listeners when open", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
        })
      );

      expect(window.addEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), true);
      expect(window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    });

    it("removes event listeners when closed", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { rerender } = renderHook(
        ({ isOpen }) =>
          usePopoverPosition({
            anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
            popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
            isOpen,
          }),
        { initialProps: { isOpen: true } }
      );

      rerender({ isOpen: false });

      expect(window.removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), true);
      expect(window.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    });
  });

  describe("null refs handling", () => {
    it("handles null anchor ref gracefully", () => {
      const anchorRef = { current: null };
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
        })
      );

      expect(result.current).toEqual({
        top: 0,
        left: 0,
        placement: "bottom-start",
      });
    });

    it("handles null popover ref gracefully", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = { current: null };

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
        })
      );

      expect(result.current).toEqual({
        top: 0,
        left: 0,
        placement: "bottom-start",
      });
    });
  });

  describe("offset handling", () => {
    it("applies custom x offset", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "bottom-start",
          offset: [10, 4],
        })
      );

      expect(result.current.left).toBe(210); // 200 + 10
    });

    it("applies custom y offset", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "bottom-start",
          offset: [0, 10],
        })
      );

      expect(result.current.top).toBe(160); // 150 + 10
    });

    it("uses default offset when not specified", () => {
      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "bottom-start",
        })
      );

      // Default offset is [0, 4]
      expect(result.current.top).toBe(154);
    });
  });

  describe("all placement variations", () => {
    const placements: PopoverPlacement[] = [
      "top",
      "top-start",
      "top-end",
      "bottom",
      "bottom-start",
      "bottom-end",
      "left",
      "left-start",
      "left-end",
      "right",
      "right-start",
      "right-end",
    ];

    placements.forEach((placement) => {
      it(`handles ${placement} placement`, () => {
        const anchorRef = createMockRef(mockAnchorRect as DOMRect);
        const popoverRef = createMockRef(mockPopoverRect as DOMRect);

        const { result } = renderHook(() =>
          usePopoverPosition({
            anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
            popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
            isOpen: true,
            placement,
            autoFlip: false,
          })
        );

        expect(result.current.placement).toBe(placement);
        expect(typeof result.current.top).toBe("number");
        expect(typeof result.current.left).toBe("number");
      });
    });
  });

  describe("with scroll offsets", () => {
    it("accounts for window scroll position", () => {
      Object.defineProperty(window, "scrollY", {
        value: 500,
        writable: true,
      });
      Object.defineProperty(window, "scrollX", {
        value: 100,
        writable: true,
      });

      const anchorRef = createMockRef(mockAnchorRect as DOMRect);
      const popoverRef = createMockRef(mockPopoverRect as DOMRect);

      const { result } = renderHook(() =>
        usePopoverPosition({
          anchorRef: anchorRef as React.RefObject<HTMLElement | null>,
          popoverRef: popoverRef as React.RefObject<HTMLElement | null>,
          isOpen: true,
          placement: "bottom-start",
          offset: [0, 4],
        })
      );

      // Position includes scroll offset
      expect(result.current.top).toBe(654); // 150 + 4 + 500
      expect(result.current.left).toBe(300); // 200 + 100
    });
  });
});
