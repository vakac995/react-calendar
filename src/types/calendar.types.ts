import type { ReactNode, MouseEvent } from "react";

/** Day of the week starting from Sunday (0) to Saturday (6) */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Time position relative to calendar */
export type TimePosition = "bottom" | "top" | "side";

/** Selection mode */
export type SelectionMode = "single" | "range";

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

/** Calendar value - either single date or range */
export type CalendarValue<TMode extends SelectionMode> = TMode extends "single"
  ? DateTimeValue | null
  : DateRangeValue | null;

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
}

/** ClassNames for styling every element */
export interface CalendarClassNames {
  // Root
  root?: string;
  rootDefaultLayout?: string;
  rootSideLayout?: string;
  calendarWrapper?: string;
  // Header
  header?: string;
  headerNavigation?: string;
  headerNavigationButton?: string;
  headerNavigationButtonPrev?: string;
  headerNavigationButtonNext?: string;
  headerTitle?: string;
  headerMonthSelect?: string;
  headerYearSelect?: string;
  // Week days header
  weekDaysRow?: string;
  weekDayCell?: string;
  weekDayCellWeekend?: string;
  weekNumberPlaceholder?: string;
  // Calendar body
  body?: string;
  week?: string;
  weekNumber?: string;
  weekNumberCell?: string;
  // Day cells
  day?: string;
  dayButton?: string;
  dayToday?: string;
  daySelected?: string;
  dayInRange?: string;
  dayRangeStart?: string;
  dayRangeEnd?: string;
  dayDisabled?: string;
  dayOutsideMonth?: string;
  dayWeekend?: string;
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
  timeLabel?: string;
  timeSelectors?: string;
  timeSelector?: string;
  timeSelectorLabel?: string;
  timeSelectorScroll?: string;
  timeSelectorItem?: string;
  timeSelectorItemSelected?: string;
  timeSelectorItemDisabled?: string;
  timeSeparator?: string;
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
}

/** Main Calendar Props */
export interface CalendarProps<TMode extends SelectionMode = "single">
  extends CalendarEventHandlers<TMode> {
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
  /** Custom day renderer */
  renderDay?: (day: DayCell, defaultRender: ReactNode) => ReactNode;
  /** Custom header renderer */
  renderHeader?: (props: HeaderRenderProps) => ReactNode;
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
