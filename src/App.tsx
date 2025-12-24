import React, { useState } from "react";
import {
  Calendar,
  type CalendarValue,
  type SelectionMode,
  type DateTimeValue,
  type DateRangeValue,
  type DayCell,
  defaultClassNames,
  defaultLabels,
  mergeClassNames,
  mergeLabels,
} from "./index";

// ============================================================================
// DEMO HELPER COMPONENTS
// ============================================================================

function CopyButton({ text }: { text: string }): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      )}
    </button>
  );
}

interface DemoCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  code: string;
}

function DemoCard({ title, description, children, code }: DemoCardProps): React.ReactElement {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        {description && <p className="text-blue-100 text-sm mt-0.5">{description}</p>}
      </div>
      <div className="flex flex-col">
        {/* Calendar Section */}
        <div className="p-5 flex flex-col items-center border-b border-gray-100">
          {children}
        </div>
        {/* Code Section */}
        <div className="p-4 bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Usage</span>
            <CopyButton text={code} />
          </div>
          <pre className="text-sm text-slate-300 font-mono whitespace-pre overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

interface ValueDisplayProps<TMode extends SelectionMode> {
  value: CalendarValue<TMode> | undefined;
  mode: TMode;
}

function ValueDisplay<TMode extends SelectionMode>({
  value,
  mode,
}: ValueDisplayProps<TMode>): React.ReactElement {
  const formatDateTime = (dtv: DateTimeValue | null): string => {
    if (!dtv) return "—";
    const date = dtv.date.toLocaleDateString();
    if (dtv.time) {
      const time = `${String(dtv.time.hours).padStart(2, "0")}:${String(dtv.time.minutes).padStart(2, "0")}:${String(dtv.time.seconds).padStart(2, "0")}`;
      return `${date} ${time}`;
    }
    return date;
  };

  if (mode === "single") {
    const singleValue = value as DateTimeValue | null | undefined;
    return (
      <div className="mt-4 w-full p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-600">Selected:</span>
          <span className="text-blue-600 font-mono">{singleValue ? formatDateTime(singleValue) : "—"}</span>
        </div>
      </div>
    );
  }

  const rangeValue = value as DateRangeValue | undefined;
  return (
    <div className="mt-4 w-full p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-sm border border-gray-200 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-600">Start:</span>
        <span className="text-blue-600 font-mono">{formatDateTime(rangeValue?.start ?? null)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-600">End:</span>
        <span className="text-emerald-600 font-mono">{formatDateTime(rangeValue?.end ?? null)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// DEMO COMPONENTS
// ============================================================================

function BasicCalendarDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={defaultClassNames}
        onDayClick={(date) => console.log("Day clicked:", date)}
        onMonthSelect={(month, year) => console.log("Month selected:", month, year)}
        onYearChange={(year) => console.log("Year changed:", year)}
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function RangeCalendarDemo(): React.ReactElement {
  const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });

  return (
    <>
      <Calendar<"range">
        mode="range"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={defaultClassNames}
        showWeekNumbers
        onDayClick={(date) => console.log("Range day clicked:", date)}
        onWeekClick={(week) => console.log("Week selected:", week.weekNumber)}
      />
      <div className="mt-1 text-xs text-gray-500 text-center">
        Click week number to select entire week
      </div>
      <ValueDisplay value={value} mode="range" />
    </>
  );
}

function CalendarWithTimeDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={defaultClassNames}
        showTime
        showSeconds
        timePosition="bottom"
        onTimeChange={(time, target) => console.log("Time changed:", time, target)}
        onHourSelect={(hour, target) => console.log("Hour selected:", hour, target)}
        onMinuteSelect={(minute, target) => console.log("Minute selected:", minute, target)}
        onSecondsSelect={(seconds, target) => console.log("Seconds selected:", seconds, target)}
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function RangeWithTimeDemo(): React.ReactElement {
  const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });

  return (
    <>
      <Calendar<"range">
        mode="range"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={defaultClassNames}
        showTime
        showSeconds
        timePosition="side"
        onTimeChange={(time, target) => console.log("Range time changed:", time, target)}
      />
      <ValueDisplay value={value} mode="range" />
    </>
  );
}

function MinMaxDatesDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5);
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={defaultClassNames}
        minDate={minDate}
        maxDate={maxDate}
      />
      <div className="mt-2 text-xs text-gray-500 text-center">
        📅 {minDate.toLocaleDateString()} → {maxDate.toLocaleDateString()}
      </div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function WeekStartMondayDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={defaultClassNames}
        weekStartsOn={1}
        showWeekNumbers
        onWeekClick={(week, _e) => console.log("Week clicked:", week)}
        onPrevWeek={(date) => console.log("Prev week from:", date)}
        onNextWeek={(date) => console.log("Next week from:", date)}
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function CustomYearsDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={defaultClassNames}
        years={years}
        onYearChange={(year) => console.log("Custom year changed:", year)}
        onPrevYear={(year) => console.log("Prev year:", year)}
        onNextYear={(year) => console.log("Next year:", year)}
      />
      <div className="mt-2 text-xs text-gray-500 text-center">
        📆 Years: {years[0]} – {years[years.length - 1]}
      </div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function TimeWithLimitsDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={defaultClassNames}
        showTime
        minTime={{ hours: 9, minutes: 0, seconds: 0 }}
        maxTime={{ hours: 17, minutes: 30, seconds: 0 }}
      />
      <div className="mt-2 text-xs text-gray-500 text-center">
        ⏰ Business hours: 09:00 – 17:30
      </div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function CustomStylesDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  const customClassNames = mergeClassNames(defaultClassNames, {
    root: "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200",
    header: "bg-purple-100 rounded-lg p-2 -m-2 mb-2",
    headerNavigationButton: "text-purple-600 hover:bg-purple-200",
    headerMonthSelect: "border-purple-300 focus:ring-purple-500",
    headerYearSelect: "border-purple-300 focus:ring-purple-500",
    weekDayCell: "text-purple-600 font-bold",
    weekDayCellWeekend: "text-pink-500",
    dayButton: "hover:bg-purple-100",
    dayToday: "border-purple-500 border-2",
    daySelected: "bg-purple-600 hover:bg-purple-700",
    dayWeekend: "text-pink-600",
    dayDisabled: "opacity-30",
    dayOutsideMonth: "text-gray-300",
  });

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={customClassNames}
      />
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function CustomLabelsDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  // Custom English labels - merge with defaults, only override specific ones
  const customLabels = mergeLabels(defaultLabels, {
    timeLabel: "Select Time",
    hoursLabel: "Hr",
    minutesLabel: "Min",
    secondsLabel: "Sec",
    shortDays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const,
    // Custom text-based navigation buttons instead of icons
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
        showTime
        onChange={(v) => setValue(v)}
        classNames={defaultClassNames}
        labels={customLabels}
      />
      <div className="mt-2 text-xs text-gray-500 text-center">
        🏷️ Custom labels &amp; text nav via mergeLabels()
      </div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function CustomDayRendererDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  // Example: Mark some dates as having events
  const eventDates = [5, 12, 15, 22, 28];

  const renderDay = (day: DayCell, defaultRender: React.ReactNode): React.ReactNode => {
    const hasEvent = day.isCurrentMonth && eventDates.includes(day.date.getDate());

    return (
      <div className="relative">
        {defaultRender}
        {hasEvent && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
        )}
      </div>
    );
  };

  return (
    <>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={defaultClassNames}
        renderDay={renderDay}
      />
      <div className="mt-2 text-xs text-gray-500 text-center">
        🔴 Red dots = events on days 5, 12, 15, 22, 28
      </div>
      <ValueDisplay value={value} mode="single" />
    </>
  );
}

function AllCallbacksDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
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
          onTimeChange={(time, target) => addLog(`onTimeChange: ${time.hours}:${time.minutes} (${target})`)}
          onHourSelect={(hour) => addLog(`onHourSelect: ${hour}`)}
          onMinuteSelect={(minute) => addLog(`onMinuteSelect: ${minute}`)}
        />
        <ValueDisplay value={value} mode="single" />
      </div>
      <div className="flex-1 min-w-[280px]">
        <div className="bg-gray-900 rounded-xl p-4 h-80 overflow-y-auto shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <h4 className="text-green-400 font-mono text-sm font-semibold">Event Log</h4>
          </div>
          {logs.length === 0 ? (
            <p className="text-gray-500 font-mono text-xs">Interact with the calendar...</p>
          ) : (
            <div className="space-y-1.5">
              {logs.map((log, i) => (
                <div key={i} className="text-green-300 font-mono text-xs bg-gray-800 rounded px-2 py-1">
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
// MAIN APP
// ============================================================================

export default function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">📅</span>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white">
                React Calendar
              </h1>
              <p className="text-blue-400 font-mono text-sm">@vakac995/react-calendar</p>
            </div>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A flexible, customizable React calendar component with date range and time picker support.
            Fully typed with TypeScript generics.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <a
              href="https://www.npmjs.com/package/@vakac995/react-calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 0v24h24V0H0zm6.672 19.992H3.996V6.996h2.676v13.002-.006zm6.672 0H10.68V10.668H8.004V6.996h8.016v3.672h-2.676v9.324zm6.66 0h-2.676V10.668h2.676v9.324z"/>
              </svg>
              npm
            </a>
            <a
              href="https://github.com/vakac995/react-calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </header>

        {/* Demo Grid */}
        <div className="flex flex-col gap-6">
          <DemoCard
            title="Basic Single Date"
            description="Simple date picker with single selection"
            code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  classNames={defaultClassNames}
/>`}
          >
            <BasicCalendarDemo />
          </DemoCard>

          <DemoCard
            title="Date Range Selection"
            description="Select start and end dates"
            code={`<Calendar
  mode="range"
  value={value}
  onChange={setValue}
  classNames={defaultClassNames}
  showWeekNumbers
/>`}
          >
            <RangeCalendarDemo />
          </DemoCard>

          <DemoCard
            title="Date & Time (Bottom)"
            description="With scrollable time selectors"
            code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  classNames={defaultClassNames}
  showTime
  showSeconds
  timePosition="bottom"
/>`}
          >
            <CalendarWithTimeDemo />
          </DemoCard>

          <DemoCard
            title="Range with Time (Side)"
            description="Independent start/end time pickers"
            code={`<Calendar
  mode="range"
  value={value}
  onChange={setValue}
  classNames={defaultClassNames}
  showTime
  showSeconds
  timePosition="side"
/>`}
          >
            <RangeWithTimeDemo />
          </DemoCard>

          <DemoCard
            title="Min/Max Constraints"
            description="Limited date range selection"
            code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  classNames={defaultClassNames}
  minDate={new Date()} // today
  maxDate={addDays(new Date(), 30)}
/>`}
          >
            <MinMaxDatesDemo />
          </DemoCard>

          <DemoCard
            title="Week Numbers + Monday Start"
            description="Clickable week numbers"
            code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  classNames={defaultClassNames}
  weekStartsOn={1} // Monday
  showWeekNumbers
/>`}
          >
            <WeekStartMondayDemo />
          </DemoCard>

          <DemoCard
            title="Custom Year Range"
            description="Limited year selection"
            code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  classNames={defaultClassNames}
  years={[2020, 2021, 2022, ...]}
/>`}
          >
            <CustomYearsDemo />
          </DemoCard>

          <DemoCard
            title="Business Hours Only"
            description="Time restricted to 09:00–17:30"
            code={`<Calendar
  mode="single"
  value={value}
  onChange={setValue}
  classNames={defaultClassNames}
  showTime
  minTime={{ hours: 9, minutes: 0, seconds: 0 }}
  maxTime={{ hours: 17, minutes: 30, seconds: 0 }}
/>`}
          >
            <TimeWithLimitsDemo />
          </DemoCard>

          <DemoCard
            title="Custom Styling"
            description="Purple theme via classNames prop"
            code={`const customClassNames = mergeClassNames(
  defaultClassNames,
  {
    root: "bg-purple-50 border-purple-200",
    daySelected: "bg-purple-600",
    dayToday: "border-purple-500",
    // ... more overrides
  }
);

<Calendar classNames={customClassNames} />`}
          >
            <CustomStylesDemo />
          </DemoCard>

          <DemoCard
            title="Custom Labels"
            description="Override labels via mergeLabels()"
            code={`const customLabels = mergeLabels(
  defaultLabels,
  {
    timeLabel: "Select Time",
    hoursLabel: "Hr",
    minutesLabel: "Min",
    shortDays: ["Su", "Mo", "Tu", ...],
    previousMonthIcon: "«",
    nextMonthIcon: "»",
  }
);

<Calendar labels={customLabels} />`}
          >
            <CustomLabelsDemo />
          </DemoCard>

          <DemoCard
            title="Custom Day Renderer"
            description="Event indicators with renderDay"
            code={`const renderDay = (day, defaultRender) => (
  <div className="relative">
    {defaultRender}
    {hasEvent(day.date) && (
      <span className="absolute bottom-0.5
        w-1.5 h-1.5 bg-red-500 rounded-full" />
    )}
  </div>
);

<Calendar renderDay={renderDay} />`}
          >
            <CustomDayRendererDemo />
          </DemoCard>

          <DemoCard
            title="All Callbacks Demo"
            description="Interactive event log"
            code={`<Calendar
  mode="range"
  onDayClick={(date, e) => {}}
  onWeekClick={(week, e) => {}}
  onMonthSelect={(month, year) => {}}
  onYearChange={(year) => {}}
  onPrevMonth={(month, year) => {}}
  onNextMonth={(month, year) => {}}
  onPrevYear={(year) => {}}
  onNextYear={(year) => {}}
  onTimeChange={(time, target) => {}}
  onHourClick={(hour, target) => {}}
  onMinuteClick={(minute, target) => {}}
  // ... and more
/>`}
          >
            <AllCallbacksDemo />
          </DemoCard>
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-500 text-sm mt-12 pb-8">
          <p>Built with React + TypeScript + Tailwind CSS</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
            <code className="text-blue-400">npm install @vakac995/react-calendar</code>
            <CopyButton text="npm install @vakac995/react-calendar" />
          </div>
        </footer>
      </div>
    </div>
  );
}
