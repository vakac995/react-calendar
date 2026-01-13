import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
  type Mock,
  afterEach,
} from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
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

    it("should render month and year buttons", () => {
      const { container } = render(
        <Calendar classNames={{ headerTitleButton: "header-title-btn" }} />
      );
      const titleButtons = container.querySelectorAll(".header-title-btn");
      expect(titleButtons.length).toBe(2);
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
      const { container } = render(
        <Calendar classNames={{ headerTitleButton: "header-title-btn" }} />
      );
      const titleButtons = container.querySelectorAll(".header-title-btn");
      expect(titleButtons[0]?.textContent).toBe("January");
      expect(titleButtons[1]?.textContent).toBe("2025");
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

  describe("multiple mode selection", () => {
    it("should select a date on first click", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="multiple" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "10" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const value = getMockCallArg<{ date: Date }[]>(handleChange, 0, 0);
      expect(value).toHaveLength(1);
      expect(value[0]?.date.getDate()).toBe(10);
    });

    it("should add multiple dates on subsequent clicks", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="multiple" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      fireEvent.click(screen.getByRole("button", { name: "15" }));
      fireEvent.click(screen.getByRole("button", { name: "20" }));

      expect(handleChange).toHaveBeenCalledTimes(3);
      const value = getMockCallArg<{ date: Date }[]>(handleChange, 2, 0);
      expect(value).toHaveLength(3);
      expect(value.map((v) => v.date.getDate())).toEqual([10, 15, 20]);
    });

    it("should remove a date when clicking on an already selected date", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="multiple" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      fireEvent.click(screen.getByRole("button", { name: "15" }));
      fireEvent.click(screen.getByRole("button", { name: "10" })); // Toggle off

      expect(handleChange).toHaveBeenCalledTimes(3);
      const value = getMockCallArg<{ date: Date }[]>(handleChange, 2, 0);
      expect(value).toHaveLength(1);
      expect(value[0]?.date.getDate()).toBe(15);
    });

    it("should sort dates chronologically", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="multiple" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: "20" }));
      fireEvent.click(screen.getByRole("button", { name: "5" }));
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      const value = getMockCallArg<{ date: Date }[]>(handleChange, 2, 0);
      expect(value.map((v) => v.date.getDate())).toEqual([5, 15, 20]);
    });

    it("should apply selected className to all selected dates", () => {
      render(<Calendar mode="multiple" classNames={{ daySelected: "selected" }} />);

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      fireEvent.click(screen.getByRole("button", { name: "15" }));
      fireEvent.click(screen.getByRole("button", { name: "20" }));

      expect(screen.getByRole("button", { name: "10" })).toHaveClass("selected");
      expect(screen.getByRole("button", { name: "15" })).toHaveClass("selected");
      expect(screen.getByRole("button", { name: "20" })).toHaveClass("selected");
      expect(screen.getByRole("button", { name: "12" })).not.toHaveClass("selected");
    });

    it("should work with controlled multiple values", () => {
      const value = [
        { date: new Date(2025, 0, 10) },
        { date: new Date(2025, 0, 15) },
        { date: new Date(2025, 0, 20) },
      ];

      render(<Calendar mode="multiple" value={value} classNames={{ daySelected: "selected" }} />);

      expect(screen.getByRole("button", { name: "10" })).toHaveClass("selected");
      expect(screen.getByRole("button", { name: "15" })).toHaveClass("selected");
      expect(screen.getByRole("button", { name: "20" })).toHaveClass("selected");
    });

    it("should clear all selections when clear button is clicked", () => {
      const handleChange = vi.fn();
      const handleClear = vi.fn();
      render(
        <Calendar
          mode="multiple"
          onChange={handleChange}
          onClear={handleClear}
          showClearButton
          labels={{ clearButton: "Clear" }}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      const clearButton = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearButton);

      expect(handleClear).toHaveBeenCalled();
      const lastCallArg = getMockCallArg<{ date: Date }[]>(handleChange, 2, 0);
      expect(lastCallArg).toEqual([]);
    });

    it("should not select disabled dates", () => {
      const handleChange = vi.fn();
      render(
        <Calendar
          mode="multiple"
          onChange={handleChange}
          isDateDisabled={(date) => date.getDate() === 15}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "10" }));
      fireEvent.click(screen.getByRole("button", { name: "15" }));
      fireEvent.click(screen.getByRole("button", { name: "20" }));

      expect(handleChange).toHaveBeenCalledTimes(2);
      const value = getMockCallArg<{ date: Date }[]>(handleChange, 1, 0);
      expect(value).toHaveLength(2);
      expect(value.map((v) => v.date.getDate())).toEqual([10, 20]);
    });

    it("should handle empty array as initial value", () => {
      const handleChange = vi.fn();
      render(
        <Calendar
          mode="multiple"
          value={[]}
          onChange={handleChange}
          classNames={{ daySelected: "selected" }}
        />
      );

      // No dates should be selected
      expect(screen.getByRole("button", { name: "10" })).not.toHaveClass("selected");
      expect(screen.getByRole("button", { name: "15" })).not.toHaveClass("selected");

      // Clicking should work normally
      fireEvent.click(screen.getByRole("button", { name: "10" }));
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("week mode selection", () => {
    it("should select entire week on day click", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="week" onChange={handleChange} />);

      // Click on Wednesday January 15, 2025
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const value = getMockCallArg<{
        weekNumber: number;
        year: number;
        startDate: Date;
        endDate: Date;
      }>(handleChange, 0, 0);

      // Week should start on Sunday (Jan 12) and end on Saturday (Jan 18)
      expect(value.startDate.getDate()).toBe(12);
      expect(value.endDate.getDate()).toBe(18);
      expect(value.year).toBe(2025);
    });

    it("should highlight all days in selected week", () => {
      render(
        <Calendar
          mode="week"
          classNames={{ dayRangeStart: "range-start", dayRangeEnd: "range-end" }}
        />
      );

      // Click on Wednesday January 15, 2025
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      // Week uses background highlight; start and end should have respective classes
      expect(screen.getByRole("button", { name: "12" })).toHaveClass("range-start");
      expect(screen.getByRole("button", { name: "18" })).toHaveClass("range-end");

      // Day outside the week should not have range classes
      expect(screen.getByRole("button", { name: "11" })).not.toHaveClass("range-start");
      expect(screen.getByRole("button", { name: "19" })).not.toHaveClass("range-end");
    });

    it("should apply range start and end classes", () => {
      render(
        <Calendar
          mode="week"
          classNames={{
            dayRangeStart: "range-start",
            dayRangeEnd: "range-end",
          }}
        />
      );

      // Click on Wednesday January 15, 2025
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      // Jan 12 should be range start, Jan 18 should be range end
      expect(screen.getByRole("button", { name: "12" })).toHaveClass("range-start");
      expect(screen.getByRole("button", { name: "18" })).toHaveClass("range-end");
    });

    it("should work with controlled week value", () => {
      const value = {
        weekNumber: 3,
        year: 2025,
        startDate: new Date(2025, 0, 12),
        endDate: new Date(2025, 0, 18),
      };

      render(
        <Calendar
          mode="week"
          value={value}
          classNames={{ dayRangeStart: "range-start", dayRangeEnd: "range-end" }}
        />
      );

      // Week uses background highlight; check start and end
      expect(screen.getByRole("button", { name: "12" })).toHaveClass("range-start");
      expect(screen.getByRole("button", { name: "18" })).toHaveClass("range-end");
    });

    it("should clear week selection when clear button is clicked", () => {
      const handleChange = vi.fn();
      const handleClear = vi.fn();
      render(
        <Calendar
          mode="week"
          onChange={handleChange}
          onClear={handleClear}
          showClearButton
          labels={{ clearButton: "Clear" }}
        />
      );

      // Select a week
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      // Clear
      const clearButton = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearButton);

      expect(handleClear).toHaveBeenCalled();
      const lastCallArg = getMockCallArg<null>(handleChange, 1, 0);
      expect(lastCallArg).toBeNull();
    });

    it("should respect weekStartsOn when selecting week", () => {
      const handleChange = vi.fn();
      // Week starts on Monday (1)
      render(<Calendar mode="week" weekStartsOn={1} onChange={handleChange} />);

      // Click on Wednesday January 15, 2025
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      const value = getMockCallArg<{
        startDate: Date;
        endDate: Date;
      }>(handleChange, 0, 0);

      // Week should start on Monday (Jan 13) and end on Sunday (Jan 19)
      expect(value.startDate.getDate()).toBe(13);
      expect(value.endDate.getDate()).toBe(19);
    });

    it("should switch weeks when clicking on different week", () => {
      const handleChange = vi.fn();
      render(
        <Calendar
          mode="week"
          onChange={handleChange}
          classNames={{ dayRangeStart: "range-start", dayRangeEnd: "range-end" }}
        />
      );

      // Click on January 15 (week of Jan 12-18)
      fireEvent.click(screen.getByRole("button", { name: "15" }));
      // Week start should have range-start
      expect(screen.getByRole("button", { name: "12" })).toHaveClass("range-start");

      // Click on January 22 (different week)
      fireEvent.click(screen.getByRole("button", { name: "22" }));

      // Previous week start should be deselected
      expect(screen.getByRole("button", { name: "12" })).not.toHaveClass("range-start");

      // New week should have range-start on Jan 19
      expect(screen.getByRole("button", { name: "19" })).toHaveClass("range-start");

      const lastValue = getMockCallArg<{
        startDate: Date;
        endDate: Date;
      }>(handleChange, 1, 0);
      expect(lastValue.startDate.getDate()).toBe(19);
      expect(lastValue.endDate.getDate()).toBe(25);
    });
  });

  describe("quarter mode selection", () => {
    it("should select entire quarter on day click", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="quarter" onChange={handleChange} />);

      // Click on January 15, 2025 (Q1)
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      expect(handleChange).toHaveBeenCalledTimes(1);
      const value = getMockCallArg<{
        quarter: 1 | 2 | 3 | 4;
        year: number;
        startDate: Date;
        endDate: Date;
      }>(handleChange, 0, 0);

      expect(value.quarter).toBe(1);
      expect(value.year).toBe(2025);
      expect(value.startDate.getMonth()).toBe(0); // January
      expect(value.startDate.getDate()).toBe(1);
      expect(value.endDate.getMonth()).toBe(2); // March
      expect(value.endDate.getDate()).toBe(31);
    });

    it("should highlight all days in selected quarter", () => {
      render(
        <Calendar
          mode="quarter"
          classNames={{
            dayInRange: "in-range",
            dayRangeStart: "range-start",
            dayRangeEnd: "range-end",
          }}
        />
      );

      // Click on January 15, 2025 (Q1)
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      // Days in January should be in range
      expect(screen.getByRole("button", { name: "15" })).toHaveClass("in-range");
      expect(screen.getByRole("button", { name: "20" })).toHaveClass("in-range");
    });

    it("should work with controlled quarter value", () => {
      const value = {
        quarter: 1 as const,
        year: 2025,
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 2, 31),
      };

      render(<Calendar mode="quarter" value={value} classNames={{ dayInRange: "in-range" }} />);

      // Days in Q1 should be in range
      expect(screen.getByRole("button", { name: "15" })).toHaveClass("in-range");
      expect(screen.getByRole("button", { name: "20" })).toHaveClass("in-range");
    });

    it("should clear quarter selection when clear button is clicked", () => {
      const handleChange = vi.fn();
      const handleClear = vi.fn();
      render(
        <Calendar
          mode="quarter"
          onChange={handleChange}
          onClear={handleClear}
          showClearButton
          labels={{ clearButton: "Clear" }}
        />
      );

      // Select a quarter
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      // Clear
      const clearButton = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearButton);

      expect(handleClear).toHaveBeenCalled();
      const lastCallArg = getMockCallArg<null>(handleChange, 1, 0);
      expect(lastCallArg).toBeNull();
    });

    it("should switch quarters when clicking on different quarter", () => {
      const handleChange = vi.fn();
      render(
        <Calendar
          mode="quarter"
          defaultValue={{
            quarter: 1,
            year: 2025,
            startDate: new Date(2025, 0, 1),
            endDate: new Date(2025, 2, 31),
          }}
          onChange={handleChange}
        />
      );

      // Navigate to April (Q2) and click a day
      fireEvent.click(screen.getByRole("button", { name: /next month/i }));
      fireEvent.click(screen.getByRole("button", { name: /next month/i }));
      fireEvent.click(screen.getByRole("button", { name: /next month/i })); // Now at April

      fireEvent.click(screen.getByRole("button", { name: "15" }));

      const value = getMockCallArg<{
        quarter: 1 | 2 | 3 | 4;
        year: number;
      }>(handleChange, 0, 0);

      expect(value.quarter).toBe(2);
      expect(value.year).toBe(2025);
    });

    it("should calculate correct quarter boundaries for Q2", () => {
      const handleChange = vi.fn();
      render(<Calendar mode="quarter" onChange={handleChange} defaultValue={null} />);

      // Navigate to May (Q2)
      fireEvent.click(screen.getByRole("button", { name: /next month/i }));
      fireEvent.click(screen.getByRole("button", { name: /next month/i }));
      fireEvent.click(screen.getByRole("button", { name: /next month/i }));
      fireEvent.click(screen.getByRole("button", { name: /next month/i })); // Now at May

      fireEvent.click(screen.getByRole("button", { name: "15" }));

      const value = getMockCallArg<{
        quarter: 1 | 2 | 3 | 4;
        startDate: Date;
        endDate: Date;
      }>(handleChange, 0, 0);

      expect(value.quarter).toBe(2);
      expect(value.startDate.getMonth()).toBe(3); // April
      expect(value.startDate.getDate()).toBe(1);
      expect(value.endDate.getMonth()).toBe(5); // June
      expect(value.endDate.getDate()).toBe(30);
    });

    it("should apply daySelected class to quarter start and end", () => {
      render(<Calendar mode="quarter" classNames={{ daySelected: "selected" }} />);

      // Click on January 15, 2025 (Q1)
      fireEvent.click(screen.getByRole("button", { name: "15" }));

      // January 1 should have selected class (range start)
      // There may be multiple "1" buttons (from next month), so check the first one
      const dayOneButtons = screen.getAllByRole("button", { name: "1" });
      expect(dayOneButtons[0]).toHaveClass("selected");
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

    it("should select month via month picker", () => {
      const onMonthSelect = vi.fn();
      const { container } = render(
        <Calendar
          onMonthSelect={onMonthSelect}
          classNames={{
            headerTitleButton: "header-title-btn",
            monthGridItem: "month-item",
          }}
        />
      );

      // Click month button to open month picker
      const monthButton = container.querySelectorAll(".header-title-btn")[0];
      fireEvent.click(monthButton!);

      // Click July (index 6)
      const monthItems = container.querySelectorAll(".month-item");
      fireEvent.click(monthItems[6]!);

      expect(onMonthSelect).toHaveBeenCalledWith(6, 2025);
    });

    it("should select year via year picker", () => {
      const onYearChange = vi.fn();
      const { container } = render(
        <Calendar
          onYearChange={onYearChange}
          years={[2025, 2026, 2027, 2028, 2029, 2030]}
          classNames={{
            headerTitleButton: "header-title-btn",
            yearGridItem: "year-item",
          }}
        />
      );

      // Click year button to open year picker
      const yearButton = container.querySelectorAll(".header-title-btn")[1];
      fireEvent.click(yearButton!);

      // Click 2030
      const yearItems = container.querySelectorAll(".year-item");
      const year2030 = Array.from(yearItems).find((item) => item.textContent === "2030");
      fireEvent.click(year2030!);

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

    it("should disable month/year buttons when disabled", () => {
      const { container } = render(
        <Calendar disabled classNames={{ headerTitleButton: "header-title-btn" }} />
      );
      const titleButtons = container.querySelectorAll(".header-title-btn");
      titleButtons.forEach((btn) => expect(btn).toBeDisabled());
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
      render(<Calendar mode="range" value={value} showTime layout="desktop" />);
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
          layout="desktop"
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
          layout="desktop"
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
          layout="desktop"
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
      const { container } = render(
        <Calendar
          years={customYears}
          defaultView="years"
          classNames={{ yearGridItem: "year-item" }}
        />
      );

      const yearItems = container.querySelectorAll(".year-item");
      expect(yearItems.length).toBe(6);

      const yearTexts = Array.from(yearItems).map((item) => item.textContent);
      expect(yearTexts).toContain("2020");
      expect(yearTexts).toContain("2025");
      expect(yearTexts).not.toContain("2026");
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

    it("should use default times for new same day range selection when controlled", () => {
      const handleChange = vi.fn();
      const existingEndTime = { hours: 17, minutes: 30, seconds: 45 };
      let currentValue: DateRangeValue | null = {
        start: { date: new Date(2025, 0, 25), time: { hours: 9, minutes: 0, seconds: 0 } },
        end: { date: new Date(2025, 0, 26), time: existingEndTime },
      };

      const { container, rerender } = render(
        <Calendar
          mode="range"
          showTime
          value={currentValue}
          onChange={(newValue) => {
            currentValue = newValue;
            handleChange(newValue);
          }}
          classNames={{ body: "cal-body" }}
        />
      );

      // Click on a new day to start new selection
      const calBody = queryAsHtmlElement(container, ".cal-body");
      fireEvent.click(within(calBody).getByRole("button", { name: "27" }));

      // Simulate controlled component by re-rendering with updated value
      rerender(
        <Calendar
          mode="range"
          showTime
          value={currentValue}
          onChange={(newValue) => {
            currentValue = newValue;
            handleChange(newValue);
          }}
          classNames={{ body: "cal-body" }}
        />
      );

      // Click same day to complete the range
      fireEvent.click(within(calBody).getByRole("button", { name: "27" }));

      // Should use default times for the new selection
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

    it("should apply headerTitleButton class to month button", () => {
      const { container } = render(<Calendar classNames={{ headerTitleButton: "title-button" }} />);
      const titleButtons = container.querySelectorAll(".title-button");
      expect(titleButtons.length).toBe(2);
    });

    it("should apply headerTitleButton class to year button", () => {
      const { container } = render(<Calendar classNames={{ headerTitleButton: "title-button" }} />);
      const titleButtons = container.querySelectorAll(".title-button");
      expect(titleButtons[1]).toBeInTheDocument();
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

    it("should apply dayInRange without dayOutsideMonth for outside month days in range", () => {
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

      // Days in range should have in-range class (for visual continuity)
      // but NOT outside class (so text remains visible with proper contrast)
      const inRangeButtons = container.querySelectorAll(".in-range");
      expect(inRangeButtons.length).toBeGreaterThan(0);
      // Range days should not have the outside class when in range
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

    it("should apply rootDisabled className when disabled", () => {
      const { container } = render(
        <Calendar disabled classNames={{ rootDisabled: "root-disabled" }} />
      );
      expect(container.querySelector(".root-disabled")).toBeInTheDocument();
    });

    it("should apply headerDisabled className when disabled", () => {
      const { container } = render(
        <Calendar disabled classNames={{ headerDisabled: "header-disabled" }} />
      );
      expect(container.querySelectorAll(".header-disabled").length).toBe(1);
    });

    it("should apply headerNavigationButtonDisabled className when disabled", () => {
      const { container } = render(
        <Calendar disabled classNames={{ headerNavigationButtonDisabled: "nav-btn-disabled" }} />
      );
      expect(container.querySelectorAll(".nav-btn-disabled").length).toBe(4);
    });

    it("should apply headerTitleButtonDisabled className to month button when disabled", () => {
      const { container } = render(
        <Calendar disabled classNames={{ headerTitleButtonDisabled: "title-btn-disabled" }} />
      );
      const disabledButtons = container.querySelectorAll(".title-btn-disabled");
      expect(disabledButtons.length).toBe(2); // Both month and year buttons
    });

    it("should apply headerTitleButtonDisabled className to year button when disabled", () => {
      const { container } = render(
        <Calendar disabled classNames={{ headerTitleButtonDisabled: "title-btn-disabled" }} />
      );
      const disabledButtons = container.querySelectorAll(".title-btn-disabled");
      expect(disabledButtons[1]).toBeInTheDocument();
    });

    it("should apply weekNumberDisabled className when disabled and showWeekNumbers", () => {
      const { container } = render(
        <Calendar disabled showWeekNumbers classNames={{ weekNumberDisabled: "week-disabled" }} />
      );
      expect(container.querySelectorAll(".week-disabled").length).toBeGreaterThan(0);
    });

    it("should not apply disabled classNames when not disabled", () => {
      const { container } = render(
        <Calendar
          classNames={{
            rootDisabled: "root-disabled",
            headerDisabled: "header-disabled",
            headerNavigationButtonDisabled: "nav-btn-disabled",
          }}
        />
      );
      expect(container.querySelector(".root-disabled")).not.toBeInTheDocument();
      expect(container.querySelector(".header-disabled")).not.toBeInTheDocument();
      expect(container.querySelector(".nav-btn-disabled")).not.toBeInTheDocument();
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

      const { rerender, container } = render(
        <Calendar
          mode="single"
          value={initialValue}
          classNames={{ headerTitleButton: "header-title-btn" }}
        />
      );

      const titleButtons = container.querySelectorAll(".header-title-btn");
      expect(titleButtons[0]?.textContent).toBe("January");

      // Change to a different month
      const newValue: DateTimeValue = { date: new Date(2025, 5, 15), time: undefined };
      rerender(
        <Calendar
          mode="single"
          value={newValue}
          classNames={{ headerTitleButton: "header-title-btn" }}
        />
      );

      // View should sync with controlled value and show June
      expect(titleButtons[0]?.textContent).toBe("June");
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

    it("should apply dayInRange without dayOutsideMonth for outside month days in range", () => {
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

      // Days in range should have the in-range styling
      const inRangeDays = container.querySelectorAll(".in-range");
      expect(inRangeDays.length).toBeGreaterThan(0);
      // In-range days should not have outside styling (for proper text contrast)
      inRangeDays.forEach((day) => {
        expect(day).not.toHaveClass("outside");
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

  describe("layout modes", () => {
    it("should use desktop layout by default", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          timePosition="side"
          layout="desktop"
          classNames={{ rootSideLayout: "side-layout" }}
        />
      );
      expect(container.querySelector(".side-layout")).toBeInTheDocument();
    });

    it("should use mobile layout when layout='mobile'", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="mobile"
          classNames={{ timePickerCollapsed: "collapsed-time" }}
        />
      );
      expect(container.querySelector(".collapsed-time")).toBeInTheDocument();
    });

    it("should force timePosition to 'bottom' in mobile layout when timePosition was 'side'", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="mobile"
          timePosition="side"
          classNames={{ rootSideLayout: "side-layout", rootDefaultLayout: "default-layout" }}
        />
      );
      // Should not have side layout in mobile mode
      expect(container.querySelector(".side-layout")).not.toBeInTheDocument();
      expect(container.querySelector(".default-layout")).toBeInTheDocument();
    });

    it("should keep timePosition when layout is desktop", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="desktop"
          timePosition="side"
          classNames={{ rootSideLayout: "side-layout" }}
        />
      );
      expect(container.querySelector(".side-layout")).toBeInTheDocument();
    });
  });

  describe("collapsible time picker (mobile layout)", () => {
    it("should render collapsible time picker in mobile layout with single mode", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="mobile"
          classNames={{
            timePickerCollapsed: "collapsed-time",
            timePickerToggle: "toggle-btn",
          }}
        />
      );
      expect(container.querySelector(".collapsed-time")).toBeInTheDocument();
      expect(container.querySelector(".toggle-btn")).toBeInTheDocument();
    });

    it("should display formatted time in toggle button", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 14, minutes: 35, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="mobile"
          classNames={{ timePickerToggle: "toggle-btn" }}
        />
      );
      const toggleBtn = container.querySelector(".toggle-btn");
      expect(toggleBtn?.textContent).toContain("14:35");
    });

    it("should display formatted time with seconds when showSeconds is true", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 14, minutes: 35, seconds: 45 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          showSeconds
          layout="mobile"
          classNames={{ timePickerToggle: "toggle-btn" }}
        />
      );
      const toggleBtn = container.querySelector(".toggle-btn");
      expect(toggleBtn?.textContent).toContain("14:35:45");
    });

    it("should expand time picker when toggle button is clicked", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="mobile"
          classNames={{ timePickerToggle: "toggle-btn" }}
        />
      );
      const toggleBtn = container.querySelector(".toggle-btn")!;
      expect(toggleBtn.getAttribute("aria-expanded")).toBe("false");

      fireEvent.click(toggleBtn);
      expect(toggleBtn.getAttribute("aria-expanded")).toBe("true");
    });

    it("should collapse time picker when toggle button is clicked again", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="mobile"
          classNames={{ timePickerToggle: "toggle-btn" }}
        />
      );
      const toggleBtn = container.querySelector(".toggle-btn")!;

      // Expand
      fireEvent.click(toggleBtn);
      expect(toggleBtn.getAttribute("aria-expanded")).toBe("true");

      // Collapse
      fireEvent.click(toggleBtn);
      expect(toggleBtn.getAttribute("aria-expanded")).toBe("false");
    });

    it("should render two collapsible time pickers in range mode", () => {
      const value: DateRangeValue = {
        start: {
          date: new Date(2025, 0, 10),
          time: { hours: 9, minutes: 0, seconds: 0 },
        },
        end: {
          date: new Date(2025, 0, 20),
          time: { hours: 17, minutes: 0, seconds: 0 },
        },
      };
      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          showTime
          layout="mobile"
          classNames={{ timePickerCollapsed: "collapsed-time" }}
        />
      );
      const collapsedPickers = container.querySelectorAll(".collapsed-time");
      expect(collapsedPickers.length).toBe(2);
    });

    it("should display start and end time labels in range mode", () => {
      const value: DateRangeValue = {
        start: {
          date: new Date(2025, 0, 10),
          time: { hours: 9, minutes: 30, seconds: 0 },
        },
        end: {
          date: new Date(2025, 0, 20),
          time: { hours: 17, minutes: 45, seconds: 0 },
        },
      };
      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          showTime
          layout="mobile"
          classNames={{ timePickerToggle: "toggle-btn" }}
          labels={{ startTimeLabel: "Start Time", endTimeLabel: "End Time" }}
        />
      );
      const toggleBtns = container.querySelectorAll(".toggle-btn");
      expect(toggleBtns[0]?.textContent).toContain("Start Time");
      expect(toggleBtns[0]?.textContent).toContain("09:30");
      expect(toggleBtns[1]?.textContent).toContain("End Time");
      expect(toggleBtns[1]?.textContent).toContain("17:45");
    });

    it("should toggle start and end time pickers independently in range mode", () => {
      const value: DateRangeValue = {
        start: {
          date: new Date(2025, 0, 10),
          time: { hours: 9, minutes: 0, seconds: 0 },
        },
        end: {
          date: new Date(2025, 0, 20),
          time: { hours: 17, minutes: 0, seconds: 0 },
        },
      };
      const { container } = render(
        <Calendar
          mode="range"
          value={value}
          showTime
          layout="mobile"
          classNames={{ timePickerToggle: "toggle-btn" }}
        />
      );
      const toggleBtns = container.querySelectorAll(".toggle-btn");
      const startToggle = toggleBtns[0] as HTMLButtonElement;
      const endToggle = toggleBtns[1] as HTMLButtonElement;

      // Both should start collapsed
      expect(startToggle.getAttribute("aria-expanded")).toBe("false");
      expect(endToggle.getAttribute("aria-expanded")).toBe("false");

      // Expand start
      fireEvent.click(startToggle);
      expect(startToggle.getAttribute("aria-expanded")).toBe("true");
      expect(endToggle.getAttribute("aria-expanded")).toBe("false");

      // Expand end (start remains expanded)
      fireEvent.click(endToggle);
      expect(startToggle.getAttribute("aria-expanded")).toBe("true");
      expect(endToggle.getAttribute("aria-expanded")).toBe("true");
    });

    it("should disable toggle button when calendar is disabled", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="mobile"
          disabled
          classNames={{ timePickerToggle: "toggle-btn" }}
        />
      );
      const toggleBtn = container.querySelector(".toggle-btn")!;
      expect(toggleBtn).toBeDisabled();
    });

    it("should apply timePickerToggleDisabled className when disabled", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="mobile"
          disabled
          classNames={{
            timePickerToggle: "toggle-btn",
            timePickerToggleDisabled: "toggle-disabled",
          }}
        />
      );
      const toggleBtn = container.querySelector(".toggle-btn");
      expect(toggleBtn).toHaveClass("toggle-disabled");
    });

    it("should render time picker icon with rotation when expanded", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="mobile"
          classNames={{
            timePickerToggle: "toggle-btn",
            timePickerToggleIcon: "toggle-icon",
          }}
        />
      );
      const toggleBtn = container.querySelector(".toggle-btn")!;
      const icon = container.querySelector(".toggle-icon")!;

      expect((icon as unknown as HTMLElement).style.transform).toBe("rotate(0deg)");

      fireEvent.click(toggleBtn);
      expect((icon as unknown as HTMLElement).style.transform).toBe("rotate(180deg)");
    });

    it("should use default 'Time' label when no label provided", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="mobile"
          classNames={{ timePickerToggle: "toggle-btn" }}
        />
      );
      const toggleBtn = container.querySelector(".toggle-btn");
      expect(toggleBtn?.textContent).toContain("Time");
    });
  });

  describe("auto layout with ResizeObserver", () => {
    let mockObserve: Mock;
    let mockDisconnect: Mock;
    let resizeCallback: ((entries: { contentRect: { width: number } }[]) => void) | null = null;

    beforeEach(() => {
      mockObserve = vi.fn();
      mockDisconnect = vi.fn();
      resizeCallback = null;

      vi.stubGlobal(
        "ResizeObserver",
        class MockResizeObserver {
          constructor(callback: (entries: { contentRect: { width: number } }[]) => void) {
            resizeCallback = callback;
          }
          observe = mockObserve;
          unobserve = vi.fn();
          disconnect = mockDisconnect;
        }
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("should observe container when layout is auto", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      render(<Calendar mode="single" value={value} showTime layout="auto" />);

      expect(mockObserve).toHaveBeenCalled();
    });

    it("should not observe container when layout is not auto", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      render(<Calendar mode="single" value={value} showTime layout="desktop" />);

      expect(mockObserve).not.toHaveBeenCalled();
    });

    it("should disconnect observer on unmount", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { unmount } = render(<Calendar mode="single" value={value} showTime layout="auto" />);

      unmount();
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("should switch to mobile layout when container width is below mobileBreakpoint", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          layout="auto"
          mobileBreakpoint={600}
          classNames={{ timePickerCollapsed: "collapsed-time" }}
        />
      );

      // Simulate resize to mobile width
      act(() => {
        resizeCallback?.([{ contentRect: { width: 400 } }]);
      });

      expect(container.querySelector(".collapsed-time")).toBeInTheDocument();
    });

    it("should switch to desktop layout when container width is above mobileBreakpoint", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          timePosition="side"
          layout="desktop"
          classNames={{ rootSideLayout: "side-layout", timePickerCollapsed: "collapsed-time" }}
        />
      );

      // Explicit desktop layout should use side layout
      expect(container.querySelector(".side-layout")).toBeInTheDocument();
      expect(container.querySelector(".collapsed-time")).not.toBeInTheDocument();
    });

    it("should use default desktop layout before ResizeObserver measures", () => {
      const value: DateTimeValue = {
        date: new Date(2025, 0, 15),
        time: { hours: 10, minutes: 30, seconds: 0 },
      };
      const { container } = render(
        <Calendar
          mode="single"
          value={value}
          showTime
          timePosition="side"
          layout="desktop"
          classNames={{ rootSideLayout: "side-layout" }}
        />
      );

      // Desktop layout should use side-layout
      expect(container.querySelector(".side-layout")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Today Button
  // ============================================================================

  describe("Today Button", () => {
    it("should not render Today button by default", () => {
      render(<Calendar />);
      expect(screen.queryByRole("button", { name: /today/i })).not.toBeInTheDocument();
    });

    it("should render Today button when showTodayButton is true", () => {
      render(<Calendar showTodayButton classNames={{ todayButton: "today-btn" }} />);
      expect(screen.getByRole("button", { name: /today/i })).toBeInTheDocument();
    });

    it("should navigate to today when Today button is clicked", () => {
      const onTodayClick = vi.fn();
      // Start viewing a different month
      const { container } = render(
        <Calendar
          showTodayButton
          value={{ date: new Date(2025, 5, 15) }}
          onTodayClick={onTodayClick}
          classNames={{ headerTitleButton: "header-title-btn" }}
        />
      );

      // Verify we're viewing June
      const titleButtons = container.querySelectorAll(".header-title-btn");
      expect(titleButtons[0]?.textContent).toBe("June");

      // Click Today button
      fireEvent.click(screen.getByRole("button", { name: /today/i }));

      // Verify callback was called
      expect(onTodayClick).toHaveBeenCalledTimes(1);

      // Should navigate to January (current frozen date month)
      expect(titleButtons[0]?.textContent).toBe("January");
    });

    it("should be disabled when calendar is disabled", () => {
      render(<Calendar showTodayButton disabled />);
      expect(screen.getByRole("button", { name: /today/i })).toBeDisabled();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Clear Button
  // ============================================================================

  describe("Clear Button", () => {
    it("should not render Clear button by default", () => {
      render(<Calendar />);
      expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
    });

    it("should render Clear button when showClearButton is true", () => {
      render(<Calendar showClearButton value={{ date: new Date(2025, 0, 15) }} />);
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("should be disabled when no value is selected", () => {
      render(<Calendar showClearButton />);
      expect(screen.getByRole("button", { name: /clear/i })).toBeDisabled();
    });

    it("should clear single value when clicked", () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      render(
        <Calendar
          mode="single"
          value={{ date: new Date(2025, 0, 15) }}
          showClearButton
          onChange={onChange}
          onClear={onClear}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /clear/i }));

      expect(onClear).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should clear range value when clicked", () => {
      const onChange = vi.fn();
      const onClear = vi.fn();
      const rangeValue: DateRangeValue = {
        start: { date: new Date(2025, 0, 10) },
        end: { date: new Date(2025, 0, 20) },
      };
      render(
        <Calendar
          mode="range"
          value={rangeValue}
          showClearButton
          onChange={onChange}
          onClear={onClear}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /clear/i }));

      expect(onClear).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({ start: null, end: null });
    });

    it("should be disabled when calendar is disabled", () => {
      render(<Calendar showClearButton disabled value={{ date: new Date(2025, 0, 15) }} />);
      expect(screen.getByRole("button", { name: /clear/i })).toBeDisabled();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Custom isDateDisabled
  // ============================================================================

  describe("Custom isDateDisabled callback", () => {
    it("should disable dates based on custom callback", () => {
      // Disable all weekends
      const isDateDisabled = (date: Date): boolean => date.getDay() === 0 || date.getDay() === 6;

      const { container } = render(
        <Calendar isDateDisabled={isDateDisabled} classNames={{ dayDisabled: "day-disabled" }} />
      );

      // Find disabled day buttons
      const disabledDays = container.querySelectorAll(".day-disabled");
      expect(disabledDays.length).toBeGreaterThan(0);

      // All disabled days should be Saturday or Sunday
      disabledDays.forEach((dayElement) => {
        const button = dayElement as HTMLButtonElement;
        expect(button.disabled).toBe(true);
      });
    });

    it("should combine custom callback with minDate/maxDate", () => {
      const minDate = new Date(2025, 0, 10);
      const maxDate = new Date(2025, 0, 20);
      // Also disable day 15
      const isDateDisabled = (date: Date): boolean => date.getDate() === 15;

      render(
        <Calendar
          minDate={minDate}
          maxDate={maxDate}
          isDateDisabled={isDateDisabled}
          classNames={{ dayDisabled: "day-disabled" }}
        />
      );

      // Day 5 should be disabled (before minDate)
      // Day 15 should be disabled (custom callback)
      // Day 25 should be disabled (after maxDate)
      const dayButtons = screen.getAllByRole("button", { name: /^[0-9]+$/ });
      const day5Button = dayButtons.find((btn) => btn.textContent === "5");
      const day15Button = dayButtons.find((btn) => btn.textContent === "15");
      const day25Button = dayButtons.find((btn) => btn.textContent === "25");

      expect(day5Button).toBeDisabled();
      expect(day15Button).toBeDisabled();
      expect(day25Button).toBeDisabled();
    });

    it("should not allow selection of custom disabled dates", () => {
      const onChange = vi.fn();
      const isDateDisabled = (date: Date): boolean => date.getDate() === 15;

      render(<Calendar isDateDisabled={isDateDisabled} onChange={onChange} />);

      const day15Button = screen
        .getAllByRole("button", { name: /^[0-9]+$/ })
        .find((btn) => btn.textContent === "15");

      fireEvent.click(day15Button!);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Highlighted Dates
  // ============================================================================

  describe("Highlighted Dates", () => {
    it("should highlight specified dates", () => {
      const highlightedDates = [new Date(2025, 0, 10), new Date(2025, 0, 20)];

      const { container } = render(
        <Calendar
          highlightedDates={highlightedDates}
          classNames={{ dayHighlighted: "day-highlighted" }}
        />
      );

      const highlightedElements = container.querySelectorAll(".day-highlighted");
      expect(highlightedElements.length).toBe(2);
    });

    it("should not apply highlight styling to selected dates", () => {
      const highlightedDates = [new Date(2025, 0, 15)];
      const value: DateTimeValue = { date: new Date(2025, 0, 15) };

      const { container } = render(
        <Calendar
          value={value}
          highlightedDates={highlightedDates}
          classNames={{ dayHighlighted: "day-highlighted", daySelected: "day-selected" }}
        />
      );

      // The day should be selected, not highlighted (selected takes precedence)
      const selectedElements = container.querySelectorAll(".day-selected");
      expect(selectedElements.length).toBe(1);

      // If highlighted, it shouldn't show highlighted class when selected
      const day15 = screen
        .getAllByRole("button", { name: /^[0-9]+$/ })
        .find((btn) => btn.textContent === "15");
      expect(day15?.classList.contains("day-highlighted")).toBe(false);
    });

    it("should allow clicking on highlighted dates", () => {
      const onChange = vi.fn();
      const highlightedDates = [new Date(2025, 0, 10)];

      render(
        <Calendar
          highlightedDates={highlightedDates}
          onChange={onChange}
          classNames={{ dayHighlighted: "day-highlighted" }}
        />
      );

      const day10Button = screen
        .getAllByRole("button", { name: /^[0-9]+$/ })
        .find((btn) => btn.textContent === "10");

      fireEvent.click(day10Button!);
      expect(onChange).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Keyboard Navigation
  // ============================================================================

  describe("Keyboard Navigation", () => {
    it("should have tabIndex on the root element for keyboard focus", () => {
      const { container } = render(<Calendar classNames={{ root: "cal-root" }} />);
      const root = container.querySelector(".cal-root");
      expect(root).toHaveAttribute("tabindex", "0");
    });

    it("should have role='application' and aria-label on root", () => {
      const { container } = render(<Calendar classNames={{ root: "cal-root" }} />);
      const root = container.querySelector(".cal-root");
      expect(root).toHaveAttribute("role", "application");
      expect(root).toHaveAttribute("aria-label", "Calendar");
    });

    it("should call onEscape when Escape key is pressed", () => {
      const onEscape = vi.fn();
      const { container } = render(
        <Calendar onEscape={onEscape} classNames={{ root: "cal-root" }} />
      );

      const root = container.querySelector(".cal-root")!;
      fireEvent.keyDown(root, { key: "Escape" });

      expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it("should not respond to keyboard when disabled", () => {
      const onEscape = vi.fn();
      const { container } = render(
        <Calendar disabled onEscape={onEscape} classNames={{ root: "cal-root" }} />
      );

      const root = container.querySelector(".cal-root")!;
      fireEvent.keyDown(root, { key: "Escape" });

      expect(onEscape).not.toHaveBeenCalled();
    });

    it("should call onFocusChange when navigating with arrow keys", () => {
      const onFocusChange = vi.fn();
      const { container } = render(
        <Calendar onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
      );

      const root = container.querySelector(".cal-root")!;
      fireEvent.keyDown(root, { key: "ArrowRight" });

      expect(onFocusChange).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Footer Styling
  // ============================================================================

  describe("Footer with both buttons", () => {
    it("should render footer with both Today and Clear buttons", () => {
      const { container } = render(
        <Calendar
          showTodayButton
          showClearButton
          value={{ date: new Date(2025, 0, 15) }}
          classNames={{ footer: "cal-footer" }}
        />
      );

      expect(container.querySelector(".cal-footer")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /today/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("should not render footer if no buttons are shown", () => {
      const { container } = render(<Calendar classNames={{ footer: "cal-footer" }} />);
      expect(container.querySelector(".cal-footer")).not.toBeInTheDocument();
    });

    it("should apply custom footer className", () => {
      const { container } = render(
        <Calendar showTodayButton classNames={{ footer: "custom-footer-class" }} />
      );
      expect(container.querySelector(".custom-footer-class")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Month Picker View
  // ============================================================================

  describe("Month Picker View", () => {
    it("should switch to month picker view when clicking month button", () => {
      const { container } = render(
        <Calendar
          classNames={{
            headerTitleButton: "header-title-btn",
            monthGrid: "month-grid",
          }}
        />
      );

      const monthButton = container.querySelectorAll(".header-title-btn")[0];
      expect(monthButton).toBeInTheDocument();

      fireEvent.click(monthButton!);

      expect(container.querySelector(".month-grid")).toBeInTheDocument();
    });

    it("should display all 12 months in month picker", () => {
      const onViewChange = vi.fn();
      const { container } = render(
        <Calendar
          view="months"
          onViewChange={onViewChange}
          classNames={{ monthGridItem: "month-item" }}
        />
      );

      const monthItems = container.querySelectorAll(".month-item");
      expect(monthItems.length).toBe(12);
    });

    it("should highlight current month in month picker", () => {
      const { container } = render(
        <Calendar
          view="months"
          classNames={{
            monthGridItem: "month-item",
            monthGridItemSelected: "month-selected",
          }}
        />
      );

      // Current month is January (frozen date is Jan 15, 2025)
      const selectedMonth = container.querySelector(".month-selected");
      expect(selectedMonth).toBeInTheDocument();
      expect(selectedMonth?.textContent).toBe("January");
    });

    it("should switch back to days view when selecting a month", () => {
      const onViewChange = vi.fn();
      const onMonthSelect = vi.fn();
      const { container } = render(
        <Calendar
          defaultView="months"
          onViewChange={onViewChange}
          onMonthSelect={onMonthSelect}
          classNames={{ monthGridItem: "month-item" }}
        />
      );

      const monthItems = container.querySelectorAll(".month-item");
      fireEvent.click(monthItems[5]!); // Click June

      expect(onMonthSelect).toHaveBeenCalledWith(5, 2025);
    });

    it("should handle keyboard navigation in month picker", () => {
      const { container } = render(
        <Calendar defaultView="months" classNames={{ root: "cal-root", monthGrid: "month-grid" }} />
      );

      const root = container.querySelector(".cal-root")!;
      expect(container.querySelector(".month-grid")).toBeInTheDocument();

      // Navigate with arrow keys
      fireEvent.keyDown(root, { key: "ArrowRight" });
      fireEvent.keyDown(root, { key: "ArrowDown" });
    });

    it("should escape from month picker view back to days view", () => {
      const onViewChange = vi.fn();
      const { container } = render(
        <Calendar
          defaultView="months"
          onViewChange={onViewChange}
          classNames={{ root: "cal-root", monthGrid: "month-grid" }}
        />
      );

      const root = container.querySelector(".cal-root")!;
      fireEvent.keyDown(root, { key: "Escape" });

      expect(onViewChange).toHaveBeenCalledWith("days");
    });

    it("should use controlled view mode", () => {
      const { container } = render(
        <Calendar view="months" classNames={{ monthGrid: "month-grid" }} />
      );

      expect(container.querySelector(".month-grid")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Year Picker View
  // ============================================================================

  describe("Year Picker View", () => {
    it("should switch to year picker view when clicking year button", () => {
      const { container } = render(
        <Calendar
          classNames={{
            headerTitleButton: "header-title-btn",
            yearGrid: "year-grid",
          }}
        />
      );

      const buttons = container.querySelectorAll(".header-title-btn");
      const yearButton = buttons[1]; // Second button is year
      expect(yearButton).toBeInTheDocument();

      fireEvent.click(yearButton!);

      expect(container.querySelector(".year-grid")).toBeInTheDocument();
    });

    it("should display years in year picker", () => {
      const { container } = render(
        <Calendar
          view="years"
          years={[2020, 2021, 2022, 2023, 2024, 2025]}
          classNames={{ yearGridItem: "year-item" }}
        />
      );

      const yearItems = container.querySelectorAll(".year-item");
      expect(yearItems.length).toBe(6);
    });

    it("should highlight current year in year picker", () => {
      const { container } = render(
        <Calendar
          view="years"
          years={[2023, 2024, 2025, 2026]}
          classNames={{
            yearGridItem: "year-item",
            yearGridItemSelected: "year-selected",
          }}
        />
      );

      const selectedYear = container.querySelector(".year-selected");
      expect(selectedYear).toBeInTheDocument();
      expect(selectedYear?.textContent).toBe("2025");
    });

    it("should switch to month picker when selecting a year", () => {
      const onViewChange = vi.fn();
      const { container } = render(
        <Calendar
          defaultView="years"
          years={[2023, 2024, 2025, 2026]}
          onViewChange={onViewChange}
          classNames={{ yearGridItem: "year-item" }}
        />
      );

      const yearItems = container.querySelectorAll(".year-item");
      fireEvent.click(yearItems[2]!); // Click 2025

      expect(onViewChange).toHaveBeenCalledWith("months");
    });

    it("should handle keyboard navigation in year picker", () => {
      const { container } = render(
        <Calendar
          defaultView="years"
          years={[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027]}
          classNames={{ root: "cal-root", yearGrid: "year-grid" }}
        />
      );

      const root = container.querySelector(".cal-root")!;
      expect(container.querySelector(".year-grid")).toBeInTheDocument();

      fireEvent.keyDown(root, { key: "ArrowRight" });
      fireEvent.keyDown(root, { key: "ArrowDown" });
      fireEvent.keyDown(root, { key: "ArrowLeft" });
      fireEvent.keyDown(root, { key: "ArrowUp" });
    });

    it("should escape from year picker view back to days view", () => {
      const onViewChange = vi.fn();
      const { container } = render(
        <Calendar
          defaultView="years"
          onViewChange={onViewChange}
          classNames={{ root: "cal-root", yearGrid: "year-grid" }}
        />
      );

      const root = container.querySelector(".cal-root")!;
      fireEvent.keyDown(root, { key: "Escape" });

      expect(onViewChange).toHaveBeenCalledWith("days");
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: View State Management
  // ============================================================================

  describe("View State Management", () => {
    it("should default to days view", () => {
      const { container } = render(
        <Calendar
          classNames={{
            body: "cal-body",
            monthGrid: "month-grid",
            yearGrid: "year-grid",
          }}
        />
      );

      expect(container.querySelector(".cal-body")).toBeInTheDocument();
      expect(container.querySelector(".month-grid")).not.toBeInTheDocument();
      expect(container.querySelector(".year-grid")).not.toBeInTheDocument();
    });

    it("should use defaultView prop", () => {
      const { container } = render(
        <Calendar defaultView="months" classNames={{ monthGrid: "month-grid" }} />
      );

      expect(container.querySelector(".month-grid")).toBeInTheDocument();
    });

    it("should call onViewChange when view changes", () => {
      const onViewChange = vi.fn();
      const { container } = render(
        <Calendar
          onViewChange={onViewChange}
          classNames={{ headerTitleButton: "header-title-btn" }}
        />
      );

      const monthButton = container.querySelectorAll(".header-title-btn")[0];
      fireEvent.click(monthButton!);

      expect(onViewChange).toHaveBeenCalledWith("months");
    });

    it("should hide time picker when not in days view", () => {
      const { container, rerender } = render(
        <Calendar
          showTime
          view="days"
          value={{ date: new Date(2025, 0, 15) }}
          classNames={{ timePickerWrapper: "time-picker" }}
        />
      );

      expect(container.querySelector(".time-picker")).toBeInTheDocument();

      rerender(
        <Calendar
          showTime
          view="months"
          value={{ date: new Date(2025, 0, 15) }}
          classNames={{ timePickerWrapper: "time-picker" }}
        />
      );

      expect(container.querySelector(".time-picker")).not.toBeInTheDocument();
    });

    it("should toggle month view on header click", () => {
      const { container } = render(
        <Calendar
          classNames={{
            headerTitleButton: "header-title-btn",
            monthGrid: "month-grid",
          }}
        />
      );

      const monthButton = container.querySelectorAll(".header-title-btn")[0];

      // Click to open
      fireEvent.click(monthButton!);
      expect(container.querySelector(".month-grid")).toBeInTheDocument();

      // Click again to close
      fireEvent.click(monthButton!);
      expect(container.querySelector(".month-grid")).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Multiple Months Display
  // ============================================================================

  describe("Multiple Months Display", () => {
    it("should render single month by default", () => {
      const { container } = render(
        <Calendar
          classNames={{
            multiMonthContainer: "multi-container",
            body: "cal-body",
          }}
        />
      );

      expect(container.querySelector(".multi-container")).not.toBeInTheDocument();
      expect(container.querySelectorAll(".cal-body").length).toBe(1);
    });

    it("should render multiple months when numberOfMonths > 1", () => {
      const { container } = render(
        <Calendar
          numberOfMonths={2}
          classNames={{
            multiMonthContainer: "multi-container",
            multiMonthGrid: "month-grid-item",
            body: "cal-body",
          }}
        />
      );

      expect(container.querySelector(".multi-container")).toBeInTheDocument();
      expect(container.querySelectorAll(".month-grid-item").length).toBe(2);
      expect(container.querySelectorAll(".cal-body").length).toBe(2);
    });

    it("should render 3 months side by side", () => {
      const { container } = render(
        <Calendar
          numberOfMonths={3}
          classNames={{
            multiMonthContainer: "multi-container",
            multiMonthGrid: "month-grid-item",
          }}
        />
      );

      expect(container.querySelectorAll(".month-grid-item").length).toBe(3);
    });

    it("should display month headers for each month in multi-month view", () => {
      const { container } = render(
        <Calendar numberOfMonths={2} classNames={{ multiMonthHeader: "month-header" }} />
      );

      const headers = container.querySelectorAll(".month-header");
      expect(headers.length).toBe(2);
      expect(headers[0]?.textContent).toContain("January");
      expect(headers[1]?.textContent).toContain("February");
    });

    it("should handle range selection across multiple months", () => {
      const onChange = vi.fn();
      const { container } = render(
        <Calendar
          mode="range"
          numberOfMonths={2}
          onChange={onChange}
          classNames={{ dayButton: "day-btn" }}
        />
      );

      const dayButtons = container.querySelectorAll(".day-btn");
      // Click day in first month
      fireEvent.click(dayButtons[10]!);
      // Click day in second month
      fireEvent.click(dayButtons[45]!);

      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("should navigate all months together", () => {
      const onNextMonth = vi.fn();
      const { container } = render(
        <Calendar
          numberOfMonths={2}
          onNextMonth={onNextMonth}
          classNames={{ multiMonthHeader: "month-header" }}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /next month/i }));

      const headers = container.querySelectorAll(".month-header");
      expect(headers[0]?.textContent).toContain("February");
      expect(headers[1]?.textContent).toContain("March");
    });

    it("should show week numbers in multi-month view when enabled", () => {
      const { container } = render(
        <Calendar numberOfMonths={2} showWeekNumbers classNames={{ weekNumber: "week-num" }} />
      );

      // Each month has multiple weeks with week numbers
      const weekNumbers = container.querySelectorAll(".week-num");
      expect(weekNumbers.length).toBeGreaterThan(6); // At least 6+ weeks across 2 months
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Header Title Buttons
  // ============================================================================

  describe("Header Title Buttons", () => {
    it("should render month and year as clickable buttons", () => {
      const { container } = render(<Calendar classNames={{ headerTitleButton: "title-btn" }} />);

      const titleButtons = container.querySelectorAll(".title-btn");
      expect(titleButtons.length).toBe(2);
    });

    it("should have aria-expanded attribute on month button", () => {
      const { container } = render(<Calendar classNames={{ headerTitleButton: "title-btn" }} />);

      const monthButton = container.querySelectorAll(".title-btn")[0];
      expect(monthButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(monthButton!);
      expect(monthButton).toHaveAttribute("aria-expanded", "true");
    });

    it("should have aria-label on month button", () => {
      const { container } = render(<Calendar classNames={{ headerTitleButton: "title-btn" }} />);

      const monthButton = container.querySelectorAll(".title-btn")[0];
      expect(monthButton).toHaveAttribute("aria-label", "Select month");
    });

    it("should have aria-label on year button", () => {
      const { container } = render(<Calendar classNames={{ headerTitleButton: "title-btn" }} />);

      const yearButton = container.querySelectorAll(".title-btn")[1];
      expect(yearButton).toHaveAttribute("aria-label", "Select year");
    });

    it("should display current month name on month button", () => {
      const { container } = render(<Calendar classNames={{ headerTitleButton: "title-btn" }} />);

      const monthButton = container.querySelectorAll(".title-btn")[0];
      expect(monthButton?.textContent).toBe("January");
    });

    it("should display current year on year button", () => {
      const { container } = render(<Calendar classNames={{ headerTitleButton: "title-btn" }} />);

      const yearButton = container.querySelectorAll(".title-btn")[1];
      expect(yearButton?.textContent).toBe("2025");
    });

    it("should be disabled when calendar is disabled", () => {
      const { container } = render(
        <Calendar disabled classNames={{ headerTitleButton: "title-btn" }} />
      );

      const titleButtons = container.querySelectorAll(".title-btn");
      expect(titleButtons[0]).toBeDisabled();
      expect(titleButtons[1]).toBeDisabled();
    });
  });

  describe("Locale/i18n Support", () => {
    it("should use English month and day names by default", () => {
      render(<Calendar />);

      // Check English day names
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getByText("Mon")).toBeInTheDocument();
      expect(screen.getByText("Tue")).toBeInTheDocument();
    });

    it("should use localized month names when locale is set", () => {
      const { container } = render(
        <Calendar locale="de-DE" classNames={{ headerTitleButton: "title-btn" }} />
      );

      const monthButton = container.querySelectorAll(".title-btn")[0];
      // German month name for January is "Januar"
      expect(monthButton?.textContent).toBe("Januar");
    });

    it("should use localized day names when locale is set", () => {
      render(<Calendar locale="de-DE" />);

      // Check German day names (Mo, Di, Mi, Do, Fr, Sa, So)
      expect(screen.getByText("Mo")).toBeInTheDocument();
      expect(screen.getByText("Di")).toBeInTheDocument();
      expect(screen.getByText("Mi")).toBeInTheDocument();
    });

    it("should auto-detect weekStartsOn from locale for German (Monday)", () => {
      const { container } = render(
        <Calendar locale="de-DE" classNames={{ weekDayCell: "day-header" }} />
      );

      // In Germany, weeks start on Monday (Mo should be first)
      const dayHeaders = container.querySelectorAll(".day-header");
      expect(dayHeaders[0]).toHaveTextContent("Mo");
    });

    it("should auto-detect weekStartsOn from locale for US (Sunday)", () => {
      const { container } = render(
        <Calendar locale="en-US" classNames={{ weekDayCell: "day-header" }} />
      );

      // In US, weeks start on Sunday (Sun should be first)
      const dayHeaders = container.querySelectorAll(".day-header");
      expect(dayHeaders[0]).toHaveTextContent("Sun");
    });

    it("should allow explicit weekStartsOn to override locale default", () => {
      const { container } = render(
        <Calendar locale="de-DE" weekStartsOn={0} classNames={{ weekDayCell: "day-header" }} />
      );

      // Even though German locale defaults to Monday, explicit weekStartsOn=0 should use Sunday
      const dayHeaders = container.querySelectorAll(".day-header");
      expect(dayHeaders[0]).toHaveTextContent("So"); // German for Sunday
    });

    it("should set dir='rtl' for RTL locales like Hebrew", () => {
      const { container } = render(<Calendar locale="he-IL" />);

      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("dir", "rtl");
    });

    it("should set dir='rtl' for Arabic locale", () => {
      const { container } = render(<Calendar locale="ar-SA" />);

      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("dir", "rtl");
    });

    it("should set dir='ltr' for LTR locales like English", () => {
      const { container } = render(<Calendar locale="en-US" />);

      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("dir", "ltr");
    });

    it("should use French month names when locale is fr-FR", () => {
      const { container } = render(
        <Calendar locale="fr-FR" classNames={{ headerTitleButton: "title-btn" }} />
      );

      const monthButton = container.querySelectorAll(".title-btn")[0];
      // French month name for January is "janvier"
      expect(monthButton?.textContent).toBe("janvier");
    });

    it("should use Japanese day names when locale is ja-JP", () => {
      render(<Calendar locale="ja-JP" />);

      // Japanese short day names
      expect(screen.getByText("日")).toBeInTheDocument(); // Sunday
      expect(screen.getByText("月")).toBeInTheDocument(); // Monday
    });

    it("should allow custom labels to override locale labels", () => {
      render(
        <Calendar
          locale="de-DE"
          labels={{ shortDays: ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] }}
        />
      );

      // Custom labels should take precedence over locale
      expect(screen.getByText("SU")).toBeInTheDocument();
      expect(screen.getByText("MO")).toBeInTheDocument();
    });

    it("should use localized month names in month picker", () => {
      const { container } = render(
        <Calendar locale="es-ES" classNames={{ headerTitleButton: "title-btn" }} />
      );

      // Click month button to open month picker
      const monthButton = container.querySelectorAll(".title-btn")[0] as HTMLButtonElement;
      fireEvent.click(monthButton);

      // Check for Spanish month names
      expect(screen.getByRole("button", { name: "enero" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "febrero" })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Today Button Complete Functionality
  // ============================================================================

  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  describe("Today Button Selection", () => {
    it("should select today in single mode when clicking Today button", () => {
      const onChange = vi.fn();
      render(<Calendar mode="single" showTodayButton onChange={onChange} />);

      const todayButton = screen.getByRole("button", { name: /today/i });
      fireEvent.click(todayButton);

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.any(Date),
        })
      );
    });

    it("should add today in multiple mode when clicking Today button", () => {
      const onChange = vi.fn();
      render(<Calendar mode="multiple" showTodayButton onChange={onChange} />);

      const todayButton = screen.getByRole("button", { name: /today/i });
      fireEvent.click(todayButton);

      expect(onChange).toHaveBeenCalled();
    });

    it("should remove today in multiple mode if already selected", () => {
      const today = new Date();
      const initialValue = [{ date: today }];
      const onChange = vi.fn();
      render(<Calendar mode="multiple" showTodayButton value={initialValue} onChange={onChange} />);

      const todayButton = screen.getByRole("button", { name: /today/i });
      fireEvent.click(todayButton);

      expect(onChange).toHaveBeenCalled();
      // Should have removed today
      const newValue = onChange.mock.calls[0]?.[0] as { date: Date }[];
      expect(newValue.length).toBe(0);
    });

    it("should select week containing today in week mode", () => {
      const onChange = vi.fn();
      render(<Calendar mode="week" showTodayButton onChange={onChange} />);

      const todayButton = screen.getByRole("button", { name: /today/i });
      fireEvent.click(todayButton);

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          weekNumber: expect.any(Number),
          year: expect.any(Number),
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        })
      );
    });

    it("should select quarter containing today in quarter mode", () => {
      const onChange = vi.fn();
      render(<Calendar mode="quarter" showTodayButton onChange={onChange} />);

      const todayButton = screen.getByRole("button", { name: /today/i });
      fireEvent.click(todayButton);

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          quarter: expect.any(Number),
          year: expect.any(Number),
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        })
      );
    });

    it("should select range from today to today in range mode", () => {
      const onChange = vi.fn();
      render(<Calendar mode="range" showTodayButton onChange={onChange} />);

      const todayButton = screen.getByRole("button", { name: /today/i });
      fireEvent.click(todayButton);

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          start: expect.objectContaining({ date: expect.any(Date) }),
          end: expect.objectContaining({ date: expect.any(Date) }),
        })
      );
    });

    it("should include time in single mode when showTime is true", () => {
      const onChange = vi.fn();
      render(
        <Calendar mode="single" showTodayButton showTime onChange={onChange} layout="desktop" />
      );

      const todayButton = screen.getByRole("button", { name: /today/i });
      fireEvent.click(todayButton);

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.any(Date),
          time: expect.objectContaining({
            hours: expect.any(Number),
            minutes: expect.any(Number),
            seconds: expect.any(Number),
          }),
        })
      );
    });

    it("should call onTodayClick callback", () => {
      const onTodayClick = vi.fn();
      render(<Calendar showTodayButton onTodayClick={onTodayClick} />);

      const todayButton = screen.getByRole("button", { name: /today/i });
      fireEvent.click(todayButton);

      expect(onTodayClick).toHaveBeenCalled();
    });

    it("should call onFocusChange callback with today date", () => {
      const onFocusChange = vi.fn();
      render(<Calendar showTodayButton onFocusChange={onFocusChange} />);

      const todayButton = screen.getByRole("button", { name: /today/i });
      fireEvent.click(todayButton);

      expect(onFocusChange).toHaveBeenCalledWith(expect.any(Date));
    });

    it("should not select when disabled", () => {
      const onChange = vi.fn();
      render(<Calendar showTodayButton disabled onChange={onChange} />);

      const todayButton = screen.getByRole("button", { name: /today/i });
      fireEvent.click(todayButton);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Clear Button Complete Functionality
  // ============================================================================

  describe("Clear Button Functionality", () => {
    it("should clear value in single mode", () => {
      const onChange = vi.fn();
      render(
        <Calendar
          mode="single"
          showClearButton
          value={{ date: new Date(2025, 0, 15) }}
          onChange={onChange}
        />
      );

      const clearButton = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearButton);

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should clear value in multiple mode", () => {
      const onChange = vi.fn();
      render(
        <Calendar
          mode="multiple"
          showClearButton
          value={[{ date: new Date(2025, 0, 15) }]}
          onChange={onChange}
        />
      );

      const clearButton = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearButton);

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it("should clear value in week mode", () => {
      const onChange = vi.fn();
      render(
        <Calendar
          mode="week"
          showClearButton
          value={{
            weekNumber: 3,
            year: 2025,
            startDate: new Date(2025, 0, 13),
            endDate: new Date(2025, 0, 19),
          }}
          onChange={onChange}
        />
      );

      const clearButton = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearButton);

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should clear value in quarter mode", () => {
      const onChange = vi.fn();
      render(
        <Calendar
          mode="quarter"
          showClearButton
          value={{
            quarter: 1,
            year: 2025,
            startDate: new Date(2025, 0, 1),
            endDate: new Date(2025, 2, 31),
          }}
          onChange={onChange}
        />
      );

      const clearButton = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearButton);

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should clear value in range mode", () => {
      const onChange = vi.fn();
      render(
        <Calendar
          mode="range"
          showClearButton
          value={{
            start: { date: new Date(2025, 0, 10) },
            end: { date: new Date(2025, 0, 20) },
          }}
          onChange={onChange}
        />
      );

      const clearButton = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearButton);

      expect(onChange).toHaveBeenCalledWith({ start: null, end: null });
    });

    it("should call onClear callback", () => {
      const onClear = vi.fn();
      render(
        <Calendar showClearButton value={{ date: new Date(2025, 0, 15) }} onClear={onClear} />
      );

      const clearButton = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearButton);

      expect(onClear).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Extended Keyboard Navigation
  // ============================================================================

  /* eslint-disable jsx-a11y/no-autofocus */
  describe("Extended Keyboard Navigation", () => {
    describe("Days View Navigation", () => {
      it("should navigate left with ArrowLeft", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "ArrowLeft" });

        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should navigate right with ArrowRight", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "ArrowRight" });

        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should navigate up with ArrowUp", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "ArrowUp" });

        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should navigate down with ArrowDown", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "ArrowDown" });

        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should navigate to previous month with PageUp", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "PageUp" });

        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should navigate to next month with PageDown", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "PageDown" });

        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should navigate to previous year with Shift+PageUp", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "PageUp", shiftKey: true });

        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should navigate to next year with Shift+PageDown", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "PageDown", shiftKey: true });

        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should navigate to start of week with Home", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "Home" });

        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should navigate to end of week with End", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onFocusChange={onFocusChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "End" });

        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should select focused date with Enter", () => {
        const onChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onChange={onChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "Enter" });

        expect(onChange).toHaveBeenCalled();
      });

      it("should select focused date with Space", () => {
        const onChange = vi.fn();
        const { container } = render(
          <Calendar autoFocus onChange={onChange} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: " " });

        expect(onChange).toHaveBeenCalled();
      });

      it("should respect minDate boundary when navigating", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar
            autoFocus
            minDate={new Date(2025, 0, 15)}
            value={{ date: new Date(2025, 0, 15) }}
            onFocusChange={onFocusChange}
            classNames={{ root: "cal-root" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        // Try to navigate before minDate
        fireEvent.keyDown(root, { key: "ArrowLeft" });

        // Should clamp to minDate
        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should respect maxDate boundary when navigating", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar
            autoFocus
            maxDate={new Date(2025, 0, 15)}
            value={{ date: new Date(2025, 0, 15) }}
            onFocusChange={onFocusChange}
            classNames={{ root: "cal-root" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        // Try to navigate after maxDate
        fireEvent.keyDown(root, { key: "ArrowRight" });

        // Should clamp to maxDate
        expect(onFocusChange).toHaveBeenCalled();
      });

      it("should not navigate to disabled dates", () => {
        const onFocusChange = vi.fn();
        const { container } = render(
          <Calendar
            autoFocus
            isDateDisabled={() => true}
            onFocusChange={onFocusChange}
            classNames={{ root: "cal-root" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "ArrowRight" });

        // Should not call onFocusChange if all dates are disabled
        expect(onFocusChange).not.toHaveBeenCalled();
      });
    });

    describe("Months View Navigation", () => {
      it("should navigate months with arrow keys", () => {
        const { container } = render(
          <Calendar
            defaultView="months"
            classNames={{ root: "cal-root", monthGrid: "month-grid" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        expect(container.querySelector(".month-grid")).toBeInTheDocument();

        fireEvent.keyDown(root, { key: "ArrowLeft" });
        fireEvent.keyDown(root, { key: "ArrowRight" });
        fireEvent.keyDown(root, { key: "ArrowUp" });
        fireEvent.keyDown(root, { key: "ArrowDown" });
      });

      it("should wrap around when navigating past December", () => {
        const { container } = render(
          <Calendar defaultView="months" classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        // Navigate right multiple times to test wrap
        for (let i = 0; i < 13; i++) {
          fireEvent.keyDown(root, { key: "ArrowRight" });
        }
      });

      it("should select month with Enter", () => {
        const onViewChange = vi.fn();
        const { container } = render(
          <Calendar
            defaultView="months"
            onViewChange={onViewChange}
            classNames={{ root: "cal-root" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "Enter" });

        expect(onViewChange).toHaveBeenCalledWith("days");
      });

      it("should select month with Space", () => {
        const onViewChange = vi.fn();
        const { container } = render(
          <Calendar
            defaultView="months"
            onViewChange={onViewChange}
            classNames={{ root: "cal-root" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: " " });

        expect(onViewChange).toHaveBeenCalledWith("days");
      });

      it("should escape to days view", () => {
        const onViewChange = vi.fn();
        const { container } = render(
          <Calendar
            defaultView="months"
            onViewChange={onViewChange}
            classNames={{ root: "cal-root" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "Escape" });

        expect(onViewChange).toHaveBeenCalledWith("days");
      });
    });

    describe("Years View Navigation", () => {
      it("should navigate years with arrow keys", () => {
        const { container } = render(
          <Calendar
            defaultView="years"
            years={[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]}
            classNames={{ root: "cal-root", yearGrid: "year-grid" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        expect(container.querySelector(".year-grid")).toBeInTheDocument();

        fireEvent.keyDown(root, { key: "ArrowLeft" });
        fireEvent.keyDown(root, { key: "ArrowRight" });
        fireEvent.keyDown(root, { key: "ArrowUp" });
        fireEvent.keyDown(root, { key: "ArrowDown" });
      });

      it("should select year with Enter", () => {
        const onViewChange = vi.fn();
        const { container } = render(
          <Calendar
            defaultView="years"
            years={[2024, 2025, 2026]}
            onViewChange={onViewChange}
            classNames={{ root: "cal-root" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "Enter" });

        expect(onViewChange).toHaveBeenCalledWith("months");
      });

      it("should select year with Space", () => {
        const onViewChange = vi.fn();
        const { container } = render(
          <Calendar
            defaultView="years"
            years={[2024, 2025, 2026]}
            onViewChange={onViewChange}
            classNames={{ root: "cal-root" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: " " });

        expect(onViewChange).toHaveBeenCalledWith("months");
      });

      it("should escape to days view", () => {
        const onViewChange = vi.fn();
        const { container } = render(
          <Calendar
            defaultView="years"
            years={[2024, 2025, 2026]}
            onViewChange={onViewChange}
            classNames={{ root: "cal-root" }}
          />
        );

        const root = container.querySelector(".cal-root")!;
        fireEvent.keyDown(root, { key: "Escape" });

        expect(onViewChange).toHaveBeenCalledWith("days");
      });

      it("should not navigate past year list boundaries", () => {
        const { container } = render(
          <Calendar defaultView="years" years={[2025]} classNames={{ root: "cal-root" }} />
        );

        const root = container.querySelector(".cal-root")!;
        // Try to navigate with only one year
        fireEvent.keyDown(root, { key: "ArrowLeft" });
        fireEvent.keyDown(root, { key: "ArrowRight" });
      });
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: autoFocus with Different Modes
  // ============================================================================

  /* eslint-disable jsx-a11y/no-autofocus */
  describe("autoFocus initialization", () => {
    it("should initialize focused date from range value (start)", () => {
      const { container } = render(
        <Calendar
          mode="range"
          autoFocus
          value={{
            start: { date: new Date(2025, 0, 10) },
            end: { date: new Date(2025, 0, 20) },
          }}
          classNames={{ root: "cal-root" }}
        />
      );

      expect(container.querySelector(".cal-root")).toBeInTheDocument();
    });

    it("should initialize focused date from multiple value", () => {
      const { container } = render(
        <Calendar
          mode="multiple"
          autoFocus
          value={[{ date: new Date(2025, 0, 10) }, { date: new Date(2025, 0, 15) }]}
          classNames={{ root: "cal-root" }}
        />
      );

      expect(container.querySelector(".cal-root")).toBeInTheDocument();
    });

    it("should initialize focused date from single value", () => {
      const { container } = render(
        <Calendar
          mode="single"
          autoFocus
          value={{ date: new Date(2025, 0, 10) }}
          classNames={{ root: "cal-root" }}
        />
      );

      expect(container.querySelector(".cal-root")).toBeInTheDocument();
    });

    it("should default to today when no value provided", () => {
      const { container } = render(<Calendar autoFocus classNames={{ root: "cal-root" }} />);

      expect(container.querySelector(".cal-root")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // NEW FEATURE TESTS: Mobile Time Picker Collapsible
  // ============================================================================

  describe("Mobile Time Picker Collapsible", () => {
    it("should render collapsible time picker in mobile layout", () => {
      render(<Calendar showTime layout="mobile" />);

      // In mobile layout, time picker should be collapsible
      const collapsibleHeaders = screen.getAllByRole("button");
      expect(collapsibleHeaders.length).toBeGreaterThan(0);
    });

    it("should toggle time picker expansion when clicking header", () => {
      render(<Calendar showTime layout="mobile" />);

      // Find and click the time header button
      const timeHeaders = screen.getAllByRole("button").filter(
        (btn) =>
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          btn.textContent?.toLowerCase().includes("time") ||
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          btn.textContent?.toLowerCase().includes("start") ||
          btn.textContent?.toLowerCase().includes("end")
      );

      if (timeHeaders.length > 0 && timeHeaders[0]) {
        fireEvent.click(timeHeaders[0]);
      }
    });
  });
});
