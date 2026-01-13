import type { ReactNode } from "react";

/** Class names for DateInput styling */
export interface DateInputClassNames {
  /** Root container */
  root?: string;
  /** Disabled root */
  rootDisabled?: string;
  /** Invalid state */
  rootInvalid?: string;
  /** Focused state */
  rootFocused?: string;
  /** Input wrapper */
  inputWrapper?: string;
  /** The text input element */
  input?: string;
  /** Disabled input */
  inputDisabled?: string;
  /** Invalid input */
  inputInvalid?: string;
  /** Icon container */
  iconContainer?: string;
  /** Icon container left position */
  iconContainerLeft?: string;
  /** Icon container right position */
  iconContainerRight?: string;
  /** Icon element */
  icon?: string;
  /** Clear button */
  clearButton?: string;
  /** Disabled clear button */
  clearButtonDisabled?: string;
}

/** DateInput component props */
export interface DateInputProps {
  /** Current selected date */
  value?: Date | null;
  /** Callback when date changes */
  onChange?: (date: Date | null) => void;
  /** Date format for display and parsing (default: "MM/DD/YYYY") */
  dateFormat?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Show calendar icon */
  showIcon?: boolean;
  /** Icon position */
  iconPosition?: "left" | "right";
  /** Custom icon element */
  icon?: ReactNode;
  /** Allow clearing the input */
  isClearable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
  /** Custom class names */
  classNames?: DateInputClassNames;
  /** Called when input is focused */
  onFocus?: () => void;
  /** Called when input loses focus */
  onBlur?: (date: Date | null) => void;
  /** Called on invalid input */
  onInvalid?: (value: string) => void;
  /** Called when icon is clicked */
  onIconClick?: () => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** aria-label for the input */
  ariaLabel?: string;
  /** aria-describedby for the input */
  ariaDescribedBy?: string;
  /** Tab index */
  tabIndex?: number;
  /** Auto focus on mount */
  autoFocus?: boolean;
}

/** Format token definition */
export interface FormatToken {
  pattern: RegExp;
  length: number;
  placeholder: string;
  validate: (value: string, max: number) => boolean;
  getValue: (date: Date) => string;
  setValue: (date: Date, value: number) => Date;
  max: number;
}

/** Parsed format segment */
export interface FormatSegment {
  type: "token" | "literal";
  value: string;
  token?: string;
  length?: number;
}
