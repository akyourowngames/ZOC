const pad = (value: number) => String(value).padStart(2, '0');

export function dateKey(value: Date | string = new Date()): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return dateKey(new Date());
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDate(value: Date | string): Date {
  if (value instanceof Date) return new Date(value.getTime());
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function toIso(value: Date | string = new Date()): string {
  return parseDate(value).toISOString();
}

export function startOfDay(value: Date | string = new Date()): Date {
  const date = parseDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(value: Date | string, amount: number): Date {
  const date = parseDate(value);
  date.setDate(date.getDate() + amount);
  return date;
}

export function startOfWeek(value: Date | string = new Date(), weekStart: 0 | 1 = 1): Date {
  const date = startOfDay(value);
  const diff = (date.getDay() - weekStart + 7) % 7;
  date.setDate(date.getDate() - diff);
  return date;
}

export function weekKey(value: Date | string = new Date(), weekStart: 0 | 1 = 1): string {
  return `week-${dateKey(startOfWeek(value, weekStart))}`;
}

export function humanDate(value: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    ...options
  }).format(parseDate(value));
}

export function longDate(value: Date | string = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parseDate(value));
}

export function timeOf(value: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(parseDate(value));
}

export function relativeDate(value: Date | string): string {
  const then = startOfDay(value);
  const today = startOfDay(new Date());
  const diff = Math.round((today.getTime() - then.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  return humanDate(value, diff > 330 ? { year: 'numeric' } : {});
}

export function toLocalInput(value: Date | string = new Date()): string {
  const date = parseDate(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function dayOfYear(date: Date = new Date()): number {
  return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
}

export function uid(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
