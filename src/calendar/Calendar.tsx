import React, {
  useState,
  useMemo,
  useCallback,
  type MouseEvent,
} from "react";

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
} from "../types";

import { DAYS_IN_WEEK, MONTHS, SHORT_DAYS } from "../constants";
import { cn, getDefaultYears, isSameDay, addMonths, getMonthData } from "../utils";
import { TimePicker } from "../time-picker";

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
    disabled = false,
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

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  // Get ordered days based on weekStartsOn
  const orderedDays = useMemo(() => {
    const days = [...SHORT_DAYS];
    const rotated = days.splice(0, weekStartsOn);
    return [...days, ...rotated];
  }, [weekStartsOn]);

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

        if (rangeSelectState === "start" || (currentRange.start && currentRange.end)) {
          // Starting new selection or resetting
          const newValue: DateRangeValue = {
            start: {
              date: day.date,
              time: showTime ? { hours: 0, minutes: 0, seconds: 0 } : undefined,
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
            time: showTime ? { hours: 23, minutes: 59, seconds: 59 } : undefined,
          };

          // Handle same day selection
          if (isSameDay(startDate, day.date)) {
            finalStart = {
              date: startDate,
              time: showTime ? { hours: 0, minutes: 0, seconds: 0 } : undefined,
            };
            finalEnd = {
              date: day.date,
              time: showTime ? { hours: 23, minutes: 59, seconds: 59 } : undefined,
            };
          } else if (day.date < startDate) {
            // Swap if end is before start
            finalEnd = {
              ...finalStart,
              time: showTime ? { hours: 23, minutes: 59, seconds: 59 } : undefined,
            };
            finalStart = {
              date: day.date,
              time: showTime ? { hours: 0, minutes: 0, seconds: 0 } : undefined,
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
      rangeSelectState,
      onDayClick,
      updateValue,
    ]
  );

  // Navigation handlers
  const handlePrevMonth = useCallback(() => {
    setViewDate((prev) => addMonths(prev, -1));
    onPrevMonth?.(currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);
  }, [currentMonth, currentYear, onPrevMonth]);

  const handleNextMonth = useCallback(() => {
    setViewDate((prev) => addMonths(prev, 1));
    onNextMonth?.(currentMonth === 11 ? 0 : currentMonth + 1, currentMonth === 11 ? currentYear + 1 : currentYear);
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
    },
    [disabled, onWeekClick]
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
    <div className={cn("flex items-center justify-between mb-4", classNames?.header)}>
      <div className={cn("flex items-center gap-1", classNames?.headerNavigation)}>
        <button
          type="button"
          onClick={handlePrevYear}
          disabled={disabled}
          className={cn(
            "p-1.5 rounded hover:bg-gray-100 disabled:opacity-50",
            classNames?.headerNavigationButton,
            classNames?.headerNavigationButtonPrev
          )}
          aria-label="Previous year"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={disabled}
          className={cn(
            "p-1.5 rounded hover:bg-gray-100 disabled:opacity-50",
            classNames?.headerNavigationButton,
            classNames?.headerNavigationButtonPrev
          )}
          aria-label="Previous month"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className={cn("flex items-center gap-2", classNames?.headerTitle)}>
        <select
          value={currentMonth}
          onChange={(e) => handleMonthSelectChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            "px-2 py-1 rounded border border-gray-200 bg-white text-sm font-medium",
            "hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
            classNames?.headerMonthSelect
          )}
        >
          {MONTHS.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={currentYear}
          onChange={(e) => handleYearSelectChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            "px-2 py-1 rounded border border-gray-200 bg-white text-sm font-medium",
            "hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
            classNames?.headerYearSelect
          )}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className={cn("flex items-center gap-1", classNames?.headerNavigation)}>
        <button
          type="button"
          onClick={handleNextMonth}
          disabled={disabled}
          className={cn(
            "p-1.5 rounded hover:bg-gray-100 disabled:opacity-50",
            classNames?.headerNavigationButton,
            classNames?.headerNavigationButtonNext
          )}
          aria-label="Next month"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleNextYear}
          disabled={disabled}
          className={cn(
            "p-1.5 rounded hover:bg-gray-100 disabled:opacity-50",
            classNames?.headerNavigationButton,
            classNames?.headerNavigationButtonNext
          )}
          aria-label="Next year"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  // Time pickers
  const timePickers = showTime && (
    <div
      className={cn(
        "flex gap-4",
        timePosition === "side" ? "flex-col" : "flex-row justify-center",
        timePosition === "top" ? "mb-4" : timePosition === "bottom" ? "mt-4 pt-4 border-t" : ""
      )}
    >
      {mode === "single" ? (
        <TimePicker
          time={singleValue?.time ?? { hours: 0, minutes: 0, seconds: 0 }}
          label="Time"
          showSeconds={showSeconds}
          disabled={disabled || !singleValue}
          minTime={minTime}
          maxTime={maxTime}
          classNames={classNames}
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
            label="Start Time"
            showSeconds={showSeconds}
            disabled={disabled || !rangeValue?.start}
            minTime={minTime}
            maxTime={maxTime}
            classNames={classNames}
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
            label="End Time"
            showSeconds={showSeconds}
            disabled={disabled || !rangeValue?.end}
            minTime={minTime}
            maxTime={maxTime}
            classNames={classNames}
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

  return (
    <div
      className={cn(
        "inline-flex bg-white rounded-lg shadow-lg p-4",
        timePosition === "side" ? "flex-row gap-4" : "flex-col",
        classNames?.root
      )}
    >
      <div className="flex flex-col">
        {/* Header */}
        {renderHeader ? renderHeader(headerRenderProps) : defaultHeader}

        {/* Time picker - top position */}
        {timePosition === "top" && timePickers}

        {/* Week day headers */}
        <div className={cn("grid gap-1 mb-2", classNames?.weekDaysRow)} style={{ gridTemplateColumns: showWeekNumbers ? `auto repeat(${DAYS_IN_WEEK}, 1fr)` : `repeat(${DAYS_IN_WEEK}, 1fr)` }}>
          {showWeekNumbers && <div className="w-8" />}
          {orderedDays.map((day, index) => {
            const isWeekend = (index + weekStartsOn) % 7 === 0 || (index + weekStartsOn) % 7 === 6;
            return (
              <div
                key={day}
                className={cn(
                  "text-center text-sm font-medium text-gray-500 py-1",
                  isWeekend && "text-red-400",
                  classNames?.weekDayCell,
                  isWeekend && classNames?.weekDayCellWeekend
                )}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Calendar body */}
        <div className={cn("flex flex-col gap-1", classNames?.body)}>
          {monthData.weeks.map((week) => (
            <div
              key={week.weekNumber + "-" + week.startDate.getTime()}
              className={cn("grid gap-1", classNames?.week)}
              style={{ gridTemplateColumns: showWeekNumbers ? `auto repeat(${DAYS_IN_WEEK}, 1fr)` : `repeat(${DAYS_IN_WEEK}, 1fr)` }}
            >
              {showWeekNumbers && (
                <button
                  type="button"
                  onClick={(e) => handleWeekClick(week, e)}
                  disabled={disabled}
                  className={cn(
                    "w-8 text-xs text-gray-400 flex items-center justify-center",
                    "hover:bg-gray-100 rounded cursor-pointer",
                    classNames?.weekNumber,
                    classNames?.weekNumberCell
                  )}
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
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm relative z-10",
                      "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                      !day.isCurrentMonth && "text-gray-300",
                      day.isCurrentMonth && !day.isSelected && !day.isInRange && "hover:bg-gray-100",
                      day.isToday && !day.isSelected && "border border-blue-500",
                      day.isInRange && !day.isRangeStart && !day.isRangeEnd && day.isCurrentMonth && "bg-blue-200",
                      (day.isRangeStart || day.isRangeEnd) && "bg-blue-500 text-white hover:bg-blue-600",
                      day.isSelected && mode === "single" && "bg-blue-500 text-white hover:bg-blue-600",
                      day.isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                      isWeekend && day.isCurrentMonth && !day.isSelected && !day.isInRange && "text-red-500",
                      classNames?.dayButton,
                      day.isToday && classNames?.dayToday,
                      day.isSelected && classNames?.daySelected,
                      day.isInRange && classNames?.dayInRange,
                      day.isRangeStart && classNames?.dayRangeStart,
                      day.isRangeEnd && classNames?.dayRangeEnd,
                      day.isDisabled && classNames?.dayDisabled,
                      !day.isCurrentMonth && classNames?.dayOutsideMonth,
                      isWeekend && classNames?.dayWeekend
                    )}
                  >
                    {day.date.getDate()}
                  </button>
                );

                const content = renderDay ? renderDay(day, dayButton) : dayButton;

                return (
                  <div
                    key={day.date.getTime()}
                    className={cn(
                      "flex justify-center relative",
                      classNames?.day
                    )}
                  >
                    {/* Range background connector */}
                    {showRangeBackground && (
                      <div
                        className={cn(
                          "absolute inset-y-0 bg-blue-200",
                          day.isRangeStart && !day.isRangeEnd && "left-1/2 right-0",
                          day.isRangeEnd && !day.isRangeStart && "left-0 right-1/2",
                          day.isRangeStart && day.isRangeEnd && "hidden",
                          !day.isRangeStart && !day.isRangeEnd && "left-0 right-0",
                          isFirstDayOfWeek && !day.isRangeStart && "rounded-l-full",
                          isLastDayOfWeek && !day.isRangeEnd && "rounded-r-full"
                        )}
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
        {timePosition === "bottom" && timePickers}
      </div>

      {/* Time picker - side position */}
      {timePosition === "side" && (
        <div className="border-l pl-4 flex items-center">{timePickers}</div>
      )}
    </div>
  );
}

// Export with proper typing
export const Calendar = CalendarComponent as <TMode extends SelectionMode = "single">(
  props: CalendarProps<TMode>
) => React.ReactElement;

export default Calendar;
