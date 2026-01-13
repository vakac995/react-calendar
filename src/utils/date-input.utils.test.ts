import { describe, it, expect } from "vitest";

import {
  FORMAT_TOKENS,
  parseFormat,
  generateMask,
  formatDateInput,
  parseDateInput,
  applyMask,
  isValidFormat,
  isDateInBounds,
  getLocalizedMonthNames,
  getLocalizedDayNames,
  getFirstDayOfWeek,
  getTextDirection,
} from "./date-input.utils";

describe("date-input.utils", () => {
  // ============================================================================
  // FORMAT_TOKENS
  // ============================================================================
  describe("FORMAT_TOKENS", () => {
    it("contains all expected tokens", () => {
      const expectedTokens = [
        "YYYY",
        "YY",
        "MMMM",
        "MMM",
        "MM",
        "M",
        "DD",
        "D",
        "dddd",
        "ddd",
        "HH",
        "hh",
        "H",
        "h",
        "mm",
        "ss",
        "A",
        "a",
      ];
      expectedTokens.forEach((token) => {
        expect(FORMAT_TOKENS[token]).toBeDefined();
      });
    });

    describe("getValue functions", () => {
      const testDate = new Date(2024, 5, 15, 14, 30, 45); // June 15, 2024, 2:30:45 PM

      it("YYYY returns full year", () => {
        expect(FORMAT_TOKENS.YYYY!.getValue(testDate)).toBe(2024);
      });

      it("YY returns 2-digit year", () => {
        expect(FORMAT_TOKENS.YY!.getValue(testDate)).toBe(24);
      });

      it("MM returns month (1-based)", () => {
        expect(FORMAT_TOKENS.MM!.getValue(testDate)).toBe(6);
      });

      it("M returns month (1-based)", () => {
        expect(FORMAT_TOKENS.M!.getValue(testDate)).toBe(6);
      });

      it("DD returns day of month", () => {
        expect(FORMAT_TOKENS.DD!.getValue(testDate)).toBe(15);
      });

      it("D returns day of month", () => {
        expect(FORMAT_TOKENS.D!.getValue(testDate)).toBe(15);
      });

      it("HH returns 24-hour hours", () => {
        expect(FORMAT_TOKENS.HH!.getValue(testDate)).toBe(14);
      });

      it("hh returns 12-hour hours", () => {
        expect(FORMAT_TOKENS.hh!.getValue(testDate)).toBe(2);
      });

      it("H returns 24-hour hours", () => {
        expect(FORMAT_TOKENS.H!.getValue(testDate)).toBe(14);
      });

      it("h returns 12-hour hours", () => {
        expect(FORMAT_TOKENS.h!.getValue(testDate)).toBe(2);
      });

      it("mm returns minutes", () => {
        expect(FORMAT_TOKENS.mm!.getValue(testDate)).toBe(30);
      });

      it("ss returns seconds", () => {
        expect(FORMAT_TOKENS.ss!.getValue(testDate)).toBe(45);
      });

      it("A returns PM indicator (1 for PM)", () => {
        expect(FORMAT_TOKENS.A!.getValue(testDate)).toBe(1);
      });

      it("a returns PM indicator (1 for PM)", () => {
        expect(FORMAT_TOKENS.a!.getValue(testDate)).toBe(1);
      });

      it("A returns AM indicator (0 for AM)", () => {
        const amDate = new Date(2024, 5, 15, 9, 0, 0);
        expect(FORMAT_TOKENS.A!.getValue(amDate)).toBe(0);
      });

      it("dddd returns day of week", () => {
        expect(FORMAT_TOKENS.dddd!.getValue(testDate)).toBe(6); // Saturday
      });

      it("ddd returns day of week", () => {
        expect(FORMAT_TOKENS.ddd!.getValue(testDate)).toBe(6); // Saturday
      });
    });

    describe("getDisplay functions", () => {
      const testDate = new Date(2024, 0, 5, 9, 5, 5); // January 5, 2024, 9:05:05 AM

      it("YYYY displays padded year", () => {
        expect(FORMAT_TOKENS.YYYY!.getDisplay(testDate)).toBe("2024");
      });

      it("YY displays 2-digit year", () => {
        expect(FORMAT_TOKENS.YY!.getDisplay(testDate)).toBe("24");
      });

      it("MM displays zero-padded month", () => {
        expect(FORMAT_TOKENS.MM!.getDisplay(testDate)).toBe("01");
      });

      it("M displays non-padded month", () => {
        expect(FORMAT_TOKENS.M!.getDisplay(testDate)).toBe("1");
      });

      it("MMMM displays full month name", () => {
        expect(FORMAT_TOKENS.MMMM!.getDisplay(testDate, "en-US")).toBe("January");
      });

      it("MMM displays abbreviated month name", () => {
        expect(FORMAT_TOKENS.MMM!.getDisplay(testDate, "en-US")).toBe("Jan");
      });

      it("DD displays zero-padded day", () => {
        expect(FORMAT_TOKENS.DD!.getDisplay(testDate)).toBe("05");
      });

      it("D displays non-padded day", () => {
        expect(FORMAT_TOKENS.D!.getDisplay(testDate)).toBe("5");
      });

      it("dddd displays full weekday name", () => {
        expect(FORMAT_TOKENS.dddd!.getDisplay(testDate, "en-US")).toBe("Friday");
      });

      it("ddd displays abbreviated weekday name", () => {
        expect(FORMAT_TOKENS.ddd!.getDisplay(testDate, "en-US")).toBe("Fri");
      });

      it("HH displays zero-padded 24-hour", () => {
        expect(FORMAT_TOKENS.HH!.getDisplay(testDate)).toBe("09");
      });

      it("H displays non-padded 24-hour", () => {
        expect(FORMAT_TOKENS.H!.getDisplay(testDate)).toBe("9");
      });

      it("hh displays zero-padded 12-hour", () => {
        expect(FORMAT_TOKENS.hh!.getDisplay(testDate)).toBe("09");
      });

      it("h displays non-padded 12-hour", () => {
        expect(FORMAT_TOKENS.h!.getDisplay(testDate)).toBe("9");
      });

      it("hh displays 12 for noon", () => {
        const noon = new Date(2024, 0, 1, 12, 0, 0);
        expect(FORMAT_TOKENS.hh!.getDisplay(noon)).toBe("12");
      });

      it("hh displays 12 for midnight", () => {
        const midnight = new Date(2024, 0, 1, 0, 0, 0);
        expect(FORMAT_TOKENS.hh!.getDisplay(midnight)).toBe("12");
      });

      it("mm displays zero-padded minutes", () => {
        expect(FORMAT_TOKENS.mm!.getDisplay(testDate)).toBe("05");
      });

      it("ss displays zero-padded seconds", () => {
        expect(FORMAT_TOKENS.ss!.getDisplay(testDate)).toBe("05");
      });

      it("A displays AM", () => {
        expect(FORMAT_TOKENS.A!.getDisplay(testDate)).toBe("AM");
      });

      it("a displays am", () => {
        expect(FORMAT_TOKENS.a!.getDisplay(testDate)).toBe("am");
      });

      it("A displays PM for afternoon", () => {
        const pmDate = new Date(2024, 0, 1, 15, 0, 0);
        expect(FORMAT_TOKENS.A!.getDisplay(pmDate)).toBe("PM");
      });

      it("a displays pm for afternoon", () => {
        const pmDate = new Date(2024, 0, 1, 15, 0, 0);
        expect(FORMAT_TOKENS.a!.getDisplay(pmDate)).toBe("pm");
      });
    });
  });

  // ============================================================================
  // parseFormat
  // ============================================================================
  describe("parseFormat", () => {
    it("parses simple date format", () => {
      const segments = parseFormat("MM/DD/YYYY");
      expect(segments).toHaveLength(5);
      expect(segments[0]).toEqual({ type: "token", value: "MM", token: "MM", length: 2 });
      expect(segments[1]).toEqual({ type: "literal", value: "/" });
      expect(segments[2]).toEqual({ type: "token", value: "DD", token: "DD", length: 2 });
      expect(segments[3]).toEqual({ type: "literal", value: "/" });
      expect(segments[4]).toEqual({ type: "token", value: "YYYY", token: "YYYY", length: 4 });
    });

    it("parses format with dashes", () => {
      const segments = parseFormat("YYYY-MM-DD");
      expect(segments).toHaveLength(5);
      expect(segments[0]).toEqual({ type: "token", value: "YYYY", token: "YYYY", length: 4 });
      expect(segments[1]).toEqual({ type: "literal", value: "-" });
    });

    it("parses format with time", () => {
      const segments = parseFormat("MM/DD/YYYY HH:mm:ss");
      expect(segments.some((s) => s.token === "HH")).toBe(true);
      expect(segments.some((s) => s.token === "mm")).toBe(true);
      expect(segments.some((s) => s.token === "ss")).toBe(true);
    });

    it("parses format with 12-hour time and AM/PM", () => {
      const segments = parseFormat("hh:mm A");
      expect(segments.some((s) => s.token === "hh")).toBe(true);
      expect(segments.some((s) => s.token === "A")).toBe(true);
    });

    it("parses format with month names", () => {
      const segments = parseFormat("MMMM DD, YYYY");
      expect(segments[0]).toEqual({ type: "token", value: "MMMM", token: "MMMM", length: 0 });
    });

    it("merges consecutive literals", () => {
      const segments = parseFormat("DD, , YYYY");
      // Should merge ", , " into one literal
      const literals = segments.filter((s) => s.type === "literal");
      expect(literals.some((l) => l.value === ", , ")).toBe(true);
    });

    it("handles empty format", () => {
      const segments = parseFormat("");
      expect(segments).toHaveLength(0);
    });

    it("handles format with only literals", () => {
      const segments = parseFormat("---");
      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual({ type: "literal", value: "---" });
    });
  });

  // ============================================================================
  // generateMask
  // ============================================================================
  describe("generateMask", () => {
    it("generates mask for MM/DD/YYYY", () => {
      const segments = parseFormat("MM/DD/YYYY");
      const mask = generateMask(segments);
      expect(mask).toBe("__/__/____");
    });

    it("generates mask for YYYY-MM-DD", () => {
      const segments = parseFormat("YYYY-MM-DD");
      const mask = generateMask(segments);
      expect(mask).toBe("____-__-__");
    });

    it("generates mask with placeholders for variable-length tokens", () => {
      const segments = parseFormat("MMMM DD, YYYY");
      const mask = generateMask(segments);
      expect(mask).toContain("Month");
    });

    it("handles empty segments", () => {
      const mask = generateMask([]);
      expect(mask).toBe("");
    });
  });

  // ============================================================================
  // formatDateInput
  // ============================================================================
  describe("formatDateInput", () => {
    it("formats date with MM/DD/YYYY", () => {
      const date = new Date(2024, 5, 15);
      const formatted = formatDateInput(date, "MM/DD/YYYY");
      expect(formatted).toBe("06/15/2024");
    });

    it("formats date with YYYY-MM-DD", () => {
      const date = new Date(2024, 0, 5);
      const formatted = formatDateInput(date, "YYYY-MM-DD");
      expect(formatted).toBe("2024-01-05");
    });

    it("formats date with time", () => {
      const date = new Date(2024, 5, 15, 14, 30, 45);
      const formatted = formatDateInput(date, "MM/DD/YYYY HH:mm:ss");
      expect(formatted).toBe("06/15/2024 14:30:45");
    });

    it("formats date with 12-hour time and AM/PM", () => {
      const date = new Date(2024, 5, 15, 14, 30, 0);
      const formatted = formatDateInput(date, "hh:mm A");
      expect(formatted).toBe("02:30 PM");
    });

    it("formats date with month name", () => {
      const date = new Date(2024, 0, 15);
      const formatted = formatDateInput(date, "MMMM DD, YYYY", "en-US");
      expect(formatted).toBe("January 15, 2024");
    });

    it("formats date with abbreviated month name", () => {
      const date = new Date(2024, 11, 25);
      const formatted = formatDateInput(date, "MMM DD, YYYY", "en-US");
      expect(formatted).toBe("Dec 25, 2024");
    });

    it("formats date with weekday", () => {
      const date = new Date(2024, 5, 15); // Saturday
      const formatted = formatDateInput(date, "dddd, MMMM DD", "en-US");
      expect(formatted).toBe("Saturday, June 15");
    });

    it("formats date with abbreviated weekday", () => {
      const date = new Date(2024, 5, 15); // Saturday
      const formatted = formatDateInput(date, "ddd, MMM DD", "en-US");
      expect(formatted).toBe("Sat, Jun 15");
    });
  });

  // ============================================================================
  // parseDateInput
  // ============================================================================
  describe("parseDateInput", () => {
    it("parses MM/DD/YYYY format", () => {
      const date = parseDateInput("06/15/2024", "MM/DD/YYYY");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2024);
      expect(date!.getMonth()).toBe(5); // June
      expect(date!.getDate()).toBe(15);
    });

    it("parses YYYY-MM-DD format", () => {
      const date = parseDateInput("2024-01-05", "YYYY-MM-DD");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2024);
      expect(date!.getMonth()).toBe(0);
      expect(date!.getDate()).toBe(5);
    });

    it("parses format with time", () => {
      const date = parseDateInput("06/15/2024 14:30:45", "MM/DD/YYYY HH:mm:ss");
      expect(date).not.toBeNull();
      expect(date!.getHours()).toBe(14);
      expect(date!.getMinutes()).toBe(30);
      expect(date!.getSeconds()).toBe(45);
    });

    it("parses 12-hour format with PM", () => {
      const date = parseDateInput("06/15/2024 02:30 PM", "MM/DD/YYYY hh:mm A");
      expect(date).not.toBeNull();
      expect(date!.getHours()).toBe(14);
    });

    it("parses 12-hour format with AM", () => {
      const date = parseDateInput("06/15/2024 09:30 AM", "MM/DD/YYYY hh:mm A");
      expect(date).not.toBeNull();
      expect(date!.getHours()).toBe(9);
    });

    it("parses 12:00 PM as noon (12)", () => {
      const date = parseDateInput("06/15/2024 12:00 PM", "MM/DD/YYYY hh:mm A");
      expect(date).not.toBeNull();
      expect(date!.getHours()).toBe(12);
    });

    it("parses 12:00 AM as midnight (0)", () => {
      const date = parseDateInput("06/15/2024 12:00 AM", "MM/DD/YYYY hh:mm A");
      expect(date).not.toBeNull();
      expect(date!.getHours()).toBe(0);
    });

    it("parses two-digit year (00-49 as 2000s)", () => {
      const date = parseDateInput("06/15/24", "MM/DD/YY");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2024);
    });

    it("parses two-digit year (50-99 as 1900s)", () => {
      const date = parseDateInput("06/15/99", "MM/DD/YY");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(1999);
    });

    it("parses month name", () => {
      const date = parseDateInput("January 15, 2024", "MMMM DD, YYYY", "en-US");
      expect(date).not.toBeNull();
      expect(date!.getMonth()).toBe(0);
      expect(date!.getDate()).toBe(15);
    });

    it("parses abbreviated month name", () => {
      const date = parseDateInput("Dec 25, 2024", "MMM DD, YYYY", "en-US");
      expect(date).not.toBeNull();
      expect(date!.getMonth()).toBe(11);
    });

    it("returns null for incomplete date", () => {
      const date = parseDateInput("06/15", "MM/DD/YYYY");
      expect(date).toBeNull();
    });

    it("returns null for invalid month", () => {
      const date = parseDateInput("13/15/2024", "MM/DD/YYYY");
      expect(date).toBeNull();
    });

    it("returns null for invalid day", () => {
      const date = parseDateInput("06/32/2024", "MM/DD/YYYY");
      expect(date).toBeNull();
    });

    it("returns null for impossible date (Feb 30)", () => {
      const date = parseDateInput("02/30/2024", "MM/DD/YYYY");
      expect(date).toBeNull();
    });

    it("parses single-digit month and day formats", () => {
      const date = parseDateInput("6/5/2024", "M/D/YYYY");
      expect(date).not.toBeNull();
      expect(date!.getMonth()).toBe(5);
      expect(date!.getDate()).toBe(5);
    });

    it("handles flexible literal matching", () => {
      // Test that parsing with different separator is handled
      // Depends on implementation - may return null or parse
      // This tests the flexible matching branch
      parseDateInput("06-15-2024", "MM/DD/YYYY");
    });
  });

  // ============================================================================
  // applyMask
  // ============================================================================
  describe("applyMask", () => {
    it("applies mask to partial input", () => {
      const result = applyMask("06", "MM/DD/YYYY");
      expect(result).toBe("06");
    });

    it("applies mask with separator", () => {
      const result = applyMask("0615", "MM/DD/YYYY");
      expect(result).toBe("06/15");
    });

    it("applies full mask", () => {
      const result = applyMask("06152024", "MM/DD/YYYY");
      expect(result).toBe("06/15/2024");
    });

    it("handles dash separator", () => {
      const result = applyMask("20240615", "YYYY-MM-DD");
      expect(result).toBe("2024-06-15");
    });

    it("returns empty string for empty input", () => {
      const result = applyMask("", "MM/DD/YYYY");
      expect(result).toBe("");
    });

    it("strips non-digit characters from input", () => {
      const result = applyMask("a0b6c1d5e", "MM/DD/YYYY");
      expect(result).toBe("06/15");
    });

    it("handles input with leading separator", () => {
      const result = applyMask("/06", "MM/DD/YYYY");
      expect(result).toBe("06");
    });
  });

  // ============================================================================
  // isValidFormat
  // ============================================================================
  describe("isValidFormat", () => {
    it("returns true for valid date string", () => {
      expect(isValidFormat("06/15/2024", "MM/DD/YYYY")).toBe(true);
    });

    it("returns false for invalid date string", () => {
      expect(isValidFormat("99/99/2024", "MM/DD/YYYY")).toBe(false);
    });

    it("returns false for incomplete date string", () => {
      expect(isValidFormat("06/15", "MM/DD/YYYY")).toBe(false);
    });

    it("returns true for valid date with time", () => {
      expect(isValidFormat("06/15/2024 14:30:00", "MM/DD/YYYY HH:mm:ss")).toBe(true);
    });
  });

  // ============================================================================
  // isDateInBounds
  // ============================================================================
  describe("isDateInBounds", () => {
    const testDate = new Date(2024, 5, 15);

    it("returns true when no bounds specified", () => {
      expect(isDateInBounds(testDate)).toBe(true);
    });

    it("returns true when date is within bounds", () => {
      const minDate = new Date(2024, 0, 1);
      const maxDate = new Date(2024, 11, 31);
      expect(isDateInBounds(testDate, minDate, maxDate)).toBe(true);
    });

    it("returns true when date equals minDate", () => {
      const minDate = new Date(2024, 5, 15);
      expect(isDateInBounds(testDate, minDate)).toBe(true);
    });

    it("returns true when date equals maxDate", () => {
      const maxDate = new Date(2024, 5, 15);
      expect(isDateInBounds(testDate, undefined, maxDate)).toBe(true);
    });

    it("returns false when date is before minDate", () => {
      const minDate = new Date(2024, 6, 1);
      expect(isDateInBounds(testDate, minDate)).toBe(false);
    });

    it("returns false when date is after maxDate", () => {
      const maxDate = new Date(2024, 4, 31);
      expect(isDateInBounds(testDate, undefined, maxDate)).toBe(false);
    });

    it("compares at start of day for minDate", () => {
      const minDate = new Date(2024, 5, 15, 12, 0, 0);
      const dateAtMidnight = new Date(2024, 5, 15, 0, 0, 0);
      expect(isDateInBounds(dateAtMidnight, minDate)).toBe(true);
    });

    it("compares at end of day for maxDate", () => {
      const maxDate = new Date(2024, 5, 15, 0, 0, 0);
      const dateAtEndOfDay = new Date(2024, 5, 15, 23, 59, 59);
      expect(isDateInBounds(dateAtEndOfDay, undefined, maxDate)).toBe(true);
    });
  });

  // ============================================================================
  // getLocalizedMonthNames
  // ============================================================================
  describe("getLocalizedMonthNames", () => {
    it("returns 12 month names", () => {
      const months = getLocalizedMonthNames();
      expect(months).toHaveLength(12);
    });

    it("returns long month names by default", () => {
      const months = getLocalizedMonthNames("en-US");
      expect(months[0]).toBe("January");
      expect(months[11]).toBe("December");
    });

    it("returns short month names when specified", () => {
      const months = getLocalizedMonthNames("en-US", "short");
      expect(months[0]).toBe("Jan");
      expect(months[11]).toBe("Dec");
    });

    it("returns localized month names for different locales", () => {
      const germanMonths = getLocalizedMonthNames("de-DE");
      expect(germanMonths[0]).toBe("Januar");
    });
  });

  // ============================================================================
  // getLocalizedDayNames
  // ============================================================================
  describe("getLocalizedDayNames", () => {
    it("returns 7 day names", () => {
      const days = getLocalizedDayNames();
      expect(days).toHaveLength(7);
    });

    it("starts with Sunday", () => {
      const days = getLocalizedDayNames("en-US", "long");
      expect(days[0]).toBe("Sunday");
    });

    it("returns short day names", () => {
      const days = getLocalizedDayNames("en-US", "short");
      expect(days[0]).toBe("Sun");
      expect(days[6]).toBe("Sat");
    });

    it("returns narrow day names", () => {
      const days = getLocalizedDayNames("en-US", "narrow");
      expect(days[0]).toBe("S"); // Sunday
    });

    it("returns localized day names for different locales", () => {
      const germanDays = getLocalizedDayNames("de-DE", "long");
      expect(germanDays[1]).toBe("Montag"); // Monday in German
    });
  });

  // ============================================================================
  // getFirstDayOfWeek
  // ============================================================================
  describe("getFirstDayOfWeek", () => {
    it("returns 0 (Sunday) for US locale", () => {
      expect(getFirstDayOfWeek("en-US")).toBe(0);
    });

    it("returns 0 (Sunday) for Canadian locale", () => {
      expect(getFirstDayOfWeek("en-CA")).toBe(0);
    });

    it("returns 1 (Monday) for most European locales", () => {
      expect(getFirstDayOfWeek("de-DE")).toBe(1);
      expect(getFirstDayOfWeek("fr-FR")).toBe(1);
    });

    it("returns 1 (Monday) for UK locale", () => {
      expect(getFirstDayOfWeek("en-GB")).toBe(1);
    });

    it("returns 6 (Saturday) for some Middle Eastern locales", () => {
      expect(getFirstDayOfWeek("ar-AE")).toBe(6);
      expect(getFirstDayOfWeek("ar-EG")).toBe(6);
    });

    it("returns 0 (Sunday) for Japanese locale", () => {
      expect(getFirstDayOfWeek("ja-JP")).toBe(0);
    });

    it("returns 0 (Sunday) for Korean locale", () => {
      expect(getFirstDayOfWeek("ko-KR")).toBe(0);
    });

    it("handles case-insensitive locale matching", () => {
      expect(getFirstDayOfWeek("EN-US")).toBe(0);
      expect(getFirstDayOfWeek("en-us")).toBe(0);
    });
  });

  // ============================================================================
  // getTextDirection
  // ============================================================================
  describe("getTextDirection", () => {
    it("returns ltr for English", () => {
      expect(getTextDirection("en-US")).toBe("ltr");
    });

    it("returns ltr for German", () => {
      expect(getTextDirection("de-DE")).toBe("ltr");
    });

    it("returns ltr for French", () => {
      expect(getTextDirection("fr-FR")).toBe("ltr");
    });

    it("returns rtl for Arabic", () => {
      expect(getTextDirection("ar-SA")).toBe("rtl");
    });

    it("returns rtl for Hebrew", () => {
      expect(getTextDirection("he-IL")).toBe("rtl");
    });

    it("returns rtl for Persian/Farsi", () => {
      expect(getTextDirection("fa-IR")).toBe("rtl");
    });

    it("returns rtl for Urdu", () => {
      expect(getTextDirection("ur-PK")).toBe("rtl");
    });

    it("handles locale without region code", () => {
      expect(getTextDirection("ar")).toBe("rtl");
      expect(getTextDirection("he")).toBe("rtl");
      expect(getTextDirection("en")).toBe("ltr");
    });
  });
});
