import { describe, it, expect } from "vitest";
import { defaultClassNames, mergeClassNames, extendClassNames } from "./defaultClassNames";
import type { CalendarClassNames } from "../types";

describe("defaultClassNames", () => {
  describe("structure", () => {
    it("should export a valid CalendarClassNames object", () => {
      expect(defaultClassNames).toBeDefined();
      expect(typeof defaultClassNames).toBe("object");
    });

    it("should have all root-level keys defined", () => {
      expect(defaultClassNames.root).toBeDefined();
      expect(defaultClassNames.rootDisabled).toBeDefined();
      expect(defaultClassNames.rootDefaultLayout).toBeDefined();
      expect(defaultClassNames.rootSideLayout).toBeDefined();
      expect(defaultClassNames.calendarWrapper).toBeDefined();
      expect(defaultClassNames.calendarWrapperDisabled).toBeDefined();
    });

    it("should have all header keys defined", () => {
      expect(defaultClassNames.header).toBeDefined();
      expect(defaultClassNames.headerDisabled).toBeDefined();
      expect(defaultClassNames.headerNavigation).toBeDefined();
      expect(defaultClassNames.headerNavigationButton).toBeDefined();
      expect(defaultClassNames.headerNavigationButtonDisabled).toBeDefined();
      expect(defaultClassNames.headerTitle).toBeDefined();
      expect(defaultClassNames.headerMonthSelect).toBeDefined();
      expect(defaultClassNames.headerMonthSelectDisabled).toBeDefined();
      expect(defaultClassNames.headerYearSelect).toBeDefined();
      expect(defaultClassNames.headerYearSelectDisabled).toBeDefined();
    });

    it("should have all day cell keys defined", () => {
      expect(defaultClassNames.day).toBeDefined();
      expect(defaultClassNames.dayButton).toBeDefined();
      expect(defaultClassNames.dayToday).toBeDefined();
      expect(defaultClassNames.daySelected).toBeDefined();
      expect(defaultClassNames.dayInRange).toBeDefined();
      expect(defaultClassNames.dayRangeStart).toBeDefined();
      expect(defaultClassNames.dayRangeEnd).toBeDefined();
      expect(defaultClassNames.dayDisabled).toBeDefined();
      expect(defaultClassNames.dayOutsideMonth).toBeDefined();
      expect(defaultClassNames.dayWeekend).toBeDefined();
    });

    it("should have all range background keys defined", () => {
      expect(defaultClassNames.dayRangeBackground).toBeDefined();
      expect(defaultClassNames.dayRangeBackgroundStart).toBeDefined();
      expect(defaultClassNames.dayRangeBackgroundEnd).toBeDefined();
      expect(defaultClassNames.dayRangeBackgroundMiddle).toBeDefined();
      expect(defaultClassNames.dayRangeBackgroundFirstOfWeek).toBeDefined();
      expect(defaultClassNames.dayRangeBackgroundLastOfWeek).toBeDefined();
    });

    it("should have all week number keys defined", () => {
      expect(defaultClassNames.weekNumberPlaceholder).toBeDefined();
      expect(defaultClassNames.weekNumber).toBeDefined();
      expect(defaultClassNames.weekNumberDisabled).toBeDefined();
      expect(defaultClassNames.weekNumberCell).toBeDefined();
    });

    it("should have all collapsible time picker keys defined", () => {
      expect(defaultClassNames.timePickerCollapsed).toBeDefined();
      expect(defaultClassNames.timePickerCollapsedDisabled).toBeDefined();
      expect(defaultClassNames.timePickerToggle).toBeDefined();
      expect(defaultClassNames.timePickerToggleDisabled).toBeDefined();
      expect(defaultClassNames.timePickerToggleText).toBeDefined();
      expect(defaultClassNames.timePickerToggleTextDisabled).toBeDefined();
      expect(defaultClassNames.timePickerToggleIcon).toBeDefined();
      expect(defaultClassNames.timePickerToggleIconDisabled).toBeDefined();
    });

    it("should have all time picker keys defined", () => {
      expect(defaultClassNames.timePickerWrapper).toBeDefined();
      expect(defaultClassNames.timePickerWrapperTop).toBeDefined();
      expect(defaultClassNames.timePickerWrapperBottom).toBeDefined();
      expect(defaultClassNames.timePickerWrapperSide).toBeDefined();
      expect(defaultClassNames.timeContainer).toBeDefined();
      expect(defaultClassNames.timeContainerDisabled).toBeDefined();
      expect(defaultClassNames.timeLabel).toBeDefined();
      expect(defaultClassNames.timeLabelDisabled).toBeDefined();
      expect(defaultClassNames.timeSelectors).toBeDefined();
      expect(defaultClassNames.timeSelectorsDisabled).toBeDefined();
      expect(defaultClassNames.timeSelector).toBeDefined();
      expect(defaultClassNames.timeSelectorDisabled).toBeDefined();
      expect(defaultClassNames.timeSelectorLabel).toBeDefined();
      expect(defaultClassNames.timeSelectorLabelDisabled).toBeDefined();
      expect(defaultClassNames.timeSelectorScroll).toBeDefined();
      expect(defaultClassNames.timeSelectorScrollDisabled).toBeDefined();
      expect(defaultClassNames.timeSelectorItem).toBeDefined();
      expect(defaultClassNames.timeSelectorItemSelected).toBeDefined();
      expect(defaultClassNames.timeSelectorItemDisabled).toBeDefined();
      expect(defaultClassNames.timeSeparator).toBeDefined();
      expect(defaultClassNames.timeSeparatorDisabled).toBeDefined();
    });

    it("should have all values as strings", () => {
      for (const [_key, value] of Object.entries(defaultClassNames)) {
        expect(typeof value).toBe("string");
      }
    });

    it("should not have undefined or null values", () => {
      for (const [_key, value] of Object.entries(defaultClassNames)) {
        expect(value).not.toBeNull();
        expect(value).not.toBeUndefined();
      }
    });
  });

  describe("content validation", () => {
    it("should have Tailwind classes in root", () => {
      expect(defaultClassNames.root).toContain("bg-white");
      expect(defaultClassNames.root).toContain("rounded");
    });

    it("should have proper disabled styling", () => {
      expect(defaultClassNames.dayDisabled).toContain("cursor-not-allowed");
      expect(defaultClassNames.dayDisabled).toContain("opacity");
    });

    it("should have focus ring classes for accessibility", () => {
      expect(defaultClassNames.dayButton).toContain("focus:");
    });
  });
});

describe("mergeClassNames", () => {
  describe("basic functionality", () => {
    it("should return base when custom is empty", () => {
      const result = mergeClassNames(defaultClassNames, {});
      expect(result).toEqual(defaultClassNames);
    });

    it("should replace a single key", () => {
      const custom: CalendarClassNames = {
        root: "my-custom-root",
      };
      const result = mergeClassNames(defaultClassNames, custom);

      expect(result.root).toBe("my-custom-root");
      // Other keys should remain unchanged
      expect(result.header).toBe(defaultClassNames.header);
    });

    it("should replace multiple keys", () => {
      const custom: CalendarClassNames = {
        root: "custom-root",
        header: "custom-header",
        dayButton: "custom-day-button",
      };
      const result = mergeClassNames(defaultClassNames, custom);

      expect(result.root).toBe("custom-root");
      expect(result.header).toBe("custom-header");
      expect(result.dayButton).toBe("custom-day-button");
    });

    it("should completely replace, not append", () => {
      const custom: CalendarClassNames = {
        root: "single-class",
      };
      const result = mergeClassNames(defaultClassNames, custom);

      expect(result.root).toBe("single-class");
      expect(result.root).not.toContain("bg-white");
      expect(result.root).not.toContain("rounded");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string as custom value", () => {
      const custom: CalendarClassNames = {
        root: "",
      };
      const result = mergeClassNames(defaultClassNames, custom);

      expect(result.root).toBe("");
    });

    it("should handle undefined values in custom (should not replace)", () => {
      const custom: CalendarClassNames = {
        root: undefined,
      };
      const result = mergeClassNames(defaultClassNames, custom);

      expect(result.root).toBe(defaultClassNames.root);
    });

    it("should not mutate the base object", () => {
      const baseCopy = { ...defaultClassNames };
      const custom: CalendarClassNames = {
        root: "mutated",
      };
      mergeClassNames(defaultClassNames, custom);

      expect(defaultClassNames.root).toBe(baseCopy.root);
    });

    it("should not mutate the custom object", () => {
      const custom: CalendarClassNames = {
        root: "custom-value",
      };
      const customCopy = { ...custom };
      mergeClassNames(defaultClassNames, custom);

      expect(custom.root).toBe(customCopy.root);
    });

    it("should work with all keys overridden", () => {
      const allCustom: CalendarClassNames = {};
      for (const key of Object.keys(defaultClassNames) as (keyof CalendarClassNames)[]) {
        allCustom[key] = `custom-${key}`;
      }

      const result = mergeClassNames(defaultClassNames, allCustom);

      for (const key of Object.keys(defaultClassNames) as (keyof CalendarClassNames)[]) {
        expect(result[key]).toBe(`custom-${key}`);
      }
    });

    it("should handle base with empty values", () => {
      const emptyBase: CalendarClassNames = {
        root: "",
        header: "",
      };
      const custom: CalendarClassNames = {
        root: "filled",
      };
      const result = mergeClassNames(emptyBase, custom);

      expect(result.root).toBe("filled");
      expect(result.header).toBe("");
    });

    it("should handle whitespace-only strings", () => {
      const custom: CalendarClassNames = {
        root: "   ",
      };
      const result = mergeClassNames(defaultClassNames, custom);

      expect(result.root).toBe("   ");
    });

    it("should handle special characters in class names", () => {
      const custom: CalendarClassNames = {
        root: "class-with-[brackets] hover:bg-[#fff]",
      };
      const result = mergeClassNames(defaultClassNames, custom);

      expect(result.root).toBe("class-with-[brackets] hover:bg-[#fff]");
    });
  });

  describe("chaining", () => {
    it("should support chaining multiple merges", () => {
      const first: CalendarClassNames = { root: "first" };
      const second: CalendarClassNames = { header: "second" };
      const third: CalendarClassNames = { dayButton: "third" };

      const result = mergeClassNames(
        mergeClassNames(mergeClassNames(defaultClassNames, first), second),
        third
      );

      expect(result.root).toBe("first");
      expect(result.header).toBe("second");
      expect(result.dayButton).toBe("third");
    });

    it("should allow later merges to override earlier ones", () => {
      const first: CalendarClassNames = { root: "first" };
      const second: CalendarClassNames = { root: "second" };

      const result = mergeClassNames(mergeClassNames(defaultClassNames, first), second);

      expect(result.root).toBe("second");
    });
  });
});

describe("extendClassNames", () => {
  describe("basic functionality", () => {
    it("should return base when custom is empty", () => {
      const result = extendClassNames(defaultClassNames, {});
      expect(result).toEqual(defaultClassNames);
    });

    it("should append a single key", () => {
      const custom: CalendarClassNames = {
        root: "extra-class",
      };
      const result = extendClassNames(defaultClassNames, custom);

      expect(result.root).toBe(`${defaultClassNames.root} extra-class`);
    });

    it("should append multiple keys", () => {
      const custom: CalendarClassNames = {
        root: "extra-root",
        header: "extra-header",
      };
      const result = extendClassNames(defaultClassNames, custom);

      expect(result.root).toBe(`${defaultClassNames.root} extra-root`);
      expect(result.header).toBe(`${defaultClassNames.header} extra-header`);
    });

    it("should preserve all original classes", () => {
      const custom: CalendarClassNames = {
        root: "added",
      };
      const result = extendClassNames(defaultClassNames, custom);

      expect(result.root).toContain("bg-white");
      expect(result.root).toContain("rounded");
      expect(result.root).toContain("added");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string as custom value (no change)", () => {
      const custom: CalendarClassNames = {
        root: "",
      };
      const result = extendClassNames(defaultClassNames, custom);

      // Empty string is falsy, so it should not append
      expect(result.root).toBe(defaultClassNames.root);
    });

    it("should handle undefined values in custom", () => {
      const custom: CalendarClassNames = {
        root: undefined,
      };
      const result = extendClassNames(defaultClassNames, custom);

      expect(result.root).toBe(defaultClassNames.root);
    });

    it("should not mutate the base object", () => {
      const baseCopy = { ...defaultClassNames };
      const custom: CalendarClassNames = {
        root: "mutated",
      };
      extendClassNames(defaultClassNames, custom);

      expect(defaultClassNames.root).toBe(baseCopy.root);
    });

    it("should handle base with empty values", () => {
      const emptyBase: CalendarClassNames = {
        root: "",
        header: "",
      };
      const custom: CalendarClassNames = {
        root: "filled",
      };
      const result = extendClassNames(emptyBase, custom);

      // When base is empty, should just use custom
      expect(result.root).toBe("filled");
    });

    it("should handle whitespace properly", () => {
      const custom: CalendarClassNames = {
        root: "class1 class2",
      };
      const result = extendClassNames(defaultClassNames, custom);

      expect(result.root).toBe(`${defaultClassNames.root} class1 class2`);
    });

    it("should handle special Tailwind arbitrary values", () => {
      const custom: CalendarClassNames = {
        root: "bg-[#123456] w-[calc(100%-20px)]",
      };
      const result = extendClassNames(defaultClassNames, custom);

      expect(result.root).toContain("bg-[#123456]");
      expect(result.root).toContain("w-[calc(100%-20px)]");
    });
  });

  describe("chaining", () => {
    it("should support chaining multiple extends", () => {
      const first: CalendarClassNames = { root: "first" };
      const second: CalendarClassNames = { root: "second" };

      const result = extendClassNames(extendClassNames(defaultClassNames, first), second);

      expect(result.root).toContain(defaultClassNames.root);
      expect(result.root).toContain("first");
      expect(result.root).toContain("second");
    });

    it("should accumulate classes across chains", () => {
      const first: CalendarClassNames = { root: "a" };
      const second: CalendarClassNames = { root: "b" };
      const third: CalendarClassNames = { root: "c" };

      const result = extendClassNames(
        extendClassNames(extendClassNames(defaultClassNames, first), second),
        third
      );

      expect(result.root).toBe(`${defaultClassNames.root} a b c`);
    });
  });

  describe("comparison with mergeClassNames", () => {
    it("should behave differently than merge", () => {
      const custom: CalendarClassNames = { root: "custom" };

      const merged = mergeClassNames(defaultClassNames, custom);
      const extended = extendClassNames(defaultClassNames, custom);

      // Merge replaces
      expect(merged.root).toBe("custom");
      // Extend appends
      expect(extended.root).toBe(`${defaultClassNames.root} custom`);
    });
  });
});

describe("integration scenarios", () => {
  it("should support theming with merge", () => {
    const darkTheme: CalendarClassNames = {
      root: "bg-gray-900 text-white rounded-lg shadow-lg p-4",
      header: "flex items-center justify-between mb-4 text-gray-100",
      dayButton:
        "w-9 h-9 rounded-full flex items-center justify-center text-sm text-gray-300 hover:bg-gray-700",
      daySelected: "bg-blue-600 text-white",
    };

    const result = mergeClassNames(defaultClassNames, darkTheme);

    expect(result.root).toContain("bg-gray-900");
    expect(result.root).not.toContain("bg-white");
  });

  it("should support adding utility classes with extend", () => {
    const utilities: CalendarClassNames = {
      root: "print:hidden",
      dayButton: "transition-transform hover:scale-105",
    };

    const result = extendClassNames(defaultClassNames, utilities);

    expect(result.root).toContain("print:hidden");
    expect(result.root).toContain("bg-white");
    expect(result.dayButton).toContain("transition-transform");
    expect(result.dayButton).toContain("hover:scale-105");
  });

  it("should support combining merge and extend", () => {
    // First, replace base styling
    const theme: CalendarClassNames = {
      root: "bg-dark",
    };
    const themed = mergeClassNames(defaultClassNames, theme);

    // Then, add utilities
    const utils: CalendarClassNames = {
      root: "print:hidden",
    };
    const result = extendClassNames(themed, utils);

    expect(result.root).toBe("bg-dark print:hidden");
  });
});
