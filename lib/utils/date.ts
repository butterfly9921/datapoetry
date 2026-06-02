import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  eachDayOfInterval,
  differenceInDays,
  parseISO,
  isSameDay,
} from 'date-fns';

export function getWeekRange() {
  const now = new Date();
  return {
    start: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}

export function getMonthRange() {
  const now = new Date();
  return {
    start: format(startOfMonth(now), 'yyyy-MM-dd'),
    end: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

export function getLastNDays(n: number): Date[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => subDays(now, n - 1 - i));
}

export function getLastNMonthsRange(n: number) {
  const end = new Date();
  const start = subMonths(end, n);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
    days: eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd')),
  };
}

export function formatDate(dateStr: string, fmt: string = 'yyyy-MM-dd'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function daysSince(dateStr: string): number {
  try {
    return differenceInDays(new Date(), parseISO(dateStr));
  } catch {
    return 0;
  }
}

export function isSameDate(a: string, b: string): boolean {
  try {
    return isSameDay(parseISO(a), parseISO(b));
  } catch {
    return false;
  }
}

export function getNowISO(): string {
  return new Date().toISOString();
}

export function getDateOnly(isoStr: string): string {
  return isoStr.slice(0, 10);
}
