import { DEFAULT_APP_TIME_ZONE } from "@/lib/constants";

export class ApplicationTimeZoneError extends Error {
  constructor() {
    super("Invalid application timezone configuration.");
    this.name = "ApplicationTimeZoneError";
  }
}

export function getTodayIsoDate() {
  const timeZone =
    process.env.APP_TIME_ZONE?.trim() || DEFAULT_APP_TIME_ZONE;

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    throw new ApplicationTimeZoneError();
  }
  const parts = formatter.formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine the current application date.");
  }

  return `${year}-${month}-${day}`;
}

export function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (year < 1000 || year > 9999 || month < 1 || month > 12) {
    return false;
  }
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];
  return day >= 1 && day <= daysInMonth[month - 1];
}
