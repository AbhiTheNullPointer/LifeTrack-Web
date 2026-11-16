import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import {
  addDaysISO,
  getCalendarMonthGrid,
  getNextMondayISO,
  getTodayISO,
  parseLocalISODate,
} from '../utils/dateUtils';

interface MaterialDatePickerProps {
  value: string | null;
  onChange: (dateISO: string | null) => void;
  onClose?: () => void;
  todayISO?: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function MaterialDatePicker({
  value,
  onChange,
  onClose,
  todayISO: todayProp,
}: MaterialDatePickerProps) {
  const todayISO = todayProp ?? getTodayISO();
  const initialDate = value ? parseLocalISODate(value) : parseLocalISODate(todayISO);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const cells = getCalendarMonthGrid(viewYear, viewMonth);
  const monthTitle = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectAndClose = (iso: string | null) => {
    onChange(iso);
    onClose?.();
  };

  const tomorrowISO = addDaysISO(todayISO, 1);
  const nextMondayISO = getNextMondayISO(todayISO);

  return (
    <div
      className="w-full max-w-[336px] sm:w-[324px] rounded-[24px] bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] p-4 m3-elevated-3 select-none"
      role="dialog"
      aria-label="Choose due date"
    >
      {/* Quick Presets */}
      <div className="flex flex-wrap gap-1.5 pb-3 mb-3 border-b border-[var(--md-sys-color-outline-variant)]">
        <button
          type="button"
          onClick={() => selectAndClose(todayISO)}
          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            value === todayISO
              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
              : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => selectAndClose(tomorrowISO)}
          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            value === tomorrowISO
              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
              : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
          }`}
        >
          Tomorrow
        </button>
        <button
          type="button"
          onClick={() => selectAndClose(nextMondayISO)}
          className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            value === nextMondayISO
              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
              : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
          }`}
        >
          Next week
        </button>
        {value && (
          <button
            type="button"
            onClick={() => selectAndClose(null)}
            className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/50 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Month Switcher */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
          {monthTitle}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={idx}
            className="h-8 flex items-center justify-center text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell) => {
          const isSelected = value === cell.iso;
          const isToday = cell.iso === todayISO;

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => selectAndClose(cell.iso)}
              aria-label={cell.iso}
              aria-pressed={isSelected}
              className={`h-10 w-10 mx-auto rounded-full text-xs font-mono-tabular flex items-center justify-center transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold'
                  : isToday
                  ? 'border border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] font-semibold hover:bg-[var(--md-sys-color-primary-container)]/50'
                  : cell.inCurrentMonth
                  ? 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                  : 'text-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-surface-container-low)]'
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
