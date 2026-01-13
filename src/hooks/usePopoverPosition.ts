import { useState, useCallback, useEffect, useLayoutEffect, type RefObject } from "react";

import type { PopoverPlacement } from "../types/date-picker.types";

/**
 * Position coordinates for the popover
 */
export interface PopoverPosition {
  top: number;
  left: number;
  placement: PopoverPlacement;
}

/**
 * Options for the popover position hook
 */
export interface UsePopoverPositionOptions {
  /**
   * Reference to the anchor element
   */
  anchorRef: RefObject<HTMLElement | null>;
  /**
   * Reference to the popover element
   */
  popoverRef: RefObject<HTMLElement | null>;
  /**
   * Preferred placement
   */
  placement?: PopoverPlacement;
  /**
   * Offset from anchor [x, y]
   */
  offset?: [number, number];
  /**
   * Whether the popover is open
   */
  isOpen: boolean;
  /**
   * Whether to auto-flip if not enough space
   */
  autoFlip?: boolean;
}

/**
 * Get the opposite placement (for auto-flip)
 */
function getOppositePlacement(placement: PopoverPlacement): PopoverPlacement {
  const opposites: Record<PopoverPlacement, PopoverPlacement> = {
    top: "bottom",
    "top-start": "bottom-start",
    "top-end": "bottom-end",
    bottom: "top",
    "bottom-start": "top-start",
    "bottom-end": "top-end",
    left: "right",
    "left-start": "right-start",
    "left-end": "right-end",
    right: "left",
    "right-start": "left-start",
    "right-end": "left-end",
  };
  return opposites[placement];
}

/**
 * Calculate position based on placement
 */
function calculatePosition(
  anchorRect: DOMRect,
  popoverRect: DOMRect,
  placement: PopoverPlacement,
  offset: [number, number]
): { top: number; left: number } {
  const [offsetX, offsetY] = offset;

  let top = 0;
  let left = 0;

  // Vertical positioning
  if (placement.startsWith("top")) {
    top = anchorRect.top - popoverRect.height - offsetY;
  } else if (placement.startsWith("bottom")) {
    top = anchorRect.bottom + offsetY;
  } else if (placement.startsWith("left") || placement.startsWith("right")) {
    if (placement.includes("-start")) {
      top = anchorRect.top;
    } else if (placement.includes("-end")) {
      top = anchorRect.bottom - popoverRect.height;
    } else {
      top = anchorRect.top + (anchorRect.height - popoverRect.height) / 2;
    }
  }

  // Horizontal positioning
  if (placement.startsWith("left")) {
    left = anchorRect.left - popoverRect.width - offsetX;
  } else if (placement.startsWith("right")) {
    left = anchorRect.right + offsetX;
  } else if (placement.startsWith("top") || placement.startsWith("bottom")) {
    if (placement.includes("-start")) {
      left = anchorRect.left + offsetX;
    } else if (placement.includes("-end")) {
      left = anchorRect.right - popoverRect.width - offsetX;
    } else {
      left = anchorRect.left + (anchorRect.width - popoverRect.width) / 2 + offsetX;
    }
  }

  // Add scroll offset for fixed positioning
  top += window.scrollY;
  left += window.scrollX;

  return { top, left };
}

/**
 * Check if position is within viewport
 */
function isInViewport(top: number, left: number, popoverRect: DOMRect): boolean {
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const viewportTop = scrollY;
  const viewportLeft = scrollX;
  const viewportBottom = scrollY + window.innerHeight;
  const viewportRight = scrollX + window.innerWidth;

  return (
    top >= viewportTop &&
    left >= viewportLeft &&
    top + popoverRect.height <= viewportBottom &&
    left + popoverRect.width <= viewportRight
  );
}

/**
 * Hook to calculate and update popover position
 */
export function usePopoverPosition({
  anchorRef,
  popoverRef,
  placement = "bottom-start",
  offset = [0, 4],
  isOpen,
  autoFlip = true,
}: UsePopoverPositionOptions): PopoverPosition {
  const [position, setPosition] = useState<PopoverPosition>({
    top: 0,
    left: 0,
    placement,
  });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const popover = popoverRef.current;

    if (!anchor || !popover) {
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    // Calculate initial position
    let { top, left } = calculatePosition(anchorRect, popoverRect, placement, offset);
    let finalPlacement = placement;

    // Auto-flip if not in viewport
    if (autoFlip && !isInViewport(top, left, popoverRect)) {
      const oppositePlacement = getOppositePlacement(placement);
      const oppositePos = calculatePosition(anchorRect, popoverRect, oppositePlacement, offset);

      // Check if opposite position is better
      if (isInViewport(oppositePos.top, oppositePos.left, popoverRect)) {
        top = oppositePos.top;
        left = oppositePos.left;
        finalPlacement = oppositePlacement;
      }
    }

    // Ensure popover stays within viewport bounds
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Clamp to viewport
    top = Math.max(scrollY, Math.min(top, scrollY + window.innerHeight - popoverRect.height));
    left = Math.max(scrollX, Math.min(left, scrollX + window.innerWidth - popoverRect.width));

    // Only update if position changed to avoid infinite loops
    setPosition((prev) => {
      if (prev.top === top && prev.left === left && prev.placement === finalPlacement) {
        return prev;
      }
      return { top, left, placement: finalPlacement };
    });
  }, [anchorRef, popoverRef, placement, offset, autoFlip]);

  // Use layout effect for initial positioning to avoid flicker
  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    // Initial update
    updatePosition();

    // Schedule another update after the popover is rendered
    // This handles the case where popoverRef isn't available yet on first open
    const rafId = requestAnimationFrame(() => {
      updatePosition();
    });

    return () => cancelAnimationFrame(rafId);
  }, [isOpen, updatePosition]);

  // Update on scroll/resize
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleUpdate = (): void => {
      updatePosition();
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, updatePosition]);

  return position;
}
