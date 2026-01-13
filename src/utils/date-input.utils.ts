import type { FormatSegment } from "../types/date-input.types";

// ============================================================================
// FORMAT PATTERN DEFINITIONS
// ============================================================================

/**
 * Maps format tokens to their configurations
 */
export const FORMAT_TOKENS: Record<
  string,
  {
    length: number;
    placeholder: string;
    max: number;
    getValue: (date: Date) => number;
    getDisplay: (date: Date, locale?: string) => string;
  }
> = {
  YYYY: {
    length: 4,
    placeholder: "YYYY",
    max: 9999,
    getValue: (d) => d.getFullYear(),
    getDisplay: (d) => String(d.getFullYear()).padStart(4, "0"),
  },
  YY: {
    length: 2,
    placeholder: "YY",
    max: 99,
    getValue: (d) => d.getFullYear() % 100,
    getDisplay: (d) => String(d.getFullYear() % 100).padStart(2, "0"),
  },
  MMMM: {
    length: 0, // Variable length
    placeholder: "Month",
    max: 12,
    getValue: (d) => d.getMonth() + 1,
    getDisplay: (d, locale = "en-US") =>
      new Intl.DateTimeFormat(locale, { month: "long" }).format(d),
  },
  MMM: {
    length: 0, // Variable length
    placeholder: "Mon",
    max: 12,
    getValue: (d) => d.getMonth() + 1,
    getDisplay: (d, locale = "en-US") =>
      new Intl.DateTimeFormat(locale, { month: "short" }).format(d),
  },
  MM: {
    length: 2,
    placeholder: "MM",
    max: 12,
    getValue: (d) => d.getMonth() + 1,
    getDisplay: (d) => String(d.getMonth() + 1).padStart(2, "0"),
  },
  M: {
    length: 1,
    placeholder: "M",
    max: 12,
    getValue: (d) => d.getMonth() + 1,
    getDisplay: (d) => String(d.getMonth() + 1),
  },
  DD: {
    length: 2,
    placeholder: "DD",
    max: 31,
    getValue: (d) => d.getDate(),
    getDisplay: (d) => String(d.getDate()).padStart(2, "0"),
  },
  D: {
    length: 1,
    placeholder: "D",
    max: 31,
    getValue: (d) => d.getDate(),
    getDisplay: (d) => String(d.getDate()),
  },
  dddd: {
    length: 0, // Variable length
    placeholder: "Day",
    max: 7,
    getValue: (d) => d.getDay(),
    getDisplay: (d, locale = "en-US") =>
      new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d),
  },
  ddd: {
    length: 0, // Variable length
    placeholder: "Day",
    max: 7,
    getValue: (d) => d.getDay(),
    getDisplay: (d, locale = "en-US") =>
      new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d),
  },
  HH: {
    length: 2,
    placeholder: "HH",
    max: 23,
    getValue: (d) => d.getHours(),
    getDisplay: (d) => String(d.getHours()).padStart(2, "0"),
  },
  hh: {
    length: 2,
    placeholder: "hh",
    max: 12,
    getValue: (d) => d.getHours() % 12 || 12,
    getDisplay: (d) => String(d.getHours() % 12 || 12).padStart(2, "0"),
  },
  H: {
    length: 1,
    placeholder: "H",
    max: 23,
    getValue: (d) => d.getHours(),
    getDisplay: (d) => String(d.getHours()),
  },
  h: {
    length: 1,
    placeholder: "h",
    max: 12,
    getValue: (d) => d.getHours() % 12 || 12,
    getDisplay: (d) => String(d.getHours() % 12 || 12),
  },
  mm: {
    length: 2,
    placeholder: "mm",
    max: 59,
    getValue: (d) => d.getMinutes(),
    getDisplay: (d) => String(d.getMinutes()).padStart(2, "0"),
  },
  ss: {
    length: 2,
    placeholder: "ss",
    max: 59,
    getValue: (d) => d.getSeconds(),
    getDisplay: (d) => String(d.getSeconds()).padStart(2, "0"),
  },
  A: {
    length: 2,
    placeholder: "AM",
    max: 1,
    getValue: (d) => (d.getHours() < 12 ? 0 : 1),
    getDisplay: (d) => (d.getHours() < 12 ? "AM" : "PM"),
  },
  a: {
    length: 2,
    placeholder: "am",
    max: 1,
    getValue: (d) => (d.getHours() < 12 ? 0 : 1),
    getDisplay: (d) => (d.getHours() < 12 ? "am" : "pm"),
  },
};

// Sorted by length (longest first) to match longer tokens before shorter ones
const TOKEN_KEYS = Object.keys(FORMAT_TOKENS).sort((a, b) => b.length - a.length);

// ============================================================================
// FORMAT PARSING
// ============================================================================

/**
 * Parse a format string into segments (tokens and literals)
 */
export function parseFormat(format: string): FormatSegment[] {
  const segments: FormatSegment[] = [];
  let remaining = format;

  while (remaining.length > 0) {
    let matched = false;

    // Try to match a token
    for (const token of TOKEN_KEYS) {
      if (remaining.startsWith(token)) {
        const tokenConfig = FORMAT_TOKENS[token];
        segments.push({
          type: "token",
          value: token,
          token,
          length: tokenConfig?.length ?? 0,
        });
        remaining = remaining.slice(token.length);
        matched = true;
        break;
      }
    }

    // If no token matched, it's a literal character
    if (!matched) {
      const char = remaining[0] ?? "";
      // Merge with previous literal if possible
      const lastSegment = segments[segments.length - 1];
      if (lastSegment?.type === "literal") {
        lastSegment.value += char;
      } else {
        segments.push({
          type: "literal",
          value: char,
        });
      }
      remaining = remaining.slice(1);
    }
  }

  return segments;
}

/**
 * Generate a mask placeholder from format segments
 */
export function generateMask(segments: FormatSegment[]): string {
  return segments
    .map((segment) => {
      if (segment.type === "literal") {
        return segment.value;
      }
      const tokenConfig = FORMAT_TOKENS[segment.token ?? ""];
      if (!tokenConfig) return "";

      // For variable length tokens, use the placeholder
      if (tokenConfig.length === 0) {
        return tokenConfig.placeholder;
      }

      // For fixed length tokens, use underscores
      return "_".repeat(tokenConfig.length);
    })
    .join("");
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date using a format string
 */
export function formatDateInput(date: Date, format: string, locale = "en-US"): string {
  const segments = parseFormat(format);

  return segments
    .map((segment) => {
      if (segment.type === "literal") {
        return segment.value;
      }
      const tokenConfig = FORMAT_TOKENS[segment.token ?? ""];
      if (!tokenConfig) return "";
      return tokenConfig.getDisplay(date, locale);
    })
    .join("");
}

// ============================================================================
// DATE PARSING
// ============================================================================

interface ParsedDateParts {
  year?: number;
  month?: number;
  day?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  isPM?: boolean;
}

/**
 * Parse a date string using a format string
 */
export function parseDateInput(value: string, format: string, locale = "en-US"): Date | null {
  const segments = parseFormat(format);
  const parts: ParsedDateParts = {};

  let valueIndex = 0;

  for (const segment of segments) {
    if (segment.type === "literal") {
      // Skip literal characters in the value
      const literal = segment.value;
      if (value.slice(valueIndex, valueIndex + literal.length) !== literal) {
        // Allow flexible matching - skip if not matching
        if (value[valueIndex] === literal[0]) {
          valueIndex += literal.length;
        }
      } else {
        valueIndex += literal.length;
      }
      continue;
    }

    const token = segment.token;
    if (!token) continue;

    const tokenConfig = FORMAT_TOKENS[token];
    if (!tokenConfig) continue;

    // Extract the value for this token
    let tokenValue: string;

    if (tokenConfig.length === 0) {
      // Variable length token (month names, day names)
      // For parsing, we need to find the next literal or end
      const nextSegment = segments[segments.indexOf(segment) + 1];
      if (nextSegment?.type === "literal") {
        const delimiterIndex = value.indexOf(nextSegment.value, valueIndex);
        if (delimiterIndex === -1) {
          tokenValue = value.slice(valueIndex);
        } else {
          tokenValue = value.slice(valueIndex, delimiterIndex);
        }
      } else {
        tokenValue = value.slice(valueIndex);
      }
    } else {
      tokenValue = value.slice(valueIndex, valueIndex + tokenConfig.length);
    }

    valueIndex += tokenValue.length;

    // Parse the token value
    const numValue = parseInt(tokenValue, 10);

    switch (token) {
      case "YYYY":
        parts.year = numValue;
        break;
      case "YY":
        // Convert 2-digit year to 4-digit (assume 2000s for 00-99)
        parts.year = numValue < 50 ? 2000 + numValue : 1900 + numValue;
        break;
      case "MM":
      case "M":
        parts.month = numValue;
        break;
      case "MMMM":
      case "MMM": {
        // Parse month name
        const monthIndex = parseMonthName(tokenValue, locale);
        if (monthIndex !== -1) {
          parts.month = monthIndex + 1;
        }
        break;
      }
      case "DD":
      case "D":
        parts.day = numValue;
        break;
      case "HH":
      case "H":
        parts.hours = numValue;
        break;
      case "hh":
      case "h":
        parts.hours = numValue;
        break;
      case "mm":
        parts.minutes = numValue;
        break;
      case "ss":
        parts.seconds = numValue;
        break;
      case "A":
      case "a":
        parts.isPM = tokenValue.toLowerCase() === "pm";
        break;
    }
  }

  // Adjust hours for 12-hour format
  if (parts.hours !== undefined && parts.isPM !== undefined) {
    if (parts.isPM && parts.hours < 12) {
      parts.hours += 12;
    } else if (!parts.isPM && parts.hours === 12) {
      parts.hours = 0;
    }
  }

  // Validate and construct date
  if (parts.year === undefined || parts.month === undefined || parts.day === undefined) {
    return null;
  }

  if (
    isNaN(parts.year) ||
    isNaN(parts.month) ||
    isNaN(parts.day) ||
    parts.month < 1 ||
    parts.month > 12 ||
    parts.day < 1 ||
    parts.day > 31
  ) {
    return null;
  }

  const date = new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hours ?? 0,
    parts.minutes ?? 0,
    parts.seconds ?? 0
  );

  // Validate the date is real (e.g., Feb 30 would roll over)
  if (
    date.getFullYear() !== parts.year ||
    date.getMonth() !== parts.month - 1 ||
    date.getDate() !== parts.day
  ) {
    return null;
  }

  return date;
}

/**
 * Parse a month name to its index (0-11)
 */
function parseMonthName(name: string, locale: string): number {
  const lowerName = name.toLowerCase();

  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 1);
    const longName = new Intl.DateTimeFormat(locale, { month: "long" }).format(date).toLowerCase();
    const shortName = new Intl.DateTimeFormat(locale, { month: "short" })
      .format(date)
      .toLowerCase();

    if (longName === lowerName || shortName === lowerName) {
      return i;
    }
  }

  return -1;
}

// ============================================================================
// INPUT MASK UTILITIES
// ============================================================================

/**
 * Apply mask to input value (for display while typing)
 */
export function applyMask(value: string, format: string, _previousValue = ""): string {
  const segments = parseFormat(format);
  const digits = value.replace(/\D/g, "");

  if (digits.length === 0) {
    return "";
  }

  let result = "";
  let digitIndex = 0;

  for (const segment of segments) {
    if (segment.type === "literal") {
      // Add literal if we have more digits coming
      if (digitIndex < digits.length) {
        result += segment.value;
      }
      continue;
    }

    const token = segment.token;
    if (!token) continue;

    const tokenConfig = FORMAT_TOKENS[token];
    if (!tokenConfig || tokenConfig.length === 0) continue;

    // Extract digits for this token
    const tokenDigits = digits.slice(digitIndex, digitIndex + tokenConfig.length);
    if (tokenDigits.length === 0) break;

    result += tokenDigits;
    digitIndex += tokenDigits.length;

    // If we've consumed all digits, stop
    if (digitIndex >= digits.length) break;
  }

  return result;
}

/**
 * Validate if a value matches the expected format
 */
export function isValidFormat(value: string, format: string): boolean {
  const date = parseDateInput(value, format);
  return date !== null;
}

/**
 * Check if a date is within min/max bounds
 */
export function isDateInBounds(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate) {
    const minStart = new Date(minDate);
    minStart.setHours(0, 0, 0, 0);
    if (date < minStart) return false;
  }

  if (maxDate) {
    const maxEnd = new Date(maxDate);
    maxEnd.setHours(23, 59, 59, 999);
    if (date > maxEnd) return false;
  }

  return true;
}

// ============================================================================
// LOCALE UTILITIES
// ============================================================================

/**
 * Get localized month names
 */
export function getLocalizedMonthNames(
  locale = "en-US",
  format: "long" | "short" = "long"
): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { month: format }).format(new Date(2024, i, 1))
  );
}

/**
 * Get localized day names
 */
export function getLocalizedDayNames(
  locale = "en-US",
  format: "long" | "short" | "narrow" = "short"
): string[] {
  // Start from Sunday (day 0)
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: format }).format(
      new Date(2024, 0, 7 + i) // Jan 7, 2024 is a Sunday
    )
  );
}

/**
 * Detect first day of week for a locale
 * Note: This uses a fallback approach since Intl.Locale.prototype.weekInfo
 * is not available in all environments
 */
export function getFirstDayOfWeek(locale: string): 0 | 1 | 6 {
  // Countries that start the week on Sunday
  const sundayFirstLocales = [
    "en-US",
    "en-CA",
    "en-AU",
    "en-NZ",
    "en-PH",
    "he-IL",
    "ar-SA",
    "ja-JP",
    "ko-KR",
    "zh-CN",
    "zh-TW",
    "pt-BR",
  ];

  // Countries that start the week on Saturday
  const saturdayFirstLocales = ["ar-AE", "ar-BH", "ar-EG", "ar-IQ", "ar-JO", "ar-KW"];

  const normalizedLocale = locale.toLowerCase();

  for (const l of saturdayFirstLocales) {
    if (normalizedLocale.startsWith(l.toLowerCase())) {
      return 6;
    }
  }

  for (const l of sundayFirstLocales) {
    if (normalizedLocale.startsWith(l.toLowerCase())) {
      return 0;
    }
  }

  // Default to Monday for most of the world
  return 1;
}

/**
 * Get the text direction for a locale
 */
export function getTextDirection(locale: string): "ltr" | "rtl" {
  const rtlLocales = ["ar", "he", "fa", "ur", "yi", "ps", "sd"];
  const lang = (locale.split("-")[0] ?? "").toLowerCase();
  return rtlLocales.includes(lang) ? "rtl" : "ltr";
}
