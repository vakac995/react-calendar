import type { CalendarClassNames } from "../types";

/**
 * Default Tailwind CSS class names for the Calendar component.
 * Import and pass to the `classNames` prop if you want the default styling.
 *
 * @example
 * ```tsx
 * import { Calendar, defaultClassNames } from '@vakac995/calendar';
 *
 * <Calendar classNames={defaultClassNames} />
 * ```
 */
export const defaultClassNames: CalendarClassNames = {
  // Root container
  root: "inline-flex bg-white rounded-lg shadow-lg p-4",
  rootDisabled: "opacity-70 cursor-not-allowed",
  rootDefaultLayout: "flex-col",
  rootSideLayout: "flex-row gap-4",
  calendarWrapper: "flex flex-col",
  calendarWrapperDisabled: "pointer-events-none",

  // Header
  header: "flex items-center justify-between mb-4",
  headerDisabled: "opacity-60",
  headerNavigation: "flex items-center gap-1",
  headerNavigationButton: "p-1.5 rounded hover:bg-gray-100 disabled:opacity-50",
  headerNavigationButtonDisabled: "opacity-50 cursor-not-allowed hover:bg-transparent",
  headerNavigationButtonPrev: "",
  headerNavigationButtonNext: "",
  headerTitle: "flex items-center gap-2",
  headerMonthSelect:
    "px-2 py-1 rounded border border-gray-200 bg-white text-sm font-medium hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
  headerMonthSelectDisabled: "opacity-60 cursor-not-allowed bg-gray-50 border-gray-100",
  headerYearSelect:
    "px-2 py-1 rounded border border-gray-200 bg-white text-sm font-medium hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
  headerYearSelectDisabled: "opacity-60 cursor-not-allowed bg-gray-50 border-gray-100",

  // Week days header
  weekDaysRow: "grid gap-1 mb-2",
  weekDayCell: "text-center text-sm font-medium text-gray-500 py-1",
  weekDayCellWeekend: "text-red-400",
  weekNumberPlaceholder: "w-8",

  // Calendar body
  body: "flex flex-col gap-1",
  week: "grid gap-1",
  weekNumber:
    "w-8 text-xs text-gray-400 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer",
  weekNumberDisabled: "cursor-not-allowed hover:bg-transparent opacity-50",
  weekNumberCell: "",

  // Day cells
  day: "flex justify-center relative",
  dayButton:
    "w-9 h-9 rounded-full flex items-center justify-center text-sm relative z-10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 hover:bg-gray-100",
  dayToday: "border border-blue-500",
  daySelected: "bg-blue-500 text-white hover:bg-blue-600",
  dayInRange: "bg-blue-200 text-blue-900",
  dayRangeStart: "bg-blue-500 text-white hover:bg-blue-600",
  dayRangeEnd: "bg-blue-500 text-white hover:bg-blue-600",
  dayDisabled: "opacity-50 cursor-not-allowed hover:bg-transparent",
  dayOutsideMonth: "text-gray-400",
  dayWeekend: "text-red-500",
  dayRangeBackground: "absolute inset-y-0 bg-blue-200",
  dayRangeBackgroundStart: "left-1/2 right-0",
  dayRangeBackgroundEnd: "left-0 right-1/2",
  dayRangeBackgroundMiddle: "left-0 right-0",
  dayRangeBackgroundFirstOfWeek: "rounded-l-full",
  dayRangeBackgroundLastOfWeek: "rounded-r-full",

  // Time picker
  timePickerWrapper: "flex gap-4",
  timePickerWrapperTop: "flex-row justify-center mb-4",
  timePickerWrapperBottom: "flex-row justify-center mt-4 pt-4 border-t",
  timePickerWrapperSide: "flex-col border-l pl-4 items-center",
  timeContainer: "flex flex-col gap-2",
  timeContainerDisabled: "opacity-60",
  timeLabel: "text-sm font-medium text-gray-700",
  timeLabelDisabled: "text-gray-400",
  timeSelectors: "flex items-center gap-1",
  timeSelectorsDisabled: "pointer-events-none",
  timeSelector: "flex flex-col items-center",
  timeSelectorDisabled: "opacity-50",
  timeSelectorLabel: "text-xs text-gray-500 mb-1 font-medium",
  timeSelectorLabelDisabled: "text-gray-400",
  timeSelectorScroll:
    "h-32 w-12 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 border border-gray-200 rounded-md bg-white",
  timeSelectorScrollDisabled: "bg-gray-50 border-gray-100",
  timeSelectorItem:
    "w-full py-1.5 text-center text-sm transition-colors hover:bg-gray-100 focus:outline-none focus:bg-gray-100",
  timeSelectorItemSelected: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600",
  timeSelectorItemDisabled: "opacity-40 cursor-not-allowed hover:bg-transparent",
  timeSeparator: "text-xl text-gray-400 mt-5",
  timeSeparatorDisabled: "text-gray-300",

  // Mobile/Responsive time picker (collapsible)
  timePickerCollapsed: "w-full",
  timePickerCollapsedDisabled: "opacity-60",
  timePickerToggle:
    "w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer",
  timePickerToggleDisabled: "cursor-not-allowed hover:bg-gray-50 opacity-60",
  timePickerToggleIcon: "w-4 h-4 text-gray-500 transition-transform",
  timePickerToggleIconDisabled: "text-gray-400",
  timePickerToggleText: "text-sm font-medium text-gray-700",
  timePickerToggleTextDisabled: "text-gray-400",
  timePickerContent: "overflow-hidden transition-all duration-200 ease-in-out",
  timePickerContentExpanded: "mt-3",
};

/**
 * Helper to merge custom classNames with defaults.
 * Custom classes will REPLACE default classes for each key provided.
 * Keys not provided in custom will keep their default values.
 *
 * This approach works with any styling solution (Tailwind, CSS modules, plain CSS, etc.)
 * because it completely replaces the class string rather than appending.
 *
 * @example
 * ```tsx
 * import { Calendar, defaultClassNames, mergeClassNames } from '@vakac995/calendar';
 *
 * const customClassNames = mergeClassNames(defaultClassNames, {
 *   root: 'my-custom-root',           // Completely replaces default root classes
 *   daySelected: 'bg-green-500',      // Completely replaces default selected styles
 * });
 * <Calendar classNames={customClassNames} />
 * ```
 */
export function mergeClassNames(
  base: CalendarClassNames,
  custom: CalendarClassNames
): CalendarClassNames {
  const result: CalendarClassNames = { ...base };
  for (const key of Object.keys(custom) as (keyof CalendarClassNames)[]) {
    if (custom[key] !== undefined) {
      result[key] = custom[key];
    }
  }
  return result;
}

/**
 * Helper to extend classNames by appending custom classes to defaults.
 * Use this when you want to ADD classes on top of defaults rather than replace them.
 *
 * Note: When using Tailwind CSS, later classes may not override earlier ones
 * due to CSS specificity. Consider using mergeClassNames for full control.
 *
 * @example
 * ```tsx
 * import { Calendar, defaultClassNames, extendClassNames } from '@vakac995/calendar';
 *
 * const customClassNames = extendClassNames(defaultClassNames, {
 *   root: 'extra-padding',            // Appends to default root classes
 *   dayButton: 'custom-hover-effect', // Appends to default day button classes
 * });
 * <Calendar classNames={customClassNames} />
 * ```
 */
export function extendClassNames(
  base: CalendarClassNames,
  custom: CalendarClassNames
): CalendarClassNames {
  const result: CalendarClassNames = { ...base };
  for (const key of Object.keys(custom) as (keyof CalendarClassNames)[]) {
    if (custom[key]) {
      result[key] = base[key] ? `${base[key]} ${custom[key]}` : custom[key];
    }
  }
  return result;
}
