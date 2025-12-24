import React, { useCallback } from "react";
import type { TimeValue, CalendarClassNames } from "../types";
import { isTimeDisabled } from "../utils";
import { TimeSelector } from "./TimeSelector";

interface TimePickerProps {
  time: TimeValue;
  label?: string;
  showSeconds?: boolean;
  disabled?: boolean;
  minTime?: TimeValue;
  maxTime?: TimeValue;
  classNames?: CalendarClassNames;
  target: "start" | "end" | "single";
  onTimeChange?: (time: TimeValue, target: "start" | "end" | "single") => void;
  onHourClick?: (hour: number, target: "start" | "end" | "single") => void;
  onHourSelect?: (hour: number, target: "start" | "end" | "single") => void;
  onMinuteClick?: (minute: number, target: "start" | "end" | "single") => void;
  onMinuteSelect?: (minute: number, target: "start" | "end" | "single") => void;
  onSecondsClick?: (seconds: number, target: "start" | "end" | "single") => void;
  onSecondsSelect?: (seconds: number, target: "start" | "end" | "single") => void;
}

export function TimePicker({
  time,
  label,
  showSeconds = false,
  disabled = false,
  minTime,
  maxTime,
  classNames,
  target,
  onTimeChange,
  onHourClick,
  onHourSelect,
  onMinuteClick,
  onMinuteSelect,
  onSecondsClick,
  onSecondsSelect,
}: TimePickerProps): React.ReactElement {
  const handleHourChange = useCallback(
    (hour: number) => {
      const newTime = { ...time, hours: hour };
      onTimeChange?.(newTime, target);
    },
    [time, target, onTimeChange]
  );

  const handleMinuteChange = useCallback(
    (minute: number) => {
      const newTime = { ...time, minutes: minute };
      onTimeChange?.(newTime, target);
    },
    [time, target, onTimeChange]
  );

  const handleSecondsChange = useCallback(
    (seconds: number) => {
      const newTime = { ...time, seconds };
      onTimeChange?.(newTime, target);
    },
    [time, target, onTimeChange]
  );

  const isHourDisabled = useCallback(
    (hour: number) => isTimeDisabled(hour, 0, 0, minTime, maxTime),
    [minTime, maxTime]
  );

  const isMinuteDisabled = useCallback(
    (minute: number) => isTimeDisabled(time.hours, minute, 0, minTime, maxTime),
    [time.hours, minTime, maxTime]
  );

  const isSecondDisabled = useCallback(
    (second: number) => isTimeDisabled(time.hours, time.minutes, second, minTime, maxTime),
    [time.hours, time.minutes, minTime, maxTime]
  );

  return (
    <div className={classNames?.timeContainer}>
      {label && (
        <span className={classNames?.timeLabel}>
          {label}
        </span>
      )}
      <div className={classNames?.timeSelectors}>
        <TimeSelector
          value={time.hours}
          max={23}
          label="HH"
          disabled={disabled}
          classNames={classNames}
          isDisabled={isHourDisabled}
          onClick={(h) => onHourClick?.(h, target)}
          onSelect={(h) => {
            handleHourChange(h);
            onHourSelect?.(h, target);
          }}
        />
        <span className={classNames?.timeSeparator}>:</span>
        <TimeSelector
          value={time.minutes}
          max={59}
          label="MM"
          disabled={disabled}
          classNames={classNames}
          isDisabled={isMinuteDisabled}
          onClick={(m) => onMinuteClick?.(m, target)}
          onSelect={(m) => {
            handleMinuteChange(m);
            onMinuteSelect?.(m, target);
          }}
        />
        {showSeconds && (
          <>
            <span className={classNames?.timeSeparator}>:</span>
            <TimeSelector
              value={time.seconds}
              max={59}
              label="SS"
              disabled={disabled}
              classNames={classNames}
              isDisabled={isSecondDisabled}
              onClick={(s) => onSecondsClick?.(s, target)}
              onSelect={(s) => {
                handleSecondsChange(s);
                onSecondsSelect?.(s, target);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
