# @vakac995/react-calendar

A flexible, customizable React calendar component with date range and time picker support.

**[📺 Live Demo](https://react-calendar-demo.pages.dev/)** | **[📦 npm](https://www.npmjs.com/package/@vakac995/react-calendar)** | **[🐙 GitHub](https://github.com/vakac995/react-calendar)**

## Features

- 📅 Single date and date range selection
- ⏰ Optional time picker with hour, minute, and second selection
- 🎨 Fully customizable styling via `classNames` prop
- 📱 Responsive design
- ♿ Accessible (keyboard navigation, ARIA labels)
- 🔧 Headless-ready with custom render props
- 📦 Tree-shakeable ES modules
- 💪 Full TypeScript support

## Installation

```bash
npm install @vakac995/react-calendar
# or
yarn add @vakac995/react-calendar
# or
pnpm add @vakac995/react-calendar
```

## Usage

### Basic Calendar

```tsx
import { Calendar, type DateTimeValue } from '@vakac995/react-calendar';
import { useState } from 'react';

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
import { Calendar, type DateRangeValue } from '@vakac995/react-calendar';
import { useState } from 'react';

function App() {
  const [range, setRange] = useState<DateRangeValue>({ start: null, end: null });

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
  timePosition="bottom" // 'bottom' | 'top' | 'side'
/>
```

### Custom Styling

```tsx
<Calendar
  value={value}
  onChange={setValue}
  classNames={{
    root: 'my-calendar',
    daySelected: 'bg-purple-500 text-white',
    dayToday: 'border-purple-500',
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'single' \| 'range'` | `'single'` | Selection mode |
| `value` | `DateTimeValue \| DateRangeValue` | - | Controlled value |
| `defaultValue` | `DateTimeValue \| DateRangeValue` | - | Uncontrolled default value |
| `showTime` | `boolean` | `false` | Show time picker |
| `timePosition` | `'bottom' \| 'top' \| 'side'` | `'bottom'` | Time picker position |
| `showSeconds` | `boolean` | `false` | Show seconds in time picker |
| `minDate` | `Date` | - | Minimum selectable date |
| `maxDate` | `Date` | - | Maximum selectable date |
| `weekStartsOn` | `0-6` | `0` | First day of week (0 = Sunday) |
| `showWeekNumbers` | `boolean` | `false` | Show week numbers |
| `disabled` | `boolean` | `false` | Disable the calendar |
| `classNames` | `CalendarClassNames` | - | Custom class names |
| `renderDay` | `(day, defaultRender) => ReactNode` | - | Custom day renderer |
| `renderHeader` | `(props) => ReactNode` | - | Custom header renderer |

## Types

```tsx
import type {
  CalendarProps,
  CalendarValue,
  DateTimeValue,
  DateRangeValue,
  TimeValue,
  DayCell,
  WeekData,
  SelectionMode,
} from '@vakac995/react-calendar';
```

## Utilities

The library also exports utility functions:

```tsx
import {
  isSameDay,
  addDays,
  addMonths,
  getWeekNumber,
  startOfDay,
} from '@vakac995/react-calendar';
```

## Development

```bash
# Install dependencies
npm install

# Run demo app
npm run dev

# Build library
npm run build

# Type check
npm run typecheck
```

## License

MIT
