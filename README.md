# @vakac995/react-calendar

[![CI](https://github.com/vakac995/react-calendar/actions/workflows/ci.yml/badge.svg)](https://github.com/vakac995/react-calendar/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@vakac995/react-calendar)](https://www.npmjs.com/package/@vakac995/react-calendar)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@vakac995/react-calendar)](https://bundlephobia.com/package/@vakac995/react-calendar)
[![Coverage](https://img.shields.io/badge/coverage-97%25-brightgreen.svg)](https://github.com/vakac995/react-calendar)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A flexible, customizable React calendar component with date range and time picker support.

- 📅 **Multiple selection modes**: Single, Range, Multiple dates, Week, Quarter
- ⏰ Integrated time picker with hours, minutes, seconds
- 📆 **DatePicker component** with text input and popover calendar
- 🎨 Fully customizable via `classNames` prop (works with Tailwind, CSS Modules, etc.)
- 🌍 **Locale support** with automatic day/month name localization
- 💪 Full TypeScript support
- 📦 Tree-shakeable ES modules
- 🪶 Zero dependencies (only React as peer dependency)

## tl;dr

- Install: `npm install @vakac995/react-calendar`
- Import: `import { Calendar } from '@vakac995/react-calendar'`
- Use: `<Calendar value={value} onChange={setValue} />`

## Demo

**[📺 Live Demo](https://react-calendar-demo.pages.dev/)** — Try all features including range selection, time picker, and custom styling.

## Installation

```bash
npm install @vakac995/react-calendar
```

```bash
yarn add @vakac995/react-calendar
```

```bash
pnpm add @vakac995/react-calendar
```

### Compatibility

- React 18.0.0 or later
- TypeScript 5.0 or later (optional, but recommended)

## Getting Started

### Basic Usage

```tsx
import { useState } from 'react';
import { Calendar, type DateTimeValue } from '@vakac995/react-calendar';

function App() {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <Calendar
      mode="single"
      value={value}
      onChange={setValue}
    />
  );
}
```

### Date Range Selection

```tsx
import { useState } from 'react';
import { Calendar, type DateRangeValue } from '@vakac995/react-calendar';

function App() {
  const [range, setRange] = useState<DateRangeValue | null>(null);

  return (
    <Calendar
      mode="range"
      value={range}
      onChange={setRange}
    />
  );
}
```

### With Time Picker

```tsx
<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  showTime
  showSeconds
  timePosition="bottom"
/>
```

### Multiple Dates Selection

```tsx
import { useState } from 'react';
import { Calendar, type MultipleDatesValue } from '@vakac995/react-calendar';

function App() {
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

### Week Picker

```tsx
import { useState } from 'react';
import { Calendar, type WeekValue } from '@vakac995/react-calendar';

function App() {
  const [week, setWeek] = useState<WeekValue | null>(null);

  return (
    <Calendar
      mode="week"
      value={week}
      onChange={setWeek}
      showWeekNumbers
    />
  );
}
```

### Quarter Picker

```tsx
import { useState } from 'react';
import { Calendar, type QuarterValue } from '@vakac995/react-calendar';

function App() {
  const [quarter, setQuarter] = useState<QuarterValue | null>(null);

  return (
    <Calendar
      mode="quarter"
      value={quarter}
      onChange={setQuarter}
    />
  );
}
```

### Today & Clear Buttons

```tsx
<Calendar
  value={value}
  onChange={setValue}
  showTodayButton   // Jump to today and select it
  showClearButton   // Clear the selection
/>
```

### Multi-Month View

```tsx
<Calendar
  mode="range"
  value={value}
  onChange={setValue}
  numberOfMonths={2}  // Show 2 months side by side
/>
```

Time picker supports three positions:
- `"bottom"` (default) — Time picker below the calendar
- `"top"` — Time picker above the calendar  
- `"side"` — Time picker to the right of the calendar

### Responsive Layout

The calendar automatically adapts to its container width using ResizeObserver:

```tsx
<Calendar
  mode="range"
  value={value}
  onChange={setValue}
  showTime
  timePosition="side"
  layout="auto"        // Auto-detect based on container width
  mobileBreakpoint={420} // Switch to mobile below 420px
/>
```

Layout modes:
- `"auto"` (default) — Automatically switches based on container width
- `"desktop"` — Always use desktop layout  
- `"mobile"` — Always use mobile layout

On mobile layout:
- `timePosition="side"` is automatically converted to `"bottom"`
- Time pickers become collapsible accordions to save space

### Date Constraints

```tsx
<Calendar
  value={value}
  onChange={setValue}
  minDate={new Date(2024, 0, 1)}
  maxDate={new Date(2024, 11, 31)}
/>
```

### Highlighted Dates

```tsx
<Calendar
  value={value}
  onChange={setValue}
  highlightedDates={[
    new Date(2024, 5, 15),
    new Date(2024, 5, 20),
    new Date(2024, 5, 25),
  ]}
/>
```

### Custom Date Disabling

```tsx
<Calendar
  value={value}
  onChange={setValue}
  isDateDisabled={(date) => date.getDay() === 0} // Disable Sundays
/>
```

### Locale Support

```tsx
<Calendar
  value={value}
  onChange={setValue}
  locale="fr-FR"  // French locale - auto-localizes day/month names
  weekStartsOn={1}
/>
```

### Week Configuration

```tsx
<Calendar
  value={value}
  onChange={setValue}
  weekStartsOn={1}      // Monday (0 = Sunday, 1 = Monday, etc.)
  showWeekNumbers       // Show ISO week numbers
/>
```

## DatePicker Component

The `DatePicker` combines a text input with a popover calendar for a complete date picking experience.

### Basic DatePicker

```tsx
import { useState } from 'react';
import { DatePicker, defaultClassNames } from '@vakac995/react-calendar';

function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Select a date..."
      dateFormat="MM/DD/YYYY"
      calendarClassNames={defaultClassNames}  // Style the calendar
    />
  );
}
```

### DatePicker with Constraints

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  dateFormat="DD/MM/YYYY"
  minDate={new Date(2024, 0, 1)}
  maxDate={new Date(2024, 11, 31)}
  isClearable
  placeholder="Select date..."
  calendarClassNames={defaultClassNames}
/>
```

### DatePicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| null` | — | Selected date |
| `onChange` | `(date: Date \| null) => void` | — | Called when date changes |
| `dateFormat` | `string` | `"MM/DD/YYYY"` | Date format pattern |
| `placeholder` | `string` | — | Input placeholder |
| `minDate` | `Date` | — | Minimum selectable date |
| `maxDate` | `Date` | — | Maximum selectable date |
| `disabled` | `boolean` | `false` | Disable the picker |
| `readOnly` | `boolean` | `false` | Make input read-only |
| `isClearable` | `boolean` | `true` | Show clear button |
| `showIcon` | `boolean` | `true` | Show calendar icon |
| `iconPosition` | `'left' \| 'right'` | `'right'` | Icon position |
| `placement` | `PopoverPlacement` | `'bottom-start'` | Popover placement |
| `openOnFocus` | `boolean` | `false` | Open calendar on input focus |
| `closeOnSelect` | `boolean` | `true` | Close after selecting date |
| `calendarClassNames` | `CalendarClassNames` | — | Styles for the calendar |

## Styling

The calendar ships with minimal default styles and is designed to be customized. Every element can be styled via the `classNames` prop.

### With Tailwind CSS

```tsx
<Calendar
  value={value}
  onChange={setValue}
  classNames={{
    root: 'bg-white rounded-xl shadow-lg p-4',
    dayButton: 'w-10 h-10 rounded-full hover:bg-gray-100',
    daySelected: 'bg-blue-500 text-white hover:bg-blue-600',
    dayToday: 'border-2 border-blue-500',
    dayInRange: 'bg-blue-100',
  }}
/>
```

### Extending Default Styles

By default, custom `classNames` **replace** the defaults. If you want to **extend** instead:

```tsx
import { Calendar, extendClassNames, defaultClassNames } from '@vakac995/react-calendar';

<Calendar
  classNames={extendClassNames(defaultClassNames, {
    daySelected: 'ring-2 ring-offset-2', // Added to defaults
  })}
/>
```

### Available Class Name Keys

<details>
<summary><strong>Root & Layout</strong></summary>

| Key | Description |
|-----|-------------|
| `root` | Root container element |
| `rootDisabled` | Root when calendar is disabled |
| `rootDefaultLayout` | Root when `timePosition` is top/bottom |
| `rootSideLayout` | Root when `timePosition` is side |
| `calendarWrapper` | Wrapper around calendar grid |
| `calendarWrapperDisabled` | Calendar wrapper when disabled |

</details>

<details>
<summary><strong>Header & Navigation</strong></summary>

| Key | Description |
|-----|-------------|
| `header` | Header container |
| `headerDisabled` | Header when calendar is disabled |
| `headerNavigation` | Navigation buttons container |
| `headerNavigationButton` | All navigation buttons |
| `headerNavigationButtonDisabled` | Navigation buttons when disabled |
| `headerNavigationButtonPrev` | Previous buttons (year/month) |
| `headerNavigationButtonNext` | Next buttons (year/month) |
| `headerTitle` | Month/year title area |
| `headerMonthSelect` | Month dropdown select |
| `headerMonthSelectDisabled` | Month select when disabled |
| `headerYearSelect` | Year dropdown select |
| `headerYearSelectDisabled` | Year select when disabled |

</details>

<details>
<summary><strong>Weekday Header</strong></summary>

| Key | Description |
|-----|-------------|
| `weekDaysRow` | Weekday labels row |
| `weekDayCell` | Individual weekday label |
| `weekDayCellWeekend` | Weekend weekday labels (Sat/Sun) |
| `weekNumberPlaceholder` | Empty cell when `showWeekNumbers` |

</details>

<details>
<summary><strong>Calendar Body</strong></summary>

| Key | Description |
|-----|-------------|
| `body` | Calendar body container |
| `week` | Week row |
| `weekNumber` | Week number cell wrapper |
| `weekNumberDisabled` | Week number when disabled |
| `weekNumberCell` | Week number button/text |

</details>

<details>
<summary><strong>Day Cells</strong></summary>

| Key | Description |
|-----|-------------|
| `day` | Day cell wrapper |
| `dayButton` | Day button element |
| `dayToday` | Today's date |
| `daySelected` | Selected date(s) |
| `dayInRange` | Dates within selected range |
| `dayRangeStart` | First date of range |
| `dayRangeEnd` | Last date of range |
| `dayDisabled` | Disabled/unavailable dates |
| `dayOutsideMonth` | Dates from prev/next month |
| `dayWeekend` | Weekend dates (Sat/Sun) |

</details>

<details>
<summary><strong>Range Background (for range mode styling)</strong></summary>

| Key | Description |
|-----|-------------|
| `dayRangeBackground` | Range highlight background |
| `dayRangeBackgroundStart` | Range start background |
| `dayRangeBackgroundEnd` | Range end background |
| `dayRangeBackgroundMiddle` | Middle of range background |
| `dayRangeBackgroundFirstOfWeek` | First day of week in range |
| `dayRangeBackgroundLastOfWeek` | Last day of week in range |

</details>

<details>
<summary><strong>Time Picker</strong></summary>

| Key | Description |
|-----|-------------|
| `timePickerWrapper` | Time picker container |
| `timePickerWrapperTop` | Time picker when position=top |
| `timePickerWrapperBottom` | Time picker when position=bottom |
| `timePickerWrapperSide` | Time picker when position=side |
| `timeContainer` | Individual time section (start/end) |
| `timeContainerDisabled` | Time container when disabled |
| `timeLabel` | Time section label |
| `timeLabelDisabled` | Time label when disabled |
| `timeSelectors` | Hour/min/sec selectors container |
| `timeSelectorsDisabled` | Selectors container when disabled |
| `timeSelector` | Individual selector column |
| `timeSelectorDisabled` | Selector column when disabled |
| `timeSelectorLabel` | Selector label (HH/MM/SS) |
| `timeSelectorLabelDisabled` | Selector label when disabled |
| `timeSelectorScroll` | Scrollable area |
| `timeSelectorScrollDisabled` | Scroll area when disabled |
| `timeSelectorItem` | Time option item |
| `timeSelectorItemSelected` | Selected time item |
| `timeSelectorItemDisabled` | Disabled time item |
| `timeSeparator` | Separator between selectors |
| `timeSeparatorDisabled` | Separator when disabled |

</details>

<details>
<summary><strong>Mobile Time Picker (Responsive)</strong></summary>

| Key | Description |
|-----|-------------|
| `timePickerCollapsed` | Collapsible time picker wrapper |
| `timePickerCollapsedDisabled` | Collapsible wrapper when disabled |
| `timePickerToggle` | Toggle button for expanding/collapsing |
| `timePickerToggleDisabled` | Toggle button when disabled |
| `timePickerToggleIcon` | Icon in toggle button |
| `timePickerToggleIconDisabled` | Toggle icon when disabled |
| `timePickerToggleText` | Text in toggle button |
| `timePickerToggleTextDisabled` | Toggle text when disabled |
| `timePickerContent` | Collapsible content wrapper |
| `timePickerContentExpanded` | Content when expanded |

</details>

See [CalendarClassNames](./src/types/calendar.types.ts) for the complete type definition.

## Custom Rendering

### Custom Day Renderer

```tsx
<Calendar
  value={value}
  onChange={setValue}
  renderDay={(day, defaultRender) => {
    // Add a dot indicator for specific dates
    const hasEvent = events.some(e => isSameDay(e.date, day.date));
    
    return (
      <div className="relative">
        {defaultRender}
        {hasEvent && (
          <span className="absolute bottom-1 left-1/2 w-1 h-1 bg-red-500 rounded-full" />
        )}
      </div>
    );
  }}
/>
```

### Custom Header

```tsx
<Calendar
  value={value}
  onChange={setValue}
  renderHeader={({ currentMonth, currentYear, onPrevMonth, onNextMonth }) => (
    <div className="flex justify-between items-center p-4">
      <button onClick={onPrevMonth}>←</button>
      <span>{MONTHS[currentMonth]} {currentYear}</span>
      <button onClick={onNextMonth}>→</button>
    </div>
  )}
/>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'single' \| 'range' \| 'multiple' \| 'week' \| 'quarter'` | `'single'` | Selection mode |
| `value` | `DateTimeValue \| DateRangeValue \| MultipleDatesValue \| WeekValue \| QuarterValue \| null` | — | Controlled value |
| `defaultValue` | Same as `value` | — | Uncontrolled default |
| `onChange` | `(value) => void` | — | Called when value changes |
| `showTime` | `boolean` | `false` | Show time picker |
| `timePosition` | `'bottom' \| 'top' \| 'side'` | `'bottom'` | Time picker position |
| `showSeconds` | `boolean` | `false` | Show seconds selector |
| `showTodayButton` | `boolean` | `false` | Show "Today" button |
| `showClearButton` | `boolean` | `false` | Show "Clear" button |
| `numberOfMonths` | `number` | `1` | Number of months to display |
| `layout` | `'auto' \| 'desktop' \| 'mobile'` | `'auto'` | Responsive layout mode |
| `mobileBreakpoint` | `number` | `420` | Container width (px) for mobile layout |
| `minDate` | `Date` | — | Minimum selectable date |
| `maxDate` | `Date` | — | Maximum selectable date |
| `minTime` | `TimeValue` | — | Minimum selectable time |
| `maxTime` | `TimeValue` | — | Maximum selectable time |
| `highlightedDates` | `Date[] \| HighlightedDate[]` | — | Dates to highlight |
| `isDateDisabled` | `(date: Date) => boolean` | — | Custom date disable function |
| `years` | `number[]` | Last 100 years | Available years for year dropdown |
| `weekStartsOn` | `0-6` | `0` | First day of week (0=Sun) |
| `showWeekNumbers` | `boolean` | `false` | Show week numbers |
| `locale` | `string` | — | Locale for formatting (e.g. `'fr-FR'`) |
| `autoFocus` | `boolean` | `false` | Auto-focus on mount |
| `disabled` | `boolean` | `false` | Disable the calendar |
| `classNames` | `CalendarClassNames` | — | Custom class names (see Styling) |
| `labels` | `CalendarLabels` | — | Custom labels for i18n (see below) |
| `renderDay` | `(day, defaultRender) => ReactNode` | — | Custom day renderer |
| `renderHeader` | `(props) => ReactNode` | — | Custom header renderer |

### Event Handlers

| Handler | Type | Description |
|---------|------|-------------|
| `onChange` | `(value: CalendarValue<TMode>) => void` | Value changed |
| `onDayClick` | `(date: Date, event: MouseEvent) => void` | Day clicked |
| `onWeekClick` | `(weekData: WeekData, event: MouseEvent) => void` | Week number clicked |
| `onMonthSelect` | `(month: number, year: number) => void` | Month selected from dropdown |
| `onYearChange` | `(year: number) => void` | Year changed from dropdown |
| `onPrevMonth` | `(month: number, year: number) => void` | Navigate to previous month |
| `onNextMonth` | `(month: number, year: number) => void` | Navigate to next month |
| `onPrevYear` | `(year: number) => void` | Navigate to previous year |
| `onNextYear` | `(year: number) => void` | Navigate to next year |
| `onTimeChange` | `(time: TimeValue, target: 'start' \| 'end' \| 'single') => void` | Time changed |
| `onHourClick` | `(hour: number, target: 'start' \| 'end' \| 'single') => void` | Hour clicked |
| `onMinuteClick` | `(minute: number, target: 'start' \| 'end' \| 'single') => void` | Minute clicked |

### Types

```tsx
import type {
  // Props
  CalendarProps,
  CalendarClassNames,
  CalendarLabels,
  HeaderRenderProps,
  DatePickerProps,
  DateInputProps,
  
  // Values
  CalendarValue,
  DateTimeValue,
  DateRangeValue,
  MultipleDatesValue,
  WeekValue,
  QuarterValue,
  TimeValue,
  
  // Data
  DayCell,
  WeekData,
  MonthData,
  HighlightedDate,
  
  // Config
  SelectionMode,
  TimePosition,
  LayoutMode,
  DayOfWeek,
  PopoverPlacement,
} from '@vakac995/react-calendar';
```

#### Key Types Explained

```tsx
// Single date with optional time
interface DateTimeValue {
  date: Date;
  time?: TimeValue;
}

// Date range
interface DateRangeValue {
  start: DateTimeValue | null;
  end: DateTimeValue | null;
}

// Multiple dates
type MultipleDatesValue = DateTimeValue[];

// Week selection
interface WeekValue {
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
}

// Quarter selection
interface QuarterValue {
  quarter: 1 | 2 | 3 | 4;
  year: number;
  startDate: Date;
  endDate: Date;
}

// Time value
interface TimeValue {
  hours: number;   // 0-23
  minutes: number; // 0-59
  seconds: number; // 0-59
}

// Day cell data (for renderDay)
interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isDisabled: boolean;
  weekNumber: number;
}
```

### Utilities

The library exports utility functions for date manipulation:

```tsx
import {
  isSameDay,
  addDays,
  addMonths,
  startOfDay,
  getWeekNumber,
  isDateInRange,
  isDateDisabled,
  getMonthData,
} from '@vakac995/react-calendar';

// Examples
isSameDay(date1, date2);           // Check if same day
addDays(date, 7);                   // Add days to date
addMonths(date, 1);                 // Add months to date
getWeekNumber(date);                // Get ISO week number
isDateInRange(date, start, end);    // Check if date in range
```

### Default Exports

```tsx
import {
  // Components
  Calendar,
  DatePicker,
  DateInput,
  TimePicker,
  TimeSelector,
  Popover,
  Portal,
  
  // Hooks
  useClickOutside,
  usePopoverPosition,
  
  // Styling utilities
  defaultClassNames,
  mergeClassNames,    // Replace defaults with custom
  extendClassNames,   // Extend defaults with custom
  defaultLabels,
  mergeLabels,
  
  // Constants
  DAYS_IN_WEEK,       // 7
  MONTHS,             // ['January', 'February', ...]
  SHORT_DAYS,         // ['Sun', 'Mon', ...]
} from '@vakac995/react-calendar';
```

## Internationalization (i18n)

All text in the calendar can be customized via the `labels` prop. Labels are optional — sensible English defaults are provided.

### Labels Reference

<details>
<summary><strong>Navigation Aria Labels</strong></summary>

| Key | Default | Description |
|-----|---------|-------------|
| `previousYear` | `"Previous year"` | Aria-label for prev year button |
| `previousMonth` | `"Previous month"` | Aria-label for prev month button |
| `nextMonth` | `"Next month"` | Aria-label for next month button |
| `nextYear` | `"Next year"` | Aria-label for next year button |

</details>

<details>
<summary><strong>Navigation Icons</strong></summary>

| Key | Default | Description |
|-----|---------|-------------|
| `previousYearIcon` | `«` SVG | Previous year button content |
| `previousMonthIcon` | `‹` SVG | Previous month button content |
| `nextMonthIcon` | `›` SVG | Next month button content |
| `nextYearIcon` | `»` SVG | Next year button content |

</details>

<details>
<summary><strong>Time Picker Labels</strong></summary>

| Key | Default | Description |
|-----|---------|-------------|
| `timeLabel` | `"Time"` | Single mode time label |
| `startTimeLabel` | `"Start Time"` | Range mode start time label |
| `endTimeLabel` | `"End Time"` | Range mode end time label |
| `hoursLabel` | `"HH"` | Hours column header |
| `minutesLabel` | `"MM"` | Minutes column header |
| `secondsLabel` | `"SS"` | Seconds column header |

</details>

<details>
<summary><strong>Month & Day Names</strong></summary>

| Key | Default | Description |
|-----|---------|-------------|
| `months` | `["January", "February", ...]` | Array of 12 month names |
| `shortDays` | `["Sun", "Mon", ...]` | Array of 7 short day names (starting Sunday) |

</details>

### Example: French Localization

```tsx
<Calendar
  value={value}
  onChange={setValue}
  labels={{
    // Month names
    months: [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ],
    // Day names (starting from Sunday)
    shortDays: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    // Navigation
    previousYear: 'Année précédente',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    nextYear: 'Année suivante',
    // Time picker
    timeLabel: 'Heure',
    startTimeLabel: 'Heure de début',
    endTimeLabel: 'Heure de fin',
  }}
  weekStartsOn={1} // Monday first
/>
```

### Using mergeLabels Utility

```tsx
import { Calendar, defaultLabels, mergeLabels } from '@vakac995/react-calendar';

// Partially override defaults
const frenchLabels = mergeLabels(defaultLabels, {
  months: ['Janvier', 'Février', 'Mars', /* ... */],
});

<Calendar labels={frenchLabels} />
```

## TypeScript

The calendar is fully typed. Generic type inference works based on `mode`:

```tsx
// mode="single" → value is DateTimeValue | null
const [single, setSingle] = useState<DateTimeValue | null>(null);
<Calendar mode="single" value={single} onChange={setSingle} />

// mode="range" → value is DateRangeValue | null  
const [range, setRange] = useState<DateRangeValue | null>(null);
<Calendar mode="range" value={range} onChange={setRange} />
```

## Browser Support

Works in all modern browsers that support ES2020+:
- Chrome/Edge 80+
- Firefox 78+
- Safari 14+

## Contributing

```bash
# Clone the repo
git clone https://github.com/vakac995/react-calendar.git
cd react-calendar

# Install dependencies
npm install

# Run development server
npm run dev

# Run linter
npm run lint

# Type check
npm run typecheck

# Build library
npm run build
```

## License

MIT © [vakac995](https://github.com/vakac995)
