export type DueState = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none';

export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayISO(): string {
  return toLocalISODate(new Date());
}

export function parseLocalISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDaysISO(baseISO: string, days: number): string {
  const date = parseLocalISODate(baseISO);
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
}

export function getNextMondayISO(baseISO: string): string {
  const date = parseLocalISODate(baseISO);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon
  const daysUntilNextMonday = ((8 - dayOfWeek) % 7) || 7;
  date.setDate(date.getDate() + daysUntilNextMonday);
  return toLocalISODate(date);
}

export function getDueState(dueDate: string | null, completed: boolean, todayISO: string): DueState {
  if (!dueDate) return 'none';
  if (!completed && dueDate < todayISO) return 'overdue';
  if (dueDate === todayISO) return 'today';
  if (dueDate === addDaysISO(todayISO, 1)) return 'tomorrow';
  return 'upcoming';
}

export function formatDueDateLabel(dueDate: string | null, todayISO: string): string {
  if (!dueDate) return 'No due date';
  if (dueDate === todayISO) return 'Today';
  const yesterdayISO = addDaysISO(todayISO, -1);
  if (dueDate === yesterdayISO) return 'Yesterday';
  const tomorrowISO = addDaysISO(todayISO, 1);
  if (dueDate === tomorrowISO) return 'Tomorrow';

  const target = parseLocalISODate(dueDate);
  const today = parseLocalISODate(todayISO);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1 && diffDays <= 6) {
    return target.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  const sameYear = target.getFullYear() === today.getFullYear();
  return target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function formatHeaderDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export interface CalendarCell {
  iso: string;
  day: number;
  inCurrentMonth: boolean;
}

export function getCalendarMonthGrid(year: number, monthIndex: number): CalendarCell[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const gridStart = new Date(year, monthIndex, 1 - startWeekday);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    cells.push({
      iso: toLocalISODate(cellDate),
      day: cellDate.getDate(),
      inCurrentMonth: cellDate.getMonth() === monthIndex,
    });
  }
  return cells;
}
