import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";

import { Popover } from "./Popover";

// Test wrapper component to provide anchorRef
function TestWrapper({
  isOpen,
  onClose,
  children,
  ...props
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  usePortal?: boolean;
  autoFocus?: boolean;
}): React.JSX.Element {
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <div>
      <button ref={anchorRef} data-testid="anchor">
        Anchor
      </button>
      <Popover isOpen={isOpen} onClose={onClose} anchorRef={anchorRef} usePortal={false} {...props}>
        {children}
      </Popover>
    </div>
  );
}

describe("Popover", () => {
  describe("rendering", () => {
    it("renders children when open", () => {
      render(
        <TestWrapper isOpen={true} onClose={vi.fn()}>
          <div>Popover content</div>
        </TestWrapper>
      );

      expect(screen.getByText("Popover content")).toBeInTheDocument();
    });

    it("does not render when closed", () => {
      render(
        <TestWrapper isOpen={false} onClose={vi.fn()}>
          <div>Popover content</div>
        </TestWrapper>
      );

      expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
    });

    it("renders as dialog with aria-modal", () => {
      render(
        <TestWrapper isOpen={true} onClose={vi.fn()}>
          <div>Content</div>
        </TestWrapper>
      );

      const popover = screen.getByRole("dialog");
      expect(popover).toHaveAttribute("aria-modal", "true");
    });
  });

  describe("close on click outside", () => {
    it("calls onClose when clicking outside", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <div>
          <div data-testid="outside">Outside</div>
          <TestWrapper isOpen={true} onClose={onClose} closeOnClickOutside={true}>
            <div>Content</div>
          </TestWrapper>
        </div>
      );

      await user.click(screen.getByTestId("outside"));

      expect(onClose).toHaveBeenCalled();
    });

    it("does not close when clicking inside popover", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <TestWrapper isOpen={true} onClose={onClose} closeOnClickOutside={true}>
          <button>Inside button</button>
        </TestWrapper>
      );

      await user.click(screen.getByText("Inside button"));

      expect(onClose).not.toHaveBeenCalled();
    });

    it("does not close when clicking anchor element", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <TestWrapper isOpen={true} onClose={onClose} closeOnClickOutside={true}>
          <div>Content</div>
        </TestWrapper>
      );

      await user.click(screen.getByTestId("anchor"));

      expect(onClose).not.toHaveBeenCalled();
    });

    it("does not call onClose when closeOnClickOutside is false", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <div>
          <div data-testid="outside">Outside</div>
          <TestWrapper isOpen={true} onClose={onClose} closeOnClickOutside={false}>
            <div>Content</div>
          </TestWrapper>
        </div>
      );

      await user.click(screen.getByTestId("outside"));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("close on escape", () => {
    it("calls onClose when pressing Escape", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <TestWrapper isOpen={true} onClose={onClose} closeOnEscape={true}>
          <div>Content</div>
        </TestWrapper>
      );

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalled();
    });

    it("does not call onClose when closeOnEscape is false", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <TestWrapper isOpen={true} onClose={onClose} closeOnEscape={false}>
          <div>Content</div>
        </TestWrapper>
      );

      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
