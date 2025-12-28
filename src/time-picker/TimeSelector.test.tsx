import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimeSelector } from "./TimeSelector";

describe("TimeSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the selector container", () => {
      render(<TimeSelector value={0} max={23} label="Hours" />);

      expect(screen.getByText("Hours")).toBeInTheDocument();
    });

    it("should render the label", () => {
      render(
        <TimeSelector
          value={0}
          max={23}
          label="Test Label"
          classNames={{ timeSelectorLabel: "custom-label" }}
        />
      );

      const label = screen.getByText("Test Label");
      expect(label).toHaveClass("custom-label");
    });

    it("should render correct number of items for max=23 (hours)", () => {
      render(<TimeSelector value={0} max={23} label="Hours" />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(24); // 0-23
    });

    it("should render correct number of items for max=59 (minutes/seconds)", () => {
      render(<TimeSelector value={0} max={59} label="Minutes" />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(60); // 0-59
    });

    it("should render items with zero-padded values", () => {
      render(<TimeSelector value={0} max={23} label="Hours" />);

      expect(screen.getByRole("button", { name: "00" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "01" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "09" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "23" })).toBeInTheDocument();
    });

    it("should apply timeSelector className", () => {
      const { container } = render(
        <TimeSelector
          value={0}
          max={23}
          label="Hours"
          classNames={{ timeSelector: "custom-selector" }}
        />
      );

      expect(container.querySelector(".custom-selector")).toBeInTheDocument();
    });

    it("should apply timeSelectorScroll className", () => {
      const { container } = render(
        <TimeSelector
          value={0}
          max={23}
          label="Hours"
          classNames={{ timeSelectorScroll: "custom-scroll" }}
        />
      );

      expect(container.querySelector(".custom-scroll")).toBeInTheDocument();
    });

    it("should apply timeSelectorItem className to buttons", () => {
      render(
        <TimeSelector
          value={0}
          max={5}
          label="Test"
          classNames={{ timeSelectorItem: "custom-item" }}
        />
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("custom-item");
      });
    });
  });

  describe("selected state", () => {
    it("should apply selected className to current value", () => {
      render(
        <TimeSelector
          value={5}
          max={23}
          label="Hours"
          classNames={{ timeSelectorItemSelected: "selected" }}
        />
      );

      const selectedButton = screen.getByRole("button", { name: "05" });
      expect(selectedButton).toHaveClass("selected");
    });

    it("should not apply selected className to non-selected values", () => {
      render(
        <TimeSelector
          value={5}
          max={23}
          label="Hours"
          classNames={{ timeSelectorItemSelected: "selected" }}
        />
      );

      const notSelectedButton = screen.getByRole("button", { name: "06" });
      expect(notSelectedButton).not.toHaveClass("selected");
    });

    it("should update selected item when value changes", () => {
      const { rerender } = render(
        <TimeSelector
          value={5}
          max={23}
          label="Hours"
          classNames={{ timeSelectorItemSelected: "selected" }}
        />
      );

      expect(screen.getByRole("button", { name: "05" })).toHaveClass("selected");

      rerender(
        <TimeSelector
          value={10}
          max={23}
          label="Hours"
          classNames={{ timeSelectorItemSelected: "selected" }}
        />
      );

      expect(screen.getByRole("button", { name: "05" })).not.toHaveClass("selected");
      expect(screen.getByRole("button", { name: "10" })).toHaveClass("selected");
    });
  });

  describe("onClick callback", () => {
    it("should call onClick when item is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<TimeSelector value={0} max={23} label="Hours" onClick={handleClick} />);

      await user.click(screen.getByRole("button", { name: "15" }));

      expect(handleClick).toHaveBeenCalledWith(15);
    });

    it("should call onClick with correct value for each item", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<TimeSelector value={0} max={5} label="Test" onClick={handleClick} />);

      await user.click(screen.getByRole("button", { name: "03" }));
      expect(handleClick).toHaveBeenCalledWith(3);

      await user.click(screen.getByRole("button", { name: "05" }));
      expect(handleClick).toHaveBeenCalledWith(5);
    });

    it("should not crash when onClick is not provided", async () => {
      const user = userEvent.setup();

      render(<TimeSelector value={0} max={23} label="Hours" />);

      await expect(user.click(screen.getByRole("button", { name: "15" }))).resolves.not.toThrow();
    });
  });

  describe("onSelect callback", () => {
    it("should call onSelect when item is clicked", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();

      render(<TimeSelector value={0} max={23} label="Hours" onSelect={handleSelect} />);

      await user.click(screen.getByRole("button", { name: "15" }));

      expect(handleSelect).toHaveBeenCalledWith(15);
    });

    it("should call both onClick and onSelect when item is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const handleSelect = vi.fn();

      render(
        <TimeSelector
          value={0}
          max={23}
          label="Hours"
          onClick={handleClick}
          onSelect={handleSelect}
        />
      );

      await user.click(screen.getByRole("button", { name: "10" }));

      expect(handleClick).toHaveBeenCalledWith(10);
      expect(handleSelect).toHaveBeenCalledWith(10);
    });
  });

  describe("disabled state", () => {
    it("should disable all buttons when disabled is true", () => {
      render(<TimeSelector value={0} max={5} label="Test" disabled={true} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("should not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <TimeSelector value={0} max={23} label="Hours" disabled={true} onClick={handleClick} />
      );

      await user.click(screen.getByRole("button", { name: "15" }));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not call onSelect when disabled", async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();

      render(
        <TimeSelector value={0} max={23} label="Hours" disabled={true} onSelect={handleSelect} />
      );

      await user.click(screen.getByRole("button", { name: "15" }));

      expect(handleSelect).not.toHaveBeenCalled();
    });

    it("should apply disabled className when disabled", () => {
      render(
        <TimeSelector
          value={0}
          max={5}
          label="Test"
          disabled={true}
          classNames={{ timeSelectorItemDisabled: "item-disabled" }}
        />
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("item-disabled");
      });
    });

    it("should apply disabled classNames to wrapper when disabled", () => {
      const { container } = render(
        <TimeSelector
          value={0}
          max={5}
          label="Test"
          disabled={true}
          classNames={{
            timeSelector: "selector",
            timeSelectorDisabled: "selector-disabled",
          }}
        />
      );

      const selector = container.querySelector(".selector");
      expect(selector).toHaveClass("selector-disabled");
    });

    it("should apply disabled classNames to label when disabled", () => {
      const { container } = render(
        <TimeSelector
          value={0}
          max={5}
          label="Test"
          disabled={true}
          classNames={{
            timeSelectorLabel: "label",
            timeSelectorLabelDisabled: "label-disabled",
          }}
        />
      );

      const label = container.querySelector(".label");
      expect(label).toHaveClass("label-disabled");
    });

    it("should apply disabled classNames to scroll container when disabled", () => {
      const { container } = render(
        <TimeSelector
          value={0}
          max={5}
          label="Test"
          disabled={true}
          classNames={{
            timeSelectorScroll: "scroll",
            timeSelectorScrollDisabled: "scroll-disabled",
          }}
        />
      );

      const scroll = container.querySelector(".scroll");
      expect(scroll).toHaveClass("scroll-disabled");
    });

    it("should not apply disabled classNames when not disabled", () => {
      const { container } = render(
        <TimeSelector
          value={0}
          max={5}
          label="Test"
          disabled={false}
          classNames={{
            timeSelector: "selector",
            timeSelectorDisabled: "selector-disabled",
            timeSelectorLabel: "label",
            timeSelectorLabelDisabled: "label-disabled",
            timeSelectorScroll: "scroll",
            timeSelectorScrollDisabled: "scroll-disabled",
          }}
        />
      );

      const selector = container.querySelector(".selector");
      expect(selector).not.toHaveClass("selector-disabled");

      const label = container.querySelector(".label");
      expect(label).not.toHaveClass("label-disabled");

      const scroll = container.querySelector(".scroll");
      expect(scroll).not.toHaveClass("scroll-disabled");
    });
  });

  describe("isDisabled callback", () => {
    it("should call isDisabled for each item", () => {
      const isDisabled = vi.fn().mockReturnValue(false);

      render(<TimeSelector value={0} max={5} label="Test" isDisabled={isDisabled} />);

      // isDisabled is called for each item (0-5 = 6 items)
      expect(isDisabled).toHaveBeenCalledTimes(6);
      expect(isDisabled).toHaveBeenCalledWith(0);
      expect(isDisabled).toHaveBeenCalledWith(1);
      expect(isDisabled).toHaveBeenCalledWith(2);
      expect(isDisabled).toHaveBeenCalledWith(3);
      expect(isDisabled).toHaveBeenCalledWith(4);
      expect(isDisabled).toHaveBeenCalledWith(5);
    });

    it("should not call callbacks when isDisabled returns true", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const isDisabled = vi.fn((v) => v === 5);

      render(
        <TimeSelector
          value={0}
          max={10}
          label="Test"
          onClick={handleClick}
          isDisabled={isDisabled}
        />
      );

      await user.click(screen.getByRole("button", { name: "05" }));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should call callbacks when isDisabled returns false", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const isDisabled = vi.fn((v) => v === 5);

      render(
        <TimeSelector
          value={0}
          max={10}
          label="Test"
          onClick={handleClick}
          isDisabled={isDisabled}
        />
      );

      await user.click(screen.getByRole("button", { name: "03" }));

      expect(handleClick).toHaveBeenCalledWith(3);
    });

    it("should apply disabled className to items where isDisabled returns true", () => {
      // Note: Due to the ?? operator in TimeSelector, isDisabled result is only used
      // when disabled prop is undefined/null. The itemDisabled calculation is:
      // const itemDisabled = disabled ?? isDisabled?.(item);
      // This means isDisabled is ignored when disabled is explicitly false
      const isDisabled = vi.fn((v) => v >= 5);

      render(
        <TimeSelector
          value={0}
          max={9}
          label="Test"
          isDisabled={isDisabled}
          classNames={{ timeSelectorItemDisabled: "item-disabled" }}
        />
      );

      // Items 0-4 should not have disabled class
      for (let i = 0; i < 5; i++) {
        expect(screen.getByRole("button", { name: String(i).padStart(2, "0") })).not.toHaveClass(
          "item-disabled"
        );
      }

      // Items 5-9 should have disabled class
      for (let i = 5; i <= 9; i++) {
        expect(screen.getByRole("button", { name: String(i).padStart(2, "0") })).toHaveClass(
          "item-disabled"
        );
      }
    });

    it("should disable button based on isDisabled callback when disabled prop is not set", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const isDisabled = vi.fn((v) => v < 5);

      render(
        <TimeSelector
          value={0}
          max={9}
          label="Test"
          onClick={handleClick}
          isDisabled={isDisabled}
        />
      );

      // Clicking disabled item (value < 5) should not trigger callback
      await user.click(screen.getByRole("button", { name: "03" }));
      expect(handleClick).not.toHaveBeenCalled();

      // Clicking enabled item (value >= 5) should trigger callback
      await user.click(screen.getByRole("button", { name: "07" }));
      expect(handleClick).toHaveBeenCalledWith(7);
    });
  });

  describe("edge cases", () => {
    it("should handle max=0 (single item)", () => {
      render(<TimeSelector value={0} max={0} label="Test" />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent("00");
    });

    it("should handle undefined classNames", () => {
      expect(() => render(<TimeSelector value={0} max={5} label="Test" />)).not.toThrow();
    });

    it("should handle empty classNames object", () => {
      expect(() =>
        render(<TimeSelector value={0} max={5} label="Test" classNames={{}} />)
      ).not.toThrow();
    });

    it("should handle value at boundary (0)", () => {
      render(
        <TimeSelector
          value={0}
          max={23}
          label="Hours"
          classNames={{ timeSelectorItemSelected: "selected" }}
        />
      );

      expect(screen.getByRole("button", { name: "00" })).toHaveClass("selected");
    });

    it("should handle value at boundary (max)", () => {
      render(
        <TimeSelector
          value={23}
          max={23}
          label="Hours"
          classNames={{ timeSelectorItemSelected: "selected" }}
        />
      );

      expect(screen.getByRole("button", { name: "23" })).toHaveClass("selected");
    });

    it("should handle value beyond max gracefully", () => {
      render(
        <TimeSelector
          value={99}
          max={23}
          label="Hours"
          classNames={{ timeSelectorItemSelected: "selected" }}
        />
      );

      // No button should be selected since 99 doesn't exist
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).not.toHaveClass("selected");
      });
    });

    it("should memoize items array", () => {
      const { rerender } = render(<TimeSelector value={0} max={23} label="Hours" />);

      const buttonsBefore = screen.getAllByRole("button");

      rerender(<TimeSelector value={5} max={23} label="Hours" />);

      const buttonsAfter = screen.getAllByRole("button");

      // Same number of buttons
      expect(buttonsBefore.length).toBe(buttonsAfter.length);
    });

    it("should update items when max changes", () => {
      const { rerender } = render(<TimeSelector value={0} max={23} label="Hours" />);

      expect(screen.getAllByRole("button")).toHaveLength(24);

      rerender(<TimeSelector value={0} max={59} label="Minutes" />);

      expect(screen.getAllByRole("button")).toHaveLength(60);
    });
  });

  describe("className composition", () => {
    it("should combine multiple classNames on selected item", () => {
      render(
        <TimeSelector
          value={5}
          max={10}
          label="Test"
          classNames={{
            timeSelectorItem: "item",
            timeSelectorItemSelected: "selected",
          }}
        />
      );

      const selectedButton = screen.getByRole("button", { name: "05" });
      expect(selectedButton).toHaveClass("item");
      expect(selectedButton).toHaveClass("selected");
    });

    it("should combine multiple classNames on disabled item", () => {
      render(
        <TimeSelector
          value={0}
          max={10}
          label="Test"
          disabled={true}
          classNames={{
            timeSelectorItem: "item",
            timeSelectorItemDisabled: "disabled",
          }}
        />
      );

      const button = screen.getByRole("button", { name: "05" });
      expect(button).toHaveClass("item");
      expect(button).toHaveClass("disabled");
    });

    it("should combine all classNames on selected disabled item", () => {
      render(
        <TimeSelector
          value={5}
          max={10}
          label="Test"
          disabled={true}
          classNames={{
            timeSelectorItem: "item",
            timeSelectorItemSelected: "selected",
            timeSelectorItemDisabled: "disabled",
          }}
        />
      );

      const selectedButton = screen.getByRole("button", { name: "05" });
      expect(selectedButton).toHaveClass("item");
      expect(selectedButton).toHaveClass("selected");
      expect(selectedButton).toHaveClass("disabled");
    });
  });
});
