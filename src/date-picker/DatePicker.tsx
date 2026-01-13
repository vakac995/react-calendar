import { useState, useRef, useCallback, forwardRef, useEffect } from "react";

import type { DatePickerProps } from "../types/date-picker.types";
import type { DateTimeValue } from "../types";
import { DateInput } from "../date-input";
import { Calendar } from "../calendar";
import { Popover } from "./Popover";

// Default class names
const defaultClassNames = {
  root: "relative inline-block",
  inputWrapper: "",
  popover: "",
  calendar: "",
};

/**
 * DatePicker component - combines DateInput, Calendar, and Popover
 * Provides a complete date picking experience with text input and dropdown calendar
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const {
      value = null,
      onChange,
      dateFormat = "MM/DD/YYYY",
      placeholder,
      minDate,
      maxDate,
      disabled = false,
      readOnly = false,
      openOnFocus = false,
      openOnIconClick = true,
      isClearable = true,
      showIcon = true,
      iconPosition = "right",
      icon,
      closeOnSelect = true,
      placement = "bottom-start",
      name,
      id,
      onOpen,
      onClose,
      onFocus,
      onBlur,
      classNames,
      ariaLabel,
      tabIndex,
      autoFocus = false,
      firstDayOfWeek = 0,
      isDateDisabled,
      showWeekNumbers = false,
      usePortal = true,
      portalContainer,
      calendarClassNames,
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<Date | null>(value);
    const anchorRef = useRef<HTMLDivElement>(null);

    // Sync internal value with prop
    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // Handle open
    const handleOpen = useCallback(() => {
      if (!disabled && !readOnly) {
        setIsOpen(true);
        onOpen?.();
      }
    }, [disabled, readOnly, onOpen]);

    // Handle close
    const handleClose = useCallback(() => {
      setIsOpen(false);
      onClose?.();
    }, [onClose]);

    // Handle input focus
    const handleInputFocus = useCallback(() => {
      onFocus?.();
      if (openOnFocus) {
        handleOpen();
      }
    }, [openOnFocus, handleOpen, onFocus]);

    // Handle input blur
    const handleInputBlur = useCallback(() => {
      onBlur?.();
      // Don't close if clicking into the popover
    }, [onBlur]);

    // Handle icon click
    const handleIconClick = useCallback(() => {
      if (openOnIconClick) {
        if (isOpen) {
          handleClose();
        } else {
          handleOpen();
        }
      }
    }, [openOnIconClick, isOpen, handleOpen, handleClose]);

    // Handle input change (from typing)
    const handleInputChange = useCallback(
      (date: Date | null) => {
        setInternalValue(date);
        onChange?.(date);
      },
      [onChange]
    );

    // Handle calendar date selection (Calendar returns DateTimeValue)
    const handleCalendarChange = useCallback(
      (value: DateTimeValue | null) => {
        const date = value?.date ?? null;
        setInternalValue(date);
        onChange?.(date);

        if (closeOnSelect) {
          handleClose();
        }
      },
      [onChange, closeOnSelect, handleClose]
    );

    // Convert Date to DateTimeValue for Calendar
    const calendarValue: DateTimeValue | null = internalValue ? { date: internalValue } : null;

    // Determine which dates are disabled
    const handleIsDateDisabled = useCallback(
      (date: Date): boolean => {
        // Check min/max bounds
        if (minDate && date < minDate) {
          return true;
        }
        if (maxDate && date > maxDate) {
          return true;
        }
        // Check custom disabled function
        if (isDateDisabled?.(date)) {
          return true;
        }
        return false;
      },
      [minDate, maxDate, isDateDisabled]
    );

    return (
      <div className={classNames?.root ?? defaultClassNames.root}>
        <div ref={anchorRef} className={classNames?.inputWrapper ?? defaultClassNames.inputWrapper}>
          <DateInput
            ref={ref}
            value={internalValue}
            onChange={handleInputChange}
            dateFormat={dateFormat}
            placeholder={placeholder}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            readOnly={readOnly}
            isClearable={isClearable}
            showIcon={showIcon}
            iconPosition={iconPosition}
            icon={icon}
            name={name}
            id={id}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onIconClick={handleIconClick}
            ariaLabel={ariaLabel}
            tabIndex={tabIndex}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={autoFocus}
          />
        </div>

        <Popover
          isOpen={isOpen}
          onClose={handleClose}
          anchorRef={anchorRef}
          placement={placement}
          closeOnClickOutside={true}
          closeOnEscape={true}
          usePortal={usePortal}
          portalContainer={portalContainer}
          classNames={{ root: classNames?.popover }}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={true}
          restoreFocus={true}
        >
          <div className={classNames?.calendar ?? defaultClassNames.calendar}>
            <Calendar
              value={calendarValue}
              onChange={handleCalendarChange}
              minDate={minDate}
              maxDate={maxDate}
              weekStartsOn={firstDayOfWeek}
              isDateDisabled={handleIsDateDisabled}
              showWeekNumbers={showWeekNumbers}
              classNames={calendarClassNames}
            />
          </div>
        </Popover>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
