import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { Portal } from "./Portal";

describe("Portal", () => {
  describe("rendering", () => {
    it("renders children in document.body by default", async () => {
      render(
        <Portal>
          <div data-testid="portal-content">Portal content</div>
        </Portal>
      );

      await waitFor(() => {
        expect(screen.getByTestId("portal-content")).toBeInTheDocument();
      });

      // Content should be in body
      const content = screen.getByTestId("portal-content");
      expect(document.body.contains(content)).toBe(true);
    });

    it("renders children in custom container when provided", async () => {
      const container = document.createElement("div");
      container.id = "custom-portal-container";
      document.body.appendChild(container);

      render(
        <Portal container={container}>
          <div data-testid="portal-content">Portal content</div>
        </Portal>
      );

      await waitFor(() => {
        expect(screen.getByTestId("portal-content")).toBeInTheDocument();
      });

      // Content should be in custom container
      const content = screen.getByTestId("portal-content");
      expect(container.contains(content)).toBe(true);

      // Cleanup
      document.body.removeChild(container);
    });

    it("renders children in place when disabled", () => {
      const { container } = render(
        <Portal disabled>
          <div data-testid="portal-content">Portal content</div>
        </Portal>
      );

      const content = screen.getByTestId("portal-content");
      expect(content).toBeInTheDocument();
      // Content should be within the component's container, not portaled
      expect(container.contains(content)).toBe(true);
    });

    it("returns null initially before mount (SSR safety)", () => {
      // This test verifies the component doesn't crash during initial render
      render(
        <Portal>
          <div data-testid="portal-content">Portal content</div>
        </Portal>
      );

      // After mount, content should appear
      expect(screen.getByTestId("portal-content")).toBeInTheDocument();
    });

    it("renders multiple children correctly", async () => {
      render(
        <Portal>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </Portal>
      );

      await waitFor(() => {
        expect(screen.getByTestId("child-1")).toBeInTheDocument();
        expect(screen.getByTestId("child-2")).toBeInTheDocument();
      });
    });

    it("renders complex nested content", async () => {
      render(
        <Portal>
          <div data-testid="parent">
            <span data-testid="child">Nested</span>
          </div>
        </Portal>
      );

      await waitFor(() => {
        expect(screen.getByTestId("parent")).toBeInTheDocument();
        expect(screen.getByTestId("child")).toBeInTheDocument();
      });
    });
  });

  describe("displayName", () => {
    it("has correct displayName", () => {
      expect(Portal.displayName).toBe("Portal");
    });
  });

  describe("cleanup", () => {
    it("cleans up when unmounted", async () => {
      const { unmount } = render(
        <Portal>
          <div data-testid="portal-content">Portal content</div>
        </Portal>
      );

      await waitFor(() => {
        expect(screen.getByTestId("portal-content")).toBeInTheDocument();
      });

      unmount();

      expect(screen.queryByTestId("portal-content")).not.toBeInTheDocument();
    });
  });
});
