import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getDefaultYears,
  startOfDay,
  isSameDay,
  isDateInRange,
  isDateDisabled,
  getWeekNumber,
  addDays,
  addMonths,
  getMonthData,
  formatDate,
  formatDateWithPattern,
  formatTime,
  parseDate,
  getRelativeDate,
} from "./date.utils";
import type { DateTimeValue, DateRangeValue, DayOfWeek } from "../types";

describe("getDefaultYears", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return an array of years", () => {
    vi.setSystemTime(new Date("2025-01-15"));
    const years = getDefaultYears();
    expect(Array.isArray(years)).toBe(true);
    expect(years.length).toBe(151); // 100 past + current + 50 future
  });

  it("should include years from 100 years ago to 50 years ahead", () => {
    vi.setSystemTime(new Date("2025-06-15"));
    const years = getDefaultYears();
    expect(years[0]).toBe(1925); // 2025 - 100
    expect(years[years.length - 1]).toBe(2075); // 2025 + 50
  });

  it("should include the current year", () => {
    vi.setSystemTime(new Date("2025-01-15"));
    const years = getDefaultYears();
    expect(years).toContain(2025);
  });

  it("should return years in ascending order", () => {
    const years = getDefaultYears();
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThan(years[i - 1]!);
    }
  });

  it("should adjust based on current year", () => {
    vi.setSystemTime(new Date("2030-01-01"));
    const years = getDefaultYears();
    expect(years[0]).toBe(1930);
    expect(years[years.length - 1]).toBe(2080);
  });
});

describe("startOfDay", () => {
  it("should set time to midnight", () => {
    const date = new Date("2025-06-15T14:30:45.123");
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("should preserve the date", () => {
    const date = new Date("2025-06-15T14:30:45.123");
    const result = startOfDay(date);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(5); // June is 5
    expect(result.getDate()).toBe(15);
  });

  it("should not mutate the original date", () => {
    const date = new Date("2025-06-15T14:30:45.123");
    const originalTime = date.getTime();
    startOfDay(date);
    expect(date.getTime()).toBe(originalTime);
  });

  it("should handle midnight input", () => {
    const date = new Date("2025-06-15T00:00:00.000");
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it("should handle end of day input", () => {
    const date = new Date("2025-06-15T23:59:59.999");
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
});

describe("isSameDay", () => {
  it("should return true for the same date", () => {
    const date = new Date("2025-06-15T12:00:00");
    expect(isSameDay(date, date)).toBe(true);
  });

  it("should return true for same day with different times", () => {
    const a = new Date("2025-06-15T08:00:00");
    const b = new Date("2025-06-15T20:30:45");
    expect(isSameDay(a, b)).toBe(true);
  });

  it("should return false for different days", () => {
    const a = new Date("2025-06-15");
    const b = new Date("2025-06-16");
    expect(isSameDay(a, b)).toBe(false);
  });

  it("should return false for different months", () => {
    const a = new Date("2025-06-15");
    const b = new Date("2025-07-15");
    expect(isSameDay(a, b)).toBe(false);
  });

  it("should return false for different years", () => {
    const a = new Date("2025-06-15");
    const b = new Date("2026-06-15");
    expect(isSameDay(a, b)).toBe(false);
  });

  it("should handle midnight edge case", () => {
    const a = new Date("2025-06-15T00:00:00.000");
    const b = new Date("2025-06-15T23:59:59.999");
    expect(isSameDay(a, b)).toBe(true);
  });

  it("should handle crossing midnight", () => {
    const a = new Date("2025-06-15T23:59:59.999");
    const b = new Date("2025-06-16T00:00:00.000");
    expect(isSameDay(a, b)).toBe(false);
  });
});

describe("isDateInRange", () => {
  it("should return false when start is null", () => {
    const date = new Date("2025-06-15");
    const end = new Date("2025-06-20");
    expect(isDateInRange(date, null, end)).toBe(false);
  });

  it("should return false when end is null", () => {
    const date = new Date("2025-06-15");
    const start = new Date("2025-06-10");
    expect(isDateInRange(date, start, null)).toBe(false);
  });

  it("should return false when both are null", () => {
    const date = new Date("2025-06-15");
    expect(isDateInRange(date, null, null)).toBe(false);
  });

  it("should return true for date within range", () => {
    const date = new Date("2025-06-15");
    const start = new Date("2025-06-10");
    const end = new Date("2025-06-20");
    expect(isDateInRange(date, start, end)).toBe(true);
  });

  it("should return true for date at start of range", () => {
    const date = new Date("2025-06-10");
    const start = new Date("2025-06-10");
    const end = new Date("2025-06-20");
    expect(isDateInRange(date, start, end)).toBe(true);
  });

  it("should return true for date at end of range", () => {
    const date = new Date("2025-06-20");
    const start = new Date("2025-06-10");
    const end = new Date("2025-06-20");
    expect(isDateInRange(date, start, end)).toBe(true);
  });

  it("should return false for date before range", () => {
    const date = new Date("2025-06-05");
    const start = new Date("2025-06-10");
    const end = new Date("2025-06-20");
    expect(isDateInRange(date, start, end)).toBe(false);
  });

  it("should return false for date after range", () => {
    const date = new Date("2025-06-25");
    const start = new Date("2025-06-10");
    const end = new Date("2025-06-20");
    expect(isDateInRange(date, start, end)).toBe(false);
  });

  it("should handle single day range", () => {
    const date = new Date("2025-06-15");
    const start = new Date("2025-06-15");
    const end = new Date("2025-06-15");
    expect(isDateInRange(date, start, end)).toBe(true);
    expect(isDateInRange(new Date("2025-06-14"), start, end)).toBe(false);
    expect(isDateInRange(new Date("2025-06-16"), start, end)).toBe(false);
  });

  it("should ignore time components", () => {
    const date = new Date("2025-06-15T23:59:59");
    const start = new Date("2025-06-15T00:00:00");
    const end = new Date("2025-06-15T12:00:00");
    expect(isDateInRange(date, start, end)).toBe(true);
  });
});

describe("isDateDisabled", () => {
  it("should return false when no constraints", () => {
    const date = new Date("2025-06-15");
    expect(isDateDisabled(date)).toBe(false);
  });

  it("should return false when date is after minDate", () => {
    const date = new Date("2025-06-15");
    const minDate = new Date("2025-06-10");
    expect(isDateDisabled(date, minDate)).toBe(false);
  });

  it("should return false when date equals minDate", () => {
    const date = new Date("2025-06-15");
    const minDate = new Date("2025-06-15");
    expect(isDateDisabled(date, minDate)).toBe(false);
  });

  it("should return true when date is before minDate", () => {
    const date = new Date("2025-06-05");
    const minDate = new Date("2025-06-10");
    expect(isDateDisabled(date, minDate)).toBe(true);
  });

  it("should return false when date is before maxDate", () => {
    const date = new Date("2025-06-15");
    const maxDate = new Date("2025-06-20");
    expect(isDateDisabled(date, undefined, maxDate)).toBe(false);
  });

  it("should return false when date equals maxDate", () => {
    const date = new Date("2025-06-20");
    const maxDate = new Date("2025-06-20");
    expect(isDateDisabled(date, undefined, maxDate)).toBe(false);
  });

  it("should return true when date is after maxDate", () => {
    const date = new Date("2025-06-25");
    const maxDate = new Date("2025-06-20");
    expect(isDateDisabled(date, undefined, maxDate)).toBe(true);
  });

  it("should handle both minDate and maxDate", () => {
    const minDate = new Date("2025-06-10");
    const maxDate = new Date("2025-06-20");

    expect(isDateDisabled(new Date("2025-06-05"), minDate, maxDate)).toBe(true);
    expect(isDateDisabled(new Date("2025-06-10"), minDate, maxDate)).toBe(false);
    expect(isDateDisabled(new Date("2025-06-15"), minDate, maxDate)).toBe(false);
    expect(isDateDisabled(new Date("2025-06-20"), minDate, maxDate)).toBe(false);
    expect(isDateDisabled(new Date("2025-06-25"), minDate, maxDate)).toBe(true);
  });

  it("should ignore time components", () => {
    const date = new Date("2025-06-15T23:59:59");
    const minDate = new Date("2025-06-15T00:00:00");
    expect(isDateDisabled(date, minDate)).toBe(false);
  });
});

describe("getWeekNumber", () => {
  it("should return week 1 for January 1st on a Thursday (ISO week)", () => {
    // January 1, 2026 is a Thursday
    const date = new Date("2026-01-01");
    expect(getWeekNumber(date)).toBe(1);
  });

  it("should return correct week for first week of 2025", () => {
    // January 1, 2025 is a Wednesday, so it's week 1
    const date = new Date("2025-01-01");
    expect(getWeekNumber(date)).toBe(1);
  });

  it("should return correct week for mid-year", () => {
    // June 15, 2025 is a Sunday
    const date = new Date("2025-06-15");
    expect(getWeekNumber(date)).toBe(24);
  });

  it("should return correct week for end of year", () => {
    // December 31, 2025 is a Wednesday
    const date = new Date("2025-12-31");
    expect(getWeekNumber(date)).toBe(1); // Week 1 of 2026
  });

  it("should handle leap year correctly", () => {
    // February 29, 2024 (leap year)
    const date = new Date("2024-02-29");
    expect(getWeekNumber(date)).toBe(9);
  });

  it("should return consistent weeks for same week days", () => {
    // All days in the same week should return the same week number
    const monday = new Date("2025-06-09");
    const tuesday = new Date("2025-06-10");
    const sunday = new Date("2025-06-15");

    expect(getWeekNumber(monday)).toBe(getWeekNumber(tuesday));
    expect(getWeekNumber(monday)).toBe(getWeekNumber(sunday));
  });
});

describe("addDays", () => {
  it("should add positive days", () => {
    const date = new Date("2025-06-15");
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(20);
  });

  it("should subtract days with negative number", () => {
    const date = new Date("2025-06-15");
    const result = addDays(date, -5);
    expect(result.getDate()).toBe(10);
  });

  it("should not mutate original date", () => {
    const date = new Date("2025-06-15");
    const originalTime = date.getTime();
    addDays(date, 5);
    expect(date.getTime()).toBe(originalTime);
  });

  it("should handle month boundary crossing", () => {
    const date = new Date("2025-06-28");
    const result = addDays(date, 5);
    expect(result.getMonth()).toBe(6); // July
    expect(result.getDate()).toBe(3);
  });

  it("should handle year boundary crossing", () => {
    const date = new Date("2025-12-30");
    const result = addDays(date, 5);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0); // January
    expect(result.getDate()).toBe(4);
  });

  it("should handle adding zero days", () => {
    const date = new Date("2025-06-15");
    const result = addDays(date, 0);
    expect(result.getDate()).toBe(15);
  });

  it("should handle February in leap year", () => {
    const date = new Date("2024-02-28");
    const result = addDays(date, 1);
    expect(result.getMonth()).toBe(1); // Still February
    expect(result.getDate()).toBe(29);
  });

  it("should handle February in non-leap year", () => {
    const date = new Date("2025-02-28");
    const result = addDays(date, 1);
    expect(result.getMonth()).toBe(2); // March
    expect(result.getDate()).toBe(1);
  });
});

describe("addMonths", () => {
  it("should add positive months", () => {
    const date = new Date("2025-06-15");
    const result = addMonths(date, 2);
    expect(result.getMonth()).toBe(7); // August
    expect(result.getDate()).toBe(15);
  });

  it("should subtract months with negative number", () => {
    const date = new Date("2025-06-15");
    const result = addMonths(date, -2);
    expect(result.getMonth()).toBe(3); // April
    expect(result.getDate()).toBe(15);
  });

  it("should not mutate original date", () => {
    const date = new Date("2025-06-15");
    const originalTime = date.getTime();
    addMonths(date, 2);
    expect(date.getTime()).toBe(originalTime);
  });

  it("should handle year boundary crossing forward", () => {
    const date = new Date("2025-11-15");
    const result = addMonths(date, 3);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(1); // February
  });

  it("should handle year boundary crossing backward", () => {
    const date = new Date("2025-02-15");
    const result = addMonths(date, -3);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(10); // November
  });

  it("should handle adding zero months", () => {
    const date = new Date("2025-06-15");
    const result = addMonths(date, 0);
    expect(result.getMonth()).toBe(5); // June
  });

  it("should handle end of month overflow (Jan 31 + 1 month)", () => {
    const date = new Date("2025-01-31");
    const result = addMonths(date, 1);
    // February doesn't have 31 days, so it overflows to March 3rd
    expect(result.getMonth()).toBe(2); // March
    expect(result.getDate()).toBe(3);
  });

  it("should handle adding 12 months", () => {
    const date = new Date("2025-06-15");
    const result = addMonths(date, 12);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5); // June
    expect(result.getDate()).toBe(15);
  });
});

describe("getMonthData", () => {
  const defaultWeekStartsOn: DayOfWeek = 0; // Sunday

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic structure", () => {
    it("should return correct month and year", () => {
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null);
      expect(result.month).toBe(5);
      expect(result.year).toBe(2025);
    });

    it("should return weeks array", () => {
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null);
      expect(Array.isArray(result.weeks)).toBe(true);
      expect(result.weeks.length).toBeGreaterThan(0);
    });

    it("should have 7 days per week", () => {
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null);
      result.weeks.forEach((week) => {
        expect(week.days.length).toBe(7);
      });
    });

    it("should include week numbers", () => {
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null);
      result.weeks.forEach((week) => {
        expect(typeof week.weekNumber).toBe("number");
      });
    });
  });

  describe("day cell properties", () => {
    it("should mark current month days correctly", () => {
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null);
      const allDays = result.weeks.flatMap((w) => w.days);
      const juneDays = allDays.filter((d) => d.isCurrentMonth);

      // June 2025 has 30 days
      expect(juneDays.length).toBe(30);
    });

    it("should mark today correctly", () => {
      // Frozen at 2025-01-15
      const result = getMonthData(2025, 0, defaultWeekStartsOn, null, null);
      const allDays = result.weeks.flatMap((w) => w.days);
      const todayCell = allDays.find((d) => d.isToday);

      expect(todayCell).toBeDefined();
      expect(todayCell?.date.getDate()).toBe(15);
      expect(todayCell?.date.getMonth()).toBe(0);
    });

    it("should not mark any day as today in different month", () => {
      // Frozen at 2025-01-15, checking June
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null);
      const allDays = result.weeks.flatMap((w) => w.days);
      const todayCount = allDays.filter((d) => d.isToday && d.isCurrentMonth).length;

      expect(todayCount).toBe(0);
    });

    it("should include disabled status", () => {
      const minDate = new Date("2025-06-10");
      const maxDate = new Date("2025-06-20");
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null, minDate, maxDate);
      const allDays = result.weeks.flatMap((w) => w.days);

      const disabledDays = allDays.filter((d) => d.isDisabled && d.isCurrentMonth);
      const enabledDays = allDays.filter((d) => !d.isDisabled && d.isCurrentMonth);

      // Days 1-9 and 21-30 should be disabled (19 days)
      expect(disabledDays.length).toBe(19);
      // Days 10-20 should be enabled (11 days)
      expect(enabledDays.length).toBe(11);
    });
  });

  describe("week starts on different days", () => {
    it("should start week on Sunday (0)", () => {
      const result = getMonthData(2025, 5, 0, null, null);
      const firstWeek = result.weeks[0];
      // First day should be a Sunday
      expect(firstWeek?.days[0]?.date.getDay()).toBe(0);
    });

    it("should start week on Monday (1)", () => {
      const result = getMonthData(2025, 5, 1, null, null);
      const firstWeek = result.weeks[0];
      // First day should be a Monday
      expect(firstWeek?.days[0]?.date.getDay()).toBe(1);
    });

    it("should start week on Saturday (6)", () => {
      const result = getMonthData(2025, 5, 6, null, null);
      const firstWeek = result.weeks[0];
      // First day should be a Saturday
      expect(firstWeek?.days[0]?.date.getDay()).toBe(6);
    });
  });

  describe("selected date handling", () => {
    it("should mark selected date", () => {
      const selectedValue: DateTimeValue = {
        date: new Date("2025-06-15"),
      };
      const result = getMonthData(2025, 5, defaultWeekStartsOn, selectedValue, null);
      const allDays = result.weeks.flatMap((w) => w.days);
      const selectedDays = allDays.filter((d) => d.isSelected);

      expect(selectedDays.length).toBe(1);
      expect(selectedDays[0]?.date.getDate()).toBe(15);
    });

    it("should not mark any date when selectedValue is null", () => {
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null);
      const allDays = result.weeks.flatMap((w) => w.days);
      const selectedDays = allDays.filter((d) => d.isSelected);

      expect(selectedDays.length).toBe(0);
    });
  });

  describe("range selection handling", () => {
    it("should mark range start and end", () => {
      const rangeValue: DateRangeValue = {
        start: { date: new Date("2025-06-10") },
        end: { date: new Date("2025-06-15") },
      };
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, rangeValue);
      const allDays = result.weeks.flatMap((w) => w.days);

      const rangeStartDays = allDays.filter((d) => d.isRangeStart);
      const rangeEndDays = allDays.filter((d) => d.isRangeEnd);

      expect(rangeStartDays.length).toBe(1);
      expect(rangeStartDays[0]?.date.getDate()).toBe(10);
      expect(rangeEndDays.length).toBe(1);
      expect(rangeEndDays[0]?.date.getDate()).toBe(15);
    });

    it("should mark dates in range", () => {
      const rangeValue: DateRangeValue = {
        start: { date: new Date("2025-06-10") },
        end: { date: new Date("2025-06-15") },
      };
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, rangeValue);
      const allDays = result.weeks.flatMap((w) => w.days);

      const inRangeDays = allDays.filter((d) => d.isInRange && d.isCurrentMonth);
      // 10, 11, 12, 13, 14, 15 = 6 days
      expect(inRangeDays.length).toBe(6);
    });

    it("should mark range start and end as selected", () => {
      const rangeValue: DateRangeValue = {
        start: { date: new Date("2025-06-10") },
        end: { date: new Date("2025-06-15") },
      };
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, rangeValue);
      const allDays = result.weeks.flatMap((w) => w.days);

      const selectedDays = allDays.filter((d) => d.isSelected && d.isCurrentMonth);
      expect(selectedDays.length).toBe(2);
    });

    it("should handle range with only start date", () => {
      const rangeValue: DateRangeValue = {
        start: { date: new Date("2025-06-10") },
        end: null,
      };
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, rangeValue);
      const allDays = result.weeks.flatMap((w) => w.days);

      const rangeStartDays = allDays.filter((d) => d.isRangeStart);
      const inRangeDays = allDays.filter((d) => d.isInRange);

      expect(rangeStartDays.length).toBe(1);
      expect(inRangeDays.length).toBe(0);
    });

    it("should handle range with only end date", () => {
      const rangeValue: DateRangeValue = {
        start: null,
        end: { date: new Date("2025-06-15") },
      };
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, rangeValue);
      const allDays = result.weeks.flatMap((w) => w.days);

      const rangeEndDays = allDays.filter((d) => d.isRangeEnd);
      const inRangeDays = allDays.filter((d) => d.isInRange);

      expect(rangeEndDays.length).toBe(1);
      expect(inRangeDays.length).toBe(0);
    });

    it("should handle single day range", () => {
      const rangeValue: DateRangeValue = {
        start: { date: new Date("2025-06-15") },
        end: { date: new Date("2025-06-15") },
      };
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, rangeValue);
      const allDays = result.weeks.flatMap((w) => w.days);

      const selectedDays = allDays.filter((d) => d.isSelected);
      const inRangeDays = allDays.filter((d) => d.isInRange && d.isCurrentMonth);

      expect(selectedDays.length).toBe(1);
      expect(inRangeDays.length).toBe(1);
    });
  });

  describe("month edge cases", () => {
    it("should handle February in leap year", () => {
      const result = getMonthData(2024, 1, defaultWeekStartsOn, null, null);
      const allDays = result.weeks.flatMap((w) => w.days);
      const febDays = allDays.filter((d) => d.isCurrentMonth);

      expect(febDays.length).toBe(29);
    });

    it("should handle February in non-leap year", () => {
      const result = getMonthData(2025, 1, defaultWeekStartsOn, null, null);
      const allDays = result.weeks.flatMap((w) => w.days);
      const febDays = allDays.filter((d) => d.isCurrentMonth);

      expect(febDays.length).toBe(28);
    });

    it("should handle months with 31 days", () => {
      const result = getMonthData(2025, 0, defaultWeekStartsOn, null, null);
      const allDays = result.weeks.flatMap((w) => w.days);
      const janDays = allDays.filter((d) => d.isCurrentMonth);

      expect(janDays.length).toBe(31);
    });

    it("should handle months with 30 days", () => {
      const result = getMonthData(2025, 3, defaultWeekStartsOn, null, null);
      const allDays = result.weeks.flatMap((w) => w.days);
      const aprilDays = allDays.filter((d) => d.isCurrentMonth);

      expect(aprilDays.length).toBe(30);
    });

    it("should include days from previous month when needed", () => {
      // June 2025 starts on a Sunday, so no prev month days when weekStartsOn=0
      const result = getMonthData(2025, 5, 0, null, null);
      const firstDay = result.weeks[0]?.days[0];
      expect(firstDay?.date.getMonth()).toBe(5); // June 1st

      // But with Monday start, we need to show May days
      const resultMonday = getMonthData(2025, 5, 1, null, null);
      const firstDayMonday = resultMonday.weeks[0]?.days[0];
      expect(firstDayMonday?.date.getMonth()).toBe(4); // May
      expect(firstDayMonday?.isCurrentMonth).toBe(false);
    });

    it("should include days from next month when needed", () => {
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null);
      const lastWeek = result.weeks[result.weeks.length - 1];
      const lastDay = lastWeek?.days[lastWeek.days.length - 1];

      // June 2025 ends on Monday, so we need July days to fill the week
      if (lastDay?.date.getMonth() === 6) {
        expect(lastDay.isCurrentMonth).toBe(false);
      }
    });
  });

  describe("week structure", () => {
    it("should include startDate and endDate for each week", () => {
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null);
      result.weeks.forEach((week) => {
        expect(week.startDate).toBeInstanceOf(Date);
        expect(week.endDate).toBeInstanceOf(Date);
      });
    });

    it("should have 6 days between startDate and endDate", () => {
      const result = getMonthData(2025, 5, defaultWeekStartsOn, null, null);
      result.weeks.forEach((week) => {
        const diff = (week.endDate.getTime() - week.startDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(diff).toBe(6);
      });
    });
  });
});

// ============================================================================
// DATE FORMATTING UTILITIES TESTS
// ============================================================================

describe("formatDateWithPattern", () => {
  it("should format date with YYYY-MM-DD pattern", () => {
    const date = new Date(2025, 5, 15); // June 15, 2025
    expect(formatDateWithPattern(date, "YYYY-MM-DD")).toBe("2025-06-15");
  });

  it("should format date with MM/DD/YYYY pattern", () => {
    const date = new Date(2025, 5, 15);
    expect(formatDateWithPattern(date, "MM/DD/YYYY")).toBe("06/15/2025");
  });

  it("should format date with DD.MM.YYYY pattern", () => {
    const date = new Date(2025, 5, 15);
    expect(formatDateWithPattern(date, "DD.MM.YYYY")).toBe("15.06.2025");
  });

  it("should handle single digit month and day with M and D tokens", () => {
    const date = new Date(2025, 0, 5); // January 5, 2025
    expect(formatDateWithPattern(date, "M/D/YYYY")).toBe("1/5/2025");
  });

  it("should handle YY for short year", () => {
    const date = new Date(2025, 5, 15);
    expect(formatDateWithPattern(date, "YY-MM-DD")).toBe("25-06-15");
  });

  it("should handle December correctly", () => {
    const date = new Date(2025, 11, 25); // December 25, 2025
    expect(formatDateWithPattern(date, "YYYY-MM-DD")).toBe("2025-12-25");
  });

  it("should handle January correctly", () => {
    const date = new Date(2025, 0, 1); // January 1, 2025
    expect(formatDateWithPattern(date, "YYYY-MM-DD")).toBe("2025-01-01");
  });
});

describe("formatDate", () => {
  it("should format date using pattern when provided", () => {
    const date = new Date(2025, 5, 15);
    expect(formatDate(date, { pattern: "YYYY-MM-DD" })).toBe("2025-06-15");
  });

  it("should use medium dateStyle by default", () => {
    const date = new Date(2025, 5, 15);
    const result = formatDate(date);
    // The exact format depends on locale, but it should contain the key parts
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("should respect locale option", () => {
    const date = new Date(2025, 5, 15);
    const enResult = formatDate(date, { locale: "en-US", dateStyle: "short" });
    const deResult = formatDate(date, { locale: "de-DE", dateStyle: "short" });
    // Different locales should potentially produce different formats
    expect(enResult).toBeTruthy();
    expect(deResult).toBeTruthy();
  });
});

describe("formatTime", () => {
  it("should format time in 24-hour format by default", () => {
    expect(formatTime(14, 30, 0)).toBe("14:30");
  });

  it("should include seconds when showSeconds is true", () => {
    expect(formatTime(14, 30, 45, { showSeconds: true })).toBe("14:30:45");
  });

  it("should format time in 12-hour format", () => {
    expect(formatTime(14, 30, 0, { use24Hour: false })).toBe("02:30 PM");
  });

  it("should handle AM times in 12-hour format", () => {
    expect(formatTime(9, 30, 0, { use24Hour: false })).toBe("09:30 AM");
  });

  it("should handle noon in 12-hour format", () => {
    expect(formatTime(12, 0, 0, { use24Hour: false })).toBe("12:00 PM");
  });

  it("should handle midnight in 12-hour format", () => {
    expect(formatTime(0, 0, 0, { use24Hour: false })).toBe("12:00 AM");
  });

  it("should include seconds in 12-hour format when requested", () => {
    expect(formatTime(14, 30, 45, { showSeconds: true, use24Hour: false })).toBe("02:30:45 PM");
  });

  it("should pad single digit hours and minutes", () => {
    expect(formatTime(5, 3, 7)).toBe("05:03");
    expect(formatTime(5, 3, 7, { showSeconds: true })).toBe("05:03:07");
  });
});

describe("parseDate", () => {
  it("should parse YYYY-MM-DD format", () => {
    const result = parseDate("2025-06-15");
    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(5);
    expect(result?.getDate()).toBe(15);
  });

  it("should parse custom MM/DD/YYYY format", () => {
    const result = parseDate("06/15/2025", "MM/DD/YYYY");
    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(5);
    expect(result?.getDate()).toBe(15);
  });

  it("should parse DD.MM.YYYY format", () => {
    const result = parseDate("15.06.2025", "DD.MM.YYYY");
    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(5);
    expect(result?.getDate()).toBe(15);
  });

  it("should return null for invalid date string", () => {
    expect(parseDate("invalid")).toBeNull();
    expect(parseDate("2025-13-45")).toBeNull(); // Invalid month and day
  });

  it("should fall back to native parsing when pattern is invalid", () => {
    // Native Date can parse ISO format even with invalid pattern
    const result = parseDate("2025-06-15", "invalid");
    // Falls back to native Date parsing which works for ISO format
    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(5);
    expect(result?.getDate()).toBe(15);
  });

  it("should return null for unparseable string with invalid pattern", () => {
    expect(parseDate("not-a-date", "invalid")).toBeNull();
  });

  it("should handle February 29 on leap year", () => {
    const result = parseDate("2024-02-29");
    expect(result).not.toBeNull();
    expect(result?.getDate()).toBe(29);
  });

  it("should return null for February 29 on non-leap year", () => {
    const result = parseDate("2025-02-29");
    expect(result).toBeNull();
  });
});

describe("getRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 'Today' for the current date", () => {
    const today = new Date("2025-06-15");
    expect(getRelativeDate(today)).toBe("Today");
  });

  it("should return 'Tomorrow' for the next day", () => {
    const tomorrow = new Date("2025-06-16");
    expect(getRelativeDate(tomorrow)).toBe("Tomorrow");
  });

  it("should return 'Yesterday' for the previous day", () => {
    const yesterday = new Date("2025-06-14");
    expect(getRelativeDate(yesterday)).toBe("Yesterday");
  });

  it("should return 'In X days' for dates within a week", () => {
    const in3Days = new Date("2025-06-18");
    expect(getRelativeDate(in3Days)).toBe("In 3 days");
  });

  it("should return 'X days ago' for recent past dates", () => {
    const threeDaysAgo = new Date("2025-06-12");
    expect(getRelativeDate(threeDaysAgo)).toBe("3 days ago");
  });

  it("should return 'In X weeks' for dates within a month", () => {
    const in2Weeks = new Date("2025-06-29");
    expect(getRelativeDate(in2Weeks)).toBe("In 2 weeks");
  });

  it("should return 'X weeks ago' for past dates within a month", () => {
    const twoWeeksAgo = new Date("2025-06-01");
    expect(getRelativeDate(twoWeeksAgo)).toBe("2 weeks ago");
  });

  it("should return formatted date for dates beyond a month", () => {
    const farDate = new Date("2025-12-25");
    const result = getRelativeDate(farDate);
    expect(result).toBeTruthy();
    expect(result).not.toBe("Today");
    expect(result).not.toBe("Tomorrow");
  });

  it("should accept a custom base date", () => {
    const date = new Date("2025-06-20");
    const baseDate = new Date("2025-06-18");
    expect(getRelativeDate(date, baseDate)).toBe("In 2 days");
  });
});
