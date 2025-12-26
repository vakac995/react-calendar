import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Custom render function that includes userEvent setup
 * Use this instead of the default render from @testing-library/react
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): ReturnType<typeof render> & { user: ReturnType<typeof userEvent.setup> } {
  return {
    user: userEvent.setup(),
    ...render(ui, { ...options }),
  };
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render with custom render
export { customRender as render };

// Export userEvent for direct usage
export { userEvent };

/**
 * Helper to create a mock date for testing
 */
export function createMockDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Helper to format date for comparison in tests
 */
export function formatTestDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Helper to wait for all pending timers/promises
 */
export async function waitForAnimations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Helper to query an element and return it as HTMLElement for use with within()
 * Throws if element is not found
 */
export function queryAsHtmlElement(container: Element | Document, selector: string): HTMLElement {
  const element = container.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element as HTMLElement;
}
