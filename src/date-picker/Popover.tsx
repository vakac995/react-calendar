import { useRef, useEffect, useCallback, type KeyboardEvent } from "react";

import type { PopoverProps } from "../types/date-picker.types";
import { Portal } from "./Portal";
import { useClickOutside, usePopoverPosition } from "../hooks";

// Default class names
const defaultClassNames = {
  root: "absolute bg-white rounded-lg shadow-lg border border-gray-200",
  content: "p-0",
  arrow: "",
};

/**
 * Popover component for floating content anchored to a reference element
 */
export function Popover({
  children,
  isOpen,
  onClose,
  anchorRef,
  placement = "bottom-start",
  offset = [0, 4],
  closeOnClickOutside = true,
  closeOnEscape = true,
  usePortal = true,
  portalContainer,
  zIndex = 1000,
  classNames,
  autoFocus = false,
  restoreFocus = true,
  animationDuration = 150,
}: PopoverProps): React.ReactElement | null {
  const popoverRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Calculate position
  const position = usePopoverPosition({
    anchorRef,
    popoverRef,
    placement,
    offset,
    isOpen,
    autoFlip: true,
  });

  // Handle click outside
  useClickOutside(
    popoverRef,
    (event) => {
      // Don't close if clicking on the anchor element
      if (anchorRef.current?.contains(event.target as Node)) {
        return;
      }
      onClose();
    },
    isOpen && closeOnClickOutside
  );

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Store previous active element and handle focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      if (autoFocus && popoverRef.current) {
        // Focus the popover or first focusable element
        const focusable = popoverRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) {
          focusable.focus();
        } else {
          popoverRef.current.focus();
        }
      }
    } else if (restoreFocus && previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen, autoFocus, restoreFocus]);

  // Add global escape key listener
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const popoverContent = (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={popoverRef}
      className={classNames?.root ?? defaultClassNames.root}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex,
        transition: `opacity ${animationDuration}ms ease-in-out`,
      }}
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown as unknown as React.KeyboardEventHandler<HTMLDivElement>}
      tabIndex={-1}
    >
      <div className={classNames?.content ?? defaultClassNames.content}>{children}</div>
    </div>
  );

  if (usePortal) {
    return <Portal container={portalContainer}>{popoverContent}</Portal>;
  }

  return popoverContent;
}

Popover.displayName = "Popover";
