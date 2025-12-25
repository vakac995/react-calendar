import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn (className utility)", () => {
  describe("basic functionality", () => {
    it("should return empty string when called with no arguments", () => {
      expect(cn()).toBe("");
    });

    it("should return a single class unchanged", () => {
      expect(cn("foo")).toBe("foo");
    });

    it("should join multiple classes with a space", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should join many classes with spaces", () => {
      expect(cn("a", "b", "c", "d", "e")).toBe("a b c d e");
    });
  });

  describe("falsy value filtering", () => {
    it("should filter out undefined values", () => {
      expect(cn("foo", undefined, "bar")).toBe("foo bar");
    });

    it("should filter out null values", () => {
      expect(cn("foo", null, "bar")).toBe("foo bar");
    });

    it("should filter out false values", () => {
      expect(cn("foo", false, "bar")).toBe("foo bar");
    });

    it("should filter out all falsy types together", () => {
      expect(cn(undefined, "foo", null, "bar", false, "baz")).toBe("foo bar baz");
    });

    it("should return empty string when all values are undefined", () => {
      expect(cn(undefined, undefined, undefined)).toBe("");
    });

    it("should return empty string when all values are null", () => {
      expect(cn(null, null, null)).toBe("");
    });

    it("should return empty string when all values are false", () => {
      expect(cn(false, false, false)).toBe("");
    });

    it("should return empty string when mixed falsy values only", () => {
      expect(cn(undefined, null, false, undefined, null, false)).toBe("");
    });
  });

  describe("conditional class patterns", () => {
    it("should work with ternary operator pattern", () => {
      const isActive = true;
      expect(cn("base", isActive ? "active" : undefined)).toBe("base active");
    });

    it("should work with ternary operator returning false", () => {
      const isActive = false;
      expect(cn("base", isActive ? "active" : undefined)).toBe("base");
    });

    it("should work with && operator pattern (truthy)", () => {
      const show = true;
      expect(cn("base", show && "visible")).toBe("base visible");
    });

    it("should work with && operator pattern (falsy)", () => {
      const show = false;
      expect(cn("base", show && "visible")).toBe("base");
    });

    it("should handle multiple conditional classes", () => {
      const isActive = true;
      const isDisabled = false;
      const isHovered = true;

      expect(
        cn(
          "btn",
          isActive && "btn-active",
          isDisabled && "btn-disabled",
          isHovered && "btn-hovered"
        )
      ).toBe("btn btn-active btn-hovered");
    });
  });

  describe("edge cases with strings", () => {
    it("should handle empty string (treated as falsy by filter)", () => {
      // Empty string is falsy, so it should be filtered out
      expect(cn("foo", "" as unknown as string, "bar")).toBe("foo bar");
    });

    it("should preserve whitespace within class names", () => {
      // Though unusual, if someone passes a string with spaces, it's preserved
      expect(cn("foo bar", "baz")).toBe("foo bar baz");
    });

    it("should handle class names with special characters", () => {
      expect(cn("hover:bg-blue-500", "focus:ring-2")).toBe("hover:bg-blue-500 focus:ring-2");
    });

    it("should handle Tailwind-style negative values", () => {
      expect(cn("-mt-4", "-translate-x-1/2")).toBe("-mt-4 -translate-x-1/2");
    });

    it("should handle BEM-style class names", () => {
      expect(cn("block__element", "block__element--modifier")).toBe(
        "block__element block__element--modifier"
      );
    });

    it("should handle CSS module style class names", () => {
      expect(cn("styles_button_abc123", "styles_primary_def456")).toBe(
        "styles_button_abc123 styles_primary_def456"
      );
    });

    it("should handle numeric-looking class names", () => {
      expect(cn("w-1", "h-2", "p-3", "m-4")).toBe("w-1 h-2 p-3 m-4");
    });
  });

  describe("real-world usage patterns", () => {
    it("should handle typical component class composition", () => {
      const baseClasses = "px-4 py-2 rounded";
      const variantClasses = "bg-blue-500 text-white";
      const sizeClasses = "text-sm";

      expect(cn(baseClasses, variantClasses, sizeClasses)).toBe(
        "px-4 py-2 rounded bg-blue-500 text-white text-sm"
      );
    });

    it("should handle calendar cell styling pattern", () => {
      const isToday = true;
      const isSelected = false;
      const isDisabled = false;
      const isOutsideMonth = true;

      expect(
        cn(
          "calendar-cell",
          isToday && "calendar-cell--today",
          isSelected && "calendar-cell--selected",
          isDisabled && "calendar-cell--disabled",
          isOutsideMonth && "calendar-cell--outside"
        )
      ).toBe("calendar-cell calendar-cell--today calendar-cell--outside");
    });

    it("should handle button with multiple states", () => {
      const variant = "primary";
      const size = "md";
      const isLoading = false;
      const isFullWidth = true;

      expect(
        cn(
          "btn",
          `btn-${variant}`,
          `btn-${size}`,
          isLoading && "btn-loading",
          isFullWidth && "w-full"
        )
      ).toBe("btn btn-primary btn-md w-full");
    });

    it("should handle time picker slot styling", () => {
      const hour = 14;
      const isSelected = hour === 14;
      const isDisabled = hour < 9 || hour > 17;

      expect(
        cn("time-slot", isSelected && "time-slot--selected", isDisabled && "time-slot--disabled")
      ).toBe("time-slot time-slot--selected");
    });
  });

  describe("order preservation", () => {
    it("should preserve the order of classes", () => {
      expect(cn("first", "second", "third")).toBe("first second third");
    });

    it("should preserve order after filtering falsy values", () => {
      expect(cn("first", undefined, "second", false, "third", null)).toBe("first second third");
    });

    it("should maintain CSS specificity order", () => {
      // Later classes should override earlier ones in CSS
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-red-500 bg-blue-500");
    });
  });

  describe("type safety scenarios", () => {
    it("should handle explicit undefined type", () => {
      const maybeClass: string | undefined = undefined;
      expect(cn("base", maybeClass)).toBe("base");
    });

    it("should handle explicit null type", () => {
      const maybeClass: string | null = null;
      expect(cn("base", maybeClass)).toBe("base");
    });

    it("should handle union type that resolves to string", () => {
      const maybeClass: string | undefined = "resolved";
      expect(cn("base", maybeClass)).toBe("base resolved");
    });

    it("should handle function returning conditional class", () => {
      const getClass = (condition: boolean): string | undefined =>
        condition ? "active" : undefined;
      expect(cn("base", getClass(true), getClass(false))).toBe("base active");
    });
  });

  describe("performance edge cases", () => {
    it("should handle a large number of classes", () => {
      const manyClasses = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const result = cn(...manyClasses);
      expect(result.split(" ")).toHaveLength(100);
      expect(result).toContain("class-0");
      expect(result).toContain("class-99");
    });

    it("should handle many falsy values efficiently", () => {
      const manyFalsy = Array.from({ length: 100 }, () => undefined);
      expect(cn(...manyFalsy)).toBe("");
    });

    it("should handle alternating truthy and falsy values", () => {
      const alternating = Array.from({ length: 20 }, (_, i) =>
        i % 2 === 0 ? `class-${i}` : undefined
      );
      const result = cn(...alternating);
      expect(result.split(" ")).toHaveLength(10);
    });
  });

  describe("return type verification", () => {
    it("should always return a string type", () => {
      expect(typeof cn()).toBe("string");
      expect(typeof cn("foo")).toBe("string");
      expect(typeof cn(undefined)).toBe("string");
      expect(typeof cn(null, false, undefined)).toBe("string");
    });

    it("should never return undefined or null", () => {
      expect(cn()).not.toBeUndefined();
      expect(cn()).not.toBeNull();
      expect(cn(undefined, null, false)).not.toBeUndefined();
      expect(cn(undefined, null, false)).not.toBeNull();
    });
  });
});
