import type { TimeValue } from "../types";

export function isTimeDisabled(
  hour: number,
  minute: number,
  second: number,
  minTime?: TimeValue,
  maxTime?: TimeValue
): boolean {
  if (!minTime && !maxTime) return false;

  const totalSeconds = hour * 3600 + minute * 60 + second;

  if (minTime) {
    const minTotal = minTime.hours * 3600 + minTime.minutes * 60 + minTime.seconds;
    if (totalSeconds < minTotal) return true;
  }

  if (maxTime) {
    const maxTotal = maxTime.hours * 3600 + maxTime.minutes * 60 + maxTime.seconds;
    if (totalSeconds > maxTotal) return true;
  }

  return false;
}
