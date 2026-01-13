# Calendar Component - Feature Implementation Plan

## Overview

This document outlines the complete feature roadmap for the React Calendar component, including completed phases and upcoming enhancements.

**Package**: `@vakac995/react-calendar`  
**Version**: 1.0.15  
**Last Updated**: January 11, 2026

---

## Current Status Summary

### ✅ Completed Features (Phases 1-6)

| Feature | Status | Tests |
|---------|:------:|:-----:|
| Keyboard Navigation (WCAG 2.1) | ✅ | ✅ |
| Custom Disabled Dates (`isDateDisabled`) | ✅ | ✅ |
| Today/Clear Buttons | ✅ | ✅ |
| Focus Management | ✅ | ✅ |
| Month Picker View | ✅ | ✅ |
| Year Picker View | ✅ | ✅ |
| Multiple Months Display | ✅ | ✅ |
| Highlighted Dates | ✅ | ✅ |
| Date Formatting Utilities | ✅ | ✅ |
| Time Picker (scroll-based) | ✅ | ✅ |
| Date Range Selection | ✅ | ✅ |
| Week Numbers | ✅ | ✅ |
| Responsive Layout | ✅ | ✅ |
| DateInput with Mask | ✅ | ✅ |
| Popover/Dropdown Mode | ✅ | ✅ |
| Multiple Date Selection | ✅ | ✅ |
| Locale/i18n Support | ✅ | ✅ |
| Custom Date Formatting | ✅ | ✅ |
| Week Picker Mode | ✅ | ✅ |
| Quarter Picker Mode | ✅ | ✅ |

**Total Tests**: 742 passing  
**Bundle Size**: ~52 KB

---

## Competitive Gap Analysis

Comparing with top React calendar libraries (react-datepicker, MUI X, react-day-picker):

### Features Status

| Feature | react-datepicker | MUI X | react-day-picker | Ours |
|---------|:----------------:|:-----:|:----------------:|:----:|
| Date Input with Mask | ✅ | ✅ | ✅ | ✅ |
| Popover/Dropdown Mode | ✅ | ✅ | ✅ | ✅ |
| Multiple Date Selection | ✅ | ✅ | ✅ | ✅ |
| Locale/i18n Support | ✅ | ✅ | ✅ | ✅ |
| Custom Date Format | ✅ | ✅ | ✅ | ✅ |
| Inline Mode Toggle | ✅ | ✅ | ✅ | ✅ |
| Portal Rendering | ✅ | ✅ | ✅ | ✅ |
| Week Picker Mode | ✅ | ❌ | ✅ | ✅ |
| Quarter Picker Mode | ✅ | ✅ | ❌ | ✅ |
| Timezone Support | ✅ | ✅ | ✅ | ⏳ |
| Animations/Transitions | ❌ | ✅ | ✅ | ⏳ |

---

## Phase 5: Input Field Integration ✅ COMPLETED

**Priority**: 🔴 CRITICAL  
**Status**: ✅ COMPLETED  
**Tests**: 77 tests (DateInput: 46, DatePicker: 22, Popover: 9)

### 5.1 DateInput Component with Mask

#### Overview
Create a text input that allows users to type dates with automatic formatting and mask support.

#### Requirements
- Masked input with auto-formatting (e.g., `__/__/____` → `01/11/2026`)
- Support common date formats (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Parse typed input to Date on blur
- Invalid date handling with visual feedback
- Clearable input
- Calendar icon button to toggle picker

#### API Design

```typescript
interface DateInputProps {
  /** Current selected date */
  value?: Date | null;
  /** Callback when date changes */
  onChange?: (date: Date | null) => void;
  /** Date format for display and parsing */
  dateFormat?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Show calendar icon */
  showIcon?: boolean;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Custom icon element */
  icon?: React.ReactNode;
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
  onBlur?: () => void;
  /** Called on invalid input */
  onInvalid?: (value: string) => void;
}
```

#### Date Format Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `YYYY` | 4-digit year | 2026 |
| `YY` | 2-digit year | 26 |
| `MM` | Month with zero-padding | 01-12 |
| `M` | Month without padding | 1-12 |
| `DD` | Day with zero-padding | 01-31 |
| `D` | Day without padding | 1-31 |

#### Implementation Tasks
- [ ] Create `DateInput` component
- [ ] Implement input mask logic
- [ ] Add date parsing utilities
- [ ] Add format validation
- [ ] Style with Tailwind defaults
- [ ] Add keyboard shortcuts (clear on Backspace, etc.)
- [ ] Write unit tests

#### Files to Create/Modify
- `src/date-input/DateInput.tsx` - Main component
- `src/date-input/DateInput.test.tsx` - Tests
- `src/date-input/index.ts` - Exports
- `src/utils/date-format.utils.ts` - Format/parse utilities
- `src/utils/date-format.utils.test.ts` - Tests
- `src/types/date-input.types.ts` - Type definitions
- `src/styles/defaultClassNames.ts` - New classNames

---

### 5.2 Popover/Dropdown Integration

#### Overview
Wrap the calendar in a popover that shows/hides when clicking the input.

#### Requirements
- Toggle calendar visibility on input click/focus
- Position popover below/above input based on viewport
- Close on outside click
- Close on Escape key
- Close on date selection (configurable)
- Portal rendering support
- Customizable animation

#### API Design

```typescript
interface DatePickerProps extends CalendarProps {
  /** Render inline (always visible) or as dropdown */
  inline?: boolean;
  /** Render in a portal */
  withPortal?: boolean;
  /** Portal container element */
  portalContainer?: HTMLElement;
  /** Popover placement */
  placement?: 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end';
  /** Close calendar on date selection */
  closeOnSelect?: boolean;
  /** Close calendar on outside click */
  closeOnOutsideClick?: boolean;
  /** Called when calendar opens */
  onCalendarOpen?: () => void;
  /** Called when calendar closes */
  onCalendarClose?: () => void;
  /** Custom input component */
  customInput?: React.ReactElement;
  /** Show the popover arrow */
  showPopperArrow?: boolean;
}
```

#### Implementation Tasks
- [ ] Create `DatePicker` wrapper component
- [ ] Implement popover positioning logic
- [ ] Add portal support using React createPortal
- [ ] Implement click-outside detection
- [ ] Add open/close state management
- [ ] Integrate with `DateInput`
- [ ] Write unit tests

#### Files to Create/Modify
- `src/date-picker/DatePicker.tsx` - Main wrapper
- `src/date-picker/Popover.tsx` - Popover component
- `src/date-picker/Portal.tsx` - Portal wrapper
- `src/date-picker/DatePicker.test.tsx` - Tests
- `src/date-picker/index.ts` - Exports
- `src/hooks/useClickOutside.ts` - Hook
- `src/hooks/usePopoverPosition.ts` - Hook

---

## Phase 6: Extended Selection Modes ✅ COMPLETED

**Priority**: 🟡 HIGH  
**Status**: ✅ COMPLETED  
**Tests**: 23 tests (Multiple: 9, Week: 7, Quarter: 7)

### 6.1 Multiple Date Selection ✅ COMPLETED

#### Overview
Allow selecting multiple non-contiguous dates.

#### Implementation Summary
- Extended `SelectionMode` type to include `"multiple"`
- Added `MultipleDatesValue` type (`DateTimeValue[]`)
- Updated `CalendarValue<TMode>` generic type
- Updated `getMonthData` to handle multiple selection
- Updated `Calendar` component with toggle selection logic
- Dates are automatically sorted chronologically
- Clear button empties all selections
- 9 new tests added

#### Usage Example

```tsx
import { Calendar, MultipleDatesValue } from '@vakac995/react-calendar';

function MultipleSelect() {
  const [dates, setDates] = useState<MultipleDatesValue>([]);
  
  return (
    <Calendar
      mode="multiple"
      value={dates}
      onChange={setDates}
      showClearButton
    />
  );
}
```

#### Implementation Tasks
- [x] Extend `SelectionMode` type
- [x] Add `MultipleDatesValue` type
- [x] Update selection logic in Calendar
- [x] Update `DayCell` to handle multiple selection
- [ ] Add `maxSelections` constraint (future enhancement)
- [x] Update tests

---

### 6.2 Week Picker Mode ✅ COMPLETED

#### Overview
Allow selecting entire weeks at once.

#### Implementation Summary
- Extended `SelectionMode` to include `"week"`
- Added `WeekValue` type with `weekNumber`, `year`, `startDate`, and `endDate`
- Updated `CalendarValue<TMode>` generic to handle week mode
- Updated `getMonthData` to highlight entire week when selected
- Clicking any day selects the entire week (based on `weekStartsOn`)
- Week selection respects the `weekStartsOn` prop for week boundaries
- 7 new tests added for week picker mode

#### Usage Example

```tsx
import { Calendar, WeekValue } from '@vakac995/react-calendar';

function WeekPicker() {
  const [week, setWeek] = useState<WeekValue | null>(null);
  
  return (
    <Calendar
      mode="week"
      value={week}
      onChange={setWeek}
      showClearButton
    />
  );
}
```

#### Implementation Tasks
- [x] Add `week` selection mode
- [x] Create `WeekValue` type
- [x] Update Calendar rendering for week selection
- [x] Add week hover effect (via daySelected, dayRangeStart, dayRangeEnd classes)
- [x] Write tests

---

### 6.3 Quarter Picker Mode ✅ COMPLETED

#### Overview
Allow selecting entire quarters at once (Q1, Q2, Q3, Q4).

#### Implementation Summary
- Extended `SelectionMode` to include `"quarter"`
- Added `QuarterValue` type with `quarter` (1-4), `year`, `startDate`, and `endDate`
- Updated `CalendarValue<TMode>` generic to handle quarter mode
- Updated `getMonthData` to highlight all days in selected quarter
- Clicking any day selects the entire quarter (3 months)
- Quarter boundaries: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)
- 7 new tests added for quarter picker mode

#### Usage Example

```tsx
import { Calendar, QuarterValue } from '@vakac995/react-calendar';

function QuarterPicker() {
  const [quarter, setQuarter] = useState<QuarterValue | null>(null);
  
  return (
    <Calendar
      mode="quarter"
      value={quarter}
      onChange={setQuarter}
      showClearButton
    />
  );
}
```

#### Implementation Tasks
- [x] Add `quarter` selection mode
- [x] Create `QuarterValue` type
- [x] Update Calendar rendering for quarter selection
- [x] Calculate quarter boundaries (first day of first month to last day of last month)
- [x] Apply range styling for entire quarter
- [x] Write tests

---

## Phase 7: Internationalization (i18n) ✅ COMPLETED

**Priority**: 🟡 HIGH  
**Status**: ✅ COMPLETED  
**Tests**: 13 new tests for locale support

### 7.1 Locale Support ✅ COMPLETED

#### Overview
Full localization using native `Intl` APIs.

#### Implementation Summary
- Added `locale` prop to Calendar (default: "en-US")
- Auto-generated localized month and day names using `Intl.DateTimeFormat`
- Auto-detect `weekStartsOn` from locale (can be overridden explicitly)
- RTL support via `dir` attribute on root element
- Text direction auto-detected from locale

#### Features Implemented
- ✅ Localized month names (long format)
- ✅ Localized day names (short format)
- ✅ RTL support (Arabic, Hebrew, Farsi, Urdu)
- ✅ First day of week per locale
- ✅ Custom labels override locale labels

#### Usage Example

```tsx
// German locale - weeks start on Monday, German month/day names
<Calendar locale="de-DE" />

// Arabic - RTL layout, Arabic month/day names
<Calendar locale="ar-SA" />

// Japanese with explicit week start
<Calendar locale="ja-JP" weekStartsOn={1} />

// Override locale labels with custom labels
<Calendar locale="de-DE" labels={{ shortDays: ["SU", "MO", ...] }} />
```

#### Implementation Tasks
- [x] Create locale utility functions (already existed in date-input.utils.ts)
- [x] Add `locale` prop to Calendar
- [x] Auto-detect first day of week
- [x] Add RTL support
- [x] Update default labels to use locale
- [x] Write tests for different locales

---

### 7.2 Custom Date Formatting ✅ COMPLETED

#### Overview
Allow users to specify how dates are displayed.

#### Implementation Summary
The custom date formatting system is fully implemented with:
- `formatDate()` - Format date with options (locale, dateStyle, or custom pattern)
- `formatDateWithPattern()` - Format date using token-based pattern
- `parseDate()` - Parse string back to Date using pattern
- `FORMAT_TOKENS` - Complete token definitions for formatting

#### Built-in Format Tokens

| Token | Output | Description |
|-------|--------|-------------|
| `YYYY` | 2026 | 4-digit year |
| `YY` | 26 | 2-digit year |
| `MMMM` | January | Full month name (locale-aware) |
| `MMM` | Jan | Short month name (locale-aware) |
| `MM` | 01 | 2-digit month |
| `M` | 1 | Month number |
| `DD` | 11 | 2-digit day |
| `D` | 11 | Day number |
| `dddd` | Sunday | Full day name (locale-aware) |
| `ddd` | Sun | Short day name (locale-aware) |
| `HH` | 14 | 24-hour hour |
| `hh` | 02 | 12-hour hour |
| `H` | 14 | 24-hour hour (no pad) |
| `h` | 2 | 12-hour hour (no pad) |
| `mm` | 30 | Minutes |
| `ss` | 45 | Seconds |
| `a` | pm | am/pm |
| `A` | PM | AM/PM |

#### Usage Examples

```tsx
import { 
  formatDate, 
  formatDateWithPattern, 
  parseDate,
  formatDateInput 
} from "@vakac995/react-calendar";

// Using formatDate with options
formatDate(date);                                    // "Jan 15, 2026"
formatDate(date, { locale: "de-DE" });              // "15. Jan. 2026"
formatDate(date, { pattern: "YYYY-MM-DD" });        // "2026-01-15"
formatDate(date, { dateStyle: "full", locale: "fr-FR" }); // "jeudi 15 janvier 2026"

// Using formatDateWithPattern
formatDateWithPattern(date, "YYYY-MM-DD");          // "2026-01-15"
formatDateWithPattern(date, "MM/DD/YYYY");          // "01/15/2026"
formatDateWithPattern(date, "DD.MM.YYYY");          // "15.01.2026"

// Parsing dates
parseDate("2026-01-15", "YYYY-MM-DD");              // Date object
parseDate("01/15/2026", "MM/DD/YYYY");              // Date object

// DateInput uses dateFormat prop
<DateInput dateFormat="YYYY-MM-DD" />
<DateInput dateFormat="DD/MM/YYYY" />
```

#### Implementation Tasks
- [x] Create format token parser
- [x] Create date formatter
- [x] Create date parser
- [x] Integrate with DateInput
- [x] Write tests (120 tests for date utilities)

---

## Phase 8: Polish & Developer Experience

**Priority**: 🟢 MEDIUM  
**Status**: ⏳ PLANNED  
**Estimated Effort**: Medium

### 8.1 Preset Date Ranges

#### Overview
Quick selection buttons for common date ranges.

```typescript
interface DatePreset {
  label: string;
  getValue: () => DateRangeValue;
}

const defaultPresets: DatePreset[] = [
  { label: 'Today', getValue: () => ({ start: today, end: today }) },
  { label: 'Yesterday', getValue: () => ({ start: yesterday, end: yesterday }) },
  { label: 'This Week', getValue: () => ({ start: weekStart, end: weekEnd }) },
  { label: 'Last Week', getValue: () => ({ start: lastWeekStart, end: lastWeekEnd }) },
  { label: 'This Month', getValue: () => ({ start: monthStart, end: monthEnd }) },
  { label: 'Last Month', getValue: () => ({ start: lastMonthStart, end: lastMonthEnd }) },
  { label: 'Last 7 Days', getValue: () => ({ start: subDays(today, 6), end: today }) },
  { label: 'Last 30 Days', getValue: () => ({ start: subDays(today, 29), end: today }) },
];

interface CalendarProps {
  /** Show preset buttons */
  showPresets?: boolean;
  /** Custom preset definitions */
  presets?: DatePreset[];
  /** Preset position */
  presetPosition?: 'left' | 'right' | 'top' | 'bottom';
}
```

---

### 8.2 Animations & Transitions

#### Overview
Smooth transitions when navigating months/views.

```typescript
interface CalendarProps {
  /** Enable animations */
  animate?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
}
```

#### CSS Classes for Animation

```typescript
interface CalendarClassNames {
  // Animation classes
  monthEnter?: string;
  monthEnterActive?: string;
  monthExit?: string;
  monthExitActive?: string;
  viewTransition?: string;
}
```

---

### 8.3 Holiday Support

#### Overview
Display holidays with special styling and tooltips.

```typescript
interface Holiday {
  date: Date | string;
  name: string;
  type?: 'public' | 'religious' | 'observance';
}

interface CalendarProps {
  /** List of holidays to display */
  holidays?: Holiday[];
  /** Custom holiday renderer */
  renderHoliday?: (holiday: Holiday, date: Date) => React.ReactNode;
}
```

---

## Phase 9: Advanced Features (Future)

**Priority**: 🔵 LOW  
**Status**: ⏳ BACKLOG

### 9.1 Timezone Support
- Display dates in specific timezones
- Timezone selector component
- UTC/local conversion utilities

### 9.2 Non-Gregorian Calendars
- Persian (Jalali) calendar
- Hebrew calendar
- Buddhist (Thai) calendar
- Hijri (Islamic) calendar

### 9.3 Time Picker Enhancements
- Clock face picker (analog style)
- Time intervals (15/30/60 min)
- Time zone display
- 12/24 hour format toggle

---

## Implementation Priority Order

### Sprint 1 (Current)
1. ⬜ DateInput component with mask
2. ⬜ Popover/Dropdown wrapper
3. ⬜ DatePicker (combined component)

### Sprint 2
4. Multiple date selection mode
5. Locale support (Intl-based)
6. Custom date format

### Sprint 3
7. Week picker mode
8. Preset date ranges
9. Holiday support

### Sprint 4
10. Animations
11. Time picker enhancements
12. Documentation & examples

---

## API Summary (After Phase 5-7)

### New Exports

```typescript
// Main components
export { Calendar } from './calendar';
export { DateInput } from './date-input';
export { DatePicker } from './date-picker';
export { TimePicker } from './time-picker';

// Types
export type {
  CalendarProps,
  DateInputProps,
  DatePickerProps,
  SelectionMode,
  CalendarValue,
  DateTimeValue,
  DateRangeValue,
  MultipleValue,
  TimeValue,
  CalendarClassNames,
  DateInputClassNames,
} from './types';

// Utilities
export {
  formatDate,
  parseDate,
  isValidDate,
  isSameDay,
  isDateInRange,
  addDays,
  addMonths,
  addYears,
  getMonthData,
  getWeekNumber,
} from './utils';
```

### Usage Examples

```tsx
// Simple date input with calendar dropdown
<DatePicker
  value={date}
  onChange={setDate}
  dateFormat="MM/DD/YYYY"
  placeholder="Select a date"
/>

// Date range with presets
<DatePicker
  mode="range"
  value={range}
  onChange={setRange}
  showPresets
  numberOfMonths={2}
/>

// Multiple date selection
<DatePicker
  mode="multiple"
  value={dates}
  onChange={setDates}
  maxSelections={5}
/>

// Inline calendar (always visible)
<DatePicker
  value={date}
  onChange={setDate}
  inline
/>

// Localized calendar
<DatePicker
  value={date}
  onChange={setDate}
  locale="de-DE"
/>
```

---

## File Structure (After Phase 5-7)

```
src/
├── calendar/
│   ├── Calendar.tsx
│   ├── Calendar.test.tsx
│   └── index.ts
├── date-input/
│   ├── DateInput.tsx
│   ├── DateInput.test.tsx
│   └── index.ts
├── date-picker/
│   ├── DatePicker.tsx
│   ├── DatePicker.test.tsx
│   ├── Popover.tsx
│   ├── Portal.tsx
│   └── index.ts
├── time-picker/
│   ├── TimePicker.tsx
│   ├── TimeSelector.tsx
│   └── index.ts
├── hooks/
│   ├── useClickOutside.ts
│   ├── usePopoverPosition.ts
│   └── index.ts
├── utils/
│   ├── date.utils.ts
│   ├── date-format.utils.ts
│   ├── time.utils.ts
│   ├── locale.utils.ts
│   ├── cn.ts
│   └── index.ts
├── types/
│   ├── calendar.types.ts
│   ├── date-input.types.ts
│   └── index.ts
├── styles/
│   ├── defaultClassNames.ts
│   ├── defaultLabels.tsx
│   └── index.ts
├── constants/
│   ├── calendar.constants.ts
│   └── index.ts
├── App.tsx (demo)
├── main.tsx (demo entry)
└── index.ts (library exports)
```

---

## Completed Phases Reference

### Phase 1: Critical Accessibility & Core Features ✅

#### 1.1 Keyboard Navigation (WCAG 2.1 Compliance) ✅
| Key | Action |
|-----|--------|
| `Arrow Left` | Move focus to previous day |
| `Arrow Right` | Move focus to next day |
| `Arrow Up` | Move focus to same day in previous week |
| `Arrow Down` | Move focus to same day in next week |
| `Enter` / `Space` | Select focused day |
| `Page Up` | Move to previous month |
| `Page Down` | Move to next month |
| `Shift + Page Up` | Move to previous year |
| `Shift + Page Down` | Move to next year |
| `Home` | Move to first day of current week |
| `End` | Move to last day of current week |
| `Escape` | Blur calendar / close picker (callback) |

#### 1.2 Custom Disabled Dates Callback ✅
```typescript
isDateDisabled?: (date: Date) => boolean;
```

---

### Phase 2: User Experience Enhancements ✅

#### 2.1 Today Button ✅
```typescript
showTodayButton?: boolean;
onTodayClick?: () => void;
```

#### 2.2 Clear Selection Button ✅
```typescript
showClearButton?: boolean;
onClear?: () => void;
```

#### 2.3 Focus Management ✅
```typescript
autoFocus?: boolean;
onFocusChange?: (date: Date | null) => void;
```

---

### Phase 3: Advanced Navigation Features ✅

#### 3.1 Month/Year Picker Views ✅
```typescript
type CalendarView = 'days' | 'months' | 'years';
view?: CalendarView;
defaultView?: CalendarView;
onViewChange?: (view: CalendarView) => void;
```

#### 3.2 Multiple Months Display ✅
```typescript
numberOfMonths?: number; // Default: 1
```

---

### Phase 4: Nice-to-Have Features ✅

#### 4.1 Highlighted/Marked Dates ✅
```typescript
highlightedDates?: Date[] | HighlightedDate[];
```

#### 4.2 Date Formatting Utilities ✅
```typescript
export function formatDate(date: Date, options?: FormatDateOptions): string;
export function formatDateWithPattern(date: Date, pattern: string): string;
export function formatTime(hours: number, minutes: number, seconds?: number, options?: FormatTimeOptions): string;
export function parseDate(dateString: string, pattern?: string): Date | null;
export function getRelativeDate(date: Date, baseDate?: Date): string;
```

---

## Breaking Changes Log

### v1.2.0 (Phase 5) - Upcoming
- **New**: `DateInput` component exported
- **New**: `DatePicker` component exported (combines DateInput + Calendar)

### v1.1.0 (Phases 1-4) - Completed
- Calendar `<select>` elements replaced with `<button>` elements in header
- New classNames: `headerTitleButton`, `headerTitleButtonDisabled`

---

## Test Coverage Goals

| Area | Current | Target |
|------|:-------:|:------:|
| Calendar | 253 tests | 280+ |
| DateInput | 0 tests | 40+ |
| DatePicker | 0 tests | 50+ |
| Time Picker | 25 tests | 30+ |
| Utilities | 150+ tests | 180+ |
| **Total** | **629 tests** | **800+** |

---

## Performance Benchmarks

| Metric | Current | Target |
|--------|:-------:|:------:|
| Bundle Size (gzip) | ~18 KB | <20 KB |
| Initial Render | <16ms | <16ms |
| Re-render | <8ms | <8ms |
| Accessibility Score | 100 | 100 |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT © 2026
