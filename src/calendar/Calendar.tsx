import type React from "react";
import { useState, useMemo, useCallback, useRef, useEffect, type MouseEvent } from "react";

import type {
  SelectionMode,
  TimeValue,
  DateTimeValue,
  DateRangeValue,
  CalendarValue,
  DayCell,
  WeekData,
  CalendarProps,
  HeaderRenderProps,
  CalendarLabels,
  LayoutMode,
} from "../types";

import { DAYS_IN_WEEK } from "../constants";
import { defaultLabels } from "../styles/defaultLabels";
import { getDefaultYears, isSameDay, addMonths, getMonthData } from "../utils";
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
    weekStartsOn = 0,
    showWeekNumbers = false,
    classNames,
    labels: customLabels,
    disabled = false,
    layout = "auto",
    mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
    renderDay,
    renderHeader,
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
  } = props;

  // Merge custom labels with defaults
  const labels: CalendarLabels = useMemo(
    () => ({ ...defaultLabels, ...customLabels }),
    [customLabels]
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
    const singleVal = (controlledValue ?? internalValue) as DateTimeValue | null | undefined;
    return singleVal?.date ?? new Date();
  });

  // For range selection, track which date we're selecting
  const [rangeSelectState, setRangeSelectState] = useState<"start" | "end">("start");

  // Container width for responsive layout detection
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Collapsible time picker state for mobile
  const [timePickerExpanded, setTimePickerExpanded] = useState<{
    single: boolean;
    start: boolean;
    end: boolean;
  }>({ single: false, start: false, end: false });

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

  // Generate month data
  const monthData = useMemo(
    () =>
      getMonthData(
        currentYear,
        currentMonth,
        weekStartsOn,
        singleValue,
        rangeValue,
        minDate,
        maxDate
      ),
    [currentYear, currentMonth, weekStartsOn, singleValue, rangeValue, minDate, maxDate]
  );

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
    [mode, disabled, showTime, singleValue, rangeValue, rangeSelectState, onDayClick, updateValue]
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
        <select
          value={currentMonth}
          onChange={(e) => handleMonthSelectChange(Number(e.target.value))}
          disabled={disabled}
          className={[
            classNames?.headerMonthSelect,
            disabled && classNames?.headerMonthSelectDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {(labels.months ?? defaultLabels.months!).map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={currentYear}
          onChange={(e) => handleYearSelectChange(Number(e.target.value))}
          disabled={disabled}
          className={[
            classNames?.headerYearSelect,
            disabled && classNames?.headerYearSelectDisabled,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
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

  return (
    <div
      ref={rootRef}
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
        {effectiveTimePosition === "top" && timePickers}

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
            const isWeekend = (index + weekStartsOn) % 7 === 0 || (index + weekStartsOn) % 7 === 6;
            return (
              <div
                key={day}
                className={[classNames?.weekDayCell, isWeekend && classNames?.weekDayCellWeekend]
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
          {monthData.weeks.map((week) => (
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

                // Determine range background styling
                const showRangeBackground = day.isInRange && day.isCurrentMonth;
                const isFirstDayOfWeek = week.days.indexOf(day) === 0;
                const isLastDayOfWeek = week.days.indexOf(day) === DAYS_IN_WEEK - 1;

                const dayButton = (
                  <button
                    type="button"
                    onClick={(e) => handleDayClick(day, e)}
                    disabled={day.isDisabled || disabled}
                    className={[
                      classNames?.dayButton,
                      day.isToday && !day.isSelected && classNames?.dayToday,
                      day.isSelected && mode === "single" && classNames?.daySelected,
                      day.isInRange &&
                        !day.isRangeStart &&
                        !day.isRangeEnd &&
                        day.isCurrentMonth &&
                        classNames?.dayInRange,
                      day.isRangeStart && classNames?.dayRangeStart,
                      day.isRangeEnd && classNames?.dayRangeEnd,
                      day.isDisabled && classNames?.dayDisabled,
                      !day.isCurrentMonth && classNames?.dayOutsideMonth,
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
                    {/* Range background connector */}
                    {showRangeBackground && (
                      <div
                        className={[
                          classNames?.dayRangeBackground,
                          day.isRangeStart &&
                            !day.isRangeEnd &&
                            classNames?.dayRangeBackgroundStart,
                          day.isRangeEnd && !day.isRangeStart && classNames?.dayRangeBackgroundEnd,
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
                        style={day.isRangeStart && day.isRangeEnd ? { display: "none" } : undefined}
                      />
                    )}
                    {content}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Time picker - bottom position */}
        {effectiveTimePosition === "bottom" && timePickers}
      </div>

      {/* Time picker - side position */}
      {effectiveTimePosition === "side" && timePickers}
    </div>
  );
}

// Export with proper typing
export const Calendar = CalendarComponent as <TMode extends SelectionMode = "single">(
  props: CalendarProps<TMode>
) => React.ReactElement;

export default Calendar;
