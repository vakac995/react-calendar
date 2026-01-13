import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DateInput } from "./DateInput";

describe("DateInput", () => {
  describe("rendering", () => {
    it("renders input field", () => {
      render(<DateInput />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("renders with default placeholder", () => {
      render(<DateInput dateFormat="MM/DD/YYYY" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("placeholder", "MM/DD/YYYY");
    });

    it("renders with custom placeholder", () => {
      render(<DateInput placeholder="Enter date" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("placeholder", "Enter date");
    });

    it("renders with initial value", () => {
      const date = new Date(2024, 5, 15); // June 15, 2024
      render(<DateInput value={date} dateFormat="MM/DD/YYYY" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("06/15/2024");
    });

    it("renders with icon by default", () => {
      render(<DateInput />);
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      expect(iconButton).toBeInTheDocument();
    });

    it("renders without icon when showIcon is false", () => {
      render(<DateInput showIcon={false} />);
      const iconButton = screen.queryByRole("button", { name: /open calendar/i });
      expect(iconButton).not.toBeInTheDocument();
    });

    it("renders icon on left when iconPosition is left", () => {
      render(<DateInput iconPosition="left" />);
      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      expect(iconButton).toBeInTheDocument();
    });

    it("renders custom icon", () => {
      render(<DateInput icon={<span data-testid="custom-icon">📅</span>} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("renders clear button when isClearable and has value", () => {
      const date = new Date(2024, 5, 15);
      render(<DateInput value={date} isClearable />);
      const clearButton = screen.getByRole("button", { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    it("does not render clear button when value is empty", () => {
      render(<DateInput isClearable />);
      const clearButton = screen.queryByRole("button", { name: /clear/i });
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe("value formatting", () => {
    it("formats date with MM/DD/YYYY format", () => {
      const date = new Date(2024, 0, 5); // Jan 5, 2024
      render(<DateInput value={date} dateFormat="MM/DD/YYYY" />);
      expect(screen.getByRole("textbox")).toHaveValue("01/05/2024");
    });

    it("formats date with DD/MM/YYYY format", () => {
      const date = new Date(2024, 0, 5); // Jan 5, 2024
      render(<DateInput value={date} dateFormat="DD/MM/YYYY" />);
      expect(screen.getByRole("textbox")).toHaveValue("05/01/2024");
    });

    it("formats date with YYYY-MM-DD format", () => {
      const date = new Date(2024, 5, 15); // June 15, 2024
      render(<DateInput value={date} dateFormat="YYYY-MM-DD" />);
      expect(screen.getByRole("textbox")).toHaveValue("2024-06-15");
    });

    it("formats date with M/D/YYYY format (no leading zeros)", () => {
      const date = new Date(2024, 0, 5); // Jan 5, 2024
      render(<DateInput value={date} dateFormat="M/D/YYYY" />);
      expect(screen.getByRole("textbox")).toHaveValue("1/5/2024");
    });

    it("formats date with DD.MM.YYYY format", () => {
      const date = new Date(2024, 5, 15);
      render(<DateInput value={date} dateFormat="DD.MM.YYYY" />);
      expect(screen.getByRole("textbox")).toHaveValue("15.06.2024");
    });
  });

  describe("input handling", () => {
    it("updates input value on type", async () => {
      const user = userEvent.setup();
      render(<DateInput />);
      const input = screen.getByRole("textbox");

      await user.type(input, "06/15/2024");
      expect(input).toHaveValue("06/15/2024");
    });

    it("calls onChange with parsed date on blur", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DateInput onChange={onChange} dateFormat="MM/DD/YYYY" />);
      const input = screen.getByRole("textbox");

      await user.type(input, "06/15/2024");
      await user.tab(); // blur

      expect(onChange).toHaveBeenCalledWith(expect.any(Date));
      const calledDate = onChange.mock.calls[0]?.[0] as Date | undefined;
      expect(calledDate?.getFullYear()).toBe(2024);
      expect(calledDate?.getMonth()).toBe(5); // June
      expect(calledDate?.getDate()).toBe(15);
    });

    it("calls onChange with null when input is cleared", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const date = new Date(2024, 5, 15);
      render(<DateInput value={date} onChange={onChange} />);
      const input = screen.getByRole("textbox");

      await user.clear(input);
      await user.tab();

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("calls onInvalid when date is invalid", async () => {
      const user = userEvent.setup();
      const onInvalid = vi.fn();
      render(<DateInput onInvalid={onInvalid} dateFormat="MM/DD/YYYY" />);
      const input = screen.getByRole("textbox");

      // Type an invalid date (month 99 does not exist)
      await user.type(input, "99/99/2024");
      await user.tab();

      expect(onInvalid).toHaveBeenCalledWith("99/99/2024");
    });

    it("sets aria-invalid when input is invalid", async () => {
      const user = userEvent.setup();
      render(<DateInput dateFormat="MM/DD/YYYY" />);
      const input = screen.getByRole("textbox");

      // Type an invalid date that won't parse
      await user.type(input, "99/99/2024");
      await user.tab();

      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("clear functionality", () => {
    it("clears input when clear button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const date = new Date(2024, 5, 15);
      render(<DateInput value={date} isClearable onChange={onChange} />);

      const clearButton = screen.getByRole("button", { name: /clear/i });
      await user.click(clearButton);

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("clears input on Escape key when isClearable", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const date = new Date(2024, 5, 15);
      render(<DateInput value={date} isClearable onChange={onChange} />);
      const input = screen.getByRole("textbox");

      await user.click(input);
      await user.keyboard("{Escape}");

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("does not clear on Escape when not clearable", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const date = new Date(2024, 5, 15);
      render(<DateInput value={date} isClearable={false} onChange={onChange} />);
      const input = screen.getByRole("textbox");

      await user.click(input);
      await user.keyboard("{Escape}");

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("icon click", () => {
    it("calls onIconClick when icon is clicked", async () => {
      const user = userEvent.setup();
      const onIconClick = vi.fn();
      render(<DateInput onIconClick={onIconClick} />);

      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      expect(onIconClick).toHaveBeenCalled();
    });

    it("does not call onIconClick when disabled", async () => {
      const user = userEvent.setup();
      const onIconClick = vi.fn();
      render(<DateInput onIconClick={onIconClick} disabled />);

      const iconButton = screen.getByRole("button", { name: /open calendar/i });
      await user.click(iconButton);

      expect(onIconClick).not.toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("disables input when disabled prop is true", () => {
      render(<DateInput disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("does not allow typing when disabled", async () => {
      const user = userEvent.setup();
      render(<DateInput disabled />);
      const input = screen.getByRole("textbox");

      await user.type(input, "06/15/2024");
      expect(input).toHaveValue("");
    });

    it("does not show clear button when disabled", () => {
      const date = new Date(2024, 5, 15);
      render(<DateInput value={date} isClearable disabled />);
      const clearButton = screen.queryByRole("button", { name: /clear/i });
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe("readonly state", () => {
    it("makes input readonly when readOnly prop is true", () => {
      render(<DateInput readOnly />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
    });

    it("does not show clear button when readonly", () => {
      const date = new Date(2024, 5, 15);
      render(<DateInput value={date} isClearable readOnly />);
      const clearButton = screen.queryByRole("button", { name: /clear/i });
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe("min/max date validation", () => {
    it("calls onInvalid when date is before minDate", async () => {
      const user = userEvent.setup();
      const onInvalid = vi.fn();
      const minDate = new Date(2024, 5, 15);
      render(<DateInput minDate={minDate} onInvalid={onInvalid} dateFormat="MM/DD/YYYY" />);
      const input = screen.getByRole("textbox");

      await user.type(input, "06/01/2024");
      await user.tab();

      expect(onInvalid).toHaveBeenCalledWith("06/01/2024");
    });

    it("calls onInvalid when date is after maxDate", async () => {
      const user = userEvent.setup();
      const onInvalid = vi.fn();
      const maxDate = new Date(2024, 5, 15);
      render(<DateInput maxDate={maxDate} onInvalid={onInvalid} dateFormat="MM/DD/YYYY" />);
      const input = screen.getByRole("textbox");

      await user.type(input, "06/30/2024");
      await user.tab();

      expect(onInvalid).toHaveBeenCalledWith("06/30/2024");
    });

    it("accepts date within min/max range", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const minDate = new Date(2024, 5, 1);
      const maxDate = new Date(2024, 5, 30);
      render(
        <DateInput
          minDate={minDate}
          maxDate={maxDate}
          onChange={onChange}
          dateFormat="MM/DD/YYYY"
        />
      );
      const input = screen.getByRole("textbox");

      await user.type(input, "06/15/2024");
      await user.tab();

      expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    });
  });

  describe("focus handling", () => {
    it("calls onFocus when input is focused", async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(<DateInput onFocus={onFocus} />);
      const input = screen.getByRole("textbox");

      await user.click(input);

      expect(onFocus).toHaveBeenCalled();
    });

    it("calls onBlur with parsed date when input loses focus", async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<DateInput onBlur={onBlur} dateFormat="MM/DD/YYYY" />);
      const input = screen.getByRole("textbox");

      await user.type(input, "06/15/2024");
      await user.tab();

      expect(onBlur).toHaveBeenCalledWith(expect.any(Date));
    });

    it("calls onBlur with null for invalid input", async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<DateInput onBlur={onBlur} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "invalid");
      await user.tab();

      expect(onBlur).toHaveBeenCalledWith(null);
    });
  });

  describe("accessibility", () => {
    it("sets aria-label when provided", () => {
      render(<DateInput ariaLabel="Select date" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-label", "Select date");
    });

    it("sets aria-describedby when provided", () => {
      render(<DateInput ariaDescribedBy="date-help" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", "date-help");
    });

    it("sets tabIndex when provided", () => {
      render(<DateInput tabIndex={0} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("tabindex", "0");
    });

    it("supports name attribute", () => {
      render(<DateInput name="birthdate" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("name", "birthdate");
    });

    it("supports id attribute", () => {
      render(<DateInput id="date-field" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "date-field");
    });
  });

  describe("controlled value updates", () => {
    it("updates display when value prop changes", () => {
      const { rerender } = render(
        <DateInput value={new Date(2024, 5, 15)} dateFormat="MM/DD/YYYY" />
      );
      expect(screen.getByRole("textbox")).toHaveValue("06/15/2024");

      rerender(<DateInput value={new Date(2024, 11, 25)} dateFormat="MM/DD/YYYY" />);
      expect(screen.getByRole("textbox")).toHaveValue("12/25/2024");
    });

    it("clears display when value changes to null", () => {
      const { rerender } = render(
        <DateInput value={new Date(2024, 5, 15)} dateFormat="MM/DD/YYYY" />
      );
      expect(screen.getByRole("textbox")).toHaveValue("06/15/2024");

      rerender(<DateInput value={null} dateFormat="MM/DD/YYYY" />);
      expect(screen.getByRole("textbox")).toHaveValue("");
    });
  });

  describe("custom class names", () => {
    it("applies custom root class", () => {
      const { container } = render(<DateInput classNames={{ root: "custom-root" }} />);
      expect(container.firstChild).toHaveClass("custom-root");
    });

    it("applies custom input class", () => {
      render(<DateInput classNames={{ input: "custom-input" }} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-input");
    });
  });

  describe("autoFocus", () => {
    it("focuses input on mount when autoFocus is true", () => {
      // eslint-disable-next-line jsx-a11y/no-autofocus
      render(<DateInput autoFocus />);
      const input = screen.getByRole("textbox");
      expect(document.activeElement).toBe(input);
    });
  });
});
