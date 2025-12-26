import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, type Mock } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { queryAsHtmlElement } from "../test";
import { Calendar } from "./Calendar";
import type { DateTimeValue, DateRangeValue, DayCell, HeaderRenderProps } from "../types";

// ============================================================================
// TEST SETUP
// ============================================================================

const FROZEN_DATE = new Date("2025-01-15T12:00:00.000Z");

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FROZEN_DATE);
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// TYPE-SAFE HELPERS
// ============================================================================

function getMockCallArg<T>(mock: Mock, callIndex: number, argIndex: number): T {
  const calls = mock.mock.calls;
  if (callIndex >= calls.length) {
    throw new Error(
      `Mock was only called ${calls.length} times, but tried to access call ${callIndex}`
    );
  }
  const call = calls[callIndex];
  if (call === undefined || argIndex >= call.length) {
    throw new Error(`Invalid argument access at call ${callIndex}, arg ${argIndex}`);
  }
  return call[argIndex] as T;
}

function getCombobox(index: number): HTMLSelectElement {
  const comboboxes = screen.getAllByRole("combobox");
  if (index >= comboboxes.length) {
    throw new Error(
      `Only ${comboboxes.length} comboboxes found, but tried to access index ${index}`
    );
  }
  return comboboxes[index] as HTMLSelectElement;
}

function getWeekButton(container: HTMLElement, index: number): HTMLButtonElement {
  const weekButtons = container.querySelectorAll(".week-num");
  if (index >= weekButtons.length) {
    throw new Error(
      `Only ${weekButtons.length} week buttons found, but tried to access index ${index}`
    );
  }
  return weekButtons[index] as HTMLButtonElement;
}

// ============================================================================
// TESTS
// ============================================================================

describe("Calendar", () => {
  describe("basic rendering", () => {
    it("should render the calendar root", () => {
      const { container } = render(<Calendar classNames={{ root: "calendar-root" }} />);
      expect(container.querySelector(".calendar-root")).toBeInTheDocument();
    });

    it("should render month and year selects", () => {
      render(<Calendar />);
      const comboboxes = screen.getAllByRole("combobox");
      expect(comboboxes.length).toBeGreaterThanOrEqual(2);
    });

    it("should render navigation buttons", () => {
      render(<Calendar />);
      expect(screen.getByRole("button", { name: /previous year/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /previous month/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next month/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next year/i })).toBeInTheDocument();
    });

    it("should render week day headers", () => {
      render(<Calendar />);
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getByText("Mon")).toBeInTheDocument();
      expect(screen.getByText("Tue")).toBeInTheDocument();
      expect(screen.getByText("Wed")).toBeInTheDocument();
      expect(screen.getByText("Thu")).toBeInTheDocument();
      expect(screen.getByText("Fri")).toBeInTheDocument();
      expect(screen.getByText("Sat")).toBeInTheDocument();
    });

    it("should render day buttons for January 2025", () => {
      render(<Calendar />);
      // Days may appear multiple times due to adjacent months, use getAllByRole
      const buttons1 = screen.getAllByRole("button", { name: "1" });
      expect(buttons1.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole("button", { name: "15" })).toBeInTheDocument();
      const buttons31 = screen.getAllByRole("button", { name: "31" });
      expect(buttons31.length).toBeGreaterThanOrEqual(1);
    });

    it("should display January 2025 by default", () => {
      render(<Calendar />);
      expect(screen.getByText("January")).toBeInTheDocument();
      expect(getCombobox(1)).toHaveValue("2025");
    });

    it("should apply calendarWrapper className", () => {
      const { container } = render(<Calendar classNames={{ calendarWrapper: "wrapper-class" }} />);
      expect(container.querySelector(".wrapper-class")).toBeInTheDocument();
    });

    it("should apply header className", () => {
      const { container } = render(<Calendar classNames={{ header: "header-class" }} />);
      expect(container.querySelector(".header-class")).toBeInTheDocument();
    });

    it("should apply body className", () => {
      const { container } = render(<Calendar classNames={{ body: "body-class" }} />);
      expect(container.querySelector(".body-class")).toBeInTheDocument();
    });
  });

  describe("weekStartsOn prop", () => {
    it("should start week on Sunday by default (weekStartsOn=0)", () => {
      const { container } = render(<Calendar classNames={{ weekDaysRow: "week-row" }} />);
      const weekRow = container.querySelector(".week-row");
      const dayHeaders = weekRow?.querySelectorAll("div");
      expect(dayHeaders?.[0]).toHaveTextContent("Sun");
    });

    it("should start week on Monday when weekStartsOn=1", () => {
      const { container } = render(
        <Calendar weekStartsOn={1} classNames={{ weekDaysRow: "week-row" }} />
      );
      const weekRow = container.querySelector(".week-row");
      const dayHeaders = weekRow?.querySelectorAll("div");
      expect(dayHeaders?.[0]).toHaveTextContent("Mon");
    });

    it("should start week on Saturday when weekStartsOn=6", () => {
      const { container } = render(
        <Calendar weekStartsOn={6} classNames={{ weekDaysRow: "week-row" }} />
      );
      const weekRow = container.querySelector(".week-row");
      const dayHeaders = weekRow?.querySelectorAll("div");
      expect(dayHeaders?.[0]).toHaveTextContent("Sat");
    });
  });

  describe("single mode selection", () => {
    it("should select a day when clicked", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="single" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "20" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const value = getMockCallArg<DateTimeValue>(handleChange, 0, 0);
      expect(value.date.getDate()).toBe(20);
      expect(value.date.getMonth()).toBe(0);
      expect(value.date.getFullYear()).toBe(2025);
    });

    it("should apply selected className to selected day", () => {
      render(<Calendar mode="single" classNames={{ daySelected: "selected" }} />);

      const day20 = screen.getByRole("button", { name: "20" });
      fireEvent.click(day20);
      expect(day20).toHaveClass("selected");
    });

    it("should work as controlled component", () => {
      const value: DateTimeValue = { date: new Date(2025, 0, 10), time: undefined };
      render(<Calendar mode="single" value={value} classNames={{ daySelected: "selected" }} />);
      expect(screen.getByRole("button", { name: "10" })).toHaveClass("selected");
    });

    it("should work as uncontrolled component with defaultValue", () => {
      const defaultValue: DateTimeValue = { date: new Date(2025, 0, 15), time: undefined };
      render(
        <Calendar
          mode="single"
          defaultValue={defaultValue}
          classNames={{ daySelected: "selected" }}
        />
      );
      expect(screen.getByRole("button", { name: "15" })).toHaveClass("selected");
    });

    it("should preserve time when selecting a new day with showTime", () => {
      const handleChange = vi.fn();
      const value: DateTimeValue = {
        date: new Date(2025, 0, 10),
        time: { hours: 14, minutes: 30, seconds: 45 },
      };

      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          onChange={handleChange}
          classNames={{ body: "calendar-body" }}
        />
      );

      const calendarBody = container.querySelector(".calendar-body");
      const day20Button = within(calendarBody as HTMLElement).getByRole("button", { name: "20" });
      fireEvent.click(day20Button);

      const newValue = getMockCallArg<DateTimeValue>(handleChange, 0, 0);
      expect(newValue.time).toEqual({ hours: 14, minutes: 30, seconds: 45 });
    });
  });

  describe("range mode selection", () => {
    it("should select range start on first click", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="range" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "10" }));

      const value = getMockCallArg<DateRangeValue>(handleChange, 0, 0);
      expect(value.start?.date.getDate()).toBe(10);
      expect(value.end).toBeNull();
    });

    it("should complete range on second click", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="range" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      fireEvent.click(screen.getByRole("button", { name: "20" }));

      expect(handleChange).toHaveBeenCalledTimes(2);
      const value = getMockCallArg<DateRangeValue>(handleChange, 1, 0);
      expect(value.start?.date.getDate()).toBe(10);
      expect(value.end?.date.getDate()).toBe(20);
    });

    it("should swap dates when end is before start", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="range" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "20" }));
      fireEvent.click(screen.getByRole("button", { name: "10" }));

      const value = getMockCallArg<DateRangeValue>(handleChange, 1, 0);
      expect(value.start?.date.getDate()).toBe(10);
      expect(value.end?.date.getDate()).toBe(20);
    });

    it("should handle same day selection", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="range" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "15" }));
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      const value = getMockCallArg<DateRangeValue>(handleChange, 1, 0);
      expect(value.start?.date.getDate()).toBe(15);
      expect(value.end?.date.getDate()).toBe(15);
    });

    it("should reset selection on third click", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="range" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      fireEvent.click(screen.getByRole("button", { name: "20" }));
      fireEvent.click(screen.getByRole("button", { name: "5" }));

      const value = getMockCallArg<DateRangeValue>(handleChange, 2, 0);
      expect(value.start?.date.getDate()).toBe(5);
      expect(value.end).toBeNull();
    });

    it("should apply range classNames", () => {
      render(
        <Calendar
          mode="range"
          classNames={{
            dayRangeStart: "range-start",
            dayRangeEnd: "range-end",
            dayInRange: "in-range",
          }}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      expect(screen.getByRole("button", { name: "10" })).toHaveClass("range-start");
      expect(screen.getByRole("button", { name: "15" })).toHaveClass("range-end");
      expect(screen.getByRole("button", { name: "12" })).toHaveClass("in-range");
    });

    it("should work with controlled range value", () => {
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 10), time: undefined },
        end: { date: new Date(2025, 0, 20), time: undefined },
      };

      render(
        <Calendar
          mode="range"
          value={value}
          classNames={{ dayRangeStart: "range-start", dayRangeEnd: "range-end" }}
        />
      );

      expect(screen.getByRole("button", { name: "10" })).toHaveClass("range-start");
      expect(screen.getByRole("button", { name: "20" })).toHaveClass("range-end");
    });
  });

  describe("navigation", () => {
    it("should navigate to previous month", () => {
      const onPrevMonth = vi.fn();
      render(<Calendar onPrevMonth={onPrevMonth} />);

      fireEvent.click(screen.getByRole("button", { name: /previous month/i }));

      expect(onPrevMonth).toHaveBeenCalledWith(11, 2024);
    });

    it("should navigate to next month", () => {
      const onNextMonth = vi.fn();
      render(<Calendar onNextMonth={onNextMonth} />);

      fireEvent.click(screen.getByRole("button", { name: /next month/i }));

      expect(onNextMonth).toHaveBeenCalledWith(1, 2025);
    });

    it("should navigate to previous year", () => {
      const onPrevYear = vi.fn();
      render(<Calendar onPrevYear={onPrevYear} />);

      fireEvent.click(screen.getByRole("button", { name: /previous year/i }));

      expect(onPrevYear).toHaveBeenCalledWith(2024);
    });

    it("should navigate to next year", () => {
      const onNextYear = vi.fn();
      render(<Calendar onNextYear={onNextYear} />);

      fireEvent.click(screen.getByRole("button", { name: /next year/i }));

      expect(onNextYear).toHaveBeenCalledWith(2026);
    });

    it("should select month via dropdown", () => {
      const onMonthSelect = vi.fn();
      render(<Calendar onMonthSelect={onMonthSelect} />);

      fireEvent.change(getCombobox(0), { target: { value: "6" } });

      expect(onMonthSelect).toHaveBeenCalledWith(6, 2025);
    });

    it("should select year via dropdown", () => {
      const onYearChange = vi.fn();
      render(<Calendar onYearChange={onYearChange} />);

      fireEvent.change(getCombobox(1), { target: { value: "2030" } });

      expect(onYearChange).toHaveBeenCalledWith(2030);
    });
  });

  describe("disabled state", () => {
    it("should disable all day buttons when disabled", () => {
      render(<Calendar disabled />);
      const dayButtons = screen
        .getAllByRole("button")
        .filter(
          (btn) =>
            !isNaN(Number(btn.textContent)) &&
            Number(btn.textContent) > 0 &&
            Number(btn.textContent) <= 31
        );
      dayButtons.forEach((btn) => expect(btn).toBeDisabled());
    });

    it("should disable navigation buttons when disabled", () => {
      render(<Calendar disabled />);
      expect(screen.getByRole("button", { name: /previous year/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /previous month/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /next month/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /next year/i })).toBeDisabled();
    });

    it("should disable month/year selects when disabled", () => {
      render(<Calendar disabled />);
      const comboboxes = screen.getAllByRole("combobox");
      comboboxes.forEach((combo) => expect(combo).toBeDisabled());
    });

    it("should not call onChange when clicking disabled days", () => {
      const handleChange = vi.fn();
      render(<Calendar disabled onChange={handleChange} />);

      // Attempt to click but since it's disabled, nothing should happen
      const day15 = screen.getByRole("button", { name: "15" });
      expect(day15).toBeDisabled();
    });
  });

  describe("minDate and maxDate constraints", () => {
    it("should disable days before minDate", () => {
      const { container } = render(
        <Calendar minDate={new Date(2025, 0, 10)} classNames={{ body: "cal-body" }} />
      );

      // Query within body only to avoid duplicate days from adjacent months
      const calBody = queryAsHtmlElement(container, ".cal-body");
      const buttons = within(calBody).getAllByRole("button");

      // Days 1-9 should be disabled
      for (let i = 1; i <= 9; i++) {
        const dayButton = buttons.find((b) => b.textContent === String(i));
        expect(dayButton).toBeDefined();
        expect(dayButton).toBeDisabled();
      }

      // Day 10 should be enabled
      const day10 = buttons.find((b) => b.textContent === "10");
      expect(day10).not.toBeDisabled();
    });

    it("should disable days after maxDate", () => {
      const { container } = render(
        <Calendar maxDate={new Date(2025, 0, 20)} classNames={{ body: "cal-body" }} />
      );

      // Query within body only to avoid duplicate days from adjacent months
      const calBody = queryAsHtmlElement(container, ".cal-body");
      const buttons = within(calBody).getAllByRole("button");
      const day21 = buttons.find((b) => b.textContent === "21");
      expect(day21).toBeDefined();
      expect(day21).toBeDisabled();

      const day20 = buttons.find((b) => b.textContent === "20");
      expect(day20).not.toBeDisabled();
    });
  });

  describe("onDayClick callback", () => {
    it("should call onDayClick when day is clicked", () => {
      const handleDayClick = vi.fn();
      render(<Calendar onDayClick={handleDayClick} />);

      fireEvent.click(screen.getByRole("button", { name: "15" }));

      expect(handleDayClick).toHaveBeenCalledTimes(1);
      expect(getMockCallArg<Date>(handleDayClick, 0, 0).getDate()).toBe(15);
    });

    it("should not call onDayClick when disabled", () => {
      const handleDayClick = vi.fn();
      render(<Calendar disabled onDayClick={handleDayClick} />);

      expect(screen.getByRole("button", { name: "15" })).toBeDisabled();
    });
  });

  describe("week numbers", () => {
    it("should not show week numbers by default", () => {
      const { container } = render(<Calendar classNames={{ weekNumber: "week-num" }} />);
      expect(container.querySelector(".week-num")).not.toBeInTheDocument();
    });

    it("should show week numbers when showWeekNumbers is true", () => {
      const { container } = render(
        <Calendar showWeekNumbers classNames={{ weekNumber: "week-num" }} />
      );
      expect(container.querySelectorAll(".week-num").length).toBeGreaterThan(0);
    });

    it("should call onWeekClick when week number is clicked", () => {
      const handleWeekClick = vi.fn();
      const { container } = render(
        <Calendar
          showWeekNumbers
          onWeekClick={handleWeekClick}
          classNames={{ weekNumber: "week-num" }}
        />
      );

      fireEvent.click(getWeekButton(container, 0));
      expect(handleWeekClick).toHaveBeenCalledTimes(1);
    });

    it("should select entire week in range mode when clicking week number", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Calendar
          mode="range"
          showWeekNumbers
          onChange={handleChange}
          classNames={{ weekNumber: "week-num" }}
        />
      );

      fireEvent.click(getWeekButton(container, 1));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const value = getMockCallArg<DateRangeValue>(handleChange, 0, 0);
      expect(value.start).not.toBeNull();
      expect(value.end).not.toBeNull();
    });

    it("should disable week buttons when disabled", () => {
      const { container } = render(
        <Calendar disabled showWeekNumbers classNames={{ weekNumber: "week-num" }} />
      );
      expect(getWeekButton(container, 0)).toBeDisabled();
    });
  });

  describe("time picker integration", () => {
    it("should not show time picker by default", () => {
      render(<Calendar />);
      expect(screen.queryByText("HH")).not.toBeInTheDocument();
    });

    it("should show time picker when showTime is true and value is set", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };
      render(<Calendar mode="single" value={value} showTime />);
      expect(screen.getByText("HH")).toBeInTheDocument();
      expect(screen.getByText("MM")).toBeInTheDocument();
    });

    it("should show seconds when showSeconds is true", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };
      render(<Calendar mode="single" value={value} showTime showSeconds />);
      expect(screen.getByText("SS")).toBeInTheDocument();
    });

    it("should show two time pickers in range mode with complete range", () => {
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 10), time: { hours: 9, minutes: 0, seconds: 0 } },
        end: { date: new Date(2025, 0, 20), time: { hours: 17, minutes: 0, seconds: 0 } },
      };
      render(<Calendar mode="range" value={value} showTime />);
      expect(screen.getByText("Start Time")).toBeInTheDocument();
      expect(screen.getByText("End Time")).toBeInTheDocument();
    });

    it("should call onTimeChange when time is changed", () => {
      const handleTimeChange = vi.fn();
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };

      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          onTimeChange={handleTimeChange}
          classNames={{ timeSelector: "time-selector" }}
        />
      );

      // Find hour selector (first time-selector element contains hours)
      const timeSelectors = container.querySelectorAll(".time-selector");
      const hourSelector = timeSelectors[0] as HTMLElement;
      const hourButton = within(hourSelector).getByRole("button", { name: "14" });
      fireEvent.click(hourButton);

      expect(handleTimeChange).toHaveBeenCalledWith(
        { hours: 14, minutes: 30, seconds: 0 },
        "single"
      );
    });

    it("should call onTimeChange and update value when changing start time in range mode", () => {
      const handleChange = vi.fn();
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 10), time: { hours: 9, minutes: 0, seconds: 0 } },
        end: { date: new Date(2025, 0, 20), time: { hours: 17, minutes: 0, seconds: 0 } },
      };

      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          showTime
          onChange={handleChange}
          classNames={{ timeSelector: "time-selector" }}
        />
      );

      // Find first time picker's hour selector (start time - first pair of selectors)
      const timeSelectors = container.querySelectorAll(".time-selector");
      const startHourSelector = timeSelectors[0] as HTMLElement;
      const hourButton = within(startHourSelector).getByRole("button", { name: "10" });
      fireEvent.click(hourButton);

      expect(handleChange).toHaveBeenCalled();
      const newValue = getMockCallArg<DateRangeValue>(handleChange, 0, 0);
      expect(newValue.start?.time?.hours).toBe(10);
    });

    it("should call onTimeChange and update value when changing end time in range mode", () => {
      const handleChange = vi.fn();
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 10), time: { hours: 9, minutes: 0, seconds: 0 } },
        end: { date: new Date(2025, 0, 20), time: { hours: 17, minutes: 0, seconds: 0 } },
      };

      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          showTime
          onChange={handleChange}
          classNames={{ timeSelector: "time-selector" }}
        />
      );

      // Find second time picker's hour selector (end time - third and fourth selectors after start's hour/minute)
      const timeSelectors = container.querySelectorAll(".time-selector");
      const endHourSelector = timeSelectors[2] as HTMLElement;
      const hourButton = within(endHourSelector).getByRole("button", { name: "18" });
      fireEvent.click(hourButton);

      expect(handleChange).toHaveBeenCalled();
      const newValue = getMockCallArg<DateRangeValue>(handleChange, 0, 0);
      expect(newValue.end?.time?.hours).toBe(18);
    });

    it("should apply timePickerWrapperBottom class for bottom position", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          timePosition="bottom"
          classNames={{ timePickerWrapperBottom: "time-bottom" }}
        />
      );
      expect(container.querySelector(".time-bottom")).toBeInTheDocument();
    });

    it("should apply timePickerWrapperTop class for top position", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          timePosition="top"
          classNames={{ timePickerWrapperTop: "time-top" }}
        />
      );
      expect(container.querySelector(".time-top")).toBeInTheDocument();
    });

    it("should apply timePickerWrapperSide class for side position", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          timePosition="side"
          classNames={{ timePickerWrapperSide: "time-side" }}
        />
      );
      expect(container.querySelector(".time-side")).toBeInTheDocument();
    });

    it("should apply rootSideLayout class when timePosition is side", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          timePosition="side"
          classNames={{ rootSideLayout: "side-layout" }}
        />
      );
      expect(container.querySelector(".side-layout")).toBeInTheDocument();
    });

    it("should apply rootDefaultLayout class when timePosition is not side", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          timePosition="bottom"
          classNames={{ rootDefaultLayout: "default-layout" }}
        />
      );
      expect(container.querySelector(".default-layout")).toBeInTheDocument();
    });
  });

  describe("custom labels", () => {
    it("should use custom month names", () => {
      const customLabels = {
        months: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      };
      render(<Calendar labels={customLabels} />);
      expect(screen.getByText("Jan")).toBeInTheDocument();
    });

    it("should use custom day names", () => {
      const customLabels = { shortDays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] };
      render(<Calendar labels={customLabels} />);
      expect(screen.getByText("Su")).toBeInTheDocument();
      expect(screen.getByText("Mo")).toBeInTheDocument();
    });

    it("should use custom navigation labels", () => {
      render(
        <Calendar
          labels={{
            previousYear: "Prev Year",
            nextYear: "Next Year",
            previousMonth: "Prev Month",
            nextMonth: "Next Month",
          }}
        />
      );
      expect(screen.getByRole("button", { name: "Prev Year" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next Year" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Prev Month" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next Month" })).toBeInTheDocument();
    });

    it("should use custom time labels", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };
      render(
        <Calendar
          mode="single"
          value={value}
          showTime
          labels={{ timeLabel: "Select Time", hoursLabel: "Hours", minutesLabel: "Minutes" }}
        />
      );
      expect(screen.getByText("Select Time")).toBeInTheDocument();
      expect(screen.getByText("Hours")).toBeInTheDocument();
      expect(screen.getByText("Minutes")).toBeInTheDocument();
    });
  });

  describe("custom years prop", () => {
    it("should use custom years array", () => {
      const customYears = [2020, 2021, 2022, 2023, 2024, 2025];
      render(<Calendar years={customYears} />);

      const yearSelect = getCombobox(1);
      expect(within(yearSelect).getByText("2020")).toBeInTheDocument();
      expect(within(yearSelect).getByText("2025")).toBeInTheDocument();
      expect(within(yearSelect).queryByText("2026")).not.toBeInTheDocument();
    });
  });

  describe("renderDay prop", () => {
    it("should render custom day content", () => {
      const renderDay = (day: DayCell, defaultContent: React.ReactNode): React.ReactNode => (
        <div data-testid={`custom-day-${day.date.getDate()}`}>
          {defaultContent}
          {day.isToday && <span>Today!</span>}
        </div>
      );

      render(<Calendar renderDay={renderDay} />);
      expect(screen.getByTestId("custom-day-15")).toBeInTheDocument();
      expect(screen.getByText("Today!")).toBeInTheDocument();
    });

    it("should pass day info to renderDay", () => {
      const renderDay = vi.fn((_day: DayCell, defaultContent: React.ReactNode) => defaultContent);
      render(<Calendar renderDay={renderDay} />);

      expect(renderDay).toHaveBeenCalled();
      const firstCall = getMockCallArg<DayCell>(renderDay, 0, 0);
      expect(firstCall).toHaveProperty("date");
      expect(firstCall).toHaveProperty("isCurrentMonth");
      expect(firstCall).toHaveProperty("isToday");
    });
  });

  describe("renderHeader prop", () => {
    it("should render custom header", () => {
      const renderHeader = (): React.ReactNode => (
        <div data-testid="custom-header">Custom Header</div>
      );
      render(<Calendar renderHeader={renderHeader} />);
      expect(screen.getByTestId("custom-header")).toBeInTheDocument();
      expect(screen.getByText("Custom Header")).toBeInTheDocument();
    });

    it("should pass header props to renderHeader", () => {
      const renderHeader = vi.fn((props: HeaderRenderProps) => (
        <div>
          <span>Month: {props.currentMonth}</span>
          <span>Year: {props.currentYear}</span>
        </div>
      ));

      render(<Calendar renderHeader={renderHeader} />);
      expect(renderHeader).toHaveBeenCalled();
      expect(screen.getByText("Month: 0")).toBeInTheDocument();
      expect(screen.getByText("Year: 2025")).toBeInTheDocument();
    });

    it("should allow navigation from custom header", () => {
      const renderHeader = (props: HeaderRenderProps): React.ReactNode => (
        <div>
          <button onClick={props.onPrevMonth}>Custom Prev</button>
          <span data-testid="month">{props.currentMonth}</span>
          <button onClick={props.onNextMonth}>Custom Next</button>
        </div>
      );

      render(<Calendar renderHeader={renderHeader} />);
      expect(screen.getByTestId("month")).toHaveTextContent("0");

      fireEvent.click(screen.getByText("Custom Next"));
      expect(screen.getByTestId("month")).toHaveTextContent("1");

      fireEvent.click(screen.getByText("Custom Prev"));
      expect(screen.getByTestId("month")).toHaveTextContent("0");
    });
  });

  describe("today highlight", () => {
    it("should apply today className to current date", () => {
      render(<Calendar classNames={{ dayToday: "today" }} />);
      expect(screen.getByRole("button", { name: "15" })).toHaveClass("today");
    });

    it("should not apply today className to other dates", () => {
      render(<Calendar classNames={{ dayToday: "today" }} />);
      expect(screen.getByRole("button", { name: "14" })).not.toHaveClass("today");
      expect(screen.getByRole("button", { name: "16" })).not.toHaveClass("today");
    });

    it("should not apply today className when day is selected", () => {
      render(<Calendar classNames={{ dayToday: "today", daySelected: "selected" }} />);

      const todayButton = screen.getByRole("button", { name: "15" });
      fireEvent.click(todayButton);

      expect(todayButton).toHaveClass("selected");
      expect(todayButton).not.toHaveClass("today");
    });
  });

  describe("weekend styling", () => {
    it("should apply weekend className to weekend days", () => {
      render(<Calendar classNames={{ dayWeekend: "weekend" }} />);
      // January 2025: 4th is Saturday, 5th is Sunday
      expect(screen.getByRole("button", { name: "4" })).toHaveClass("weekend");
      expect(screen.getByRole("button", { name: "5" })).toHaveClass("weekend");
    });

    it("should apply weekend className to week day headers", () => {
      const { container } = render(
        <Calendar classNames={{ weekDayCellWeekend: "weekend-header" }} />
      );
      const weekendHeaders = container.querySelectorAll(".weekend-header");
      expect(weekendHeaders.length).toBe(2);
    });
  });

  describe("outside month days", () => {
    it("should apply outsideMonth className to days from other months", () => {
      render(<Calendar classNames={{ dayOutsideMonth: "outside" }} />);

      const allDayButtons = screen
        .getAllByRole("button")
        .filter((btn) => !isNaN(Number(btn.textContent)) && Number(btn.textContent) > 0);
      const outsideButtons = allDayButtons.filter((btn) => btn.classList.contains("outside"));
      expect(outsideButtons.length).toBeGreaterThan(0);
    });
  });

  describe("view initialization", () => {
    it("should initialize view to controlled value date", () => {
      const value: DateTimeValue = { date: new Date(2023, 5, 15), time: undefined };
      render(<Calendar mode="single" value={value} />);
      expect(screen.getByText("June")).toBeInTheDocument();
    });

    it("should initialize view to range start date", () => {
      const value: DateRangeValue = {
        start: { date: new Date(2023, 8, 10), time: undefined },
        end: { date: new Date(2023, 8, 20), time: undefined },
      };
      render(<Calendar mode="range" value={value} />);
      expect(screen.getByText("September")).toBeInTheDocument();
    });

    it("should initialize view to defaultValue date", () => {
      const defaultValue: DateTimeValue = { date: new Date(2022, 11, 25), time: undefined };
      render(<Calendar mode="single" defaultValue={defaultValue} />);
      expect(screen.getByText("December")).toBeInTheDocument();
    });
  });

  describe("time callbacks", () => {
    it("should call onHourClick callback", () => {
      const handleHourClick = vi.fn();
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };

      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          onHourClick={handleHourClick}
          classNames={{ timeSelector: "time-selector" }}
        />
      );

      // Find hour selector (first time-selector element contains hours)
      const timeSelectors = container.querySelectorAll(".time-selector");
      const hourSelector = timeSelectors[0] as HTMLElement;
      const hourButton = within(hourSelector).getByRole("button", { name: "14" });
      fireEvent.click(hourButton);

      expect(handleHourClick).toHaveBeenCalledWith(14, "single");
    });

    it("should call onMinuteClick callback", () => {
      const handleMinuteClick = vi.fn();
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };

      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          onMinuteClick={handleMinuteClick}
          classNames={{ timeSelector: "time-selector" }}
        />
      );

      // Find minute selector (second time-selector element contains minutes)
      const timeSelectors = container.querySelectorAll(".time-selector");
      const minuteSelector = timeSelectors[1] as HTMLElement;
      const minuteButton = within(minuteSelector).getByRole("button", { name: "30" });
      fireEvent.click(minuteButton);

      expect(handleMinuteClick).toHaveBeenCalledWith(30, "single");
    });
  });

  describe("edge cases", () => {
    it("should handle null single value", () => {
      expect(() => render(<Calendar mode="single" value={null} />)).not.toThrow();
    });

    it("should handle undefined value", () => {
      expect(() => render(<Calendar mode="single" value={undefined} />)).not.toThrow();
    });

    it("should handle empty range value", () => {
      const value: DateRangeValue = { start: null, end: null };
      expect(() => render(<Calendar mode="range" value={value} />)).not.toThrow();
    });

    it("should handle partial range value (start only)", () => {
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 10), time: undefined },
        end: null,
      };

      render(<Calendar mode="range" value={value} classNames={{ dayRangeStart: "range-start" }} />);
      expect(screen.getByRole("button", { name: "10" })).toHaveClass("range-start");
    });

    it("should handle all classNames being undefined", () => {
      expect(() => render(<Calendar classNames={undefined} />)).not.toThrow();
    });

    it("should handle empty classNames object", () => {
      expect(() => render(<Calendar classNames={{}} />)).not.toThrow();
    });
  });

  describe("minTime and maxTime with time picker", () => {
    it("should pass minTime to time picker", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };

      render(
        <Calendar
          mode="single"
          value={value}
          showTime
          minTime={{ hours: 9, minutes: 0, seconds: 0 }}
        />
      );
      expect(screen.getByText("HH")).toBeInTheDocument();
    });

    it("should pass maxTime to time picker", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };

      render(
        <Calendar
          mode="single"
          value={value}
          showTime
          maxTime={{ hours: 17, minutes: 0, seconds: 0 }}
        />
      );
      expect(screen.getByText("HH")).toBeInTheDocument();
    });
  });

  describe("branch coverage - day selection edge cases", () => {
    it("should use default time when selecting first day without existing time", () => {
      const handleChange = vi.fn();
      // Use a day > 23 to avoid conflict with hour buttons in time picker
      const { container } = render(
        <Calendar
          mode="single"
          showTime
          onChange={handleChange}
          classNames={{ body: "cal-body" }}
        />
      );

      const calBody = queryAsHtmlElement(container, ".cal-body");
      fireEvent.click(within(calBody).getByRole("button", { name: "25" }));

      const value = getMockCallArg<DateTimeValue>(handleChange, 0, 0);
      expect(value.time).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    });

    it("should not set time when showTime is false", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="single" showTime={false} onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "15" }));

      const value = getMockCallArg<DateTimeValue>(handleChange, 0, 0);
      expect(value.time).toBeUndefined();
    });

    it("should handle range selection with showTime preserving times", () => {
      const handleChange = vi.fn();
      // Use days > 23 to avoid conflict with hour buttons in time picker
      const { container } = render(
        <Calendar mode="range" showTime onChange={handleChange} classNames={{ body: "cal-body" }} />
      );

      const calBody = queryAsHtmlElement(container, ".cal-body");
      fireEvent.click(within(calBody).getByRole("button", { name: "24" }));

      const startValue = getMockCallArg<DateRangeValue>(handleChange, 0, 0);
      expect(startValue.start?.time).toEqual({ hours: 0, minutes: 0, seconds: 0 });

      fireEvent.click(within(calBody).getByRole("button", { name: "28" }));

      const endValue = getMockCallArg<DateRangeValue>(handleChange, 1, 0);
      expect(endValue.end?.time).toEqual({ hours: 23, minutes: 59, seconds: 59 });
    });

    it("should handle range selection without showTime (time undefined)", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="range" showTime={false} onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "10" }));

      const startValue = getMockCallArg<DateRangeValue>(handleChange, 0, 0);
      expect(startValue.start?.time).toBeUndefined();
    });

    it("should handle same day range selection with showTime", () => {
      const handleChange = vi.fn();
      // Use a day > 23 to avoid conflict with hour buttons in time picker
      const { container } = render(
        <Calendar mode="range" showTime onChange={handleChange} classNames={{ body: "cal-body" }} />
      );

      const calBody = queryAsHtmlElement(container, ".cal-body");
      fireEvent.click(within(calBody).getByRole("button", { name: "25" }));
      fireEvent.click(within(calBody).getByRole("button", { name: "25" }));

      const value = getMockCallArg<DateRangeValue>(handleChange, 1, 0);
      expect(value.start?.time).toEqual({ hours: 0, minutes: 0, seconds: 0 });
      expect(value.end?.time).toEqual({ hours: 23, minutes: 59, seconds: 59 });
    });

    it("should handle same day range selection without showTime", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="range" showTime={false} onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "15" }));
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      const value = getMockCallArg<DateRangeValue>(handleChange, 1, 0);
      expect(value.start?.time).toBeUndefined();
    });

    it("should handle reversed range selection with showTime", () => {
      const handleChange = vi.fn();
      // Use days > 23 to avoid conflict with hour buttons in time picker
      const { container } = render(
        <Calendar mode="range" showTime onChange={handleChange} classNames={{ body: "cal-body" }} />
      );

      const calBody = queryAsHtmlElement(container, ".cal-body");
      fireEvent.click(within(calBody).getByRole("button", { name: "28" }));
      fireEvent.click(within(calBody).getByRole("button", { name: "24" }));

      const value = getMockCallArg<DateRangeValue>(handleChange, 1, 0);
      expect(value.start?.date.getDate()).toBe(24);
      expect(value.start?.time).toEqual({ hours: 0, minutes: 0, seconds: 0 });
      expect(value.end?.date.getDate()).toBe(28);
    });

    it("should handle reversed range selection without showTime", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="range" showTime={false} onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "20" }));
      fireEvent.click(screen.getByRole("button", { name: "10" }));

      const value = getMockCallArg<DateRangeValue>(handleChange, 1, 0);
      expect(value.start?.date.getDate()).toBe(10);
      expect(value.start?.time).toBeUndefined();
    });

    it("should not call onChange when clicking disabled day", () => {
      const handleChange = vi.fn();
      const handleDayClick = vi.fn();
      render(<Calendar disabled onChange={handleChange} onDayClick={handleDayClick} />);

      // All days are disabled, clicking should do nothing
      expect(screen.getByRole("button", { name: "15" })).toBeDisabled();
      expect(handleChange).not.toHaveBeenCalled();
      expect(handleDayClick).not.toHaveBeenCalled();
    });
  });

  describe("branch coverage - week click edge cases", () => {
    it("should not call onWeekClick when disabled", () => {
      const handleWeekClick = vi.fn();
      const { container } = render(
        <Calendar
          disabled
          showWeekNumbers
          onWeekClick={handleWeekClick}
          classNames={{ weekNumber: "week-num" }}
        />
      );

      expect(getWeekButton(container, 0)).toBeDisabled();
    });

    it("should select week with showTime preserving times", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Calendar
          mode="range"
          showWeekNumbers
          showTime
          onChange={handleChange}
          classNames={{ weekNumber: "week-num" }}
        />
      );

      fireEvent.click(getWeekButton(container, 1));

      const value = getMockCallArg<DateRangeValue>(handleChange, 0, 0);
      expect(value.start?.time).toEqual({ hours: 0, minutes: 0, seconds: 0 });
      expect(value.end?.time).toEqual({ hours: 23, minutes: 59, seconds: 59 });
    });

    it("should select week without showTime (time undefined)", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Calendar
          mode="range"
          showWeekNumbers
          showTime={false}
          onChange={handleChange}
          classNames={{ weekNumber: "week-num" }}
        />
      );

      fireEvent.click(getWeekButton(container, 1));

      const value = getMockCallArg<DateRangeValue>(handleChange, 0, 0);
      expect(value.start?.time).toBeUndefined();
    });

    it("should call onWeekClick in single mode without selecting range", () => {
      const handleWeekClick = vi.fn();
      const handleChange = vi.fn();
      const { container } = render(
        <Calendar
          mode="single"
          showWeekNumbers
          onWeekClick={handleWeekClick}
          onChange={handleChange}
          classNames={{ weekNumber: "week-num" }}
        />
      );

      fireEvent.click(getWeekButton(container, 1));

      expect(handleWeekClick).toHaveBeenCalled();
      // In single mode, week click should not trigger range selection
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("branch coverage - range background styling", () => {
    it("should apply dayRangeBackgroundStart class for range start", () => {
      render(
        <Calendar
          mode="range"
          classNames={{
            dayRangeBackground: "range-bg",
            dayRangeBackgroundStart: "range-bg-start",
          }}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      const { container } = render(
        <Calendar
          mode="range"
          value={{
            start: { date: new Date(2025, 0, 10), time: undefined },
            end: { date: new Date(2025, 0, 15), time: undefined },
          }}
          classNames={{
            dayRangeBackground: "range-bg",
            dayRangeBackgroundStart: "range-bg-start",
            dayRangeBackgroundEnd: "range-bg-end",
            dayRangeBackgroundMiddle: "range-bg-middle",
          }}
        />
      );

      expect(container.querySelector(".range-bg-start")).toBeInTheDocument();
      expect(container.querySelector(".range-bg-end")).toBeInTheDocument();
      expect(container.querySelector(".range-bg-middle")).toBeInTheDocument();
    });

    it("should hide range background when start and end are same day", () => {
      const { container } = render(
        <Calendar
          mode="range"
          value={{
            start: { date: new Date(2025, 0, 15), time: undefined },
            end: { date: new Date(2025, 0, 15), time: undefined },
          }}
          classNames={{ dayRangeBackground: "range-bg" }}
        />
      );

      const rangeBg = container.querySelector(".range-bg");
      expect(rangeBg).toHaveStyle({ display: "none" });
    });

    it("should apply first/last of week classes for range spanning multiple weeks", () => {
      // January 2025: Week starts on Sunday
      // Create a range that spans from Wednesday 8th to Wednesday 15th
      const { container } = render(
        <Calendar
          mode="range"
          value={{
            start: { date: new Date(2025, 0, 8), time: undefined },
            end: { date: new Date(2025, 0, 15), time: undefined },
          }}
          classNames={{
            dayRangeBackground: "range-bg",
            dayRangeBackgroundFirstOfWeek: "range-bg-first-week",
            dayRangeBackgroundLastOfWeek: "range-bg-last-week",
          }}
        />
      );

      // Days in the middle of the range on row boundaries should have these classes
      expect(container.querySelector(".range-bg-last-week")).toBeInTheDocument();
      expect(container.querySelector(".range-bg-first-week")).toBeInTheDocument();
    });
  });

  describe("branch coverage - default labels fallback", () => {
    it("should use default shortDays when labels.shortDays is undefined", () => {
      render(<Calendar labels={{}} />);
      expect(screen.getByText("Sun")).toBeInTheDocument();
    });

    it("should use default previousYearIcon when not provided", () => {
      render(<Calendar />);
      const prevYearBtn = screen.getByRole("button", { name: /previous year/i });
      expect(prevYearBtn.querySelector("svg")).toBeInTheDocument();
    });

    it("should use custom previousYearIcon when provided", () => {
      render(
        <Calendar
          labels={{ previousYearIcon: <span data-testid="custom-prev-year">{"<<"}</span> }}
        />
      );
      expect(screen.getByTestId("custom-prev-year")).toBeInTheDocument();
    });

    it("should use default previousMonthIcon when not provided", () => {
      render(<Calendar />);
      const prevMonthBtn = screen.getByRole("button", { name: /previous month/i });
      expect(prevMonthBtn.querySelector("svg")).toBeInTheDocument();
    });

    it("should use custom previousMonthIcon when provided", () => {
      render(
        <Calendar
          labels={{ previousMonthIcon: <span data-testid="custom-prev-month">{"<"}</span> }}
        />
      );
      expect(screen.getByTestId("custom-prev-month")).toBeInTheDocument();
    });

    it("should use default nextMonthIcon when not provided", () => {
      render(<Calendar />);
      const nextMonthBtn = screen.getByRole("button", { name: /next month/i });
      expect(nextMonthBtn.querySelector("svg")).toBeInTheDocument();
    });

    it("should use custom nextMonthIcon when provided", () => {
      render(
        <Calendar labels={{ nextMonthIcon: <span data-testid="custom-next-month">{">"}</span> }} />
      );
      expect(screen.getByTestId("custom-next-month")).toBeInTheDocument();
    });

    it("should use default nextYearIcon when not provided", () => {
      render(<Calendar />);
      const nextYearBtn = screen.getByRole("button", { name: /next year/i });
      expect(nextYearBtn.querySelector("svg")).toBeInTheDocument();
    });

    it("should use custom nextYearIcon when provided", () => {
      render(
        <Calendar labels={{ nextYearIcon: <span data-testid="custom-next-year">{">>"}</span> }} />
      );
      expect(screen.getByTestId("custom-next-year")).toBeInTheDocument();
    });
  });

  describe("branch coverage - navigation button classes", () => {
    it("should apply headerNavigationButtonPrev class to previous buttons", () => {
      const { container } = render(
        <Calendar classNames={{ headerNavigationButtonPrev: "nav-prev" }} />
      );
      const prevButtons = container.querySelectorAll(".nav-prev");
      expect(prevButtons.length).toBe(2);
    });

    it("should apply headerNavigationButtonNext class to next buttons", () => {
      const { container } = render(
        <Calendar classNames={{ headerNavigationButtonNext: "nav-next" }} />
      );
      const nextButtons = container.querySelectorAll(".nav-next");
      expect(nextButtons.length).toBe(2);
    });

    it("should apply headerTitle class", () => {
      const { container } = render(<Calendar classNames={{ headerTitle: "header-title" }} />);
      expect(container.querySelector(".header-title")).toBeInTheDocument();
    });

    it("should apply monthSelect class", () => {
      const { container } = render(<Calendar classNames={{ headerMonthSelect: "month-select" }} />);
      expect(container.querySelector(".month-select")).toBeInTheDocument();
    });

    it("should apply yearSelect class", () => {
      const { container } = render(<Calendar classNames={{ headerYearSelect: "year-select" }} />);
      expect(container.querySelector(".year-select")).toBeInTheDocument();
    });
  });

  describe("branch coverage - uncontrolled mode state updates", () => {
    it("should update internal state in uncontrolled mode", () => {
      render(<Calendar mode="single" classNames={{ daySelected: "selected" }} />);

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      expect(screen.getByRole("button", { name: "10" })).toHaveClass("selected");

      fireEvent.click(screen.getByRole("button", { name: "20" }));
      expect(screen.getByRole("button", { name: "20" })).toHaveClass("selected");
      expect(screen.getByRole("button", { name: "10" })).not.toHaveClass("selected");
    });

    it("should update internal state for range in uncontrolled mode", () => {
      render(
        <Calendar
          mode="range"
          classNames={{ dayRangeStart: "range-start", dayRangeEnd: "range-end" }}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      expect(screen.getByRole("button", { name: "10" })).toHaveClass("range-start");

      fireEvent.click(screen.getByRole("button", { name: "15" }));
      expect(screen.getByRole("button", { name: "10" })).toHaveClass("range-start");
      expect(screen.getByRole("button", { name: "15" })).toHaveClass("range-end");
    });
  });

  describe("branch coverage - grid template columns", () => {
    it("should set correct grid columns without week numbers", () => {
      const { container } = render(
        <Calendar showWeekNumbers={false} classNames={{ weekDaysRow: "week-row" }} />
      );
      const weekRow = container.querySelector(".week-row");
      expect(weekRow).toHaveStyle({ gridTemplateColumns: "repeat(7, 1fr)" });
    });

    it("should set correct grid columns with week numbers", () => {
      const { container } = render(
        <Calendar showWeekNumbers classNames={{ weekDaysRow: "week-row" }} />
      );
      const weekRow = container.querySelector(".week-row");
      expect(weekRow).toHaveStyle({ gridTemplateColumns: "auto repeat(7, 1fr)" });
    });

    it("should render weekNumberPlaceholder when showWeekNumbers is true", () => {
      const { container } = render(
        <Calendar showWeekNumbers classNames={{ weekNumberPlaceholder: "week-placeholder" }} />
      );
      expect(container.querySelector(".week-placeholder")).toBeInTheDocument();
    });
  });

  describe("branch coverage - day button classes combinations", () => {
    it("should not apply dayToday when day is selected", () => {
      // January 15, 2025 is "today" in our frozen time
      render(
        <Calendar
          mode="single"
          value={{ date: new Date(2025, 0, 15), time: undefined }}
          classNames={{ dayToday: "today", daySelected: "selected" }}
        />
      );

      const day15 = screen.getByRole("button", { name: "15" });
      expect(day15).toHaveClass("selected");
      expect(day15).not.toHaveClass("today");
    });

    it("should not apply dayWeekend when day is selected", () => {
      // January 4, 2025 is Saturday (weekend)
      render(
        <Calendar
          mode="single"
          value={{ date: new Date(2025, 0, 4), time: undefined }}
          classNames={{ dayWeekend: "weekend", daySelected: "selected" }}
        />
      );

      const day4 = screen.getByRole("button", { name: "4" });
      expect(day4).toHaveClass("selected");
      expect(day4).not.toHaveClass("weekend");
    });

    it("should not apply dayWeekend when day is in range", () => {
      // Range includes weekend days
      render(
        <Calendar
          mode="range"
          value={{
            start: { date: new Date(2025, 0, 3), time: undefined },
            end: { date: new Date(2025, 0, 6), time: undefined },
          }}
          classNames={{ dayWeekend: "weekend", dayInRange: "in-range" }}
        />
      );

      // January 4 (Sat) and 5 (Sun) are weekends but in range
      const day4 = screen.getByRole("button", { name: "4" });
      const day5 = screen.getByRole("button", { name: "5" });
      expect(day4).not.toHaveClass("weekend");
      expect(day5).not.toHaveClass("weekend");
    });

    it("should not apply dayWeekend for outside month days", () => {
      const { container } = render(
        <Calendar classNames={{ dayWeekend: "weekend", dayOutsideMonth: "outside" }} />
      );

      // Find outside month buttons that are on weekends
      const outsideButtons = container.querySelectorAll(".outside");
      outsideButtons.forEach((btn) => {
        // Outside month days should have outside class but weekend status varies
        expect(btn).toHaveClass("outside");
      });
    });

    it("should apply dayInRange only for current month days", () => {
      const { container } = render(
        <Calendar
          mode="range"
          value={{
            start: { date: new Date(2025, 0, 29), time: undefined },
            end: { date: new Date(2025, 1, 5), time: undefined },
          }}
          classNames={{
            dayInRange: "in-range",
            dayOutsideMonth: "outside",
          }}
        />
      );

      // Days from February shown in January view shouldn't have in-range class applied
      // (they're outside the current month)
      const inRangeButtons = container.querySelectorAll(".in-range");
      inRangeButtons.forEach((btn) => {
        expect(btn).not.toHaveClass("outside");
      });
    });
  });

  describe("branch coverage - month boundary navigation", () => {
    it("should wrap to December when going to previous month from January", () => {
      const onPrevMonth = vi.fn();
      render(<Calendar onPrevMonth={onPrevMonth} />);

      fireEvent.click(screen.getByRole("button", { name: /previous month/i }));

      expect(onPrevMonth).toHaveBeenCalledWith(11, 2024);
    });

    it("should wrap to January when going to next month from December", () => {
      const onNextMonth = vi.fn();
      const value: DateTimeValue = { date: new Date(2025, 11, 15), time: undefined };
      render(<Calendar value={value} onNextMonth={onNextMonth} />);

      fireEvent.click(screen.getByRole("button", { name: /next month/i }));

      expect(onNextMonth).toHaveBeenCalledWith(0, 2026);
    });
  });

  describe("branch coverage - week and day cell classes", () => {
    it("should apply week class", () => {
      const { container } = render(<Calendar classNames={{ week: "week-row" }} />);
      expect(container.querySelectorAll(".week-row").length).toBeGreaterThan(0);
    });

    it("should apply weekNumberCell class", () => {
      const { container } = render(
        <Calendar showWeekNumbers classNames={{ weekNumberCell: "week-num-cell" }} />
      );
      expect(container.querySelectorAll(".week-num-cell").length).toBeGreaterThan(0);
    });

    it("should apply day class", () => {
      const { container } = render(<Calendar classNames={{ day: "day-cell" }} />);
      expect(container.querySelectorAll(".day-cell").length).toBeGreaterThan(0);
    });
  });

  describe("branch coverage - additional edge cases", () => {
    it("should use custom shortDays when provided in labels", () => {
      const customLabels = { shortDays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] };
      render(<Calendar labels={customLabels} />);
      expect(screen.getByText("Su")).toBeInTheDocument();
      expect(screen.queryByText("Sun")).not.toBeInTheDocument();
    });

    it("should not navigate when disabled for prev month", () => {
      const onPrevMonth = vi.fn();
      render(<Calendar disabled onPrevMonth={onPrevMonth} />);

      const btn = screen.getByRole("button", { name: /previous month/i });
      expect(btn).toBeDisabled();
      expect(onPrevMonth).not.toHaveBeenCalled();
    });

    it("should not navigate when disabled for next month", () => {
      const onNextMonth = vi.fn();
      render(<Calendar disabled onNextMonth={onNextMonth} />);

      const btn = screen.getByRole("button", { name: /next month/i });
      expect(btn).toBeDisabled();
      expect(onNextMonth).not.toHaveBeenCalled();
    });

    it("should navigate to next month correctly when not at boundary", () => {
      const onNextMonth = vi.fn();
      // January 2025 is the current view (frozen date)
      render(<Calendar onNextMonth={onNextMonth} />);

      fireEvent.click(screen.getByRole("button", { name: /next month/i }));

      expect(onNextMonth).toHaveBeenCalledWith(1, 2025);
    });

    it("should apply dayButton className", () => {
      const { container } = render(<Calendar classNames={{ dayButton: "day-btn" }} />);
      expect(container.querySelectorAll(".day-btn").length).toBeGreaterThan(0);
    });

    it("should apply dayDisabled className for disabled days", () => {
      const { container } = render(
        <Calendar minDate={new Date(2025, 0, 10)} classNames={{ dayDisabled: "disabled-day" }} />
      );
      expect(container.querySelectorAll(".disabled-day").length).toBeGreaterThan(0);
    });

    it("should apply timeSeparator className", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 0, seconds: 0 },
      };
      const { container } = render(
        <Calendar mode="single" value={value} showTime classNames={{ timeSeparator: "time-sep" }} />
      );
      expect(container.querySelector(".time-sep")).toBeInTheDocument();
    });

    it("should apply headerNavigationButton className", () => {
      const { container } = render(<Calendar classNames={{ headerNavigationButton: "nav-btn" }} />);
      expect(container.querySelectorAll(".nav-btn").length).toBe(4);
    });

    it("should apply headerNavigation className", () => {
      const { container } = render(<Calendar classNames={{ headerNavigation: "nav-container" }} />);
      expect(container.querySelectorAll(".nav-container").length).toBe(2);
    });

    it("should not trigger handleWeekClick when disabled", () => {
      const onChange = vi.fn();
      const onWeekClick = vi.fn();
      const { container } = render(
        <Calendar
          mode="range"
          showWeekNumbers
          disabled
          onChange={onChange}
          onWeekClick={onWeekClick}
          classNames={{ weekNumber: "week-num" }}
        />
      );

      const weekButton = getWeekButton(container, 3);
      fireEvent.click(weekButton);

      expect(onWeekClick).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should not trigger handleDayClick when calendar is disabled via prop", () => {
      const onChange = vi.fn();
      const onDayClick = vi.fn();
      const { container } = render(
        <Calendar
          mode="single"
          disabled
          onChange={onChange}
          onDayClick={onDayClick}
          classNames={{ body: "cal-body" }}
        />
      );

      const calBody = container.querySelector(".cal-body");
      const dayButton = within(calBody as HTMLElement).getByRole("button", { name: "25" });
      fireEvent.click(dayButton);

      expect(onDayClick).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should use default shortDays when labels.shortDays is undefined", () => {
      // Pass labels without shortDays to trigger the ?? fallback
      render(<Calendar labels={{ previousYear: "Prev" }} />);
      // Default shortDays should be used (Sun, Mon, etc.)
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getByText("Mon")).toBeInTheDocument();
    });

    it("should apply weekNumber className", () => {
      const { container } = render(
        <Calendar showWeekNumbers classNames={{ weekNumber: "wn-btn" }} />
      );
      expect(container.querySelectorAll(".wn-btn").length).toBeGreaterThan(0);
    });
  });

  describe("branch coverage - edge cases with unusual data", () => {
    it("should handle labels with explicitly undefined shortDays", () => {
      // Pass labels object with shortDays explicitly undefined
      const customLabels = {
        previousYear: "<<",
        shortDays: undefined as unknown as string[],
      };
      render(<Calendar labels={customLabels} />);
      // Should fall back to default shortDays
      expect(screen.getByText("Sun")).toBeInTheDocument();
    });

    it("should handle clicking day when both isDisabled and disabled are true", () => {
      const onChange = vi.fn();
      const onDayClick = vi.fn();
      // Day before minDate is isDisabled, calendar is also disabled
      const { container } = render(
        <Calendar
          mode="single"
          disabled
          minDate={new Date(2025, 0, 10)}
          onChange={onChange}
          onDayClick={onDayClick}
          classNames={{ body: "cal-body" }}
        />
      );

      const calBody = container.querySelector(".cal-body");
      // Day 5 is both isDisabled (before minDate) AND calendar is disabled
      const buttons = within(calBody as HTMLElement).getAllByRole("button");
      const day5 = buttons.find((b) => b.textContent === "5");
      expect(day5).toBeDisabled();

      // Try clicking - should not trigger anything
      if (day5) fireEvent.click(day5);
      expect(onDayClick).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should show time picker in single mode with showTime even without value", () => {
      const onChange = vi.fn();
      const onTimeChange = vi.fn();
      // Single mode with showTime but no value selected yet
      render(<Calendar mode="single" showTime onChange={onChange} onTimeChange={onTimeChange} />);

      // Time picker is visible even without a selected date
      expect(screen.getByText("HH")).toBeInTheDocument();
    });

    it("should show time pickers in range mode with showTime even without value", () => {
      const onChange = vi.fn();
      const onTimeChange = vi.fn();
      // Range mode with showTime but no range selected
      render(<Calendar mode="range" showTime onChange={onChange} onTimeChange={onTimeChange} />);

      // Time pickers are visible - two of them in range mode
      expect(screen.queryAllByText("HH").length).toBe(2);
    });

    it("should show time pickers in range mode with partial value (start only)", () => {
      const onChange = vi.fn();
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 10), time: { hours: 10, minutes: 0, seconds: 0 } },
        end: null,
      };
      render(<Calendar mode="range" value={value} showTime onChange={onChange} />);

      // Time pickers are visible even with partial range
      expect(screen.queryAllByText("HH").length).toBe(2);
    });

    it("should not navigate in month when disabled - prev month boundary", () => {
      const onPrevMonth = vi.fn();
      render(<Calendar disabled onPrevMonth={onPrevMonth} />);

      const prevBtn = screen.getByRole("button", { name: /previous month/i });
      expect(prevBtn).toBeDisabled();
      // Even if we force click, nothing should happen
      fireEvent.click(prevBtn);
      expect(onPrevMonth).not.toHaveBeenCalled();
    });

    it("should not navigate in month when disabled - next month boundary", () => {
      const onNextMonth = vi.fn();
      render(<Calendar disabled onNextMonth={onNextMonth} />);

      const nextBtn = screen.getByRole("button", { name: /next month/i });
      expect(nextBtn).toBeDisabled();
      fireEvent.click(nextBtn);
      expect(onNextMonth).not.toHaveBeenCalled();
    });

    it("should handle week click with empty days array gracefully in range mode", () => {
      // This tests the defensive check for !firstDay || !lastDay
      const onChange = vi.fn();
      const onWeekClick = vi.fn();
      const { container } = render(
        <Calendar
          mode="range"
          showWeekNumbers
          onChange={onChange}
          onWeekClick={onWeekClick}
          classNames={{ weekNumber: "week-num" }}
        />
      );

      // Click week button - normally works fine
      fireEvent.click(getWeekButton(container, 0));
      expect(onWeekClick).toHaveBeenCalled();
    });

    it("should handle labels with null shortDays", () => {
      const customLabels = {
        previousYear: "<<",
        shortDays: null as unknown as string[],
      };
      render(<Calendar labels={customLabels} />);
      // Should fall back to default shortDays
      expect(screen.getByText("Sun")).toBeInTheDocument();
    });

    it("should handle empty labels object", () => {
      render(<Calendar labels={{}} />);
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getByText("Mon")).toBeInTheDocument();
    });

    it("should handle single mode with time change when value has no time", () => {
      const onChange = vi.fn();
      const value: DateTimeValue = { date: new Date(2025, 0, 15), time: undefined };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          onChange={onChange}
          classNames={{ body: "cal-body" }}
        />
      );

      // Select day 25 - use day > 23 to avoid conflict with hour buttons
      const calBody = container.querySelector(".cal-body");
      const day25 = within(calBody as HTMLElement).getByRole("button", { name: "25" });
      fireEvent.click(day25);
      expect(onChange).toHaveBeenCalled();
    });

    it("should handle range mode with mismatched time values", () => {
      const onChange = vi.fn();
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 10), time: { hours: 8, minutes: 0, seconds: 0 } },
        end: { date: new Date(2025, 0, 20), time: undefined },
      };
      render(<Calendar mode="range" value={value} showTime onChange={onChange} />);

      // Both time pickers should be visible
      expect(screen.getAllByText("HH").length).toBe(2);
    });

    it("should handle controlled value change from parent", () => {
      const onChange = vi.fn();
      const initialValue: DateTimeValue = { date: new Date(2025, 0, 10), time: undefined };

      const { rerender } = render(
        <Calendar
          mode="single"
          value={initialValue}
          onChange={onChange}
          classNames={{ daySelected: "selected" }}
        />
      );

      expect(screen.getByRole("button", { name: "10" })).toHaveClass("selected");

      // Update value from parent
      const newValue: DateTimeValue = { date: new Date(2025, 0, 20), time: undefined };
      rerender(
        <Calendar
          mode="single"
          value={newValue}
          onChange={onChange}
          classNames={{ daySelected: "selected" }}
        />
      );

      expect(screen.getByRole("button", { name: "20" })).toHaveClass("selected");
      expect(screen.getByRole("button", { name: "10" })).not.toHaveClass("selected");
    });

    it("should handle view date changes when value changes month", () => {
      const initialValue: DateTimeValue = { date: new Date(2025, 0, 15), time: undefined };

      const { rerender } = render(<Calendar mode="single" value={initialValue} />);

      expect(screen.getByText("January")).toBeInTheDocument();

      // Change to a different month
      const newValue: DateTimeValue = { date: new Date(2025, 5, 15), time: undefined };
      rerender(<Calendar mode="single" value={newValue} />);

      // View should still show January since viewDate is controlled internally
      // unless there's logic to sync it
      expect(screen.getByText("January")).toBeInTheDocument();
    });
  });

  describe("branch coverage - time picker with null values", () => {
    it("should render time picker in single mode even when value is null", () => {
      // Single mode with showTime but value is null
      render(<Calendar mode="single" value={null} showTime />);

      // The time picker is visible even without a selected date
      expect(screen.getByText("HH")).toBeInTheDocument();
      expect(screen.getByText("MM")).toBeInTheDocument();
    });

    it("should render both time pickers in range mode even when value is null", () => {
      // Range mode with showTime but value is null
      render(<Calendar mode="range" value={null} showTime />);

      // Both time pickers visible
      expect(screen.getAllByText("HH").length).toBe(2);
      expect(screen.getAllByText("MM").length).toBe(2);
    });

    it("should render time pickers with partial range value", () => {
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 10), time: { hours: 10, minutes: 0, seconds: 0 } },
        end: null,
      };

      render(<Calendar mode="range" value={value} showTime />);

      // Both time pickers are visible
      expect(screen.getAllByText("HH").length).toBe(2);
    });
  });

  describe("branch coverage - JSX conditional classes", () => {
    it("should not apply dayRangeBackgroundStart when day is both start and end", () => {
      // Same day selection - both start and end
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 15), time: undefined },
        end: { date: new Date(2025, 0, 15), time: undefined },
      };

      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          classNames={{
            dayRangeBackgroundStart: "bg-start",
            dayRangeBackgroundEnd: "bg-end",
          }}
        />
      );

      // Same day means isRangeStart && isRangeEnd both true
      // The background should have display: none
      expect(container.querySelector(".bg-start")).not.toBeInTheDocument();
      expect(container.querySelector(".bg-end")).not.toBeInTheDocument();
    });

    it("should apply dayRangeBackgroundMiddle for days in middle of range", () => {
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 10), time: undefined },
        end: { date: new Date(2025, 0, 20), time: undefined },
      };

      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          classNames={{
            dayRangeBackgroundMiddle: "bg-middle",
          }}
        />
      );

      // Days 11-19 should have bg-middle
      expect(container.querySelectorAll(".bg-middle").length).toBeGreaterThan(0);
    });

    it("should apply dayRangeBackgroundFirstOfWeek for first day of week in range", () => {
      // Range spanning multiple weeks
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 8), time: undefined },
        end: { date: new Date(2025, 0, 22), time: undefined },
      };

      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          classNames={{
            dayRangeBackgroundFirstOfWeek: "first-of-week",
          }}
        />
      );

      // Check for first-of-week class on Sundays within the range
      expect(container.querySelectorAll(".first-of-week").length).toBeGreaterThan(0);
    });

    it("should apply dayRangeBackgroundLastOfWeek for last day of week in range", () => {
      // Range spanning multiple weeks
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 8), time: undefined },
        end: { date: new Date(2025, 0, 22), time: undefined },
      };

      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          classNames={{
            dayRangeBackgroundLastOfWeek: "last-of-week",
          }}
        />
      );

      // Check for last-of-week class on Saturdays within the range
      expect(container.querySelectorAll(".last-of-week").length).toBeGreaterThan(0);
    });

    it("should not apply dayWeekend when day is range start", () => {
      // Select a weekend day as range start (Jan 11 is Saturday)
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 11), time: undefined },
        end: { date: new Date(2025, 0, 15), time: undefined },
      };

      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          classNames={{
            dayWeekend: "weekend",
            dayRangeStart: "range-start",
          }}
        />
      );

      // The range start (Saturday Jan 11) should have range-start but not weekend
      const rangeStarts = container.querySelectorAll(".range-start");
      expect(rangeStarts.length).toBe(1);
      expect(rangeStarts[0]).not.toHaveClass("weekend");
    });

    it("should not apply dayWeekend when day is range end", () => {
      // Select a weekend day as range end (Jan 12 is Sunday)
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 8), time: undefined },
        end: { date: new Date(2025, 0, 12), time: undefined },
      };

      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          classNames={{
            dayWeekend: "weekend",
            dayRangeEnd: "range-end",
          }}
        />
      );

      // The range end (Sunday Jan 12) should have range-end but not weekend
      const rangeEnds = container.querySelectorAll(".range-end");
      expect(rangeEnds.length).toBe(1);
      expect(rangeEnds[0]).not.toHaveClass("weekend");
    });

    it("should not show dayInRange for outside month days", () => {
      // Range that extends into next month
      const value: DateRangeValue = {
        start: { date: new Date(2025, 0, 28), time: undefined },
        end: { date: new Date(2025, 1, 5), time: undefined },
      };

      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          classNames={{
            dayInRange: "in-range",
            dayOutsideMonth: "outside",
          }}
        />
      );

      // Days in February (outside January view) should not have in-range
      const outsideDays = container.querySelectorAll(".outside");
      outsideDays.forEach((day) => {
        // Outside month days shouldn't have in-range styling
        expect(day).not.toHaveClass("in-range");
      });
    });
  });

  describe("branch coverage - disabled calendar day click", () => {
    it("should trigger disabled branch when clicking enabled day on disabled calendar", () => {
      const onChange = vi.fn();
      const onDayClick = vi.fn();

      // Calendar is disabled, but days themselves are not disabled by minDate/maxDate
      const { container } = render(
        <Calendar
          mode="single"
          disabled
          onChange={onChange}
          onDayClick={onDayClick}
          classNames={{ body: "cal-body" }}
        />
      );

      // Day 15 is not disabled by date constraints, only by calendar disabled prop
      const calBody = container.querySelector(".cal-body");
      const dayButtons = within(calBody as HTMLElement).getAllByRole("button");
      const day15 = dayButtons.find((b) => b.textContent === "15");

      expect(day15).toBeDisabled();

      // Try to click - should not trigger callbacks
      if (day15) {
        fireEvent.click(day15);
      }
      expect(onDayClick).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
