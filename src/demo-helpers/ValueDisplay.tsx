import type { ReactElement } from "react";
import type { DateTimeValue, DateRangeValue, SelectionMode, CalendarValue } from "../types";

/**
 * Format a DateTimeValue to a displayable string.
 */
function formatDateTime(dtv: DateTimeValue | null): string {
  if (!dtv) return "—";

  const date = dtv.date.toLocaleDateString();
  const hours = dtv.time?.hours ?? 0;
  const minutes = dtv.time?.minutes ?? 0;
  const seconds = dtv.time?.seconds ?? 0;
  const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return dtv.time ? `${date} ${time}` : date;
}

interface ValueDisplayProps<TMode extends SelectionMode> {
  /** Current calendar value */
  value: CalendarValue<TMode> | undefined;
  /** Selection mode */
  mode: TMode;
  /** Whether to show time in the display */
  showTime?: boolean;
}

/**
 * Displays the current selected value for single or range mode.
 * Shows formatted date and optionally time.
 */
export function ValueDisplay<TMode extends SelectionMode>({
  value,
  mode,
}: ValueDisplayProps<TMode>): ReactElement {
  if (mode === "single") {
    const singleValue = value as DateTimeValue | null | undefined;

    return (
      <div className="mt-4 w-full rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-600">Selected:</span>
          <span className="font-mono text-blue-600">
            {singleValue ? formatDateTime(singleValue) : "—"}
          </span>
        </div>
      </div>
    );
  }

  const rangeValue = value as DateRangeValue | null | undefined;

  return (
    <div className="mt-4 w-full space-y-2 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-600">Start:</span>
        <span className="font-mono text-blue-600">{formatDateTime(rangeValue?.start ?? null)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-600">End:</span>
        <span className="font-mono text-emerald-600">
          {formatDateTime(rangeValue?.end ?? null)}
        </span>
      </div>
    </div>
  );
}
