import type React from "react";
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  type ChangeEvent,
  type KeyboardEvent,
  type FocusEvent,
} from "react";

import type { DateInputProps } from "../types/date-input.types";
import {
  formatDateInput,
  parseDateInput,
  isDateInBounds,
  applyMask,
} from "../utils/date-input.utils";

// Default calendar icon SVG
const CalendarIcon = (): React.JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// Clear icon SVG
const ClearIcon = (): React.JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Default class names
const defaultClassNames = {
  root: "relative inline-flex items-center",
  rootDisabled: "opacity-50 cursor-not-allowed",
  rootInvalid: "",
  rootFocused: "",
  inputWrapper: "relative flex items-center w-full",
  input:
    "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  inputDisabled: "bg-gray-100 cursor-not-allowed",
  inputInvalid: "border-red-500 focus:ring-red-500 focus:border-red-500",
  iconContainer: "absolute flex items-center justify-center text-gray-400",
  iconContainerLeft: "left-2",
  iconContainerRight: "right-2",
  icon: "cursor-pointer hover:text-gray-600",
  clearButton:
    "absolute right-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer",
  clearButtonDisabled: "cursor-not-allowed opacity-50",
};

/**
 * DateInput component with mask formatting
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput(props, ref) {
    const {
      value,
      onChange,
      dateFormat = "MM/DD/YYYY",
      placeholder,
      showIcon = true,
      iconPosition = "right",
      icon,
      isClearable = false,
      disabled = false,
      readOnly = false,
      name,
      id,
      classNames,
      onFocus,
      onBlur,
      onInvalid,
      onIconClick,
      minDate,
      maxDate,
      ariaLabel,
      ariaDescribedBy,
      tabIndex,
      autoFocus = false,
    } = props;

    // Internal state for the input value
    const [inputValue, setInputValue] = useState<string>(() =>
      value ? formatDateInput(value, dateFormat) : ""
    );
    const [isFocused, setIsFocused] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Sync input value when controlled value changes externally
    useEffect(() => {
      if (value) {
        const formatted = formatDateInput(value, dateFormat);
        setInputValue(formatted);
        setIsInvalid(false);
      } else if (value === null) {
        setInputValue("");
        setIsInvalid(false);
      }
    }, [value, dateFormat]);

    // Auto focus
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

    // Merge refs
    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Handle input change with live mask insertion and caret preservation
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const newValue = target.value;
        const selectionStart = target.selectionStart ?? newValue.length;

        // Apply mask (inserts literals like / or - while typing)
        const masked = applyMask(newValue, dateFormat, inputValue);
        setInputValue(masked);
        setIsInvalid(false);

        // Preserve caret position relative to digits entered
        const digitsBefore = newValue.slice(0, selectionStart).replace(/\D/g, "").length;

        requestAnimationFrame(() => {
          const el = inputRef.current;
          if (!el) return;

          let digits = 0;
          let pos = 0;
          for (; pos < masked.length; pos++) {
            const char = masked[pos];
            if (char !== undefined && /\d/.test(char)) digits++;
            if (digits === digitsBefore) {
              pos++;
              break;
            }
          }

          if (digitsBefore === 0) pos = 0;
          if (pos > masked.length) pos = masked.length;
          el.setSelectionRange(pos, pos);
        });

        // Do not call onChange here; keep existing behavior of emitting parsed value on blur
      },
      [dateFormat, inputValue]
    );

    // Handle blur - validate and emit change
    const handleBlur = useCallback(
      (_e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);

        const trimmedValue = inputValue.trim();

        if (trimmedValue === "") {
          // Empty input - clear the value
          if (value !== null) {
            onChange?.(null);
          }
          setIsInvalid(false);
          onBlur?.(null);
          return;
        }

        // Try to parse the input
        const parsed = parseDateInput(trimmedValue, dateFormat);

        if (parsed) {
          // Check if date is in bounds
          if (!isDateInBounds(parsed, minDate, maxDate)) {
            setIsInvalid(true);
            onInvalid?.(trimmedValue);
            onBlur?.(null);
            return;
          }

          // Valid date
          setIsInvalid(false);
          const formatted = formatDateInput(parsed, dateFormat);
          setInputValue(formatted);
          onChange?.(parsed);
          onBlur?.(parsed);
        } else {
          // Invalid date
          setIsInvalid(true);
          onInvalid?.(trimmedValue);
          onBlur?.(null);
        }
      },
      [inputValue, value, dateFormat, minDate, maxDate, onChange, onBlur, onInvalid]
    );

    // Handle focus
    const handleFocus = useCallback(() => {
      setIsFocused(true);
      onFocus?.();
    }, [onFocus]);

    // Handle keyboard events
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        // Clear on Escape
        if (e.key === "Escape" && isClearable) {
          setInputValue("");
          setIsInvalid(false);
          onChange?.(null);
        }
      },
      [isClearable, onChange]
    );

    // Handle clear button click
    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !readOnly) {
          setInputValue("");
          setIsInvalid(false);
          onChange?.(null);
          inputRef.current?.focus();
        }
      },
      [disabled, readOnly, onChange]
    );

    // Handle icon click
    const handleIconClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (!disabled && !readOnly) {
          onIconClick?.();
        }
      },
      [disabled, readOnly, onIconClick]
    );

    // Build class names
    const rootClassName = [
      classNames?.root ?? defaultClassNames.root,
      disabled && (classNames?.rootDisabled ?? defaultClassNames.rootDisabled),
      isInvalid && (classNames?.rootInvalid ?? defaultClassNames.rootInvalid),
      isFocused && (classNames?.rootFocused ?? defaultClassNames.rootFocused),
    ]
      .filter(Boolean)
      .join(" ");

    const inputClassName = [
      classNames?.input ?? defaultClassNames.input,
      disabled && (classNames?.inputDisabled ?? defaultClassNames.inputDisabled),
      isInvalid && (classNames?.inputInvalid ?? defaultClassNames.inputInvalid),
      showIcon && iconPosition === "left" && "pl-9",
      showIcon && iconPosition === "right" && "pr-9",
      isClearable && inputValue && "pr-16",
    ]
      .filter(Boolean)
      .join(" ");

    const iconContainerClassName = [
      classNames?.iconContainer ?? defaultClassNames.iconContainer,
      iconPosition === "left"
        ? (classNames?.iconContainerLeft ?? defaultClassNames.iconContainerLeft)
        : (classNames?.iconContainerRight ?? defaultClassNames.iconContainerRight),
    ]
      .filter(Boolean)
      .join(" ");

    // Generate placeholder
    const displayPlaceholder = placeholder ?? dateFormat;

    return (
      <div className={rootClassName}>
        <div className={classNames?.inputWrapper ?? defaultClassNames.inputWrapper}>
          {/* Calendar Icon (left position) */}
          {showIcon && iconPosition === "left" && (
            <button
              type="button"
              className={iconContainerClassName}
              onClick={handleIconClick}
              disabled={disabled}
              tabIndex={-1}
              aria-label="Open calendar"
            >
              <span className={classNames?.icon ?? defaultClassNames.icon}>
                {icon ?? <CalendarIcon />}
              </span>
            </button>
          )}

          {/* Input field */}
          <input
            ref={mergedRef}
            type="text"
            name={name}
            id={id}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={displayPlaceholder}
            disabled={disabled}
            readOnly={readOnly}
            className={inputClassName}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-invalid={isInvalid}
            tabIndex={tabIndex}
            autoComplete="off"
          />

          {/* Clear button */}
          {isClearable && inputValue && !disabled && !readOnly && (
            <button
              type="button"
              className={classNames?.clearButton ?? defaultClassNames.clearButton}
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear date"
            >
              <ClearIcon />
            </button>
          )}

          {/* Calendar Icon (right position) */}
          {showIcon && iconPosition === "right" && (
            <button
              type="button"
              className={iconContainerClassName}
              onClick={handleIconClick}
              disabled={disabled}
              tabIndex={-1}
              aria-label="Open calendar"
            >
              <span className={classNames?.icon ?? defaultClassNames.icon}>
                {icon ?? <CalendarIcon />}
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }
);

DateInput.displayName = "DateInput";
