import { format, formatDistanceToNowStrict, isToday, isYesterday, differenceInHours } from "date-fns";

/**
 * Format currency in Bangladeshi Taka (BDT, ৳)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "৳0.00";
  }
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `৳${Number(amount).toFixed(2)}`;
  }
}

/**
 * Format relative if <24h ("3h ago" or "Jan 15, 10:05"), absolute otherwise
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "—";

    const hoursDiff = Math.abs(differenceInHours(new Date(), date));
    if (hoursDiff < 24) {
      return formatDistanceToNowStrict(date, { addSuffix: true });
    }
    return format(date, "MMM dd, HH:mm");
  } catch {
    return "—";
  }
}

/**
 * Format short calendar date: "Jan 15, 2026"
 */
export function formatShortDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "—";
    return format(date, "MMM dd, yyyy");
  } catch {
    return "—";
  }
}

/**
 * Format numbers with thousand separators
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Format percentage: e.g. 23.5%
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.0%";
  }
  return `${value.toFixed(1)}%`;
}
