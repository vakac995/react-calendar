import type { ReactNode } from "react";

import type { CalendarClassNames } from "./calendar.types";

/**
 * Props for the Portal component
 */
export interface PortalProps {
  /**
   * Content to render in the portal
   */
  children: ReactNode;
  /**
   * Container element to render the portal into
   * @default document.body
   */
  container?: HTMLElement | null;
  /**
   * Whether the portal is disabled (renders children in place)
   * @default false
   */
  disabled?: boolean;
}

/**
 * Props for the Popover component
 */
export interface PopoverProps {
  /**
   * Content to display in the popover
   */
  children: ReactNode;
  /**
   * Whether the popover is open
   */
  isOpen: boolean;
  /**
   * Callback when the popover should close
   */
  onClose: () => void;
  /**
   * Reference element to position the popover relative to
   */
  anchorRef: React.RefObject<HTMLElement | null>;
  /**
   * Preferred placement of the popover
   * @default "bottom-start"
   */
  placement?: PopoverPlacement;
  /**
   * Offset from the anchor element [x, y]
   * @default [0, 4]
   */
  offset?: [number, number];
  /**
   * Whether to close on click outside
   * @default true
   */
  closeOnClickOutside?: boolean;
  /**
   * Whether to close on Escape key
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Whether to use a portal
   * @default true
   */
  usePortal?: boolean;
  /**
   * Container for the portal
   * @default document.body
   */
  portalContainer?: HTMLElement | null;
  /**
   * Z-index for the popover
   * @default 1000
   */
  zIndex?: number;
  /**
   * Custom class names
   */
  classNames?: PopoverClassNames;
  /**
   * Whether to auto-focus the popover when opened
   * @default false
   */
  autoFocus?: boolean;
  /**
   * Whether to restore focus when closed
   * @default true
   */
  restoreFocus?: boolean;
  /**
   * Animation duration in ms
   * @default 150
   */
  animationDuration?: number;
}

/**
 * Placement options for the popover
 */
export type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

/**
 * Class names for styling the popover
 */
export interface PopoverClassNames {
  /**
   * Root popover container
   */
  root?: string;
  /**
   * Content wrapper inside popover
   */
  content?: string;
  /**
   * Arrow element (if used)
   */
  arrow?: string;
}

/**
 * DatePicker props - combines DateInput + Calendar + Popover
 */
export interface DatePickerProps {
  /**
   * Selected date value
   */
  value?: Date | null;
  /**
   * Callback when date changes
   */
  onChange?: (date: Date | null) => void;
  /**
   * Date format for the input
   * @default "MM/DD/YYYY"
   */
  dateFormat?: string;
  /**
   * Placeholder text for empty input
   */
  placeholder?: string;
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  /**
   * Whether the picker is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the input is read-only
   * @default false
   */
  readOnly?: boolean;
  /**
   * Whether the calendar opens automatically on focus
   * @default false
   */
  openOnFocus?: boolean;
  /**
   * Whether clicking the icon opens the calendar
   * @default true
   */
  openOnIconClick?: boolean;
  /**
   * Whether the value is clearable
   * @default true
   */
  isClearable?: boolean;
  /**
   * Whether to show the calendar icon
   * @default true
   */
  showIcon?: boolean;
  /**
   * Icon position
   * @default "right"
   */
  iconPosition?: "left" | "right";
  /**
   * Custom icon element
   */
  icon?: React.ReactNode;
  /**
   * Whether to close calendar on date select
   * @default true
   */
  closeOnSelect?: boolean;
  /**
   * Popover placement
   * @default "bottom-start"
   */
  placement?: PopoverPlacement;
  /**
   * Name attribute for the input
   */
  name?: string;
  /**
   * ID attribute for the input
   */
  id?: string;
  /**
   * Callback when calendar opens
   */
  onOpen?: () => void;
  /**
   * Callback when calendar closes
   */
  onClose?: () => void;
  /**
   * Callback when input focuses
   */
  onFocus?: () => void;
  /**
   * Callback when input blurs
   */
  onBlur?: () => void;
  /**
   * Custom class names
   */
  classNames?: DatePickerClassNames;
  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
  /**
   * Tab index for the input
   */
  tabIndex?: number;
  /**
   * Whether to auto-focus on mount
   * @default false
   */
  autoFocus?: boolean;
  /**
   * First day of week (0 = Sunday, 1 = Monday, etc.)
   * @default 0
   */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Function to determine if a date is disabled
   */
  isDateDisabled?: (date: Date) => boolean;
  /**
   * Whether to show week numbers
   * @default false
   */
  showWeekNumbers?: boolean;
  /**
   * Whether to use portal for popover
   * @default true
   */
  usePortal?: boolean;
  /**
   * Portal container element
   */
  portalContainer?: HTMLElement | null;
  /**
   * Class names to pass to the Calendar component inside the DatePicker
   * Use this to style the calendar when it opens in the popover
   */
  calendarClassNames?: CalendarClassNames;
}

/**
 * Class names for DatePicker
 */
export interface DatePickerClassNames {
  /**
   * Root wrapper
   */
  root?: string;
  /**
   * Input wrapper
   */
  inputWrapper?: string;
  /**
   * Popover wrapper
   */
  popover?: string;
  /**
   * Calendar wrapper inside popover
   */
  calendar?: string;
}
