// Main component
export { Calendar } from "./calendar";

// DateInput component
export { DateInput } from "./date-input";

// DatePicker components
export { DatePicker, Popover, Portal } from "./date-picker";

// Types
export type {
  DayOfWeek,
  TimePosition,
  SelectionMode,
  LayoutMode,
  CalendarView,
  TimeValue,
  DateTimeValue,
  DateRangeValue,
  MultipleDatesValue,
  WeekValue,
  QuarterValue,
  CalendarValue,
  DayCell,
  WeekData,
  MonthData,
  CalendarLabels,
  CalendarClassNames,
  CalendarEventHandlers,
  CalendarProps,
  HeaderRenderProps,
  HighlightedDate,
  // DateInput types
  DateInputProps,
  DateInputClassNames,
  FormatToken,
  FormatSegment,
  // DatePicker types
  PortalProps,
  PopoverProps,
  PopoverPlacement,
  PopoverClassNames,
  DatePickerProps,
  DatePickerClassNames,
} from "./types";

// Hooks
export { useClickOutside, usePopoverPosition } from "./hooks";
export type { PopoverPosition, UsePopoverPositionOptions } from "./hooks";

// Time Picker components
export { TimePicker, TimeSelector } from "./time-picker";

// Default styles and labels
export {
  defaultClassNames,
  mergeClassNames,
  extendClassNames,
  defaultLabels,
  mergeLabels,
} from "./styles";

// Utils
export {
  cn,
  getDefaultYears,
  startOfDay,
  isSameDay,
  isDateInRange,
  isDateDisabled,
  getWeekNumber,
  addDays,
  addMonths,
  getMonthData,
  isTimeDisabled,
  // Date formatting utilities
  formatDate,
  formatDateWithPattern,
  formatTime,
  parseDate,
  getRelativeDate,
  // DateInput utilities
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
} from "./utils";

// Formatting types
export type { FormatDateOptions, FormatTimeOptions } from "./utils/date.utils";

// Constants
export { DAYS_IN_WEEK, MONTHS, SHORT_DAYS } from "./constants";
