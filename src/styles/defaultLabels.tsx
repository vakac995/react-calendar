import type { CalendarLabels } from "../types";

// Default navigation icons
const PrevYearIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
    />
  </svg>
);

const PrevMonthIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const NextMonthIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const NextYearIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 5l7 7-7 7M5 5l7 7-7 7"
    />
  </svg>
);

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
  // Navigation button icons
  previousYearIcon: PrevYearIcon,
  previousMonthIcon: PrevMonthIcon,
  nextMonthIcon: NextMonthIcon,
  nextYearIcon: NextYearIcon,
  // Time labels
  timeLabel: "Time",
  startTimeLabel: "Start Time",
  endTimeLabel: "End Time",
  hoursLabel: "HH",
  minutesLabel: "MM",
  secondsLabel: "SS",
  // Month names
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  // Short day names (starting from Sunday)
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

/**
 * Merge custom labels with default labels.
 * Custom labels will override default labels.
 */
export function mergeLabels(base: CalendarLabels, custom?: CalendarLabels): CalendarLabels {
  if (!custom) return base;
  return { ...base, ...custom };
}
