import React, { useState } from "react";
import {
  Calendar,
  type CalendarValue,
  type SelectionMode,
  type DateTimeValue,
  type DateRangeValue,
  type DayCell,
  type CalendarClassNames,
} from "./index";

// ============================================================================
// DEMO HELPER COMPONENTS
// ============================================================================

interface DemoSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function DemoSection({ title, description, children }: DemoSectionProps): React.ReactElement {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      {description && <p className="text-gray-500 text-sm mb-4">{description}</p>}
      <div className="flex flex-wrap gap-4">{children}</div>
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
    if (!dtv) return "null";
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
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
        <span className="font-medium text-gray-700">Selected: </span>
        <span className="text-blue-600">{singleValue ? formatDateTime(singleValue) : "None"}</span>
      </div>
    );
  }

  const rangeValue = value as DateRangeValue | undefined;
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
      <div>
        <span className="font-medium text-gray-700">Start: </span>
        <span className="text-blue-600">{formatDateTime(rangeValue?.start ?? null)}</span>
      </div>
      <div>
        <span className="font-medium text-gray-700">End: </span>
        <span className="text-green-600">{formatDateTime(rangeValue?.end ?? null)}</span>
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
    <div>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        onDayClick={(date) => console.log("Day clicked:", date)}
        onMonthSelect={(month, year) => console.log("Month selected:", month, year)}
        onYearChange={(year) => console.log("Year changed:", year)}
      />
      <ValueDisplay value={value} mode="single" />
    </div>
  );
}

function RangeCalendarDemo(): React.ReactElement {
  const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });

  return (
    <div>
      <Calendar<"range">
        mode="range"
        value={value}
        onChange={(v) => setValue(v)}
        onDayClick={(date) => console.log("Range day clicked:", date)}
      />
      <ValueDisplay value={value} mode="range" />
    </div>
  );
}

function CalendarWithTimeDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <div>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        showTime
        showSeconds
        timePosition="bottom"
        onTimeChange={(time, target) => console.log("Time changed:", time, target)}
        onHourSelect={(hour, target) => console.log("Hour selected:", hour, target)}
        onMinuteSelect={(minute, target) => console.log("Minute selected:", minute, target)}
        onSecondsSelect={(seconds, target) => console.log("Seconds selected:", seconds, target)}
      />
      <ValueDisplay value={value} mode="single" />
    </div>
  );
}

function RangeWithTimeDemo(): React.ReactElement {
  const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });

  return (
    <div>
      <Calendar<"range">
        mode="range"
        value={value}
        onChange={(v) => setValue(v)}
        showTime
        showSeconds
        timePosition="side"
        onTimeChange={(time, target) => console.log("Range time changed:", time, target)}
      />
      <ValueDisplay value={value} mode="range" />
    </div>
  );
}

function MinMaxDatesDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5);
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);

  return (
    <div>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        minDate={minDate}
        maxDate={maxDate}
      />
      <div className="mt-2 text-xs text-gray-500">
        Min: {minDate.toLocaleDateString()} | Max: {maxDate.toLocaleDateString()}
      </div>
      <ValueDisplay value={value} mode="single" />
    </div>
  );
}

function WeekStartMondayDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <div>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        weekStartsOn={1}
        showWeekNumbers
        onWeekClick={(week, _e) => console.log("Week clicked:", week)}
        onPrevWeek={(date) => console.log("Prev week from:", date)}
        onNextWeek={(date) => console.log("Next week from:", date)}
      />
      <ValueDisplay value={value} mode="single" />
    </div>
  );
}

function CustomYearsDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <div>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        years={years}
        onYearChange={(year) => console.log("Custom year changed:", year)}
        onPrevYear={(year) => console.log("Prev year:", year)}
        onNextYear={(year) => console.log("Next year:", year)}
      />
      <div className="mt-2 text-xs text-gray-500">
        Available years: {years[0]} - {years[years.length - 1]}
      </div>
      <ValueDisplay value={value} mode="single" />
    </div>
  );
}

function TimeWithLimitsDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  return (
    <div>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        showTime
        minTime={{ hours: 9, minutes: 0, seconds: 0 }}
        maxTime={{ hours: 17, minutes: 30, seconds: 0 }}
      />
      <div className="mt-2 text-xs text-gray-500">Time limited: 09:00 - 17:30</div>
      <ValueDisplay value={value} mode="single" />
    </div>
  );
}

function CustomStylesDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);

  const customClassNames: CalendarClassNames = {
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
  };

  return (
    <div>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        classNames={customClassNames}
      />
      <ValueDisplay value={value} mode="single" />
    </div>
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
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
        )}
      </div>
    );
  };

  return (
    <div>
      <Calendar<"single">
        mode="single"
        value={value}
        onChange={(v) => setValue(v)}
        renderDay={renderDay}
      />
      <div className="mt-2 text-xs text-gray-500">Red dots indicate events</div>
      <ValueDisplay value={value} mode="single" />
    </div>
  );
}

function AllCallbacksDemo(): React.ReactElement {
  const [value, setValue] = useState<DateTimeValue | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <div>
        <Calendar<"single">
          mode="single"
          value={value}
          onChange={(v) => {
            setValue(v);
            addLog(`onChange: ${v?.date.toLocaleDateString() ?? "null"}`);
          }}
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
      <div className="flex-1 min-w-[250px]">
        <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto">
          <h3 className="text-green-400 font-mono text-sm mb-2">Event Log:</h3>
          {logs.length === 0 ? (
            <p className="text-gray-500 font-mono text-xs">Interact with the calendar...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="text-green-300 font-mono text-xs">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📅 Production-Ready Calendar Component
          </h1>
          <p className="text-gray-600">
            Strictly typed TypeScript with generics • All features demonstrated below
          </p>
        </header>

        <DemoSection
          title="1. Basic Single Date Selection"
          description="Simple date picker with single selection mode"
        >
          <BasicCalendarDemo />
        </DemoSection>

        <DemoSection
          title="2. Range Selection"
          description="Select a date range. Same-day range sets 00:00:00 to 23:59:59"
        >
          <RangeCalendarDemo />
        </DemoSection>

        <DemoSection
          title="3. Single Date with Time (Bottom Position)"
          description="Date and time selection with seconds, scrollable time selectors"
        >
          <CalendarWithTimeDemo />
        </DemoSection>

        <DemoSection
          title="4. Range with Time (Side Position)"
          description="Range selection with independent start/end time pickers"
        >
          <RangeWithTimeDemo />
        </DemoSection>

        <DemoSection
          title="5. Min/Max Date Constraints"
          description="Only dates within range are selectable"
        >
          <MinMaxDatesDemo />
        </DemoSection>

        <DemoSection
          title="6. Week Starts on Monday + Week Numbers"
          description="Configurable week start day with clickable week numbers"
        >
          <WeekStartMondayDemo />
        </DemoSection>

        <DemoSection
          title="7. Custom Years Array"
          description="Limit year selection to specific range"
        >
          <CustomYearsDemo />
        </DemoSection>

        <DemoSection
          title="8. Time with Min/Max Limits"
          description="Time selection restricted to business hours (9:00 AM - 5:30 PM)"
        >
          <TimeWithLimitsDemo />
        </DemoSection>

        <DemoSection
          title="9. Custom Styling via classNames"
          description="Every element is stylable via the classNames prop"
        >
          <CustomStylesDemo />
        </DemoSection>

        <DemoSection
          title="10. Custom Day Renderer"
          description="Use renderDay prop to add custom indicators"
        >
          <CustomDayRendererDemo />
        </DemoSection>

        <DemoSection
          title="11. All Callbacks Demo"
          description="Interactive log showing all event callbacks in action"
        >
          <AllCallbacksDemo />
        </DemoSection>

        <footer className="text-center text-gray-500 text-sm mt-12 pb-8">
          <p>Built with React + TypeScript + Tailwind CSS</p>
          <p className="mt-1">All types are strictly enforced with generics</p>
        </footer>
      </div>
    </div>
  );
}
