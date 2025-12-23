import React, {
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import type { CalendarClassNames } from "../types";
import { cn } from "../utils";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Scroll to selected value on mount and when value changes
  useEffect(() => {
    const element = itemRefs.current.get(value);
    if (element && scrollRef.current) {
      const container = scrollRef.current;
      const scrollTop = element.offsetTop - container.clientHeight / 2 + element.clientHeight / 2;
      container.scrollTop = scrollTop;
    }
  }, [value]);

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
    <div className={cn("flex flex-col items-center", classNames?.timeSelector)}>
      <span
        className={cn(
          "text-xs text-gray-500 mb-1 font-medium",
          classNames?.timeSelectorLabel
        )}
      >
        {label}
      </span>
      <div
        ref={scrollRef}
        className={cn(
          "h-32 w-12 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300",
          "border border-gray-200 rounded-md bg-white",
          classNames?.timeSelectorScroll
        )}
      >
        {items.map((item) => {
          const itemDisabled = disabled || isDisabled?.(item);
          const isSelected = item === value;

          return (
            <button
              key={item}
              ref={(el) => {
                if (el) itemRefs.current.set(item, el);
              }}
              type="button"
              disabled={itemDisabled}
              onClick={() => handleClick(item)}
              className={cn(
                "w-full py-1.5 text-center text-sm transition-colors",
                "hover:bg-gray-100 focus:outline-none focus:bg-gray-100",
                isSelected && "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600",
                itemDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                classNames?.timeSelectorItem,
                isSelected && classNames?.timeSelectorItemSelected,
                itemDisabled && classNames?.timeSelectorItemDisabled
              )}
            >
              {String(item).padStart(2, "0")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
