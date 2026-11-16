import { Calendar, Plus, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORY_TONE_STYLES } from '../data/initialData';
import { Category, PriorityLevel } from '../types/todo';
import { formatDueDateLabel } from '../utils/dateUtils';
import { MaterialDatePicker } from './MaterialDatePicker';
import { MaterialSelect } from './MaterialSelect';

interface QuickAddBarProps {
  categories: Category[];
  defaultCategoryId: string;
  defaultDueDate: string | null;
  todayISO: string;
  onAddTask: (payload: {
    title: string;
    notes: string;
    categoryId: string;
    dueDate: string | null;
    priority: PriorityLevel;
  }) => void;
}

export function QuickAddBar({
  categories,
  defaultCategoryId,
  defaultDueDate,
  todayISO,
  onAddTask,
}: QuickAddBarProps) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [dueDate, setDueDate] = useState<string | null>(defaultDueDate);
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const pickerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCategoryId(defaultCategoryId);
  }, [defaultCategoryId]);

  useEffect(() => {
    setDueDate(defaultDueDate);
  }, [defaultDueDate]);

  useEffect(() => {
    if (!datePickerOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerContainerRef.current &&
        !pickerContainerRef.current.contains(event.target as Node)
      ) {
        setDatePickerOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDatePickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [datePickerOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddTask({
      title: trimmed,
      notes: '',
      categoryId,
      dueDate,
      priority,
    });
    setTitle('');
    setPriority('normal');
    setDatePickerOpen(false);
  };

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
        dotColor: CATEGORY_TONE_STYLES[cat.tone].dotColor,
      })),
    [categories]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] p-3 sm:px-4 sm:py-3 m3-elevated-1 transition-colors focus-within:border-[var(--md-sys-color-primary)]"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Plus className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task..."
            aria-label="Quick add task title"
            className="w-full min-h-[40px] bg-transparent text-[15px] text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-outline)] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Category Material 3 Dropdown Menu */}
          <MaterialSelect
            value={categoryId}
            options={categoryOptions}
            onChange={setCategoryId}
            ariaLabel="Task category"
            sheetTitle="Select task category"
            align="left"
            shape="xl"
          />

          {/* Due Date Picker Trigger (responsive modal on mobile, anchored popover on tablet/desktop) */}
          <div className="relative" ref={pickerContainerRef}>
            <button
              type="button"
              onClick={() => setDatePickerOpen((prev) => !prev)}
              aria-expanded={datePickerOpen}
              className={`h-11 sm:h-9 px-3 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                dueDate
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-transparent'
                  : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono-tabular">
                {dueDate ? formatDueDateLabel(dueDate, todayISO) : 'Due date'}
              </span>
            </button>

            {datePickerOpen && (
              <>
                {/* Mobile centered modal overlay */}
                <div
                  className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4 sm:hidden"
                  onClick={() => setDatePickerOpen(false)}
                >
                  <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
                    <MaterialDatePicker
                      value={dueDate}
                      onChange={setDueDate}
                      onClose={() => setDatePickerOpen(false)}
                      todayISO={todayISO}
                    />
                  </div>
                </div>
                {/* Tablet/Desktop anchored popover */}
                <div className="hidden sm:block absolute right-0 top-11 z-40">
                  <MaterialDatePicker
                    value={dueDate}
                    onChange={setDueDate}
                    onClose={() => setDatePickerOpen(false)}
                    todayISO={todayISO}
                  />
                </div>
              </>
            )}
          </div>

          {/* Priority Toggle */}
          <button
            type="button"
            onClick={() => setPriority((p) => (p === 'high' ? 'normal' : 'high'))}
            aria-pressed={priority === 'high'}
            aria-label="Toggle high priority"
            className={`w-11 h-11 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-colors shrink-0 cursor-pointer ${
              priority === 'high'
                ? 'bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-warning)] border-transparent'
                : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
            }`}
          >
            <Star className={`w-4 h-4 ${priority === 'high' ? 'fill-current' : ''}`} />
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="h-11 sm:h-9 px-4 rounded-xl text-xs font-semibold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-95 disabled:opacity-40 transition-opacity whitespace-nowrap shrink-0 cursor-pointer ml-auto sm:ml-0"
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
}
