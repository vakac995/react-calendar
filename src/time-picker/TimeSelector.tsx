import type React from "react";
import { useMemo, useCallback } from "react";
import type { CalendarClassNames } from "../types";

interface TimeSelectorProps {
  value: number;
  max: number;
  label: string;
  disabled?: boolean;
  classNames?: CalendarClassNames;
  isDisabled?: (value: number) => boolean;
  onClick?: (value: number) => void;
  onSelect?: (value: number) => void;
}

export function TimeSelector({
  value,
  max,
  label,
  disabled,
  classNames,
  isDisabled,
  onClick,
  onSelect,
}: TimeSelectorProps): React.ReactElement {
  const items = useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i <= max; i++) {
      result.push(i);
    }
    return result;
  }, [max]);

  const handleClick = useCallback(
    (v: number) => {
      if (disabled || isDisabled?.(v)) return;
      onClick?.(v);
      onSelect?.(v);
    },
    [disabled, isDisabled, onClick, onSelect]
  );

  return (
    <div
      className={[classNames?.timeSelector, disabled && classNames?.timeSelectorDisabled]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          classNames?.timeSelectorLabel,
          disabled && classNames?.timeSelectorLabelDisabled,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </span>
      <div
        className={[
          classNames?.timeSelectorScroll,
          disabled && classNames?.timeSelectorScrollDisabled,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {items.map((item) => {
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          const itemDisabled = disabled || isDisabled?.(item);
          const isSelected = item === value;

          return (
            <button
              key={item}
              type="button"
              disabled={itemDisabled}
              onClick={() => handleClick(item)}
              className={[
                classNames?.timeSelectorItem,
                isSelected && classNames?.timeSelectorItemSelected,
                itemDisabled && classNames?.timeSelectorItemDisabled,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {String(item).padStart(2, "0")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
