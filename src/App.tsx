import type { ReactElement } from "react";
import { useState } from "react";

// Calendar imports
import {
  Calendar,
  DatePicker,
  type DateTimeValue,
  type DateRangeValue,
  type MultipleDatesValue,
  type WeekValue,
  type QuarterValue,
  type DayCell,
  type LayoutMode,
  defaultClassNames,
  defaultLabels,
  mergeClassNames,
  mergeLabels,
  MONTHS,
} from "./index";

// Demo helper imports
import { CopyButton, DemoCard, DemoSection, ValueDisplay } from "./demo-helpers";

// ============================================================================
// DEMO COMPONENTS - Basic Selection
// ============================================================================

function BasicSingleDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function DateRangeDemo(): ReactElement {
  const [value, setValue] = useState<DateRangeValue | null>(null);

  return (
    <>
      <Calendar<"range">
        mode="range"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showWeekNumbers
      />
      <div className="mt-1 text-center text-xs text-gray-500">
        Click week number to select entire week
      </div>
      <ValueDisplay value={value} mode="range" />
    </>
  );
}

function MultipleDatesDemo(): ReactElement {
  const [value, setValue] = useState<MultipleDatesValue>([]);

  return (
    <>
      <Calendar<"multiple">
        mode="multiple"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showClearButton
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        {value.length} date{value.length !== 1 ? "s" : ""} selected
      </div>
    </>
  );
}

function WeekPickerDemo(): ReactElement {
  const [value, setValue] = useState<WeekValue | null>(null);

  return (
    <>
      <Calendar<"week">
        mode="week"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showClearButton
        showWeekNumbers
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        {value ? `Week ${value.weekNumber}, ${value.year}` : "Select a week"}
      </div>
    </>
  );
}

function QuarterPickerDemo(): ReactElement {
  const [value, setValue] = useState<QuarterValue | null>(null);

  return (
    <>
      <Calendar<"quarter">
        mode="quarter"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showClearButton
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        {value ? `Q${value.quarter} ${value.year}` : "Select a quarter"}
      </div>
    </>
  );
}

// ============================================================================
// DEMO COMPONENTS - Time Picker
// ============================================================================

function TimePickerBottomDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showTime
        showSeconds
        timePosition="bottom"
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function TimePickerTopDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showTime
        timePosition="top"
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function TimePickerSideDemo(): ReactElement {
  const [value, setValue] = useState<DateRangeValue | null>(null);

  return (
    <>
      <Calendar<"range">
        mode="range"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showTime
        showSeconds
        timePosition="side"
      />
      <ValueDisplay value={value} mode="range" />
    </>
  );
}

// ============================================================================
// DEMO COMPONENTS - Responsive Layout
// ============================================================================

function ResponsiveLayoutDemo(): ReactElement {
  const [value, setValue] = useState<DateRangeValue | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("auto");

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["auto", "desktop", "mobile"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setLayoutMode(mode)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              layoutMode === mode
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
      <Calendar<"range">
        mode="range"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showTime
        showSeconds
        timePosition="side"
        layout={layoutMode}
        mobileBreakpoint={420}
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        {layoutMode === "auto"
          ? "📱 Resize container to see responsive layout"
          : layoutMode === "mobile"
            ? "📱 Mobile: Collapsible time picker"
            : "🖥️ Desktop: Side time picker"}
      </div>
      <ValueDisplay value={value} mode="range" />
    </>
  );
}

// ============================================================================
// DEMO COMPONENTS - Multiple Months & Features
// ============================================================================

function MultipleMonthsDemo(): ReactElement {
  const [value, setValue] = useState<DateRangeValue | null>(null);

  return (
    <>
      <Calendar<"range">
        mode="range"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        numberOfMonths={2}
      />
      <ValueDisplay value={value} mode="range" />
    </>
  );
}

function TodayClearButtonsDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showTodayButton
        showClearButton
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function HighlightedDatesDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  const today = new Date();
  const highlightedDates = [
    new Date(today.getFullYear(), today.getMonth(), 10),
    new Date(today.getFullYear(), today.getMonth(), 15),
    new Date(today.getFullYear(), today.getMonth(), 20),
    new Date(today.getFullYear(), today.getMonth(), 25),
  ];

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        highlightedDates={highlightedDates}
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        📌 Days 10, 15, 20, 25 are highlighted
      </div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function CustomDisabledDatesDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  // Disable weekends
  const isDateDisabled = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        isDateDisabled={isDateDisabled}
      />
      <div className="mt-2 text-center text-xs text-gray-500">🚫 Weekends disabled</div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

// ============================================================================
// DEMO COMPONENTS - Locale/i18n
// ============================================================================

function LocaleGermanDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        locale="de-DE"
      />
      <div className="mt-2 text-center text-xs text-gray-500">🇩🇪 German locale (Monday start)</div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function LocaleArabicDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        locale="ar-SA"
      />
      <div className="mt-2 text-center text-xs text-gray-500">🇸🇦 Arabic locale (RTL)</div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function LocaleJapaneseDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        locale="ja-JP"
      />
      <div className="mt-2 text-center text-xs text-gray-500">🇯🇵 Japanese locale</div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

// ============================================================================
// DEMO COMPONENTS - DatePicker (Popover)
// ============================================================================

function DatePickerBasicDemo(): ReactElement {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <>
      <DatePicker
        value={value}
        onChange={setValue}
        placeholder="Select a date..."
        dateFormat="MM/DD/YYYY"
        calendarClassNames={defaultClassNames}
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        {value ? value.toLocaleDateString() : "No date selected"}
      </div>
    </>
  );
}

function DatePickerWithTimeDemo(): ReactElement {
  const [value, setValue] = useState<Date | null>(null);

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return (
    <>
      <DatePicker
        value={value}
        onChange={setValue}
        placeholder="Select date..."
        dateFormat="DD/MM/YYYY"
        minDate={minDate}
        maxDate={maxDate}
        isClearable
        calendarClassNames={defaultClassNames}
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        {value ? value.toLocaleDateString() : "Current month only"}
      </div>
    </>
  );
}

// ============================================================================
// DEMO COMPONENTS - Constraints
// ============================================================================

function MinMaxDatesDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5);
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        minDate={minDate}
        maxDate={maxDate}
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        📅 {minDate.toLocaleDateString()} → {maxDate.toLocaleDateString()}
      </div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function TimeConstraintsDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showTime
        minTime={{ hours: 9, minutes: 0, seconds: 0 }}
        maxTime={{ hours: 17, minutes: 30, seconds: 0 }}
      />
      <div className="mt-2 text-center text-xs text-gray-500">🕘 Business hours: 09:00 – 17:30</div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

// ============================================================================
// DEMO COMPONENTS - Week Configuration
// ============================================================================

function WeekConfigDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        weekStartsOn={1}
        showWeekNumbers
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function CustomYearsDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  const years = Array.from({ length: 5 }, (_, i) => 2024 + i);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        years={years}
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        Years: {years[0]} – {years[years.length - 1]}
      </div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

// ============================================================================
// DEMO COMPONENTS - Customization
// ============================================================================

function CustomStylesDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  const shadcnClassNames = mergeClassNames(defaultClassNames, {
    root: "bg-white rounded-lg shadow-sm border border-gray-200 p-4 font-sans",
    header: "flex justify-between border-b border-gray-100 pb-3 mb-3",
    headerTitle: "flex items-center gap-1",
    headerMonthSelect:
      "appearance-none bg-transparent text-sm font-medium text-gray-900 cursor-pointer hover:text-gray-600 focus:outline-none",
    headerYearSelect:
      "appearance-none bg-transparent text-sm font-medium text-gray-900 cursor-pointer hover:text-gray-600 focus:outline-none",
    headerNavigationButton:
      "inline-flex items-center justify-center h-7 w-7 rounded-md bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
    dayButton:
      "relative w-9 h-9 text-sm rounded-md text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
    daySelected: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900",
    dayToday: "bg-gray-100 font-semibold",
    dayInRange: "bg-gray-100 text-gray-900",
    dayRangeStart: "bg-gray-900 text-white rounded-l-md",
    dayRangeEnd: "bg-gray-900 text-white rounded-r-md",
    dayDisabled: "text-gray-300 cursor-not-allowed hover:bg-transparent",
    dayOutsideMonth: "text-gray-300",
  });

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={shadcnClassNames}
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function CustomLabelsDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  const customLabels = mergeLabels(defaultLabels, {
    timeLabel: "Select Time",
    hoursLabel: "Hr",
    minutesLabel: "Min",
    secondsLabel: "Sec",
    shortDays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ],
    previousYearIcon: "««",
    previousMonthIcon: "«",
    nextMonthIcon: "»",
    nextYearIcon: "»»",
  });

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        labels={customLabels}
        showTime
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        🏷️ Custom labels via mergeLabels()
      </div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function CustomDayRendererDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  const eventDates = [5, 12, 15, 22, 28];

  const renderDay = (day: DayCell, defaultRender: React.ReactNode): React.ReactNode => {
    const hasEvent = day.isCurrentMonth && eventDates.includes(day.date.getDate());

    return (
      <div className="relative">
        {defaultRender}
        {hasEvent && (
          <span className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-500" />
        )}
      </div>
    );
  };

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        renderDay={renderDay}
      />
      <div className="mt-2 text-center text-xs text-gray-500">
        🔴 Red dots = events on days 5, 12, 15, 22, 28
      </div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function CustomHeaderDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        renderHeader={({ currentMonth, currentYear, onPrevMonth, onNextMonth }) => (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white">
            <button
              onClick={onPrevMonth}
              className="rounded-full p-1 hover:bg-white/20"
              aria-label="Previous month"
            >
              ←
            </button>
            <span className="text-lg font-bold">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              onClick={onNextMonth}
              className="rounded-full p-1 hover:bg-white/20"
              aria-label="Next month"
            >
              →
            </button>
          </div>
        )}
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

// ============================================================================
// DEMO COMPONENTS - States
// ============================================================================

function DisabledDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>({
    date: new Date(),
    time: { hours: 14, minutes: 30, seconds: 0 },
  });

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
        showTime
        disabled
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function PreselectedDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>({
    date: new Date(2025, 11, 25),
  });

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
      />
      <div className="mt-2 text-center text-xs text-gray-500">🎄 Christmas 2025</div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function ControlledRangeDemo(): ReactElement {
  const getThisWeek = (): DateRangeValue => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return {
      start: { date: startOfWeek, time: { hours: 0, minutes: 0, seconds: 0 } },
      end: { date: endOfWeek, time: { hours: 23, minutes: 59, seconds: 59 } },
    };
  };

  const [value, setValue] = useState<DateRangeValue | null>(getThisWeek());

  return (
    <>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setValue(getThisWeek())}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
        >
          This Week
        </button>
        <button
          onClick={() => setValue(null)}
          className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-300"
        >
          Clear
        </button>
      </div>
      <Calendar<"range">
        mode="range"
        value={value}
        onChange={setValue}
        classNames={defaultClassNames}
      />
      <ValueDisplay value={value} mode="range" />
    </>
  );
}

// ============================================================================
// DEMO COMPONENTS - Events
// ============================================================================

function AllCallbacksDemo(): ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string): void => {
    setLogs((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row">
      <div className="flex flex-col items-center">
        <Calendar<"single">
          mode="single"
          value={value}
          onChange={(v) => {
            setValue(v);
            addLog(`onChange: ${v?.date.toLocaleDateString() ?? "null"}`);
          }}
          classNames={defaultClassNames}
          showTime
          showWeekNumbers
          onDayClick={(date) => addLog(`onDayClick: ${date.toLocaleDateString()}`)}
          onWeekClick={(week) => addLog(`onWeekClick: Week ${week.weekNumber}`)}
          onMonthClick={(month, year) => addLog(`onMonthClick: ${month + 1}/${year}`)}
          onMonthSelect={(month, year) => addLog(`onMonthSelect: ${month + 1}/${year}`)}
          onYearChange={(year) => addLog(`onYearChange: ${year}`)}
          onPrevMonth={(month, year) => addLog(`onPrevMonth: ${month + 1}/${year}`)}
          onNextMonth={(month, year) => addLog(`onNextMonth: ${month + 1}/${year}`)}
          onPrevYear={(year) => addLog(`onPrevYear: ${year}`)}
          onNextYear={(year) => addLog(`onNextYear: ${year}`)}
          onTimeChange={(time, target) =>
            addLog(`onTimeChange: ${time.hours}:${time.minutes} (${target})`)
          }
          onHourSelect={(hour) => addLog(`onHourSelect: ${hour}`)}
          onMinuteSelect={(minute) => addLog(`onMinuteSelect: ${minute}`)}
        />
        <ValueDisplay value={value} mode="single" />
      </div>
      <div className="min-w-[280px] flex-1">
        <div className="h-80 overflow-y-auto rounded-xl bg-gray-900 p-4 shadow-inner">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <h4 className="font-mono text-sm font-semibold text-green-400">Event Log</h4>
          </div>
          {logs.length === 0 ? (
            <p className="font-mono text-xs text-gray-500">Interact with the calendar...</p>
          ) : (
            <div className="space-y-1.5">
              {logs.map((log, i) => (
                <div
                  key={`${log}-${i}`}
                  className="rounded bg-gray-800 px-2 py-1 font-mono text-xs text-green-300"
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

function Header(): ReactElement {
  return (
    <header className="mb-12 text-center">
      <div className="mb-4 inline-flex items-center gap-3">
        <span className="text-5xl">📅</span>
        <div className="text-left">
          <h1 className="text-4xl font-bold text-white">React Calendar</h1>
          <p className="font-mono text-sm text-blue-400">@vakac995/react-calendar</p>
        </div>
      </div>
      <p className="mx-auto max-w-2xl text-slate-400">
        A flexible, customizable React calendar component with date range and time picker support.
        Fully typed with TypeScript generics.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <a
          href="https://www.npmjs.com/package/@vakac995/react-calendar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0v24h24V0H0zm6.672 19.992H3.996V6.996h2.676v13.002-.006zm6.672 0H10.68V10.668H8.004V6.996h8.016v3.672h-2.676v9.324zm6.66 0h-2.676V10.668h2.676v9.324z" />
          </svg>
          npm
        </a>
        <a
          href="https://github.com/vakac995/react-calendar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </a>
      </div>
    </header>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function App(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <Header />

        <div className="flex flex-col gap-12">
          {/* Basic Selection */}
          <DemoSection
            id="basic"
            title="Basic Selection"
            description="Single date and date range selection modes"
            icon="📅"
          >
            <DemoCard
              title="Single Date"
              description="Simple date picker with single selection"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  classNames={defaultClassNames}
/>`}
            >
              <BasicSingleDemo />
            </DemoCard>

            <DemoCard
              title="Date Range"
              description="Select start and end dates with week number selection"
              code={`<Calendar
  mode="range"
  value={value}
  onChange={setValue}
  classNames={defaultClassNames}
  showWeekNumbers
/>`}
            >
              <DateRangeDemo />
            </DemoCard>

            <DemoCard
              title="Multiple Dates"
              description="Select multiple non-contiguous dates"
              badge="New"
              badgeVariant="green"
              code={`<Calendar
  mode="multiple"
  value={dates}
  onChange={setDates}
  classNames={defaultClassNames}
  showClearButton
/>`}
            >
              <MultipleDatesDemo />
            </DemoCard>

            <DemoCard
              title="Week Picker"
              description="Select entire weeks at once"
              badge="New"
              badgeVariant="green"
              code={`<Calendar
  mode="week"
  value={week}
  onChange={setWeek}
  classNames={defaultClassNames}
  showWeekNumbers
/>`}
            >
              <WeekPickerDemo />
            </DemoCard>

            <DemoCard
              title="Quarter Picker"
              description="Select entire quarters (Q1-Q4)"
              badge="New"
              badgeVariant="green"
              code={`<Calendar
  mode="quarter"
  value={quarter}
  onChange={setQuarter}
  classNames={defaultClassNames}
/>`}
            >
              <QuarterPickerDemo />
            </DemoCard>
          </DemoSection>

          {/* Time Picker */}
          <DemoSection
            id="time"
            title="Time Picker"
            description="Integrated time selection with flexible positioning"
            icon="⏰"
          >
            <DemoCard
              title="Time Picker (Bottom)"
              description="Time selector below the calendar"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  showTime
  showSeconds
  timePosition="bottom"
/>`}
            >
              <TimePickerBottomDemo />
            </DemoCard>

            <DemoCard
              title="Time Picker (Top)"
              description="Time selector above the calendar"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  showTime
  timePosition="top"
/>`}
            >
              <TimePickerTopDemo />
            </DemoCard>

            <DemoCard
              title="Range with Time (Side)"
              description="Independent start/end time pickers beside the calendar"
              code={`<Calendar
  mode="range"
  value={value}
  onChange={setValue}
  showTime
  showSeconds
  timePosition="side"
/>`}
            >
              <TimePickerSideDemo />
            </DemoCard>
          </DemoSection>

          {/* Responsive Layout */}
          <DemoSection
            id="responsive"
            title="Responsive Layout"
            description="Auto-adapting layout for different screen sizes"
            icon="📱"
          >
            <DemoCard
              title="Responsive Mode"
              description="Automatically switches to mobile layout with collapsible time picker"
              badge="New"
              badgeVariant="green"
              code={`<Calendar
  mode="range"
  value={value}
  onChange={setValue}
  showTime
  timePosition="side"
  layout="auto"        // "auto" | "desktop" | "mobile"
  mobileBreakpoint={420} // default: 420px
/>`}
            >
              <ResponsiveLayoutDemo />
            </DemoCard>
          </DemoSection>

          {/* DatePicker (Popover) */}
          <DemoSection
            id="datepicker"
            title="DatePicker (Popover)"
            description="Input field with calendar dropdown"
            icon="📋"
          >
            <DemoCard
              title="Basic DatePicker"
              description="Text input with calendar popup"
              badge="New"
              badgeVariant="green"
              code={`<DatePicker
  value={value}
  onChange={setValue}
  placeholder="Select a date..."
  dateFormat="MM/DD/YYYY"
/>`}
            >
              <DatePickerBasicDemo />
            </DemoCard>

            <DemoCard
              title="DatePicker with Constraints"
              description="Min/max date restrictions with European format"
              badge="New"
              badgeVariant="green"
              code={`<DatePicker
  value={value}
  onChange={setValue}
  placeholder="Select date..."
  dateFormat="DD/MM/YYYY"
  minDate={startOfMonth}
  maxDate={endOfMonth}
  isClearable
/>`}
            >
              <DatePickerWithTimeDemo />
            </DemoCard>
          </DemoSection>

          {/* Multiple Months & Features */}
          <DemoSection
            id="features"
            title="Additional Features"
            description="Multiple months, today/clear buttons, highlighted dates"
            icon="✨"
          >
            <DemoCard
              title="Multiple Months"
              description="Display 2+ months side by side"
              code={`<Calendar
  mode="range"
  value={value}
  onChange={setValue}
  numberOfMonths={2}
/>`}
            >
              <MultipleMonthsDemo />
            </DemoCard>

            <DemoCard
              title="Today & Clear Buttons"
              description="Quick navigation and clear selection"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  showTodayButton
  showClearButton
/>`}
            >
              <TodayClearButtonsDemo />
            </DemoCard>

            <DemoCard
              title="Highlighted Dates"
              description="Mark special dates with visual indicator"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  highlightedDates={[
    new Date(2024, 0, 10),
    new Date(2024, 0, 15),
  ]}
/>`}
            >
              <HighlightedDatesDemo />
            </DemoCard>

            <DemoCard
              title="Custom Disabled Dates"
              description="Disable specific dates via callback"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  isDateDisabled={(date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  }}
/>`}
            >
              <CustomDisabledDatesDemo />
            </DemoCard>
          </DemoSection>

          {/* Locale/i18n */}
          <DemoSection
            id="locale"
            title="Locale / i18n"
            description="Internationalization with automatic RTL support"
            icon="🌍"
          >
            <DemoCard
              title="German Locale"
              description="German month/day names, Monday start"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  locale="de-DE"
/>`}
            >
              <LocaleGermanDemo />
            </DemoCard>

            <DemoCard
              title="Arabic Locale (RTL)"
              description="Right-to-left layout with Arabic names"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  locale="ar-SA"
/>`}
            >
              <LocaleArabicDemo />
            </DemoCard>

            <DemoCard
              title="Japanese Locale"
              description="Japanese month/day names"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  locale="ja-JP"
/>`}
            >
              <LocaleJapaneseDemo />
            </DemoCard>
          </DemoSection>

          {/* Constraints */}
          <DemoSection
            id="constraints"
            title="Constraints"
            description="Date and time restrictions"
            icon="🔒"
          >
            <DemoCard
              title="Min/Max Dates"
              description="Limit selectable date range"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  minDate={new Date(2024, 0, 1)}
  maxDate={new Date(2024, 11, 31)}
/>`}
            >
              <MinMaxDatesDemo />
            </DemoCard>

            <DemoCard
              title="Business Hours"
              description="Time restricted to 09:00–17:30"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  showTime
  minTime={{ hours: 9, minutes: 0, seconds: 0 }}
  maxTime={{ hours: 17, minutes: 30, seconds: 0 }}
/>`}
            >
              <TimeConstraintsDemo />
            </DemoCard>
          </DemoSection>

          {/* Week Configuration */}
          <DemoSection
            id="week"
            title="Week Configuration"
            description="Customize week display and behavior"
            icon="📆"
          >
            <DemoCard
              title="Monday Start + Week Numbers"
              description="European style with ISO week numbers"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  weekStartsOn={1}  // Monday
  showWeekNumbers
/>`}
            >
              <WeekConfigDemo />
            </DemoCard>

            <DemoCard
              title="Custom Year Range"
              description="Limited year selection in dropdown"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  years={[2024, 2025, 2026, 2027, 2028]}
/>`}
            >
              <CustomYearsDemo />
            </DemoCard>
          </DemoSection>

          {/* Customization */}
          <DemoSection
            id="customization"
            title="Customization"
            description="Custom styling, labels, and rendering"
            icon="🎨"
          >
            <DemoCard
              title="Custom Styling"
              description="Shadcn-inspired minimal theme via classNames"
              code={`const shadcnClassNames = mergeClassNames(
  defaultClassNames,
  {
    root: "bg-white rounded-lg shadow-sm",
    daySelected: "bg-gray-900 text-white",
    dayToday: "bg-gray-100 font-semibold",
    // ... minimal palette
  }
);

<Calendar classNames={shadcnClassNames} />`}
            >
              <CustomStylesDemo />
            </DemoCard>

            <DemoCard
              title="Custom Labels"
              description="Override text and icons via mergeLabels()"
              code={`const customLabels = mergeLabels(
  defaultLabels,
  {
    timeLabel: "Select Time",
    shortDays: ["Su", "Mo", "Tu", ...],
    previousMonthIcon: "«",
    nextMonthIcon: "»",
  }
);

<Calendar labels={customLabels} showTime />`}
            >
              <CustomLabelsDemo />
            </DemoCard>

            <DemoCard
              title="Custom Day Renderer"
              description="Add event indicators with renderDay"
              code={`<Calendar
  renderDay={(day, defaultRender) => (
    <div className="relative">
      {defaultRender}
      {hasEvent(day.date) && (
        <span className="... bg-red-500" />
      )}
    </div>
  )}
/>`}
            >
              <CustomDayRendererDemo />
            </DemoCard>

            <DemoCard
              title="Custom Header"
              description="Fully custom header with renderHeader"
              code={`<Calendar
  renderHeader={({ currentMonth, currentYear, onPrevMonth, onNextMonth }) => (
    <div className="...">
      <button onClick={onPrevMonth}>←</button>
      <span>{MONTHS[currentMonth]} {currentYear}</span>
      <button onClick={onNextMonth}>→</button>
    </div>
  )}
/>`}
            >
              <CustomHeaderDemo />
            </DemoCard>
          </DemoSection>

          {/* States */}
          <DemoSection
            id="states"
            title="States"
            description="Disabled, preselected, and controlled values"
            icon="⚙️"
          >
            <DemoCard
              title="Disabled State"
              description="Non-interactive calendar"
              code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  showTime
  disabled
/>`}
            >
              <DisabledDemo />
            </DemoCard>

            <DemoCard
              title="Preselected Date"
              description="Calendar with initial value"
              code={`const [value, setValue] = useState({
  date: new Date(2025, 11, 25),
});

<Calendar value={value} onChange={setValue} />`}
            >
              <PreselectedDemo />
            </DemoCard>

            <DemoCard
              title="Programmatic Control"
              description="External buttons to set value"
              code={`const [value, setValue] = useState(getThisWeek());

<button onClick={() => setValue(getThisWeek())}>
  This Week
</button>
<button onClick={() => setValue(null)}>
  Clear
</button>

<Calendar mode="range" value={value} onChange={setValue} />`}
            >
              <ControlledRangeDemo />
            </DemoCard>
          </DemoSection>

          {/* Events */}
          <DemoSection
            id="events"
            title="Event Handlers"
            description="All available callback functions"
            icon="🔔"
          >
            <DemoCard
              title="All Callbacks"
              description="Live event log showing all handler invocations"
              code={`<Calendar
  onDayClick={(date) => ...}
  onWeekClick={(week) => ...}
  onMonthClick={(month, year) => ...}
  onMonthSelect={(month, year) => ...}
  onYearChange={(year) => ...}
  onPrevMonth={(month, year) => ...}
  onNextMonth={(month, year) => ...}
  onPrevYear={(year) => ...}
  onNextYear={(year) => ...}
  onTimeChange={(time, target) => ...}
  onHourSelect={(hour, target) => ...}
  onMinuteSelect={(minute, target) => ...}
  onSecondsSelect={(seconds, target) => ...}
/>`}
            >
              <AllCallbacksDemo />
            </DemoCard>
          </DemoSection>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-700 pt-8 text-center text-slate-500">
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2">
            <code className="text-blue-400">npm install @vakac995/react-calendar</code>
            <CopyButton text="npm install @vakac995/react-calendar" />
          </div>
          <p className="text-sm">
            MIT License •{" "}
            <a
              href="https://github.com/vakac995/react-calendar"
              className="text-blue-400 hover:underline"
            >
              GitHub
            </a>{" "}
            •{" "}
            <a
              href="https://www.npmjs.com/package/@vakac995/react-calendar"
              className="text-blue-400 hover:underline"
            >
              npm
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
