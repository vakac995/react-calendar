import { describe, it, expect } from "vitest";

describe("Test Setup", () => {
  it("should work with vitest", () => {
    expect(true).toBe(true);
  });

  it("should have frozen time", () => {
    const now = new Date();
    expect(now.toISOString()).toBe("2025-01-15T12:00:00.000Z");
  });
});
