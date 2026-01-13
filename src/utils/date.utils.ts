import type {
  DayOfWeek,
  DateTimeValue,
  DateRangeValue,
  MultipleDatesValue,
  WeekValue,
  QuarterValue,
  MonthData,
  DayCell,
} from "../types";
import { DAYS_IN_WEEK } from "../constants";

export function getDefaultYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = currentYear - 100; i <= currentYear + 50; i++) {
    years.push(i);
  }
  return years;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const d = startOfDay(date).getTime();
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  return d >= s && d <= e;
}

export function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && startOfDay(date) < startOfDay(minDate)) return true;
  if (maxDate && startOfDay(date) > startOfDay(maxDate)) return true;
  return false;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function getMonthData(
  year: number,
  month: number,
  weekStartsOn: DayOfWeek,
  selectedValue: DateTimeValue | null,
  rangeValue: DateRangeValue | null,
  minDate?: Date,
  maxDate?: Date,
  isDateDisabledCallback?: (date: Date) => boolean,
  highlightedDates?: Date[],
  multipleDatesValue?: MultipleDatesValue,
  weekValue?: WeekValue | null,
  quarterValue?: QuarterValue | null
): MonthData {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const today = new Date();

  // Calculate start date (may be from previous month)
  let startDay = firstDayOfMonth.getDay() - weekStartsOn;
  if (startDay < 0) startDay += 7;
  const startDate = addDays(firstDayOfMonth, -startDay);

  const weeks: { weekNumber: number; days: DayCell[]; startDate: Date; endDate: Date }[] = [];
  let currentDate = startDate;

  // Generate 6 weeks to ensure we cover all cases
  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    const days: DayCell[] = [];
    const weekStartDate = currentDate;

    // Check if this week is selected (for week picker mode)
    // Use date comparison instead of week number to handle weekStartsOn correctly
    const isWeekSelected =
      weekValue &&
      isSameDay(weekValue.startDate, weekStartDate) &&
      weekValue.year === weekStartDate.getFullYear();

    for (let dayIndex = 0; dayIndex < DAYS_IN_WEEK; dayIndex++) {
      const date = new Date(currentDate);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = isSameDay(date, today);
      // Combine minDate/maxDate with custom callback
      const isDisabledByMinMax = isDateDisabled(date, minDate, maxDate);
      const isDisabledByCallback = isDateDisabledCallback?.(date) ?? false;
      const isDisabled = isDisabledByMinMax || isDisabledByCallback;
      const isHighlighted = highlightedDates?.some((d) => isSameDay(d, date)) ?? false;

      let isSelected = false;
      let isInRange = false;
      let isRangeStart = false;
      let isRangeEnd = false;

      // Check if date falls within selected quarter
      const isInSelectedQuarter =
        quarterValue && date >= quarterValue.startDate && date <= quarterValue.endDate;

      if (isInSelectedQuarter && quarterValue) {
        // Quarter picker mode - all days in the selected quarter are in range
        isInRange = true;
        isRangeStart = isSameDay(date, quarterValue.startDate);
        isRangeEnd = isSameDay(date, quarterValue.endDate);
        isSelected = isRangeStart || isRangeEnd;
      } else if (isWeekSelected) {
        // Week picker mode - all days in the selected week are selected
        isSelected = true;
        isInRange = true;
        isRangeStart = dayIndex === 0;
        isRangeEnd = dayIndex === DAYS_IN_WEEK - 1;
      } else if (multipleDatesValue && multipleDatesValue.length > 0) {
        // Multiple dates mode
        isSelected = multipleDatesValue.some((dtv) => isSameDay(date, dtv.date));
      } else if (rangeValue) {
        const { start, end } = rangeValue;
        if (start?.date) {
          isRangeStart = isSameDay(date, start.date);
          isSelected = isRangeStart;
        }
        if (end?.date) {
          isRangeEnd = isSameDay(date, end.date);
          isSelected = isSelected || isRangeEnd;
        }
        if (start?.date && end?.date) {
          isInRange = isDateInRange(date, start.date, end.date);
        }
      } else if (selectedValue?.date) {
        isSelected = isSameDay(date, selectedValue.date);
      }

      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isInRange,
        isRangeStart,
        isRangeEnd,
        isDisabled,
        isHighlighted,
        weekNumber: getWeekNumber(date),
      });

      currentDate = addDays(currentDate, 1);
    }

    // Only add week if it contains days from current month
    const firstDay = days[0];
    if (firstDay && (days.some((d) => d.isCurrentMonth) || weekIndex < 5)) {
      weeks.push({
        weekNumber: firstDay.weekNumber,
        days,
        startDate: weekStartDate,
        endDate: addDays(weekStartDate, 6),
      });
    }

    // Stop if we've passed the last day of the month and completed the row
    if (currentDate > lastDayOfMonth && weekIndex >= 3) {
      const hasRemainingDaysInMonth = days.some((d) => d.isCurrentMonth);
      if (!hasRemainingDaysInMonth) break;
    }
  }

  return { month, year, weeks };
}

// ============================================================================
// DATE FORMATTING UTILITIES
// ============================================================================

/** Format options for date formatting */
export interface FormatDateOptions {
  /** Locale for formatting (default: 'en-US') */
  locale?: string;
  /** Date format style */
  dateStyle?: "full" | "long" | "medium" | "short";
  /** Custom format pattern (overrides dateStyle) */
  pattern?: string;
}

/** Format options for time formatting */
export interface FormatTimeOptions {
  /** Locale for formatting (default: 'en-US') */
  locale?: string;
  /** Whether to show seconds */
  showSeconds?: boolean;
  /** Whether to use 24-hour format */
  use24Hour?: boolean;
}

/**
 * Format a date to a localized string
 * @param date - The date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(date: Date, options: FormatDateOptions = {}): string {
  const { locale = "en-US", dateStyle = "medium", pattern } = options;

  if (pattern) {
    // Custom pattern formatting
    return formatDateWithPattern(date, pattern);
  }

  return date.toLocaleDateString(locale, { dateStyle });
}

/**
 * Format a date using a custom pattern
 * Supported tokens: YYYY (year), MM (month), DD (day), M (month no pad), D (day no pad)
 * @param date - The date to format
 * @param pattern - The pattern string (e.g., 'YYYY-MM-DD', 'MM/DD/YYYY')
 * @returns Formatted date string
 */
export function formatDateWithPattern(date: Date, pattern: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return pattern
    .replace(/YYYY/g, String(year))
    .replace(/YY/g, String(year).slice(-2))
    .replace(/MM/g, String(month).padStart(2, "0"))
    .replace(/M/g, String(month))
    .replace(/DD/g, String(day).padStart(2, "0"))
    .replace(/D/g, String(day));
}

/**
 * Format time to a string
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @param seconds - Seconds (0-59)
 * @param options - Formatting options
 * @returns Formatted time string
 */
export function formatTime(
  hours: number,
  minutes: number,
  seconds = 0,
  options: FormatTimeOptions = {}
): string {
  const { showSeconds = false, use24Hour = true } = options;

  if (use24Hour) {
    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");
    const s = String(seconds).padStart(2, "0");
    return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
  }

  // 12-hour format
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const h = String(displayHours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");

  return showSeconds ? `${h}:${m}:${s} ${period}` : `${h}:${m} ${period}`;
}

/**
 * Parse a date string into a Date object
 * @param dateString - The date string to parse
 * @param pattern - The pattern the string follows (e.g., 'YYYY-MM-DD')
 * @returns Parsed Date object or null if invalid
 */
export function parseDate(dateString: string, pattern = "YYYY-MM-DD"): Date | null {
  try {
    // Find positions of pattern tokens
    const yearMatch = /YYYY/.exec(pattern);
    const monthMatch = /MM/.exec(pattern);
    const dayMatch = /DD/.exec(pattern);

    if (!yearMatch || !monthMatch || !dayMatch) {
      // Try native parsing as fallback
      const parsed = new Date(dateString);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    const yearPos = pattern.indexOf("YYYY");
    const monthPos = pattern.indexOf("MM");
    const dayPos = pattern.indexOf("DD");

    const year = parseInt(dateString.substring(yearPos, yearPos + 4), 10);
    const month = parseInt(dateString.substring(monthPos, monthPos + 2), 10) - 1;
    const day = parseInt(dateString.substring(dayPos, dayPos + 2), 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return null;
    }

    const date = new Date(year, month, day);

    // Validate the date is correct (handles invalid dates like Feb 30)
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

/**
 * Get a human-readable relative date string
 * @param date - The date to describe
 * @param baseDate - The reference date (default: today)
 * @returns Relative date string (e.g., 'Today', 'Yesterday', 'Tomorrow', '3 days ago')
 */
export function getRelativeDate(date: Date, baseDate: Date = new Date()): string {
  const daysDiff = Math.floor(
    (startOfDay(date).getTime() - startOfDay(baseDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) return "Today";
  if (daysDiff === 1) return "Tomorrow";
  if (daysDiff === -1) return "Yesterday";
  if (daysDiff > 1 && daysDiff <= 7) return `In ${daysDiff} days`;
  if (daysDiff < -1 && daysDiff >= -7) return `${Math.abs(daysDiff)} days ago`;
  if (daysDiff > 7 && daysDiff <= 30) return `In ${Math.ceil(daysDiff / 7)} weeks`;
  if (daysDiff < -7 && daysDiff >= -30) return `${Math.ceil(Math.abs(daysDiff) / 7)} weeks ago`;

  return formatDate(date, { dateStyle: "medium" });
}
