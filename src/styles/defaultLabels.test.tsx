import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { defaultLabels, mergeLabels } from "./defaultLabels";
import type { CalendarLabels } from "../types";

describe("defaultLabels", () => {
  describe("structure", () => {
    it("should export a valid CalendarLabels object", () => {
      expect(defaultLabels).toBeDefined();
      expect(typeof defaultLabels).toBe("object");
    });

    it("should have all navigation aria-labels defined", () => {
      expect(defaultLabels.previousYear).toBe("Previous year");
      expect(defaultLabels.previousMonth).toBe("Previous month");
      expect(defaultLabels.nextMonth).toBe("Next month");
      expect(defaultLabels.nextYear).toBe("Next year");
    });

    it("should have all navigation icons defined", () => {
      expect(defaultLabels.previousYearIcon).toBeDefined();
      expect(defaultLabels.previousMonthIcon).toBeDefined();
      expect(defaultLabels.nextMonthIcon).toBeDefined();
      expect(defaultLabels.nextYearIcon).toBeDefined();
    });

    it("should have all time labels defined", () => {
      expect(defaultLabels.timeLabel).toBe("Time");
      expect(defaultLabels.startTimeLabel).toBe("Start Time");
      expect(defaultLabels.endTimeLabel).toBe("End Time");
      expect(defaultLabels.hoursLabel).toBe("HH");
      expect(defaultLabels.minutesLabel).toBe("MM");
      expect(defaultLabels.secondsLabel).toBe("SS");
    });

    it("should have 12 months defined", () => {
      expect(defaultLabels.months).toBeDefined();
      expect(defaultLabels.months).toHaveLength(12);
    });

    it("should have correct month names", () => {
      const months = defaultLabels.months!;
      expect(months[0]).toBe("January");
      expect(months[1]).toBe("February");
      expect(months[2]).toBe("March");
      expect(months[3]).toBe("April");
      expect(months[4]).toBe("May");
      expect(months[5]).toBe("June");
      expect(months[6]).toBe("July");
      expect(months[7]).toBe("August");
      expect(months[8]).toBe("September");
      expect(months[9]).toBe("October");
      expect(months[10]).toBe("November");
      expect(months[11]).toBe("December");
    });

    it("should have 7 short day names defined", () => {
      expect(defaultLabels.shortDays).toBeDefined();
      expect(defaultLabels.shortDays).toHaveLength(7);
    });

    it("should have correct short day names starting from Sunday", () => {
      const days = defaultLabels.shortDays!;
      expect(days[0]).toBe("Sun");
      expect(days[1]).toBe("Mon");
      expect(days[2]).toBe("Tue");
      expect(days[3]).toBe("Wed");
      expect(days[4]).toBe("Thu");
      expect(days[5]).toBe("Fri");
      expect(days[6]).toBe("Sat");
    });
  });

  describe("navigation icons", () => {
    it("should render previousYearIcon as valid React element", () => {
      const { container } = render(<>{defaultLabels.previousYearIcon}</>);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
    });

    it("should render previousMonthIcon as valid React element", () => {
      const { container } = render(<>{defaultLabels.previousMonthIcon}</>);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
    });

    it("should render nextMonthIcon as valid React element", () => {
      const { container } = render(<>{defaultLabels.nextMonthIcon}</>);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
    });

    it("should render nextYearIcon as valid React element", () => {
      const { container } = render(<>{defaultLabels.nextYearIcon}</>);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
    });

    it("should have proper SVG attributes on icons", () => {
      const { container } = render(<>{defaultLabels.previousYearIcon}</>);
      const svg = container.querySelector("svg");

      expect(svg?.getAttribute("fill")).toBe("none");
      expect(svg?.getAttribute("stroke")).toBe("currentColor");
      expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    });
  });
});

describe("mergeLabels", () => {
  describe("basic functionality", () => {
    it("should return base when custom is undefined", () => {
      const result = mergeLabels(defaultLabels, undefined);
      expect(result).toEqual(defaultLabels);
    });

    it("should return base when custom is empty", () => {
      const result = mergeLabels(defaultLabels, {});
      expect(result).toEqual(defaultLabels);
    });

    it("should override a single string label", () => {
      const custom: CalendarLabels = {
        timeLabel: "Hora",
      };
      const result = mergeLabels(defaultLabels, custom);

      expect(result.timeLabel).toBe("Hora");
      // Other labels should remain
      expect(result.previousMonth).toBe("Previous month");
    });

    it("should override multiple labels", () => {
      const custom: CalendarLabels = {
        timeLabel: "Zeit",
        startTimeLabel: "Startzeit",
        endTimeLabel: "Endzeit",
      };
      const result = mergeLabels(defaultLabels, custom);

      expect(result.timeLabel).toBe("Zeit");
      expect(result.startTimeLabel).toBe("Startzeit");
      expect(result.endTimeLabel).toBe("Endzeit");
    });

    it("should override months array", () => {
      const spanishMonths = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ] as const;

      const custom: CalendarLabels = {
        months: spanishMonths,
      };
      const result = mergeLabels(defaultLabels, custom);

      expect(result.months![0]).toBe("Enero");
      expect(result.months![11]).toBe("Diciembre");
    });

    it("should override shortDays array", () => {
      const germanDays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;

      const custom: CalendarLabels = {
        shortDays: germanDays,
      };
      const result = mergeLabels(defaultLabels, custom);

      expect(result.shortDays![0]).toBe("So");
      expect(result.shortDays![1]).toBe("Mo");
    });

    it("should override navigation icons", () => {
      const customIcon = <span>←←</span>;
      const custom: CalendarLabels = {
        previousYearIcon: customIcon,
      };
      const result = mergeLabels(defaultLabels, custom);

      const { container } = render(<>{result.previousYearIcon}</>);
      expect(container.textContent).toBe("←←");
    });
  });

  describe("edge cases", () => {
    it("should not mutate the base object", () => {
      const baseCopy = { ...defaultLabels };
      const custom: CalendarLabels = {
        timeLabel: "Mutated",
      };
      mergeLabels(defaultLabels, custom);

      expect(defaultLabels.timeLabel).toBe(baseCopy.timeLabel);
    });

    it("should not mutate the custom object", () => {
      const custom: CalendarLabels = {
        timeLabel: "Custom",
      };
      const customCopy = { ...custom };
      mergeLabels(defaultLabels, custom);

      expect(custom.timeLabel).toBe(customCopy.timeLabel);
    });

    it("should handle empty string values", () => {
      const custom: CalendarLabels = {
        timeLabel: "",
      };
      const result = mergeLabels(defaultLabels, custom);

      expect(result.timeLabel).toBe("");
    });

    it("should handle partial month array replacement", () => {
      // Even though it's partial in logic, the type expects full array
      // This tests that the whole array is replaced
      const partialMonths = [
        "M1",
        "M2",
        "M3",
        "M4",
        "M5",
        "M6",
        "M7",
        "M8",
        "M9",
        "M10",
        "M11",
        "M12",
      ] as const;
      const custom: CalendarLabels = {
        months: partialMonths,
      };
      const result = mergeLabels(defaultLabels, custom);

      expect(result.months).toEqual(partialMonths);
    });

    it("should handle null icon replacement", () => {
      const custom: CalendarLabels = {
        previousYearIcon: null,
      };
      const result = mergeLabels(defaultLabels, custom);

      expect(result.previousYearIcon).toBeNull();
    });

    it("should handle string icon replacement", () => {
      const custom: CalendarLabels = {
        previousYearIcon: "«",
        previousMonthIcon: "‹",
        nextMonthIcon: "›",
        nextYearIcon: "»",
      };
      const result = mergeLabels(defaultLabels, custom);

      expect(result.previousYearIcon).toBe("«");
      expect(result.previousMonthIcon).toBe("‹");
      expect(result.nextMonthIcon).toBe("›");
      expect(result.nextYearIcon).toBe("»");
    });
  });

  describe("chaining", () => {
    it("should support chaining multiple merges", () => {
      const first: CalendarLabels = { timeLabel: "First" };
      const second: CalendarLabels = { startTimeLabel: "Second" };
      const third: CalendarLabels = { endTimeLabel: "Third" };

      const result = mergeLabels(mergeLabels(mergeLabels(defaultLabels, first), second), third);

      expect(result.timeLabel).toBe("First");
      expect(result.startTimeLabel).toBe("Second");
      expect(result.endTimeLabel).toBe("Third");
    });

    it("should allow later merges to override earlier ones", () => {
      const first: CalendarLabels = { timeLabel: "First" };
      const second: CalendarLabels = { timeLabel: "Second" };

      const result = mergeLabels(mergeLabels(defaultLabels, first), second);

      expect(result.timeLabel).toBe("Second");
    });
  });
});

describe("i18n scenarios", () => {
  it("should support complete French localization", () => {
    const frenchLabels: CalendarLabels = {
      previousYear: "Année précédente",
      previousMonth: "Mois précédent",
      nextMonth: "Mois suivant",
      nextYear: "Année suivante",
      timeLabel: "Heure",
      startTimeLabel: "Heure de début",
      endTimeLabel: "Heure de fin",
      hoursLabel: "HH",
      minutesLabel: "MM",
      secondsLabel: "SS",
      months: [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
      ],
      shortDays: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    };

    const result = mergeLabels(defaultLabels, frenchLabels);

    expect(result.months![0]).toBe("Janvier");
    expect(result.shortDays![0]).toBe("Dim");
    expect(result.timeLabel).toBe("Heure");
  });

  it("should support complete German localization", () => {
    const germanLabels: CalendarLabels = {
      previousYear: "Vorheriges Jahr",
      previousMonth: "Vorheriger Monat",
      nextMonth: "Nächster Monat",
      nextYear: "Nächstes Jahr",
      timeLabel: "Zeit",
      startTimeLabel: "Startzeit",
      endTimeLabel: "Endzeit",
      months: [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
      ],
      shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    };

    const result = mergeLabels(defaultLabels, germanLabels);

    expect(result.months![0]).toBe("Januar");
    expect(result.shortDays![1]).toBe("Mo");
  });

  it("should support RTL languages (Arabic)", () => {
    const arabicLabels: CalendarLabels = {
      previousYear: "السنة السابقة",
      previousMonth: "الشهر السابق",
      nextMonth: "الشهر التالي",
      nextYear: "السنة التالية",
      timeLabel: "الوقت",
      months: [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ],
      shortDays: ["أحد", "إثن", "ثلا", "أربع", "خمس", "جمع", "سبت"],
    };

    const result = mergeLabels(defaultLabels, arabicLabels);

    expect(result.months![0]).toBe("يناير");
    expect(result.previousMonth).toBe("الشهر السابق");
  });

  it("should support CJK languages (Japanese)", () => {
    const japaneseLabels: CalendarLabels = {
      previousYear: "前年",
      previousMonth: "前月",
      nextMonth: "翌月",
      nextYear: "翌年",
      timeLabel: "時刻",
      months: [
        "1月",
        "2月",
        "3月",
        "4月",
        "5月",
        "6月",
        "7月",
        "8月",
        "9月",
        "10月",
        "11月",
        "12月",
      ],
      shortDays: ["日", "月", "火", "水", "木", "金", "土"],
    };

    const result = mergeLabels(defaultLabels, japaneseLabels);

    expect(result.months![0]).toBe("1月");
    expect(result.shortDays![0]).toBe("日");
  });

  it("should support partial overrides for minor customizations", () => {
    // Only change the time label format
    const custom: CalendarLabels = {
      hoursLabel: "Hours",
      minutesLabel: "Minutes",
      secondsLabel: "Seconds",
    };

    const result = mergeLabels(defaultLabels, custom);

    // Custom values
    expect(result.hoursLabel).toBe("Hours");
    expect(result.minutesLabel).toBe("Minutes");
    expect(result.secondsLabel).toBe("Seconds");

    // Default values preserved
    expect(result.months![0]).toBe("January");
    expect(result.timeLabel).toBe("Time");
  });
});
