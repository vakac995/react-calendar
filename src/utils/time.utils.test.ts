import { describe, it, expect } from "vitest";
import { isTimeDisabled } from "./time.utils";
import type { TimeValue } from "../types";

describe("isTimeDisabled", () => {
  describe("no constraints (no minTime, no maxTime)", () => {
    it("should return false when no constraints are provided", () => {
      expect(isTimeDisabled(12, 30, 0)).toBe(false);
    });

    it("should return false for midnight with no constraints", () => {
      expect(isTimeDisabled(0, 0, 0)).toBe(false);
    });

    it("should return false for end of day with no constraints", () => {
      expect(isTimeDisabled(23, 59, 59)).toBe(false);
    });

    it("should return false with undefined minTime and maxTime", () => {
      expect(isTimeDisabled(12, 0, 0, undefined, undefined)).toBe(false);
    });
  });

  describe("minTime constraint only", () => {
    const minTime: TimeValue = { hours: 9, minutes: 0, seconds: 0 };

    it("should return true for time before minTime", () => {
      expect(isTimeDisabled(8, 59, 59, minTime)).toBe(true);
    });

    it("should return false for time exactly at minTime", () => {
      expect(isTimeDisabled(9, 0, 0, minTime)).toBe(false);
    });

    it("should return false for time after minTime", () => {
      expect(isTimeDisabled(9, 0, 1, minTime)).toBe(false);
    });

    it("should return false for time well after minTime", () => {
      expect(isTimeDisabled(12, 30, 0, minTime)).toBe(false);
    });

    it("should return true for midnight when minTime is morning", () => {
      expect(isTimeDisabled(0, 0, 0, minTime)).toBe(true);
    });

    it("should handle minTime with minutes", () => {
      const minWithMinutes: TimeValue = { hours: 9, minutes: 30, seconds: 0 };
      expect(isTimeDisabled(9, 29, 59, minWithMinutes)).toBe(true);
      expect(isTimeDisabled(9, 30, 0, minWithMinutes)).toBe(false);
      expect(isTimeDisabled(9, 30, 1, minWithMinutes)).toBe(false);
    });

    it("should handle minTime with seconds", () => {
      const minWithSeconds: TimeValue = { hours: 9, minutes: 30, seconds: 30 };
      expect(isTimeDisabled(9, 30, 29, minWithSeconds)).toBe(true);
      expect(isTimeDisabled(9, 30, 30, minWithSeconds)).toBe(false);
      expect(isTimeDisabled(9, 30, 31, minWithSeconds)).toBe(false);
    });
  });

  describe("maxTime constraint only", () => {
    const maxTime: TimeValue = { hours: 17, minutes: 0, seconds: 0 };

    it("should return false for time before maxTime", () => {
      expect(isTimeDisabled(16, 59, 59, undefined, maxTime)).toBe(false);
    });

    it("should return false for time exactly at maxTime", () => {
      expect(isTimeDisabled(17, 0, 0, undefined, maxTime)).toBe(false);
    });

    it("should return true for time after maxTime", () => {
      expect(isTimeDisabled(17, 0, 1, undefined, maxTime)).toBe(true);
    });

    it("should return true for time well after maxTime", () => {
      expect(isTimeDisabled(23, 59, 59, undefined, maxTime)).toBe(true);
    });

    it("should return false for midnight when maxTime is afternoon", () => {
      expect(isTimeDisabled(0, 0, 0, undefined, maxTime)).toBe(false);
    });

    it("should handle maxTime with minutes", () => {
      const maxWithMinutes: TimeValue = { hours: 17, minutes: 30, seconds: 0 };
      expect(isTimeDisabled(17, 30, 0, undefined, maxWithMinutes)).toBe(false);
      expect(isTimeDisabled(17, 30, 1, undefined, maxWithMinutes)).toBe(true);
      expect(isTimeDisabled(17, 31, 0, undefined, maxWithMinutes)).toBe(true);
    });

    it("should handle maxTime with seconds", () => {
      const maxWithSeconds: TimeValue = { hours: 17, minutes: 30, seconds: 30 };
      expect(isTimeDisabled(17, 30, 30, undefined, maxWithSeconds)).toBe(false);
      expect(isTimeDisabled(17, 30, 31, undefined, maxWithSeconds)).toBe(true);
    });
  });

  describe("both minTime and maxTime constraints", () => {
    const minTime: TimeValue = { hours: 9, minutes: 0, seconds: 0 };
    const maxTime: TimeValue = { hours: 17, minutes: 0, seconds: 0 };

    it("should return true for time before range", () => {
      expect(isTimeDisabled(8, 59, 59, minTime, maxTime)).toBe(true);
    });

    it("should return false for time at start of range", () => {
      expect(isTimeDisabled(9, 0, 0, minTime, maxTime)).toBe(false);
    });

    it("should return false for time in middle of range", () => {
      expect(isTimeDisabled(12, 30, 0, minTime, maxTime)).toBe(false);
    });

    it("should return false for time at end of range", () => {
      expect(isTimeDisabled(17, 0, 0, minTime, maxTime)).toBe(false);
    });

    it("should return true for time after range", () => {
      expect(isTimeDisabled(17, 0, 1, minTime, maxTime)).toBe(true);
    });

    it("should handle narrow time window", () => {
      const narrowMin: TimeValue = { hours: 12, minutes: 0, seconds: 0 };
      const narrowMax: TimeValue = { hours: 13, minutes: 0, seconds: 0 };

      expect(isTimeDisabled(11, 59, 59, narrowMin, narrowMax)).toBe(true);
      expect(isTimeDisabled(12, 0, 0, narrowMin, narrowMax)).toBe(false);
      expect(isTimeDisabled(12, 30, 0, narrowMin, narrowMax)).toBe(false);
      expect(isTimeDisabled(13, 0, 0, narrowMin, narrowMax)).toBe(false);
      expect(isTimeDisabled(13, 0, 1, narrowMin, narrowMax)).toBe(true);
    });

    it("should handle single minute window", () => {
      const min: TimeValue = { hours: 12, minutes: 30, seconds: 0 };
      const max: TimeValue = { hours: 12, minutes: 30, seconds: 59 };

      expect(isTimeDisabled(12, 29, 59, min, max)).toBe(true);
      expect(isTimeDisabled(12, 30, 0, min, max)).toBe(false);
      expect(isTimeDisabled(12, 30, 30, min, max)).toBe(false);
      expect(isTimeDisabled(12, 30, 59, min, max)).toBe(false);
      expect(isTimeDisabled(12, 31, 0, min, max)).toBe(true);
    });

    it("should handle exact same min and max time (single allowed time)", () => {
      const exactTime: TimeValue = { hours: 12, minutes: 0, seconds: 0 };

      expect(isTimeDisabled(11, 59, 59, exactTime, exactTime)).toBe(true);
      expect(isTimeDisabled(12, 0, 0, exactTime, exactTime)).toBe(false);
      expect(isTimeDisabled(12, 0, 1, exactTime, exactTime)).toBe(true);
    });
  });

  describe("edge cases with time boundaries", () => {
    it("should handle midnight (00:00:00) correctly", () => {
      const midnight: TimeValue = { hours: 0, minutes: 0, seconds: 0 };
      expect(isTimeDisabled(0, 0, 0, midnight)).toBe(false);
      expect(isTimeDisabled(0, 0, 0, undefined, midnight)).toBe(false);
    });

    it("should handle end of day (23:59:59) correctly", () => {
      const endOfDay: TimeValue = { hours: 23, minutes: 59, seconds: 59 };
      expect(isTimeDisabled(23, 59, 59, endOfDay)).toBe(false);
      expect(isTimeDisabled(23, 59, 59, undefined, endOfDay)).toBe(false);
    });

    it("should handle full day range", () => {
      const midnight: TimeValue = { hours: 0, minutes: 0, seconds: 0 };
      const endOfDay: TimeValue = { hours: 23, minutes: 59, seconds: 59 };

      expect(isTimeDisabled(0, 0, 0, midnight, endOfDay)).toBe(false);
      expect(isTimeDisabled(12, 0, 0, midnight, endOfDay)).toBe(false);
      expect(isTimeDisabled(23, 59, 59, midnight, endOfDay)).toBe(false);
    });

    it("should handle time just before midnight as maxTime", () => {
      const maxTime: TimeValue = { hours: 23, minutes: 59, seconds: 58 };
      expect(isTimeDisabled(23, 59, 58, undefined, maxTime)).toBe(false);
      expect(isTimeDisabled(23, 59, 59, undefined, maxTime)).toBe(true);
    });

    it("should handle time just after midnight as minTime", () => {
      const minTime: TimeValue = { hours: 0, minutes: 0, seconds: 1 };
      expect(isTimeDisabled(0, 0, 0, minTime)).toBe(true);
      expect(isTimeDisabled(0, 0, 1, minTime)).toBe(false);
    });
  });

  describe("total seconds calculation verification", () => {
    it("should correctly calculate for hours only", () => {
      const minTime: TimeValue = { hours: 2, minutes: 0, seconds: 0 };
      // 2 hours = 7200 seconds
      // 1:59:59 = 3600 + 3540 + 59 = 7199 seconds (should be disabled)
      expect(isTimeDisabled(1, 59, 59, minTime)).toBe(true);
      // 2:00:00 = 7200 seconds (should be enabled)
      expect(isTimeDisabled(2, 0, 0, minTime)).toBe(false);
    });

    it("should correctly calculate for minutes", () => {
      const minTime: TimeValue = { hours: 0, minutes: 30, seconds: 0 };
      // 30 minutes = 1800 seconds
      expect(isTimeDisabled(0, 29, 59, minTime)).toBe(true);
      expect(isTimeDisabled(0, 30, 0, minTime)).toBe(false);
    });

    it("should correctly calculate for seconds", () => {
      const minTime: TimeValue = { hours: 0, minutes: 0, seconds: 30 };
      expect(isTimeDisabled(0, 0, 29, minTime)).toBe(true);
      expect(isTimeDisabled(0, 0, 30, minTime)).toBe(false);
    });

    it("should correctly combine hours, minutes, and seconds", () => {
      const minTime: TimeValue = { hours: 1, minutes: 30, seconds: 30 };
      // 1:30:30 = 3600 + 1800 + 30 = 5430 seconds

      // 1:30:29 = 5429 seconds (disabled)
      expect(isTimeDisabled(1, 30, 29, minTime)).toBe(true);
      // 1:30:30 = 5430 seconds (enabled)
      expect(isTimeDisabled(1, 30, 30, minTime)).toBe(false);
      // 1:30:31 = 5431 seconds (enabled)
      expect(isTimeDisabled(1, 30, 31, minTime)).toBe(false);
    });
  });

  describe("real-world business hour scenarios", () => {
    it("should handle typical 9-5 business hours", () => {
      const businessStart: TimeValue = { hours: 9, minutes: 0, seconds: 0 };
      const businessEnd: TimeValue = { hours: 17, minutes: 0, seconds: 0 };

      // Before work
      expect(isTimeDisabled(8, 30, 0, businessStart, businessEnd)).toBe(true);
      // Start of work
      expect(isTimeDisabled(9, 0, 0, businessStart, businessEnd)).toBe(false);
      // Lunch time
      expect(isTimeDisabled(12, 30, 0, businessStart, businessEnd)).toBe(false);
      // End of work
      expect(isTimeDisabled(17, 0, 0, businessStart, businessEnd)).toBe(false);
      // After work
      expect(isTimeDisabled(17, 30, 0, businessStart, businessEnd)).toBe(true);
    });

    it("should handle restaurant dinner hours", () => {
      const dinnerStart: TimeValue = { hours: 18, minutes: 0, seconds: 0 };
      const dinnerEnd: TimeValue = { hours: 22, minutes: 0, seconds: 0 };

      expect(isTimeDisabled(17, 30, 0, dinnerStart, dinnerEnd)).toBe(true);
      expect(isTimeDisabled(18, 0, 0, dinnerStart, dinnerEnd)).toBe(false);
      expect(isTimeDisabled(20, 30, 0, dinnerStart, dinnerEnd)).toBe(false);
      expect(isTimeDisabled(22, 0, 0, dinnerStart, dinnerEnd)).toBe(false);
      expect(isTimeDisabled(22, 30, 0, dinnerStart, dinnerEnd)).toBe(true);
    });

    it("should handle appointment slots with 15-minute increments", () => {
      const slotStart: TimeValue = { hours: 14, minutes: 0, seconds: 0 };
      const slotEnd: TimeValue = { hours: 14, minutes: 14, seconds: 59 };

      expect(isTimeDisabled(13, 59, 59, slotStart, slotEnd)).toBe(true);
      expect(isTimeDisabled(14, 0, 0, slotStart, slotEnd)).toBe(false);
      expect(isTimeDisabled(14, 7, 30, slotStart, slotEnd)).toBe(false);
      expect(isTimeDisabled(14, 14, 59, slotStart, slotEnd)).toBe(false);
      expect(isTimeDisabled(14, 15, 0, slotStart, slotEnd)).toBe(true);
    });

    it("should handle late-night hours (after midnight scenario)", () => {
      // Note: This function doesn't wrap around midnight
      // It treats times as same-day only
      const nightStart: TimeValue = { hours: 22, minutes: 0, seconds: 0 };
      const nightEnd: TimeValue = { hours: 23, minutes: 59, seconds: 59 };

      expect(isTimeDisabled(21, 59, 59, nightStart, nightEnd)).toBe(true);
      expect(isTimeDisabled(22, 0, 0, nightStart, nightEnd)).toBe(false);
      expect(isTimeDisabled(23, 59, 59, nightStart, nightEnd)).toBe(false);
    });
  });

  describe("type safety and return value verification", () => {
    it("should always return a boolean", () => {
      expect(typeof isTimeDisabled(12, 0, 0)).toBe("boolean");
      expect(typeof isTimeDisabled(12, 0, 0, { hours: 9, minutes: 0, seconds: 0 })).toBe("boolean");
      expect(
        typeof isTimeDisabled(12, 0, 0, undefined, { hours: 17, minutes: 0, seconds: 0 })
      ).toBe("boolean");
    });

    it("should return exactly true or false", () => {
      const result1 = isTimeDisabled(12, 0, 0);
      const result2 = isTimeDisabled(12, 0, 0, { hours: 15, minutes: 0, seconds: 0 });

      expect(result1 === true || result1 === false).toBe(true);
      expect(result2 === true || result2 === false).toBe(true);
    });
  });
});
