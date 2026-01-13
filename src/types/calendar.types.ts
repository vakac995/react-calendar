import type { ReactNode, MouseEvent } from "react";

/** Day of the week starting from Sunday (0) to Saturday (6) */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Time position relative to calendar */
export type TimePosition = "bottom" | "top" | "side";

/** Layout mode for responsive behavior */
export type LayoutMode = "auto" | "desktop" | "mobile";

/** Selection mode */
export type SelectionMode = "single" | "range" | "multiple" | "week" | "quarter";

/** Time unit for granular control */
export interface TimeValue {
  hours: number;
  minutes: number;
  seconds: number;
}

/** Date with optional time */
export interface DateTimeValue {
  date: Date;
  time?: TimeValue;
}

/** Range value with start and end */
export interface DateRangeValue {
  start: DateTimeValue | null;
  end: DateTimeValue | null;
}

/** Multiple dates value - array of DateTimeValue */
export type MultipleDatesValue = DateTimeValue[];

/** Week value for week picker mode */
export interface WeekValue {
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
}

/** Quarter value for quarter picker mode */
export interface QuarterValue {
  quarter: 1 | 2 | 3 | 4;
  year: number;
  startDate: Date;
  endDate: Date;
}

/** Calendar value - single date, range, multiple dates, week, or quarter */
export type CalendarValue<TMode extends SelectionMode> = TMode extends "single"
  ? DateTimeValue | null
  : TMode extends "range"
    ? DateRangeValue | null
    : TMode extends "week"
      ? WeekValue | null
      : TMode extends "quarter"
        ? QuarterValue | null
        : MultipleDatesValue;

/** Day cell data */
export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isDisabled: boolean;
  isHighlighted: boolean;
  weekNumber: number;
}

/** Week data */
export interface WeekData {
  weekNumber: number;
  days: DayCell[];
  startDate: Date;
  endDate: Date;
}

/** Month data */
export interface MonthData {
  month: number;
  year: number;
  weeks: WeekData[];
}

/** Labels for all text in the calendar */
export interface CalendarLabels {
  // Navigation aria-labels
  previousYear?: string;
  previousMonth?: string;
  nextMonth?: string;
  nextYear?: string;
  // Navigation button content (icons or text)
  previousYearIcon?: ReactNode;
  previousMonthIcon?: ReactNode;
  nextMonthIcon?: ReactNode;
  nextYearIcon?: ReactNode;
  // Time labels
  timeLabel?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  hoursLabel?: string;
  minutesLabel?: string;
  secondsLabel?: string;
  // Month names (array of 12)
  months?: readonly string[];
  // Short day names (array of 7, starting from Sunday)
  shortDays?: readonly string[];
  // Footer buttons
  todayButton?: string;
  clearButton?: string;
  // View picker labels
  monthPickerLabel?: string;
  yearPickerLabel?: string;
}

/** ClassNames for styling every element */
export interface CalendarClassNames {
  // Root
  root?: string;
  rootDisabled?: string;
  rootDefaultLayout?: string;
  rootSideLayout?: string;
  calendarWrapper?: string;
  calendarWrapperDisabled?: string;
  // Header
  header?: string;
  headerDisabled?: string;
  headerNavigation?: string;
  headerNavigationButton?: string;
  headerNavigationButtonDisabled?: string;
  headerNavigationButtonPrev?: string;
  headerNavigationButtonNext?: string;
  headerTitle?: string;
  headerTitleButton?: string;
  headerTitleButtonDisabled?: string;
  headerMonthSelect?: string;
  headerMonthSelectDisabled?: string;
  headerYearSelect?: string;
  headerYearSelectDisabled?: string;
  // Week days header
  weekDaysRow?: string;
  weekDayCell?: string;
  weekDayCellWeekend?: string;
  weekNumberPlaceholder?: string;
  // Calendar body
  body?: string;
  week?: string;
  weekNumber?: string;
  weekNumberDisabled?: string;
  weekNumberCell?: string;
  // Day cells
  day?: string;
  dayButton?: string;
  dayFocused?: string;
  dayToday?: string;
  daySelected?: string;
  dayInRange?: string;
  dayRangeStart?: string;
  dayRangeEnd?: string;
  dayDisabled?: string;
  dayOutsideMonth?: string;
  dayWeekend?: string;
  dayHighlighted?: string;
  dayRangeBackground?: string;
  dayRangeBackgroundStart?: string;
  dayRangeBackgroundEnd?: string;
  dayRangeBackgroundMiddle?: string;
  dayRangeBackgroundFirstOfWeek?: string;
  dayRangeBackgroundLastOfWeek?: string;
  // Time picker
  timePickerWrapper?: string;
  timePickerWrapperTop?: string;
  timePickerWrapperBottom?: string;
  timePickerWrapperSide?: string;
  timeContainer?: string;
  timeContainerDisabled?: string;
  timeLabel?: string;
  timeLabelDisabled?: string;
  timeSelectors?: string;
  timeSelectorsDisabled?: string;
  timeSelector?: string;
  timeSelectorDisabled?: string;
  timeSelectorLabel?: string;
  timeSelectorLabelDisabled?: string;
  timeSelectorScroll?: string;
  timeSelectorScrollDisabled?: string;
  timeSelectorItem?: string;
  timeSelectorItemSelected?: string;
  timeSelectorItemDisabled?: string;
  timeSeparator?: string;
  timeSeparatorDisabled?: string;
  // Mobile/Responsive time picker
  timePickerCollapsed?: string;
  timePickerCollapsedDisabled?: string;
  timePickerToggle?: string;
  timePickerToggleDisabled?: string;
  timePickerToggleIcon?: string;
  timePickerToggleIconDisabled?: string;
  timePickerToggleText?: string;
  timePickerToggleTextDisabled?: string;
  timePickerContent?: string;
  timePickerContentExpanded?: string;
  // Footer buttons
  footer?: string;
  footerButton?: string;
  footerButtonDisabled?: string;
  todayButton?: string;
  todayButtonDisabled?: string;
  clearButton?: string;
  clearButtonDisabled?: string;
  // Month picker view
  monthGrid?: string;
  monthGridItem?: string;
  monthGridItemSelected?: string;
  monthGridItemCurrent?: string;
  monthGridItemDisabled?: string;
  // Year picker view
  yearGrid?: string;
  yearGridItem?: string;
  yearGridItemSelected?: string;
  yearGridItemCurrent?: string;
  yearGridItemDisabled?: string;
  // Multiple months container
  multiMonthContainer?: string;
  multiMonthGrid?: string;
  multiMonthHeader?: string;
}

/** Event handlers */
export interface CalendarEventHandlers<TMode extends SelectionMode> {
  onChange?: (value: CalendarValue<TMode>) => void;
  onDayClick?: (date: Date, event: MouseEvent<HTMLButtonElement>) => void;
  onWeekClick?: (weekData: WeekData, event: MouseEvent<HTMLButtonElement>) => void;
  onMonthClick?: (month: number, year: number) => void;
  onMonthSelect?: (month: number, year: number) => void;
  onYearChange?: (year: number) => void;
  onPrevWeek?: (currentDate: Date) => void;
  onNextWeek?: (currentDate: Date) => void;
  onPrevMonth?: (month: number, year: number) => void;
  onNextMonth?: (month: number, year: number) => void;
  onPrevYear?: (year: number) => void;
  onNextYear?: (year: number) => void;
  onPrevDay?: (date: Date) => void;
  onNextDay?: (date: Date) => void;
  onTimeChange?: (time: TimeValue, target: "start" | "end" | "single") => void;
  onHourClick?: (hour: number, target: "start" | "end" | "single") => void;
  onHourSelect?: (hour: number, target: "start" | "end" | "single") => void;
  onMinuteClick?: (minute: number, target: "start" | "end" | "single") => void;
  onMinuteSelect?: (minute: number, target: "start" | "end" | "single") => void;
  onSecondsClick?: (seconds: number, target: "start" | "end" | "single") => void;
  onSecondsSelect?: (seconds: number, target: "start" | "end" | "single") => void;
  // New event handlers
  onTodayClick?: () => void;
  onClear?: () => void;
  onEscape?: () => void;
  onViewChange?: (view: CalendarView) => void;
  onFocusChange?: (date: Date | null) => void;
}

/** View modes for the calendar */
export type CalendarView = "days" | "months" | "years";

/** Highlighted date configuration */
export interface HighlightedDate {
  date: Date;
  className?: string;
  label?: string;
}

/** Main Calendar Props */
export interface CalendarProps<
  TMode extends SelectionMode = "single",
> extends CalendarEventHandlers<TMode> {
  /** Selection mode - single date or range */
  mode?: TMode;
  /** Current value */
  value?: CalendarValue<TMode>;
  /** Default value (uncontrolled) */
  defaultValue?: CalendarValue<TMode>;
  /** Show time picker */
  showTime?: boolean;
  /** Time picker position */
  timePosition?: TimePosition;
  /** Show seconds in time picker */
  showSeconds?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Custom function to disable specific dates */
  isDateDisabled?: (date: Date) => boolean;
  /** Minimum selectable time */
  minTime?: TimeValue;
  /** Maximum selectable time */
  maxTime?: TimeValue;
  /** Available years for selection */
  years?: number[];
  /** First day of the week (0 = Sunday, 1 = Monday, etc.) */
  weekStartsOn?: DayOfWeek;
  /** Show week numbers */
  showWeekNumbers?: boolean;
  /** Locale for formatting */
  locale?: string;
  /** Custom class names */
  classNames?: CalendarClassNames;
  /** Custom labels for i18n */
  labels?: CalendarLabels;
  /** Disabled state */
  disabled?: boolean;
  /** Layout mode: "auto" (default) detects container width, "desktop"/"mobile" forces layout */
  layout?: LayoutMode;
  /** Breakpoint in pixels for auto layout detection (default: 420) */
  mobileBreakpoint?: number;
  /** Custom day renderer */
  renderDay?: (day: DayCell, defaultRender: ReactNode) => ReactNode;
  /** Custom header renderer */
  renderHeader?: (props: HeaderRenderProps) => ReactNode;
  /** Show Today button */
  showTodayButton?: boolean;
  /** Show Clear button */
  showClearButton?: boolean;
  /** Dates to highlight with special styling */
  highlightedDates?: Date[] | HighlightedDate[];
  /** Current view mode */
  view?: CalendarView;
  /** Default view mode */
  defaultView?: CalendarView;
  /** Number of months to display (default: 1) */
  numberOfMonths?: number;
  /** Auto-focus the calendar on mount */
  autoFocus?: boolean;
}

export interface HeaderRenderProps {
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onMonthSelect: (month: number) => void;
  onYearSelect: (year: number) => void;
  years: number[];
}
