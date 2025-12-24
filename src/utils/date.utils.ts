import type { DayOfWeek, DateTimeValue, DateRangeValue, MonthData, DayCell } from "../types";
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
  maxDate?: Date
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

    for (let dayIndex = 0; dayIndex < DAYS_IN_WEEK; dayIndex++) {
      const date = new Date(currentDate);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = isSameDay(date, today);
      const isDisabled = isDateDisabled(date, minDate, maxDate);

      let isSelected = false;
      let isInRange = false;
      let isRangeStart = false;
      let isRangeEnd = false;

      if (rangeValue) {
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
