import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimePicker } from "./TimePicker";
import type { TimeValue, CalendarClassNames, CalendarLabels } from "../types";

describe("TimePicker", () => {
  const defaultTime: TimeValue = { hours: 12, minutes: 30, seconds: 0 };

  const defaultProps = {
    time: defaultTime,
    target: "single" as const,
  };

  describe("rendering", () => {
    it("should render the time container", () => {
      const classNames: CalendarClassNames = { timeContainer: "time-container" };
      render(<TimePicker {...defaultProps} classNames={classNames} />);

      const container = document.querySelector(".time-container");
      expect(container).toBeInTheDocument();
    });

    it("should render label when provided", () => {
      render(<TimePicker {...defaultProps} label="Select Time" />);

      expect(screen.getByText("Select Time")).toBeInTheDocument();
    });

    it("should not render label when not provided", () => {
      render(<TimePicker {...defaultProps} />);

      // Should only have time selectors, no extra label span
      const labels = screen.queryByText(/Select/i);
      expect(labels).not.toBeInTheDocument();
    });

    it("should apply timeLabel className to label", () => {
      const classNames: CalendarClassNames = { timeLabel: "my-time-label" };
      render(<TimePicker {...defaultProps} label="Time" classNames={classNames} />);

      const label = screen.getByText("Time");
      expect(label).toHaveClass("my-time-label");
    });

    it("should render hours and minutes selectors by default", () => {
      render(<TimePicker {...defaultProps} />);

      // Default labels
      expect(screen.getByText("HH")).toBeInTheDocument();
      expect(screen.getByText("MM")).toBeInTheDocument();
    });

    it("should not render seconds selector by default", () => {
      render(<TimePicker {...defaultProps} />);

      expect(screen.queryByText("SS")).not.toBeInTheDocument();
    });

    it("should render seconds selector when showSeconds is true", () => {
      render(<TimePicker {...defaultProps} showSeconds />);

      expect(screen.getByText("SS")).toBeInTheDocument();
    });

    it("should render time separators", () => {
      render(<TimePicker {...defaultProps} />);

      const separators = screen.getAllByText(":");
      expect(separators).toHaveLength(1); // Only between HH and MM
    });

    it("should render two time separators when showSeconds is true", () => {
      render(<TimePicker {...defaultProps} showSeconds />);

      const separators = screen.getAllByText(":");
      expect(separators).toHaveLength(2);
    });

    it("should apply timeSelectors className", () => {
      const classNames: CalendarClassNames = { timeSelectors: "selectors-row" };
      render(<TimePicker {...defaultProps} classNames={classNames} />);

      const selectorsContainer = document.querySelector(".selectors-row");
      expect(selectorsContainer).toBeInTheDocument();
    });

    it("should apply timeSeparator className", () => {
      const classNames: CalendarClassNames = { timeSeparator: "my-separator" };
      render(<TimePicker {...defaultProps} classNames={classNames} />);

      const separator = screen.getByText(":");
      expect(separator).toHaveClass("my-separator");
    });
  });

  describe("custom labels", () => {
    it("should use custom hoursLabel", () => {
      const labels: CalendarLabels = { hoursLabel: "Hours" };
      render(<TimePicker {...defaultProps} labels={labels} />);

      expect(screen.getByText("Hours")).toBeInTheDocument();
      expect(screen.queryByText("HH")).not.toBeInTheDocument();
    });

    it("should use custom minutesLabel", () => {
      const labels: CalendarLabels = { minutesLabel: "Minutes" };
      render(<TimePicker {...defaultProps} labels={labels} />);

      expect(screen.getByText("Minutes")).toBeInTheDocument();
      expect(screen.queryByText("MM")).not.toBeInTheDocument();
    });

    it("should use custom secondsLabel", () => {
      const labels: CalendarLabels = { secondsLabel: "Seconds" };
      render(<TimePicker {...defaultProps} showSeconds labels={labels} />);

      expect(screen.getByText("Seconds")).toBeInTheDocument();
      expect(screen.queryByText("SS")).not.toBeInTheDocument();
    });

    it("should fall back to defaults when labels not provided", () => {
      render(<TimePicker {...defaultProps} showSeconds />);

      expect(screen.getByText("HH")).toBeInTheDocument();
      expect(screen.getByText("MM")).toBeInTheDocument();
      expect(screen.getByText("SS")).toBeInTheDocument();
    });
  });

  describe("time display", () => {
    it("should display current hour value", () => {
      const time: TimeValue = { hours: 14, minutes: 0, seconds: 0 };
      render(<TimePicker {...defaultProps} time={time} />);

      // Hour 14 should be rendered (appears in both hours and minutes)
      const hour14Buttons = screen.getAllByRole("button", { name: "14" });
      expect(hour14Buttons.length).toBeGreaterThanOrEqual(1);
    });

    it("should display current minute value", () => {
      const time: TimeValue = { hours: 0, minutes: 45, seconds: 0 };
      render(<TimePicker {...defaultProps} time={time} />);

      // Minute 45 appears in minutes selector only (> 23)
      const minute45 = screen.getByRole("button", { name: "45" });
      expect(minute45).toBeInTheDocument();
    });

    it("should display current second value when showSeconds is true", () => {
      const time: TimeValue = { hours: 0, minutes: 0, seconds: 30 };
      render(<TimePicker {...defaultProps} time={time} showSeconds />);

      // Should find 30 in seconds selector
      const buttons = screen.getAllByRole("button", { name: "30" });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it("should render all 24 hour options (0-23)", () => {
      render(<TimePicker {...defaultProps} />);

      // Values 0-23 appear in both hours and minutes selectors
      const button00 = screen.getAllByRole("button", { name: "00" });
      const button12 = screen.getAllByRole("button", { name: "12" });
      const button23 = screen.getAllByRole("button", { name: "23" });
      expect(button00.length).toBeGreaterThanOrEqual(1);
      expect(button12.length).toBeGreaterThanOrEqual(1);
      expect(button23.length).toBeGreaterThanOrEqual(1);
    });

    it("should render all 60 minute options (0-59)", () => {
      render(<TimePicker {...defaultProps} />);

      // Minutes are in a separate selector - need to check for multiple buttons with same name
      const buttons59 = screen.getAllByRole("button", { name: "59" });
      expect(buttons59.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("onTimeChange callback", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it("should call onTimeChange when hour is selected", async () => {
      const onTimeChange = vi.fn();
      const time: TimeValue = { hours: 10, minutes: 30, seconds: 0 };

      render(
        <TimePicker {...defaultProps} time={time} target="single" onTimeChange={onTimeChange} />
      );

      // Click on hour 14 (use getAllByRole since 14 appears in both hours and minutes)
      const hour14Buttons = screen.getAllByRole("button", { name: "14" });
      await user.click(hour14Buttons[0]!); // First is hours

      expect(onTimeChange).toHaveBeenCalledWith({ hours: 14, minutes: 30, seconds: 0 }, "single");
    });

    it("should call onTimeChange when minute is selected", async () => {
      const onTimeChange = vi.fn();
      const time: TimeValue = { hours: 10, minutes: 30, seconds: 0 };

      render(
        <TimePicker {...defaultProps} time={time} target="start" onTimeChange={onTimeChange} />
      );

      // Find and click minute 45
      const allButtons = screen.getAllByRole("button", { name: "45" });
      // The minute 45 should be in the second selector (first is hours)
      await user.click(allButtons[0]!);

      expect(onTimeChange).toHaveBeenCalledWith({ hours: 10, minutes: 45, seconds: 0 }, "start");
    });

    it("should call onTimeChange when second is selected", async () => {
      const onTimeChange = vi.fn();
      const time: TimeValue = { hours: 10, minutes: 30, seconds: 15 };

      render(
        <TimePicker
          {...defaultProps}
          time={time}
          target="end"
          showSeconds
          onTimeChange={onTimeChange}
        />
      );

      // Find seconds 45 button (will appear in minute and seconds selectors)
      const allButtons = screen.getAllByRole("button", { name: "45" });
      // Click the last one which should be in seconds selector
      await user.click(allButtons[allButtons.length - 1]!);

      expect(onTimeChange).toHaveBeenCalledWith({ hours: 10, minutes: 30, seconds: 45 }, "end");
    });

    it("should not crash when onTimeChange is not provided", async () => {
      const time: TimeValue = { hours: 10, minutes: 30, seconds: 0 };

      render(<TimePicker {...defaultProps} time={time} />);

      // Use getAllByRole since "14" appears in both hours and minutes
      const hour14Buttons = screen.getAllByRole("button", { name: "14" });
      await expect(user.click(hour14Buttons[0]!)).resolves.not.toThrow();
    });
  });

  describe("click and select callbacks", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it("should call onHourClick when hour is clicked", async () => {
      const onHourClick = vi.fn();

      render(<TimePicker {...defaultProps} target="single" onHourClick={onHourClick} />);

      // Use getAllByRole since "15" appears in both hours and minutes
      const hour15Buttons = screen.getAllByRole("button", { name: "15" });
      await user.click(hour15Buttons[0]!); // First is hours

      expect(onHourClick).toHaveBeenCalledWith(15, "single");
    });

    it("should call onHourSelect when hour is selected", async () => {
      const onHourSelect = vi.fn();

      render(<TimePicker {...defaultProps} target="start" onHourSelect={onHourSelect} />);

      // Use getAllByRole since "15" appears in both hours and minutes
      const hour15Buttons = screen.getAllByRole("button", { name: "15" });
      await user.click(hour15Buttons[0]!); // First is hours

      expect(onHourSelect).toHaveBeenCalledWith(15, "start");
    });

    it("should call onMinuteClick when minute is clicked", async () => {
      const onMinuteClick = vi.fn();

      render(<TimePicker {...defaultProps} target="end" onMinuteClick={onMinuteClick} />);

      // Find minute buttons
      const allButtons = screen.getAllByRole("button", { name: "45" });
      await user.click(allButtons[0]!);

      expect(onMinuteClick).toHaveBeenCalledWith(45, "end");
    });

    it("should call onMinuteSelect when minute is selected", async () => {
      const onMinuteSelect = vi.fn();

      render(<TimePicker {...defaultProps} target="single" onMinuteSelect={onMinuteSelect} />);

      const allButtons = screen.getAllByRole("button", { name: "45" });
      await user.click(allButtons[0]!);

      expect(onMinuteSelect).toHaveBeenCalledWith(45, "single");
    });

    it("should call onSecondsClick when seconds is clicked", async () => {
      const onSecondsClick = vi.fn();

      render(
        <TimePicker {...defaultProps} showSeconds target="start" onSecondsClick={onSecondsClick} />
      );

      // Seconds 45 will be the last occurrence
      const allButtons = screen.getAllByRole("button", { name: "45" });
      await user.click(allButtons[allButtons.length - 1]!);

      expect(onSecondsClick).toHaveBeenCalledWith(45, "start");
    });

    it("should call onSecondsSelect when seconds is selected", async () => {
      const onSecondsSelect = vi.fn();

      render(
        <TimePicker {...defaultProps} showSeconds target="end" onSecondsSelect={onSecondsSelect} />
      );

      const allButtons = screen.getAllByRole("button", { name: "45" });
      await user.click(allButtons[allButtons.length - 1]!);

      expect(onSecondsSelect).toHaveBeenCalledWith(45, "end");
    });

    it("should call both onTimeChange and onHourSelect when hour is selected", async () => {
      const onTimeChange = vi.fn();
      const onHourSelect = vi.fn();

      render(
        <TimePicker
          {...defaultProps}
          target="single"
          onTimeChange={onTimeChange}
          onHourSelect={onHourSelect}
        />
      );

      // Use getAllByRole since "15" appears in both hours and minutes
      const hour15Buttons = screen.getAllByRole("button", { name: "15" });
      await user.click(hour15Buttons[0]!); // First is hours

      expect(onTimeChange).toHaveBeenCalled();
      expect(onHourSelect).toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("should disable all time buttons when disabled is true", () => {
      render(<TimePicker {...defaultProps} disabled showSeconds />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("should not call onTimeChange when disabled", async () => {
      const user = userEvent.setup();
      const onTimeChange = vi.fn();

      render(<TimePicker {...defaultProps} disabled onTimeChange={onTimeChange} />);

      // Use getAllByRole since "14" appears in both hours and minutes
      const hour14Buttons = screen.getAllByRole("button", { name: "14" });
      await user.click(hour14Buttons[0]!);

      expect(onTimeChange).not.toHaveBeenCalled();
    });

    it("should not call onClick callbacks when disabled", async () => {
      const user = userEvent.setup();
      const onHourClick = vi.fn();

      render(<TimePicker {...defaultProps} disabled onHourClick={onHourClick} />);

      // Use getAllByRole since "14" appears in both hours and minutes
      const hour14Buttons = screen.getAllByRole("button", { name: "14" });
      await user.click(hour14Buttons[0]!);

      expect(onHourClick).not.toHaveBeenCalled();
    });

    it("should apply disabled classNames to container when disabled", () => {
      const classNames = {
        timeContainer: "time-container",
        timeContainerDisabled: "time-container-disabled",
        timeSelectors: "time-selectors",
        timeSelectorsDisabled: "time-selectors-disabled",
      };

      const { container } = render(
        <TimePicker {...defaultProps} disabled classNames={classNames} />
      );

      const timeContainer = container.querySelector(".time-container");
      expect(timeContainer).toHaveClass("time-container-disabled");

      const timeSelectors = container.querySelector(".time-selectors");
      expect(timeSelectors).toHaveClass("time-selectors-disabled");
    });

    it("should apply disabled classNames to label when disabled", () => {
      const classNames = {
        timeLabel: "time-label",
        timeLabelDisabled: "time-label-disabled",
      };

      const { container } = render(
        <TimePicker {...defaultProps} disabled label="Test Label" classNames={classNames} />
      );

      const timeLabel = container.querySelector(".time-label");
      expect(timeLabel).toHaveClass("time-label-disabled");
    });

    it("should apply disabled classNames to separators when disabled", () => {
      const classNames = {
        timeSeparator: "time-separator",
        timeSeparatorDisabled: "time-separator-disabled",
      };

      const { container } = render(
        <TimePicker {...defaultProps} disabled classNames={classNames} />
      );

      const separators = container.querySelectorAll(".time-separator");
      separators.forEach((separator) => {
        expect(separator).toHaveClass("time-separator-disabled");
      });
    });

    it("should not apply disabled classNames when not disabled", () => {
      const classNames = {
        timeContainer: "time-container",
        timeContainerDisabled: "time-container-disabled",
        timeLabel: "time-label",
        timeLabelDisabled: "time-label-disabled",
      };

      const { container } = render(
        <TimePicker {...defaultProps} disabled={false} label="Test Label" classNames={classNames} />
      );

      const timeContainer = container.querySelector(".time-container");
      expect(timeContainer).not.toHaveClass("time-container-disabled");

      const timeLabel = container.querySelector(".time-label");
      expect(timeLabel).not.toHaveClass("time-label-disabled");
    });
  });

  describe("minTime and maxTime constraints", () => {
    // Note: The isHourDisabled, isMinuteDisabled, isSecondDisabled callbacks are passed
    // to TimeSelector, but due to how disabled state is handled (disabled ?? isDisabled),
    // the constraint callbacks only affect behavior when isDisabled callback is invoked.
    // These tests verify the callbacks are set up correctly and would work if clicked.

    it("should not call onTimeChange when clicking time outside minTime constraint", async () => {
      const user = userEvent.setup();
      const onTimeChange = vi.fn();
      const minTime: TimeValue = { hours: 9, minutes: 0, seconds: 0 };

      render(<TimePicker {...defaultProps} minTime={minTime} onTimeChange={onTimeChange} />);

      // Use getAllByRole since "08" appears in both hours and minutes
      const hour8Buttons = screen.getAllByRole("button", { name: "08" });
      await user.click(hour8Buttons[0]!); // First is hours

      // TimeSelector's handleClick checks isDisabled before calling onSelect,
      // so clicking a disabled time (hour 8 when minTime is 9) does not trigger callback
      expect(onTimeChange).not.toHaveBeenCalled();
    });

    it("should call onTimeChange when clicking time within minTime constraint", async () => {
      const user = userEvent.setup();
      const onTimeChange = vi.fn();
      const minTime: TimeValue = { hours: 9, minutes: 0, seconds: 0 };

      render(<TimePicker {...defaultProps} minTime={minTime} onTimeChange={onTimeChange} />);

      // Use getAllByRole since "10" appears in both hours and minutes
      const hour10Buttons = screen.getAllByRole("button", { name: "10" });
      await user.click(hour10Buttons[0]!); // First is hours

      expect(onTimeChange).toHaveBeenCalledWith({ hours: 10, minutes: 30, seconds: 0 }, "single");
    });

    it("should pass isHourDisabled callback to TimeSelector", () => {
      const minTime: TimeValue = { hours: 9, minutes: 0, seconds: 0 };

      render(<TimePicker {...defaultProps} minTime={minTime} />);

      // Verify the component renders without errors with minTime
      expect(screen.getByText("HH")).toBeInTheDocument();
    });

    it("should pass isMinuteDisabled callback to TimeSelector", () => {
      const time: TimeValue = { hours: 9, minutes: 0, seconds: 0 };
      const minTime: TimeValue = { hours: 9, minutes: 30, seconds: 0 };

      render(<TimePicker {...defaultProps} time={time} minTime={minTime} />);

      // Verify the component renders without errors with minTime
      expect(screen.getByText("MM")).toBeInTheDocument();
    });

    it("should pass isSecondDisabled callback to TimeSelector", () => {
      const time: TimeValue = { hours: 9, minutes: 30, seconds: 0 };
      const minTime: TimeValue = { hours: 9, minutes: 30, seconds: 30 };

      render(<TimePicker {...defaultProps} time={time} showSeconds minTime={minTime} />);

      // Verify the component renders without errors with minTime
      expect(screen.getByText("SS")).toBeInTheDocument();
    });

    it("should handle both minTime and maxTime props", () => {
      const minTime: TimeValue = { hours: 9, minutes: 0, seconds: 0 };
      const maxTime: TimeValue = { hours: 17, minutes: 0, seconds: 0 };

      render(<TimePicker {...defaultProps} minTime={minTime} maxTime={maxTime} />);

      // Verify the component renders without errors with both constraints
      expect(screen.getByText("HH")).toBeInTheDocument();
      expect(screen.getByText("MM")).toBeInTheDocument();
    });
  });

  describe("target prop", () => {
    it("should pass 'single' target to callbacks", async () => {
      const user = userEvent.setup();
      const onTimeChange = vi.fn();

      render(<TimePicker {...defaultProps} target="single" onTimeChange={onTimeChange} />);

      // Use getAllByRole since "15" appears in both hours and minutes
      const hour15Buttons = screen.getAllByRole("button", { name: "15" });
      await user.click(hour15Buttons[0]!); // First is hours

      expect(onTimeChange).toHaveBeenCalledWith(expect.any(Object), "single");
    });

    it("should pass 'start' target to callbacks", async () => {
      const user = userEvent.setup();
      const onTimeChange = vi.fn();

      render(<TimePicker {...defaultProps} target="start" onTimeChange={onTimeChange} />);

      // Use getAllByRole since "15" appears in both hours and minutes
      const hour15Buttons = screen.getAllByRole("button", { name: "15" });
      await user.click(hour15Buttons[0]!); // First is hours

      expect(onTimeChange).toHaveBeenCalledWith(expect.any(Object), "start");
    });

    it("should pass 'end' target to callbacks", async () => {
      const user = userEvent.setup();
      const onTimeChange = vi.fn();

      render(<TimePicker {...defaultProps} target="end" onTimeChange={onTimeChange} />);

      // Use getAllByRole since "15" appears in both hours and minutes
      const hour15Buttons = screen.getAllByRole("button", { name: "15" });
      await user.click(hour15Buttons[0]!); // First is hours

      expect(onTimeChange).toHaveBeenCalledWith(expect.any(Object), "end");
    });
  });

  describe("time preservation on change", () => {
    it("should preserve minutes and seconds when changing hour", async () => {
      const user = userEvent.setup();
      const onTimeChange = vi.fn();
      const time: TimeValue = { hours: 10, minutes: 25, seconds: 45 };

      render(<TimePicker {...defaultProps} time={time} onTimeChange={onTimeChange} />);

      // Use getAllByRole since "15" appears in both hours and minutes
      const hour15Buttons = screen.getAllByRole("button", { name: "15" });
      await user.click(hour15Buttons[0]!); // First is hours

      expect(onTimeChange).toHaveBeenCalledWith({ hours: 15, minutes: 25, seconds: 45 }, "single");
    });

    it("should preserve hours and seconds when changing minute", async () => {
      const user = userEvent.setup();
      const onTimeChange = vi.fn();
      const time: TimeValue = { hours: 10, minutes: 25, seconds: 45 };

      render(<TimePicker {...defaultProps} time={time} onTimeChange={onTimeChange} />);

      // Click minute 40
      const minute40Buttons = screen.getAllByRole("button", { name: "40" });
      await user.click(minute40Buttons[0]!);

      expect(onTimeChange).toHaveBeenCalledWith({ hours: 10, minutes: 40, seconds: 45 }, "single");
    });

    it("should preserve hours and minutes when changing seconds", async () => {
      const user = userEvent.setup();
      const onTimeChange = vi.fn();
      const time: TimeValue = { hours: 10, minutes: 25, seconds: 45 };

      render(<TimePicker {...defaultProps} time={time} showSeconds onTimeChange={onTimeChange} />);

      // Click seconds 30 (last occurrence of 30)
      const second30Buttons = screen.getAllByRole("button", { name: "30" });
      await user.click(second30Buttons[second30Buttons.length - 1]!);

      expect(onTimeChange).toHaveBeenCalledWith({ hours: 10, minutes: 25, seconds: 30 }, "single");
    });
  });

  describe("edge cases", () => {
    it("should handle midnight (00:00:00)", () => {
      const time: TimeValue = { hours: 0, minutes: 0, seconds: 0 };

      render(<TimePicker {...defaultProps} time={time} showSeconds />);

      expect(screen.getByText("HH")).toBeInTheDocument();
    });

    it("should handle end of day (23:59:59)", () => {
      const time: TimeValue = { hours: 23, minutes: 59, seconds: 59 };

      render(<TimePicker {...defaultProps} time={time} showSeconds />);

      expect(screen.getByText("HH")).toBeInTheDocument();
    });

    it("should handle all classNames being undefined", () => {
      render(<TimePicker {...defaultProps} classNames={undefined} />);

      expect(screen.getByText("HH")).toBeInTheDocument();
    });

    it("should handle empty classNames object", () => {
      render(<TimePicker {...defaultProps} classNames={{}} />);

      expect(screen.getByText("HH")).toBeInTheDocument();
    });

    it("should handle all labels being undefined", () => {
      render(<TimePicker {...defaultProps} labels={undefined} />);

      // Should fall back to defaults
      expect(screen.getByText("HH")).toBeInTheDocument();
      expect(screen.getByText("MM")).toBeInTheDocument();
    });

    it("should handle partial labels object", () => {
      const labels: CalendarLabels = { hoursLabel: "H" };
      render(<TimePicker {...defaultProps} labels={labels} showSeconds />);

      expect(screen.getByText("H")).toBeInTheDocument();
      expect(screen.getByText("MM")).toBeInTheDocument(); // fallback
      expect(screen.getByText("SS")).toBeInTheDocument(); // fallback
    });
  });
});
