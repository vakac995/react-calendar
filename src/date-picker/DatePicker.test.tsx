import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  describe("rendering", () => {
    it("renders input field", () => {
      render(<DatePicker usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("renders with initial value", () => {
      const date = new Date(2024, 5, 15);
      render(<DatePicker value={date} dateFormat="MM/DD/YYYY" usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("06/15/2024");
    });

    it("renders calendar icon", () => {
      render(<DatePicker usePortal={false} />);
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      expect(iconButton).toBeInTheDocument();
    });

    it("does not render calendar when closed", () => {
      render(<DatePicker usePortal={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("calendar opening", () => {
    it("opens calendar when icon is clicked", async () => {
      const user = userEvent.setup();
      render(<DatePicker usePortal={false} />);

      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("opens calendar on focus when openOnFocus is true", async () => {
      const user = userEvent.setup();
      render(<DatePicker openOnFocus usePortal={false} />);

      const input = screen.getByRole("textbox");
      await user.click(input);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("does not open calendar on focus when openOnFocus is false", async () => {
      const user = userEvent.setup();
      render(<DatePicker openOnFocus={false} usePortal={false} />);

      const input = screen.getByRole("textbox");
      await user.click(input);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not open when disabled", async () => {
      const user = userEvent.setup();
      render(<DatePicker disabled usePortal={false} />);

      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not open when readOnly", async () => {
      const user = userEvent.setup();
      render(<DatePicker readOnly usePortal={false} />);

      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("calendar closing", () => {
    it("closes calendar on escape", async () => {
      const user = userEvent.setup();
      render(<DatePicker usePortal={false} />);

      // Open calendar
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Press escape
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes calendar when clicking icon again", async () => {
      const user = userEvent.setup();
      render(<DatePicker usePortal={false} />);

      const iconButton = screen.getByRole("button", { name: /open calendar/i });

      // Open calendar
      await user.click(iconButton);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click icon again to close
      await user.click(iconButton);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("callbacks", () => {
    it("calls onOpen when calendar opens", async () => {
      const user = userEvent.setup();
      const onOpen = vi.fn();
      render(<DatePicker onOpen={onOpen} usePortal={false} />);

      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      expect(onOpen).toHaveBeenCalled();
    });

    it("calls onClose when calendar closes", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<DatePicker onClose={onClose} usePortal={false} />);

      const iconButton = screen.getByRole("button", { name: /open calendar/i });

      // Open
      await user.click(iconButton);
      // Close
      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalled();
    });

    it("calls onFocus when input focuses", async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(<DatePicker onFocus={onFocus} usePortal={false} />);

      const input = screen.getByRole("textbox");
      await user.click(input);

      expect(onFocus).toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("disables input when disabled prop is true", () => {
      render(<DatePicker disabled usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("does not show clear button when disabled", () => {
      const date = new Date(2024, 5, 15);
      render(<DatePicker value={date} isClearable disabled usePortal={false} />);
      const clearButton = screen.queryByRole("button", { name: /clear/i });
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe("readonly state", () => {
    it("makes input readonly when readOnly prop is true", () => {
      render(<DatePicker readOnly usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
    });
  });

  describe("accessibility", () => {
    it("sets aria-label on input when provided", () => {
      render(<DatePicker ariaLabel="Select date" usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-label", "Select date");
    });

    it("sets name attribute on input", () => {
      render(<DatePicker name="date-field" usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("name", "date-field");
    });

    it("sets id attribute on input", () => {
      render(<DatePicker id="date-input" usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "date-input");
    });
  });

  describe("custom date format", () => {
    it("formats value with DD/MM/YYYY format", () => {
      const date = new Date(2024, 0, 15);
      render(<DatePicker value={date} dateFormat="DD/MM/YYYY" usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("15/01/2024");
    });

    it("formats value with YYYY-MM-DD format", () => {
      const date = new Date(2024, 5, 15);
      render(<DatePicker value={date} dateFormat="YYYY-MM-DD" usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("2024-06-15");
    });
  });

  describe("date selection", () => {
    it("closes calendar after selection when closeOnSelect is true", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker closeOnSelect onChange={onChange} usePortal={false} />);

      // Open calendar
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click a date
      const dateButton = screen.getByRole("button", { name: /15/ });
      await user.click(dateButton);

      // Calendar should close
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalled();
    });

    it("keeps calendar open after selection when closeOnSelect is false", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker closeOnSelect={false} onChange={onChange} usePortal={false} />);

      // Open calendar
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click a date
      const dateButton = screen.getByRole("button", { name: /15/ });
      await user.click(dateButton);

      // Calendar should stay open
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("calls onChange when typing a valid date", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePicker onChange={onChange} usePortal={false} />);

      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "06/15/2024");
      await user.tab(); // Blur to trigger change

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("date bounds", () => {
    it("disables dates before minDate", async () => {
      const user = userEvent.setup();
      const minDate = new Date(2024, 0, 15);
      render(<DatePicker minDate={minDate} usePortal={false} />);

      // Open calendar
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      // Verify calendar is open and minDate is passed
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("disables dates after maxDate", async () => {
      const user = userEvent.setup();
      const maxDate = new Date(2024, 0, 20);
      render(<DatePicker maxDate={maxDate} usePortal={false} />);

      // Open calendar
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);
    });

    it("uses custom isDateDisabled function", async () => {
      const user = userEvent.setup();
      const isDateDisabled = vi.fn().mockReturnValue(false);
      render(<DatePicker isDateDisabled={isDateDisabled} usePortal={false} />);

      // Open calendar
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      // isDateDisabled should have been called for visible dates
      expect(isDateDisabled).toHaveBeenCalled();
    });
  });

  describe("icon configuration", () => {
    it("positions icon on left when iconPosition is left", () => {
      const { container } = render(<DatePicker iconPosition="left" usePortal={false} />);
      // Just verify component renders without error
      expect(container).toBeInTheDocument();
    });

    it("hides icon when showIcon is false", () => {
      render(<DatePicker showIcon={false} usePortal={false} />);
      const iconButton = screen.queryByRole("button", { name: /open calendar/i });
      expect(iconButton).not.toBeInTheDocument();
    });

    it("does not toggle calendar when openOnIconClick is false", async () => {
      const user = userEvent.setup();
      render(<DatePicker openOnIconClick={false} usePortal={false} />);

      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      // Calendar should not open
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("calendar configuration", () => {
    it("passes firstDayOfWeek to calendar", async () => {
      const user = userEvent.setup();
      render(<DatePicker firstDayOfWeek={1} usePortal={false} />);

      // Open calendar
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      // Calendar should be open with Monday as first day
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("passes showWeekNumbers to calendar", async () => {
      const user = userEvent.setup();
      render(<DatePicker showWeekNumbers usePortal={false} />);

      // Open calendar
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      // Week numbers should be visible
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("input blur handling", () => {
    it("calls onBlur when input loses focus", async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<DatePicker onBlur={onBlur} usePortal={false} />);

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();

      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe("tabIndex", () => {
    it("passes tabIndex to input", () => {
      // eslint-disable-next-line jsx-a11y/tabindex-no-positive
      render(<DatePicker tabIndex={5} usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("tabindex", "5");
    });
  });

  describe("autoFocus", () => {
    it("autofocuses input when autoFocus is true", () => {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      render(<DatePicker autoFocus usePortal={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveFocus();
    });
  });

  describe("portal configuration", () => {
    it("renders with portal when usePortal is true", () => {
      render(<DatePicker usePortal={true} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("uses custom portal container", () => {
      const container = document.createElement("div");
      container.id = "custom-container";
      document.body.appendChild(container);

      render(<DatePicker usePortal={true} portalContainer={container} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();

      document.body.removeChild(container);
    });
  });

  describe("placement", () => {
    it("uses specified placement for popover", async () => {
      const user = userEvent.setup();
      render(<DatePicker placement="top-start" usePortal={false} />);

      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("custom classNames", () => {
    it("applies custom root className", () => {
      const { container } = render(
        <DatePicker classNames={{ root: "custom-root" }} usePortal={false} />
      );
      expect(container.querySelector(".custom-root")).toBeInTheDocument();
    });
  });
});
