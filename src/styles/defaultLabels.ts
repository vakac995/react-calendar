import type { CalendarLabels } from "../types";

/**
 * Default labels for the calendar component.
 * Use this as a base and override specific labels as needed for i18n.
 */
export const defaultLabels: CalendarLabels = {
  // Navigation aria-labels
  previousYear: "Previous year",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  nextYear: "Next year",
  // Time labels
  timeLabel: "Time",
  startTimeLabel: "Start Time",
  endTimeLabel: "End Time",
  hoursLabel: "HH",
  minutesLabel: "MM",
  secondsLabel: "SS",
  // Month names
  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  // Short day names (starting from Sunday)
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

/**
 * Merge custom labels with default labels.
 * Custom labels will override default labels.
 */
export function mergeLabels(
  base: CalendarLabels,
  custom?: CalendarLabels
): CalendarLabels {
  if (!custom) return base;
  return { ...base, ...custom };
}
