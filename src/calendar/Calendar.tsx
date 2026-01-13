import type React from "react";
import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  type MouseEvent,
  type KeyboardEvent,
} from "react";

import type {
  SelectionMode,
  TimeValue,
  DateTimeValue,
  DateRangeValue,
  MultipleDatesValue,
  WeekValue,
  QuarterValue,
  CalendarValue,
  DayCell,
  WeekData,
  CalendarProps,
  HeaderRenderProps,
  CalendarLabels,
  LayoutMode,
  CalendarView,
} from "../types";

import { DAYS_IN_WEEK } from "../constants";
import { defaultLabels } from "../styles/defaultLabels";
import {
  getDefaultYears,
  isSameDay,
  addMonths,
  getMonthData,
  getWeekNumber,
  addDays,
} from "../utils";
import {
  getLocalizedMonthNames,
  getLocalizedDayNames,
  getFirstDayOfWeek,
  getTextDirection,
} from "../utils/date-input.utils";
import { TimePicker } from "../time-picker";

// Default breakpoint for mobile layout detection
const DEFAULT_MOBILE_BREAKPOINT = 420;

// ============================================================================
// MAIN CALENDAR COMPONENT
// ============================================================================

function CalendarComponent<TMode extends SelectionMode = "single">(
  props: CalendarProps<TMode>
): React.ReactElement {
  const {
    mode = "single" as TMode,
    value: controlledValue,
    defaultValue,
    showTime = false,
    timePosition = "bottom",
    showSeconds = false,
    minDate,
    maxDate,
    minTime,
    maxTime,
    years = getDefaultYears(),
    weekStartsOn: weekStartsOnProp,
    showWeekNumbers = false,
    locale = "en-US",
    classNames,
    labels: customLabels,
    disabled = false,
    layout = "auto",
    mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
    renderDay,
    renderHeader,
    // New props for enhanced features
    isDateDisabled,
    showTodayButton = false,
    showClearButton = false,
    highlightedDates,
    autoFocus = false,
    // View mode props
    view: controlledView,
    defaultView = "days",
    numberOfMonths = 1,
    // Event handlers
    onChange,
    onDayClick,
    onWeekClick,
    // onMonthClick - available but not used internally
    onMonthSelect,
    onYearChange,
    // onPrevWeek, onNextWeek, onPrevDay, onNextDay - available for external use
    onPrevMonth,
    onNextMonth,
    onPrevYear,
    onNextYear,
    onTimeChange,
    onHourClick,
    onHourSelect,
    onMinuteClick,
    onMinuteSelect,
    onSecondsClick,
    onSecondsSelect,
    // New event handlers
    onTodayClick,
    onClear,
    onEscape,
    onFocusChange,
    onViewChange,
  } = props;

  // Auto-detect weekStartsOn from locale if not explicitly provided
  const weekStartsOn = useMemo(() => {
    if (weekStartsOnProp !== undefined) return weekStartsOnProp;
    return getFirstDayOfWeek(locale);
  }, [weekStartsOnProp, locale]);

  // Auto-detect text direction from locale
  const textDirection = useMemo(() => getTextDirection(locale), [locale]);

  // Get localized labels based on locale
  const localizedLabels = useMemo<CalendarLabels>(() => {
    return {
      months: getLocalizedMonthNames(locale, "long"),
      shortDays: getLocalizedDayNames(locale, "short"),
    };
  }, [locale]);

  // Merge custom labels with locale-aware defaults
  const labels: CalendarLabels = useMemo(
    () => ({ ...defaultLabels, ...localizedLabels, ...customLabels }),
    [localizedLabels, customLabels]
  );

  // Ref for container width detection
  const rootRef = useRef<HTMLDivElement>(null);

  // State
  const [internalValue, setInternalValue] = useState<CalendarValue<TMode> | undefined>(
    defaultValue
  );
  const [viewDate, setViewDate] = useState(() => {
    if (mode === "range") {
      const rangeVal = (controlledValue ?? internalValue) as DateRangeValue | undefined;
      return rangeVal?.start?.date ?? new Date();
    }
    if (mode === "multiple") {
      const multipleVal = (controlledValue ?? internalValue) as MultipleDatesValue | undefined;
      return multipleVal?.[0]?.date ?? new Date();
    }
    const singleVal = (controlledValue ?? internalValue) as DateTimeValue | null | undefined;
    return singleVal?.date ?? new Date();
  });

  // For range selection, track which date we're selecting
  const [rangeSelectState, setRangeSelectState] = useState<"start" | "end">("start");

  // Current view mode (days, months, years)
  const [internalView, setInternalView] = useState<CalendarView>(defaultView);
  const isViewControlled = controlledView !== undefined;
  const currentView = isViewControlled ? controlledView : internalView;

  // Container width for responsive layout detection
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Collapsible time picker state for mobile
  const [timePickerExpanded, setTimePickerExpanded] = useState<{
    single: boolean;
    start: boolean;
    end: boolean;
  }>({ single: false, start: false, end: false });

  // Focused date for keyboard navigation
  const [focusedDate, setFocusedDate] = useState<Date | null>(() => {
    if (!autoFocus) return null;
    // Initialize with selected date or today
    if (mode === "range") {
      const rangeVal = (controlledValue ?? internalValue) as DateRangeValue | undefined;
      return rangeVal?.start?.date ?? new Date();
    }
    if (mode === "multiple") {
      const multipleVal = (controlledValue ?? internalValue) as MultipleDatesValue | undefined;
      return multipleVal?.[0]?.date ?? new Date();
    }
    const singleVal = (controlledValue ?? internalValue) as DateTimeValue | null | undefined;
    return singleVal?.date ?? new Date();
  });

  // Ref to day buttons for focus management
  const dayButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Refs for month/year grid items for focus management
  const monthGridRef = useRef<Map<number, HTMLButtonElement>>(new Map());
  const yearGridRef = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Focused month/year index for keyboard navigation in picker views
  const [focusedMonth, setFocusedMonth] = useState<number | null>(null);
  const [focusedYear, setFocusedYear] = useState<number | null>(null);

  // Convert highlighted dates to plain Date[] for getMonthData
  const highlightedDatesArray = useMemo(() => {
    if (!highlightedDates) return undefined;
    return highlightedDates.map((hd) => (hd instanceof Date ? hd : hd.date));
  }, [highlightedDates]);

  // ResizeObserver for container width detection
  useEffect(() => {
    if (layout !== "auto" || !rootRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [layout]);

  // Improved responsive detection: measure element width if available,
  // otherwise fall back to window.innerWidth and listen to resize.
  useEffect(() => {
    if (layout !== "auto") return;

    const setWidth = (): void => {
      const el = rootRef.current;
      const width = el ? el.getBoundingClientRect().width : window.innerWidth;
      setContainerWidth(width);
    };

    setWidth();

    let observer: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined" && rootRef.current) {
      observer = new ResizeObserver(() => setWidth());
      observer.observe(rootRef.current);
    } else {
      window.addEventListener("resize", setWidth);
    }

    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", setWidth);
    };
  }, [layout]);

  // Determine effective layout based on props and container width
  const effectiveLayout: Exclude<LayoutMode, "auto"> = useMemo(() => {
    if (layout !== "auto") return layout;
    if (containerWidth === null) return "desktop"; // Default before measurement
    return containerWidth < mobileBreakpoint ? "mobile" : "desktop";
  }, [layout, containerWidth, mobileBreakpoint]);

  // In mobile layout, force timePosition to "bottom" if it was "side"
  const effectiveTimePosition = useMemo(() => {
    if (effectiveLayout === "mobile" && timePosition === "side") {
      return "bottom";
    }
    return timePosition;
  }, [effectiveLayout, timePosition]);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Sync viewDate when controlled value changes programmatically
  // This ensures the calendar focuses on the selected date(s)
  useEffect(() => {
    if (!isControlled) return;

    let targetDate: Date | null = null;

    if (mode === "range") {
      const rangeVal = controlledValue as DateRangeValue | null | undefined;
      // For range, focus on start date if available, otherwise end date
      targetDate = rangeVal?.start?.date ?? rangeVal?.end?.date ?? null;
    } else if (mode === "multiple") {
      const multipleVal = controlledValue as MultipleDatesValue | undefined;
      // For multiple, focus on the first selected date
      targetDate = multipleVal?.[0]?.date ?? null;
    } else {
      const singleVal = controlledValue as DateTimeValue | null | undefined;
      targetDate = singleVal?.date ?? null;
    }

    // Only update viewDate if the target date is in a different month/year
    if (targetDate) {
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();
      if (targetMonth !== viewDate.getMonth() || targetYear !== viewDate.getFullYear()) {
        setViewDate(new Date(targetYear, targetMonth, 1));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, controlledValue, mode]); // Intentionally excluding viewDate to avoid loops

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  // Get ordered days based on weekStartsOn
  const orderedDays = useMemo(() => {
    const days = [...(labels.shortDays ?? defaultLabels.shortDays!)];
    const rotated = days.splice(0, weekStartsOn);
    return [...days, ...rotated];
  }, [weekStartsOn, labels.shortDays]);

  // Get current selection values
  const singleValue = mode === "single" ? (currentValue as DateTimeValue | null) : null;
  const rangeValue = mode === "range" ? (currentValue as DateRangeValue) : null;
  const multipleValue =
    mode === "multiple" ? (currentValue as MultipleDatesValue | undefined) : undefined;
  const weekValue = mode === "week" ? (currentValue as WeekValue | null) : null;
  const quarterValue = mode === "quarter" ? (currentValue as QuarterValue | null) : null;

  // Generate month data for single or multiple months
  const monthData = useMemo(
    () =>
      getMonthData(
        currentYear,
        currentMonth,
        weekStartsOn,
        singleValue,
        rangeValue,
        minDate,
        maxDate,
        isDateDisabled,
        highlightedDatesArray,
        multipleValue,
        weekValue,
        quarterValue
      ),
    [
      currentYear,
      currentMonth,
      weekStartsOn,
      singleValue,
      rangeValue,
      multipleValue,
      weekValue,
      quarterValue,
      minDate,
      maxDate,
      isDateDisabled,
      highlightedDatesArray,
    ]
  );

  // Generate data for all months when numberOfMonths > 1
  const allMonthsData = useMemo(() => {
    if (numberOfMonths <= 1) return [monthData];

    const months = [];
    for (let i = 0; i < numberOfMonths; i++) {
      const offsetDate = addMonths(viewDate, i);
      months.push(
        getMonthData(
          offsetDate.getFullYear(),
          offsetDate.getMonth(),
          weekStartsOn,
          singleValue,
          rangeValue,
          minDate,
          maxDate,
          isDateDisabled,
          highlightedDatesArray,
          multipleValue,
          weekValue,
          quarterValue
        )
      );
    }
    return months;
  }, [
    numberOfMonths,
    monthData,
    viewDate,
    weekStartsOn,
    singleValue,
    rangeValue,
    multipleValue,
    weekValue,
    quarterValue,
    minDate,
    maxDate,
    isDateDisabled,
    highlightedDatesArray,
  ]);

  // Update value helper
  const updateValue = useCallback(
    (newValue: CalendarValue<TMode>) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  // Handle day click
  const handleDayClick = useCallback(
    (day: DayCell, event: MouseEvent<HTMLButtonElement>) => {
      if (day.isDisabled || disabled) return;

      onDayClick?.(day.date, event);

      if (mode === "single") {
        const defaultTime: TimeValue = { hours: 0, minutes: 0, seconds: 0 };
        const existingTime = singleValue?.time ?? defaultTime;
        const newValue: DateTimeValue = {
          date: day.date,
          time: showTime ? existingTime : undefined,
        };
        updateValue(newValue as CalendarValue<TMode>);
      } else if (mode === "multiple") {
        // Multiple dates mode - toggle selection
        const currentMultiple = multipleValue ?? [];
        const existingIndex = currentMultiple.findIndex((dtv) => isSameDay(dtv.date, day.date));

        let newValue: MultipleDatesValue;
        if (existingIndex >= 0) {
          // Remove date if already selected
          newValue = [...currentMultiple];
          newValue.splice(existingIndex, 1);
        } else {
          // Add date if not selected
          const defaultTime: TimeValue = { hours: 0, minutes: 0, seconds: 0 };
          newValue = [
            ...currentMultiple,
            {
              date: day.date,
              time: showTime ? defaultTime : undefined,
            },
          ];
          // Sort by date for consistent ordering
          newValue.sort((a, b) => a.date.getTime() - b.date.getTime());
        }
        updateValue(newValue as CalendarValue<TMode>);
      } else if (mode === "week") {
        // Week picker mode - select entire week
        const weekNum = getWeekNumber(day.date);
        const dayOfWeek = day.date.getDay();
        // Calculate start of week based on weekStartsOn
        const daysToSubtract = (dayOfWeek - weekStartsOn + 7) % 7;
        const weekStart = addDays(day.date, -daysToSubtract);
        const weekEnd = addDays(weekStart, 6);

        const newValue: WeekValue = {
          weekNumber: weekNum,
          year: weekStart.getFullYear(),
          startDate: weekStart,
          endDate: weekEnd,
        };
        updateValue(newValue as CalendarValue<TMode>);
      } else if (mode === "quarter") {
        // Quarter picker mode - select entire quarter
        const clickedMonth = day.date.getMonth();
        const clickedYear = day.date.getFullYear();
        // Calculate quarter (0-based month / 3, then add 1)
        const quarter = (Math.floor(clickedMonth / 3) + 1) as 1 | 2 | 3 | 4;
        // Quarter start: first day of first month in quarter
        const quarterStartMonth = (quarter - 1) * 3;
        const quarterStart = new Date(clickedYear, quarterStartMonth, 1);
        // Quarter end: last day of last month in quarter
        const quarterEndMonth = quarterStartMonth + 2;
        const quarterEnd = new Date(clickedYear, quarterEndMonth + 1, 0);

        const newValue: QuarterValue = {
          quarter,
          year: clickedYear,
          startDate: quarterStart,
          endDate: quarterEnd,
        };
        updateValue(newValue as CalendarValue<TMode>);
      } else {
        // Range mode
        const currentRange = rangeValue ?? { start: null, end: null };
        const startTime: TimeValue = { hours: 0, minutes: 0, seconds: 0 };
        const endTime: TimeValue = { hours: 23, minutes: 59, seconds: 59 };

        if (rangeSelectState === "start" || (currentRange.start && currentRange.end)) {
          // Starting new selection or resetting
          const newValue: DateRangeValue = {
            start: {
              date: day.date,
              time: showTime ? startTime : undefined,
            },
            end: null,
          };
          updateValue(newValue as CalendarValue<TMode>);
          setRangeSelectState("end");
        } else {
          // Completing the range
          const startDate = currentRange.start!.date;
          let finalStart = currentRange.start!;
          let finalEnd: DateTimeValue = {
            date: day.date,
            time: endTime,
          };

          // Handle same day selection
          if (isSameDay(startDate, day.date)) {
            finalStart = {
              date: startDate,
              time: showTime ? startTime : undefined,
            };
            finalEnd = {
              date: day.date,
              time: endTime,
            };
          } else if (day.date < startDate) {
            // Swap if end is before start
            finalEnd = {
              ...finalStart,
              time: endTime,
            };
            finalStart = {
              date: day.date,
              time: showTime ? startTime : undefined,
            };
          }

          const newValue: DateRangeValue = {
            start: finalStart,
            end: finalEnd,
          };
          updateValue(newValue as CalendarValue<TMode>);
          setRangeSelectState("start");
        }
      }
    },
    [
      mode,
      disabled,
      showTime,
      singleValue,
      rangeValue,
      multipleValue,
      weekStartsOn,
      rangeSelectState,
      onDayClick,
      updateValue,
    ]
  );

  // Navigation handlers
  const handlePrevMonth = useCallback(() => {
    setViewDate((prev) => addMonths(prev, -1));
    onPrevMonth?.(
      currentMonth === 0 ? 11 : currentMonth - 1,
      currentMonth === 0 ? currentYear - 1 : currentYear
    );
  }, [currentMonth, currentYear, onPrevMonth]);

  const handleNextMonth = useCallback(() => {
    setViewDate((prev) => addMonths(prev, 1));
    onNextMonth?.(
      currentMonth === 11 ? 0 : currentMonth + 1,
      currentMonth === 11 ? currentYear + 1 : currentYear
    );
  }, [currentMonth, currentYear, onNextMonth]);

  const handlePrevYear = useCallback(() => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() - 1);
      return newDate;
    });
    onPrevYear?.(currentYear - 1);
  }, [currentYear, onPrevYear]);

  const handleNextYear = useCallback(() => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + 1);
      return newDate;
    });
    onNextYear?.(currentYear + 1);
  }, [currentYear, onNextYear]);

  const handleMonthSelectChange = useCallback(
    (month: number) => {
      setViewDate((prev) => {
        const newDate = new Date(prev);
        newDate.setMonth(month);
        return newDate;
      });
      onMonthSelect?.(month, currentYear);
    },
    [currentYear, onMonthSelect]
  );

  const handleYearSelectChange = useCallback(
    (year: number) => {
      setViewDate((prev) => {
        const newDate = new Date(prev);
        newDate.setFullYear(year);
        return newDate;
      });
      onYearChange?.(year);
    },
    [onYearChange]
  );

  // View change handler
  const setView = useCallback(
    (newView: CalendarView) => {
      if (!isViewControlled) {
        setInternalView(newView);
      }
      onViewChange?.(newView);
      // Reset focused month/year when switching views
      if (newView === "months") {
        setFocusedMonth(currentMonth);
      } else if (newView === "years") {
        setFocusedYear(currentYear);
      } else {
        setFocusedMonth(null);
        setFocusedYear(null);
      }
    },
    [isViewControlled, onViewChange, currentMonth, currentYear]
  );

  // Handle month click in month picker view
  const handleMonthPickerClick = useCallback(
    (month: number) => {
      handleMonthSelectChange(month);
      setView("days");
    },
    [handleMonthSelectChange, setView]
  );

  // Handle year click in year picker view
  const handleYearPickerClick = useCallback(
    (year: number) => {
      handleYearSelectChange(year);
      setView("months"); // Go to month picker after selecting year
    },
    [handleYearSelectChange, setView]
  );

  // Toggle month picker view
  const handleMonthTitleClick = useCallback(() => {
    if (disabled) return;
    setView(currentView === "months" ? "days" : "months");
  }, [disabled, currentView, setView]);

  // Toggle year picker view
  const handleYearTitleClick = useCallback(() => {
    if (disabled) return;
    setView(currentView === "years" ? "days" : "years");
  }, [disabled, currentView, setView]);

  const handleWeekClick = useCallback(
    (week: WeekData, event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onWeekClick?.(week, event);

      // In range mode, select the entire week
      if (mode === "range" && week.days.length > 0) {
        const firstDay = week.days[0];
        const lastDay = week.days[week.days.length - 1];
        if (!firstDay || !lastDay) return;

        const newValue: DateRangeValue = {
          start: {
            date: firstDay.date,
            time: showTime ? { hours: 0, minutes: 0, seconds: 0 } : undefined,
          },
          end: {
            date: lastDay.date,
            time: { hours: 23, minutes: 59, seconds: 59 },
          },
        };
        updateValue(newValue as CalendarValue<TMode>);
        setRangeSelectState("start");
      }
    },
    [disabled, onWeekClick, mode, showTime, updateValue]
  );

  // Note: Week and day navigation handlers can be added here if needed
  // for programmatic navigation. Currently month/year navigation is supported.

  // Today button handler - also select today's date depending on mode
  const handleTodayClick = useCallback(() => {
    if (disabled) return;

    const today = new Date();
    setViewDate(today);
    // Clear focusedDate - the ring should only show during keyboard navigation
    setFocusedDate(null);

    const defaultStartTime = { hours: 0, minutes: 0, seconds: 0 } as const;
    const defaultEndTime = { hours: 23, minutes: 59, seconds: 59 } as const;

    try {
      if (mode === "single") {
        const existingTime: TimeValue = singleValue?.time ?? defaultStartTime;
        const newValue: DateTimeValue = {
          date: today,
          time: showTime ? existingTime : undefined,
        };
        updateValue(newValue as CalendarValue<TMode>);
      } else if (mode === "multiple") {
        const currentMultiple = multipleValue ?? [];
        const idx = currentMultiple.findIndex((d) => isSameDay(d.date, today));
        let newValue: MultipleDatesValue;
        if (idx >= 0) {
          newValue = [...currentMultiple];
          newValue.splice(idx, 1);
        } else {
          newValue = [
            ...currentMultiple,
            { date: today, time: showTime ? defaultStartTime : undefined },
          ];
          newValue.sort((a, b) => a.date.getTime() - b.date.getTime());
        }
        updateValue(newValue as CalendarValue<TMode>);
      } else if (mode === "week") {
        const weekNum = getWeekNumber(today);
        const dayOfWeek = today.getDay();
        const daysToSubtract = (dayOfWeek - weekStartsOn + 7) % 7;
        const weekStart = addDays(today, -daysToSubtract);
        const weekEnd = addDays(weekStart, 6);
        const newValue: WeekValue = {
          weekNumber: weekNum,
          year: weekStart.getFullYear(),
          startDate: weekStart,
          endDate: weekEnd,
        };
        updateValue(newValue as CalendarValue<TMode>);
      } else if (mode === "quarter") {
        const clickedMonth = today.getMonth();
        const clickedYear = today.getFullYear();
        const quarter = (Math.floor(clickedMonth / 3) + 1) as 1 | 2 | 3 | 4;
        const quarterStartMonth = (quarter - 1) * 3;
        const quarterStart = new Date(clickedYear, quarterStartMonth, 1);
        const quarterEndMonth = quarterStartMonth + 2;
        const quarterEnd = new Date(clickedYear, quarterEndMonth + 1, 0);
        const newValue: QuarterValue = {
          quarter,
          year: clickedYear,
          startDate: quarterStart,
          endDate: quarterEnd,
        };
        updateValue(newValue as CalendarValue<TMode>);
      } else {
        // range
        const newValue: DateRangeValue = {
          start: { date: today, time: showTime ? defaultStartTime : undefined },
          end: { date: today, time: defaultEndTime },
        };
        updateValue(newValue as CalendarValue<TMode>);
      }
    } finally {
      onTodayClick?.();
      onFocusChange?.(today);
    }
  }, [
    disabled,
    mode,
    singleValue,
    multipleValue,
    showTime,
    updateValue,
    weekStartsOn,
    onTodayClick,
    onFocusChange,
  ]);

  // Clear button handler
  const handleClearClick = useCallback(() => {
    if (mode === "single") {
      updateValue(null as CalendarValue<TMode>);
    } else if (mode === "multiple") {
      updateValue([] as unknown as CalendarValue<TMode>);
    } else if (mode === "week" || mode === "quarter") {
      updateValue(null as CalendarValue<TMode>);
    } else {
      updateValue({ start: null, end: null } as CalendarValue<TMode>);
    }
    setRangeSelectState("start");
    // Clear focused date to remove the focus ring
    setFocusedDate(null);
    onClear?.();
  }, [mode, updateValue, onClear]);

  // Keyboard navigation handler for days view
  const handleDaysKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      let newFocusedDate: Date | null = null;

      // Initialize focused date if not set
      const currentFocus = focusedDate ?? viewDate;

      switch (key) {
        case "ArrowLeft":
          event.preventDefault();
          newFocusedDate = new Date(currentFocus);
          newFocusedDate.setDate(newFocusedDate.getDate() - 1);
          break;
        case "ArrowRight":
          event.preventDefault();
          newFocusedDate = new Date(currentFocus);
          newFocusedDate.setDate(newFocusedDate.getDate() + 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          newFocusedDate = new Date(currentFocus);
          newFocusedDate.setDate(newFocusedDate.getDate() - 7);
          break;
        case "ArrowDown":
          event.preventDefault();
          newFocusedDate = new Date(currentFocus);
          newFocusedDate.setDate(newFocusedDate.getDate() + 7);
          break;
        case "PageUp":
          event.preventDefault();
          if (event.shiftKey) {
            newFocusedDate = new Date(currentFocus);
            newFocusedDate.setFullYear(newFocusedDate.getFullYear() - 1);
          } else {
            newFocusedDate = addMonths(currentFocus, -1);
          }
          break;
        case "PageDown":
          event.preventDefault();
          if (event.shiftKey) {
            newFocusedDate = new Date(currentFocus);
            newFocusedDate.setFullYear(newFocusedDate.getFullYear() + 1);
          } else {
            newFocusedDate = addMonths(currentFocus, 1);
          }
          break;
        case "Home": {
          event.preventDefault();
          newFocusedDate = new Date(currentFocus);
          const dayOfWeek = newFocusedDate.getDay();
          const daysToSubtract = (dayOfWeek - weekStartsOn + 7) % 7;
          newFocusedDate.setDate(newFocusedDate.getDate() - daysToSubtract);
          break;
        }
        case "End": {
          event.preventDefault();
          newFocusedDate = new Date(currentFocus);
          const dow = newFocusedDate.getDay();
          const daysToAdd = (6 - dow + weekStartsOn + 7) % 7;
          newFocusedDate.setDate(newFocusedDate.getDate() + daysToAdd);
          break;
        }
        case "Enter":
        case " ":
          event.preventDefault();
          if (focusedDate) {
            const focusedDayCell = monthData.weeks
              .flatMap((w) => w.days)
              .find((d) => isSameDay(d.date, focusedDate));
            if (focusedDayCell && !focusedDayCell.isDisabled) {
              handleDayClick(focusedDayCell, event as unknown as MouseEvent<HTMLButtonElement>);
            }
          }
          return;
        case "Escape":
          event.preventDefault();
          onEscape?.();
          return;
        default:
          return;
      }

      if (newFocusedDate) {
        if (minDate && newFocusedDate < minDate) {
          newFocusedDate = new Date(minDate);
        }
        if (maxDate && newFocusedDate > maxDate) {
          newFocusedDate = new Date(maxDate);
        }
        if (isDateDisabled?.(newFocusedDate)) {
          return;
        }

        setFocusedDate(newFocusedDate);
        onFocusChange?.(newFocusedDate);

        if (
          newFocusedDate.getMonth() !== viewDate.getMonth() ||
          newFocusedDate.getFullYear() !== viewDate.getFullYear()
        ) {
          setViewDate(new Date(newFocusedDate.getFullYear(), newFocusedDate.getMonth(), 1));
        }

        requestAnimationFrame(() => {
          const key = `${newFocusedDate!.getFullYear()}-${newFocusedDate!.getMonth()}-${newFocusedDate!.getDate()}`;
          const button = dayButtonsRef.current.get(key);
          button?.focus();
        });
      }
    },
    [
      focusedDate,
      viewDate,
      weekStartsOn,
      minDate,
      maxDate,
      isDateDisabled,
      monthData.weeks,
      handleDayClick,
      onEscape,
      onFocusChange,
    ]
  );

  // Keyboard navigation handler for months view
  const handleMonthsKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      const current = focusedMonth ?? currentMonth;

      switch (key) {
        case "ArrowLeft":
          event.preventDefault();
          setFocusedMonth(current > 0 ? current - 1 : 11);
          break;
        case "ArrowRight":
          event.preventDefault();
          setFocusedMonth(current < 11 ? current + 1 : 0);
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedMonth(current >= 3 ? current - 3 : current + 9);
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedMonth(current <= 8 ? current + 3 : current - 9);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          handleMonthPickerClick(focusedMonth ?? currentMonth);
          break;
        case "Escape":
          event.preventDefault();
          setView("days");
          break;
        default:
          return;
      }

      requestAnimationFrame(() => {
        const button = monthGridRef.current.get(focusedMonth ?? currentMonth);
        button?.focus();
      });
    },
    [focusedMonth, currentMonth, handleMonthPickerClick, setView]
  );

  // Keyboard navigation handler for years view
  const handleYearsKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      const current = focusedYear ?? currentYear;
      const yearIndex = years.indexOf(current);

      switch (key) {
        case "ArrowLeft": {
          event.preventDefault();
          const prevYear = years[yearIndex - 1];
          if (yearIndex > 0 && prevYear !== undefined) setFocusedYear(prevYear);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          const nextYear = years[yearIndex + 1];
          if (yearIndex < years.length - 1 && nextYear !== undefined) setFocusedYear(nextYear);
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          const upYear = years[yearIndex - 4];
          if (yearIndex >= 4 && upYear !== undefined) setFocusedYear(upYear);
          break;
        }
        case "ArrowDown": {
          event.preventDefault();
          const downYear = years[yearIndex + 4];
          if (yearIndex + 4 < years.length && downYear !== undefined) setFocusedYear(downYear);
          break;
        }
        case "Enter":
        case " ":
          event.preventDefault();
          handleYearPickerClick(focusedYear ?? currentYear);
          break;
        case "Escape":
          event.preventDefault();
          setView("days");
          break;
        default:
          return;
      }

      requestAnimationFrame(() => {
        const button = yearGridRef.current.get(focusedYear ?? currentYear);
        button?.focus();
      });
    },
    [focusedYear, currentYear, years, handleYearPickerClick, setView]
  );

  // Main keyboard handler that delegates to the appropriate view handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      switch (currentView) {
        case "days":
          handleDaysKeyDown(event);
          break;
        case "months":
          handleMonthsKeyDown(event);
          break;
        case "years":
          handleYearsKeyDown(event);
          break;
      }
    },
    [disabled, currentView, handleDaysKeyDown, handleMonthsKeyDown, handleYearsKeyDown]
  );

  // Time change handler
  const handleTimeChange = useCallback(
    (time: TimeValue, target: "start" | "end" | "single") => {
      onTimeChange?.(time, target);

      if (mode === "single") {
        if (!singleValue) return;
        const newValue: DateTimeValue = { ...singleValue, time };
        updateValue(newValue as CalendarValue<TMode>);
      } else {
        if (!rangeValue) return;
        const newRange = { ...rangeValue };
        if (target === "start" && newRange.start) {
          newRange.start = { ...newRange.start, time };
        } else if (target === "end" && newRange.end) {
          newRange.end = { ...newRange.end, time };
        }
        updateValue(newRange as CalendarValue<TMode>);
      }
    },
    [mode, singleValue, rangeValue, onTimeChange, updateValue]
  );

  // Header render props
  const headerRenderProps: HeaderRenderProps = {
    currentMonth,
    currentYear,
    onPrevMonth: handlePrevMonth,
    onNextMonth: handleNextMonth,
    onPrevYear: handlePrevYear,
    onNextYear: handleNextYear,
    onMonthSelect: handleMonthSelectChange,
    onYearSelect: handleYearSelectChange,
    years,
  };

  // Default header
  const defaultHeader = (
    <div
      className={[classNames?.header, disabled && classNames?.headerDisabled]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={classNames?.headerNavigation}>
        <button
          type="button"
          onClick={handlePrevYear}
          disabled={disabled}
          className={[
            classNames?.headerNavigationButton,
            classNames?.headerNavigationButtonPrev,
            disabled && classNames?.headerNavigationButtonDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={labels.previousYear}
        >
          {labels.previousYearIcon ?? defaultLabels.previousYearIcon}
        </button>
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={disabled}
          className={[
            classNames?.headerNavigationButton,
            classNames?.headerNavigationButtonPrev,
            disabled && classNames?.headerNavigationButtonDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={labels.previousMonth}
        >
          {labels.previousMonthIcon ?? defaultLabels.previousMonthIcon}
        </button>
      </div>

      <div className={classNames?.headerTitle}>
        {/* Month button - toggles month picker */}
        <button
          type="button"
          onClick={handleMonthTitleClick}
          disabled={disabled}
          className={[
            classNames?.headerTitleButton,
            disabled && classNames?.headerTitleButtonDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={labels.monthPickerLabel ?? "Select month"}
          aria-expanded={currentView === "months"}
        >
          {(labels.months ?? defaultLabels.months!)[currentMonth]}
        </button>
        {/* Year button - toggles year picker */}
        <button
          type="button"
          onClick={handleYearTitleClick}
          disabled={disabled}
          className={[
            classNames?.headerTitleButton,
            disabled && classNames?.headerTitleButtonDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={labels.yearPickerLabel ?? "Select year"}
          aria-expanded={currentView === "years"}
        >
          {currentYear}
        </button>
      </div>

      <div className={classNames?.headerNavigation}>
        <button
          type="button"
          onClick={handleNextMonth}
          disabled={disabled}
          className={[
            classNames?.headerNavigationButton,
            classNames?.headerNavigationButtonNext,
            disabled && classNames?.headerNavigationButtonDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={labels.nextMonth}
        >
          {labels.nextMonthIcon ?? defaultLabels.nextMonthIcon}
        </button>
        <button
          type="button"
          onClick={handleNextYear}
          disabled={disabled}
          className={[
            classNames?.headerNavigationButton,
            classNames?.headerNavigationButtonNext,
            disabled && classNames?.headerNavigationButtonDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={labels.nextYear}
        >
          {labels.nextYearIcon ?? defaultLabels.nextYearIcon}
        </button>
      </div>
    </div>
  );

  // Time pickers
  const timePickerPositionClass =
    effectiveTimePosition === "top"
      ? classNames?.timePickerWrapperTop
      : effectiveTimePosition === "bottom"
        ? classNames?.timePickerWrapperBottom
        : classNames?.timePickerWrapperSide;

  // Helper to format time for display in collapsed state
  const formatTimeDisplay = (time: TimeValue): string => {
    const h = String(time.hours).padStart(2, "0");
    const m = String(time.minutes).padStart(2, "0");
    const s = String(time.seconds).padStart(2, "0");
    return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
  };

  // Toggle handler for collapsible time picker
  const toggleTimePicker = useCallback((target: "single" | "start" | "end") => {
    setTimePickerExpanded((prev) => ({
      ...prev,
      [target]: !prev[target],
    }));
  }, []);

  // Collapsible time picker wrapper for mobile
  const renderCollapsibleTimePicker = (
    time: TimeValue,
    label: string | undefined,
    target: "single" | "start" | "end",
    isDisabled: boolean
  ): React.ReactElement => {
    const isExpanded = timePickerExpanded[target];

    return (
      <div
        className={[
          classNames?.timePickerCollapsed,
          isDisabled && classNames?.timePickerCollapsedDisabled,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          onClick={() => toggleTimePicker(target)}
          disabled={isDisabled}
          className={[
            classNames?.timePickerToggle,
            isDisabled && classNames?.timePickerToggleDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-expanded={isExpanded}
        >
          <span
            className={[
              classNames?.timePickerToggleText,
              isDisabled && classNames?.timePickerToggleTextDisabled,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {label ?? "Time"}: {formatTimeDisplay(time)}
          </span>
          <svg
            className={[
              classNames?.timePickerToggleIcon,
              isDisabled && classNames?.timePickerToggleIconDisabled,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div
          className={[
            classNames?.timePickerContent,
            isExpanded && classNames?.timePickerContentExpanded,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            maxHeight: isExpanded ? "200px" : "0",
            opacity: isExpanded ? 1 : 0,
          }}
        >
          <TimePicker
            time={time}
            label={undefined} // Label shown in toggle button
            showSeconds={showSeconds}
            disabled={isDisabled}
            minTime={minTime}
            maxTime={maxTime}
            classNames={classNames}
            labels={labels}
            target={target}
            onTimeChange={handleTimeChange}
            onHourClick={onHourClick}
            onHourSelect={onHourSelect}
            onMinuteClick={onMinuteClick}
            onMinuteSelect={onMinuteSelect}
            onSecondsClick={onSecondsClick}
            onSecondsSelect={onSecondsSelect}
          />
        </div>
      </div>
    );
  };

  // Mobile time pickers (collapsible)
  const mobileTimePickers = showTime && effectiveLayout === "mobile" && (
    <div
      className={[classNames?.timePickerWrapper, timePickerPositionClass].filter(Boolean).join(" ")}
    >
      {mode === "single" ? (
        renderCollapsibleTimePicker(
          singleValue?.time ?? { hours: 0, minutes: 0, seconds: 0 },
          labels.timeLabel,
          "single",
          disabled || !singleValue
        )
      ) : (
        <div className="flex w-full flex-col gap-2">
          {renderCollapsibleTimePicker(
            rangeValue?.start?.time ?? { hours: 0, minutes: 0, seconds: 0 },
            labels.startTimeLabel,
            "start",
            disabled || !rangeValue?.start
          )}
          {renderCollapsibleTimePicker(
            rangeValue?.end?.time ?? { hours: 23, minutes: 59, seconds: 59 },
            labels.endTimeLabel,
            "end",
            disabled || !rangeValue?.end
          )}
        </div>
      )}
    </div>
  );

  // Desktop time pickers (standard)
  const desktopTimePickers = showTime && effectiveLayout === "desktop" && (
    <div
      className={[classNames?.timePickerWrapper, timePickerPositionClass].filter(Boolean).join(" ")}
    >
      {mode === "single" ? (
        <TimePicker
          time={singleValue?.time ?? { hours: 0, minutes: 0, seconds: 0 }}
          label={labels.timeLabel}
          showSeconds={showSeconds}
          disabled={disabled || !singleValue}
          minTime={minTime}
          maxTime={maxTime}
          classNames={classNames}
          labels={labels}
          target="single"
          onTimeChange={handleTimeChange}
          onHourClick={onHourClick}
          onHourSelect={onHourSelect}
          onMinuteClick={onMinuteClick}
          onMinuteSelect={onMinuteSelect}
          onSecondsClick={onSecondsClick}
          onSecondsSelect={onSecondsSelect}
        />
      ) : (
        <>
          <TimePicker
            time={rangeValue?.start?.time ?? { hours: 0, minutes: 0, seconds: 0 }}
            label={labels.startTimeLabel}
            showSeconds={showSeconds}
            disabled={disabled || !rangeValue?.start}
            minTime={minTime}
            maxTime={maxTime}
            classNames={classNames}
            labels={labels}
            target="start"
            onTimeChange={handleTimeChange}
            onHourClick={onHourClick}
            onHourSelect={onHourSelect}
            onMinuteClick={onMinuteClick}
            onMinuteSelect={onMinuteSelect}
            onSecondsClick={onSecondsClick}
            onSecondsSelect={onSecondsSelect}
          />
          <TimePicker
            time={rangeValue?.end?.time ?? { hours: 23, minutes: 59, seconds: 59 }}
            label={labels.endTimeLabel}
            showSeconds={showSeconds}
            disabled={disabled || !rangeValue?.end}
            minTime={minTime}
            maxTime={maxTime}
            classNames={classNames}
            labels={labels}
            target="end"
            onTimeChange={handleTimeChange}
            onHourClick={onHourClick}
            onHourSelect={onHourSelect}
            onMinuteClick={onMinuteClick}
            onMinuteSelect={onMinuteSelect}
            onSecondsClick={onSecondsClick}
            onSecondsSelect={onSecondsSelect}
          />
        </>
      )}
    </div>
  );

  // Combined time pickers - renders either mobile or desktop version
  const timePickers = mobileTimePickers || desktopTimePickers;

  // Footer with Today/Clear buttons
  const showFooter = showTodayButton || showClearButton;
  const hasValue =
    mode === "single"
      ? !!singleValue
      : mode === "multiple"
        ? (multipleValue?.length ?? 0) > 0
        : mode === "week"
          ? !!weekValue
          : mode === "quarter"
            ? !!quarterValue
            : !!(rangeValue?.start ?? rangeValue?.end);

  const footer = showFooter && (
    <div className={classNames?.footer}>
      {showTodayButton && (
        <button
          type="button"
          onClick={handleTodayClick}
          disabled={disabled}
          className={[
            classNames?.footerButton,
            classNames?.todayButton,
            disabled && classNames?.footerButtonDisabled,
            disabled && classNames?.todayButtonDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {labels.todayButton ?? "Today"}
        </button>
      )}
      {showClearButton && (
        <button
          type="button"
          onClick={handleClearClick}
          disabled={disabled || !hasValue}
          className={[
            classNames?.footerButton,
            classNames?.clearButton,
            (disabled || !hasValue) && classNames?.footerButtonDisabled,
            (disabled || !hasValue) && classNames?.clearButtonDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {labels.clearButton ?? "Clear"}
        </button>
      )}
    </div>
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={rootRef}
      dir={textDirection}
      onKeyDown={handleKeyDown}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="application"
      aria-label="Calendar"
      className={[
        classNames?.root,
        disabled && classNames?.rootDisabled,
        effectiveTimePosition === "side"
          ? classNames?.rootSideLayout
          : classNames?.rootDefaultLayout,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[classNames?.calendarWrapper, disabled && classNames?.calendarWrapperDisabled]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Header */}
        {renderHeader ? renderHeader(headerRenderProps) : defaultHeader}

        {/* Time picker - top position */}
        {effectiveTimePosition === "top" && currentView === "days" && timePickers}

        {/* Month Picker View */}
        {currentView === "months" && (
          <div className={classNames?.monthGrid} role="grid" aria-label={labels.monthPickerLabel}>
            {(labels.months ?? defaultLabels.months!).map((monthName, monthIndex) => {
              const isSelected = monthIndex === currentMonth;
              const isCurrent =
                monthIndex === new Date().getMonth() && currentYear === new Date().getFullYear();
              const isFocused = focusedMonth === monthIndex;

              return (
                <button
                  key={monthName}
                  type="button"
                  ref={(el) => {
                    if (el) {
                      monthGridRef.current.set(monthIndex, el);
                    } else {
                      monthGridRef.current.delete(monthIndex);
                    }
                  }}
                  onClick={() => handleMonthPickerClick(monthIndex)}
                  disabled={disabled}
                  tabIndex={isFocused || (focusedMonth === null && isSelected) ? 0 : -1}
                  className={[
                    classNames?.monthGridItem,
                    isSelected && classNames?.monthGridItemSelected,
                    isCurrent && !isSelected && classNames?.monthGridItemCurrent,
                    disabled && classNames?.monthGridItemDisabled,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={isSelected}
                >
                  {monthName}
                </button>
              );
            })}
          </div>
        )}

        {/* Year Picker View */}
        {currentView === "years" && (
          <div className={classNames?.yearGrid} role="grid" aria-label={labels.yearPickerLabel}>
            {years.map((year) => {
              const isSelected = year === currentYear;
              const isCurrent = year === new Date().getFullYear();
              const isFocused = focusedYear === year;

              return (
                <button
                  key={year}
                  type="button"
                  ref={(el) => {
                    if (el) {
                      yearGridRef.current.set(year, el);
                    } else {
                      yearGridRef.current.delete(year);
                    }
                  }}
                  onClick={() => handleYearPickerClick(year)}
                  disabled={disabled}
                  tabIndex={isFocused || (focusedYear === null && isSelected) ? 0 : -1}
                  className={[
                    classNames?.yearGridItem,
                    isSelected && classNames?.yearGridItemSelected,
                    isCurrent && !isSelected && classNames?.yearGridItemCurrent,
                    disabled && classNames?.yearGridItemDisabled,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={isSelected}
                >
                  {year}
                </button>
              );
            })}
          </div>
        )}

        {/* Days View - Single or Multiple Months */}
        {currentView === "days" && (
          <div className={numberOfMonths > 1 ? classNames?.multiMonthContainer : undefined}>
            {allMonthsData.map((monthDataItem, monthOffset) => {
              const monthDate = addMonths(viewDate, monthOffset);
              const monthIndex = monthDate.getMonth();
              const yearValue = monthDate.getFullYear();
              const monthNames = labels.months ?? defaultLabels.months!;

              return (
                <div
                  key={`${yearValue}-${monthIndex}`}
                  className={numberOfMonths > 1 ? classNames?.multiMonthGrid : undefined}
                >
                  {/* Month header for multi-month view */}
                  {numberOfMonths > 1 && (
                    <div className={classNames?.multiMonthHeader}>
                      {monthNames[monthIndex]} {yearValue}
                    </div>
                  )}

                  {/* Week day headers */}
                  <div
                    className={classNames?.weekDaysRow}
                    style={{
                      gridTemplateColumns: showWeekNumbers
                        ? `auto repeat(${DAYS_IN_WEEK}, 1fr)`
                        : `repeat(${DAYS_IN_WEEK}, 1fr)`,
                    }}
                  >
                    {showWeekNumbers && <div className={classNames?.weekNumberPlaceholder} />}
                    {orderedDays.map((day, index) => {
                      const isWeekend =
                        (index + weekStartsOn) % 7 === 0 || (index + weekStartsOn) % 7 === 6;
                      return (
                        <div
                          key={day}
                          className={[
                            classNames?.weekDayCell,
                            isWeekend && classNames?.weekDayCellWeekend,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>

                  {/* Calendar body */}
                  <div className={classNames?.body}>
                    {monthDataItem.weeks.map((week) => (
                      <div
                        key={week.weekNumber + "-" + week.startDate.getTime()}
                        className={classNames?.week}
                        style={{
                          gridTemplateColumns: showWeekNumbers
                            ? `auto repeat(${DAYS_IN_WEEK}, 1fr)`
                            : `repeat(${DAYS_IN_WEEK}, 1fr)`,
                        }}
                      >
                        {showWeekNumbers && (
                          <button
                            type="button"
                            onClick={(e) => handleWeekClick(week, e)}
                            disabled={disabled}
                            className={[
                              classNames?.weekNumber,
                              classNames?.weekNumberCell,
                              disabled && classNames?.weekNumberDisabled,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {week.weekNumber}
                          </button>
                        )}
                        {week.days.map((day) => {
                          const dayIndex = day.date.getDay();
                          const isWeekend = dayIndex === 0 || dayIndex === 6;

                          const showRangeBackground = day.isInRange;
                          const isFirstDayOfWeek = week.days.indexOf(day) === 0;
                          const isLastDayOfWeek = week.days.indexOf(day) === DAYS_IN_WEEK - 1;

                          const isFocused = focusedDate && isSameDay(day.date, focusedDate);
                          const refKey = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`;

                          const dayButton = (
                            <button
                              type="button"
                              ref={(el) => {
                                if (el) {
                                  dayButtonsRef.current.set(refKey, el);
                                } else {
                                  dayButtonsRef.current.delete(refKey);
                                }
                              }}
                              onClick={(e) => handleDayClick(day, e)}
                              disabled={day.isDisabled || disabled}
                              tabIndex={isFocused ? 0 : -1}
                              className={[
                                classNames?.dayButton,
                                isFocused && classNames?.dayFocused,
                                day.isToday && !day.isSelected && classNames?.dayToday,
                                // Apply selected styling for single/multiple/quarter modes
                                day.isSelected &&
                                  (mode === "single" ||
                                    mode === "multiple" ||
                                    mode === "quarter") &&
                                  classNames?.daySelected,
                                // Range background should not change text color in week picker;
                                // keep background-only highlight for week selections
                                day.isInRange &&
                                  !day.isRangeStart &&
                                  !day.isRangeEnd &&
                                  mode !== "week" &&
                                  classNames?.dayInRange,
                                day.isRangeStart && classNames?.dayRangeStart,
                                day.isRangeEnd && classNames?.dayRangeEnd,
                                day.isDisabled && classNames?.dayDisabled,
                                day.isHighlighted &&
                                  !day.isSelected &&
                                  !day.isInRange &&
                                  classNames?.dayHighlighted,
                                !day.isCurrentMonth &&
                                  !day.isInRange &&
                                  classNames?.dayOutsideMonth,
                                isWeekend &&
                                  day.isCurrentMonth &&
                                  !day.isSelected &&
                                  !day.isInRange &&
                                  classNames?.dayWeekend,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {day.date.getDate()}
                            </button>
                          );

                          const content = renderDay ? renderDay(day, dayButton) : dayButton;

                          return (
                            <div key={day.date.getTime()} className={classNames?.day}>
                              {showRangeBackground && (
                                <div
                                  className={[
                                    classNames?.dayRangeBackground,
                                    day.isRangeStart &&
                                      !day.isRangeEnd &&
                                      classNames?.dayRangeBackgroundStart,
                                    day.isRangeEnd &&
                                      !day.isRangeStart &&
                                      classNames?.dayRangeBackgroundEnd,
                                    !day.isRangeStart &&
                                      !day.isRangeEnd &&
                                      classNames?.dayRangeBackgroundMiddle,
                                    isFirstDayOfWeek &&
                                      !day.isRangeStart &&
                                      classNames?.dayRangeBackgroundFirstOfWeek,
                                    isLastDayOfWeek &&
                                      !day.isRangeEnd &&
                                      classNames?.dayRangeBackgroundLastOfWeek,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                  style={
                                    day.isRangeStart && day.isRangeEnd
                                      ? { display: "none" }
                                      : undefined
                                  }
                                />
                              )}
                              {content}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Time picker - bottom position */}
        {effectiveTimePosition === "bottom" && currentView === "days" && timePickers}

        {/* Footer with Today/Clear buttons */}
        {footer}
      </div>

      {/* Time picker - side position */}
      {effectiveTimePosition === "side" && currentView === "days" && timePickers}
    </div>
  );
}

// Export with proper typing
export const Calendar = CalendarComponent as <TMode extends SelectionMode = "single">(
  props: CalendarProps<TMode>
) => React.ReactElement;

export default Calendar;
