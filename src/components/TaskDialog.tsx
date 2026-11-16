import { Calendar, Star, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CATEGORY_TONE_STYLES } from '../data/initialData';
import { Category, PriorityLevel, Task } from '../types/todo';
import { formatDueDateLabel } from '../utils/dateUtils';
import { MaterialDatePicker } from './MaterialDatePicker';

interface TaskDialogProps {
  open: boolean;
  editingTask: Task | null;
  categories: Category[];
  defaultCategoryId: string;
  defaultDueDate: string | null;
  todayISO: string;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    title: string;
    notes: string;
    categoryId: string;
    dueDate: string | null;
    priority: PriorityLevel;
  }) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskDialog({
  open,
  editingTask,
  categories,
  defaultCategoryId,
  defaultDueDate,
  todayISO,
  onClose,
  onSave,
  onDelete,
}: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [dueDate, setDueDate] = useState<string | null>(defaultDueDate);
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setNotes(editingTask.notes);
      setCategoryId(editingTask.categoryId);
      setDueDate(editingTask.dueDate);
      setPriority(editingTask.priority);
    } else {
      setTitle('');
      setNotes('');
      setCategoryId(defaultCategoryId);
      setDueDate(defaultDueDate);
      setPriority('normal');
    }
    setShowDatePicker(false);
    setTimeout(() => titleInputRef.current?.focus(), 30);
  }, [open, editingTask, defaultCategoryId, defaultDueDate]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDatePicker) {
          setShowDatePicker(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, showDatePicker, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({
      id: editingTask?.id,
      title: trimmed,
      notes: notes.trim(),
      categoryId,
      dueDate,
      priority,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-dialog-title"
    >
      <div
        className="fixed inset-0 bg-black/45"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full sm:max-w-[520px] max-h-[92dvh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] p-5 sm:p-6 pb-safe m3-elevated-3" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        {/* Mobile Sheet Drag Handle */}
        <div
          className="w-10 h-1 rounded-full bg-[var(--md-sys-color-outline-variant)] mx-auto mb-3 sm:hidden"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2
            id="task-dialog-title"
            className="font-display text-xl font-semibold text-[var(--md-sys-color-on-surface)]"
          >
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-11 h-11 sm:w-9 sm:h-9 -mr-1.5 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="task-title-input"
              className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1.5"
            >
              Task title
            </label>
            <input
              ref={titleInputRef}
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-[15px] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="task-notes-input"
              className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1.5"
            >
              Notes
            </label>
            <textarea
              id="task-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional context, checklist details, or links..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] resize-none"
            />
          </div>

          {/* Category Selection Buttons */}
          <div>
            <span className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const selected = categoryId === cat.id;
                const style = CATEGORY_TONE_STYLES[cat.tone];
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    aria-pressed={selected}
                    className={`h-10 sm:h-9 px-3 rounded-xl text-xs font-medium inline-flex items-center gap-2 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selected
                        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-transparent font-semibold'
                        : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-xs shrink-0"
                      style={{ backgroundColor: style.dotColor }}
                      aria-hidden="true"
                    />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
                Due date
              </span>
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="w-full h-11 sm:h-10 px-3.5 rounded-xl text-sm flex items-center justify-between bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)] transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-2 font-mono-tabular text-xs">
                  <Calendar className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
                  {dueDate ? formatDueDateLabel(dueDate, todayISO) : 'No due date'}
                </span>
                <span className="text-xs text-[var(--md-sys-color-primary)] font-medium">
                  {dueDate ? 'Change' : 'Pick'}
                </span>
              </button>
            </div>

            <div>
              <span className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
                Priority
              </span>
              <button
                type="button"
                onClick={() => setPriority((p) => (p === 'high' ? 'normal' : 'high'))}
                aria-pressed={priority === 'high'}
                className={`w-full h-11 sm:h-10 px-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition-colors cursor-pointer ${
                  priority === 'high'
                    ? 'bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-warning)] border-transparent font-semibold'
                    : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                }`}
              >
                <Star className={`w-4 h-4 ${priority === 'high' ? 'fill-current' : ''}`} />
                <span>{priority === 'high' ? 'High priority' : 'Standard priority'}</span>
              </button>
            </div>
          </div>

          {/* Dialog Footer Actions */}
          <div className="flex items-center justify-between gap-2 pt-4 mt-2 pb-1 border-t border-[var(--md-sys-color-outline-variant)]">
            {editingTask && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingTask.id);
                  onClose();
                }}
                className="h-11 sm:h-10 px-3.5 rounded-full text-sm font-medium text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 sm:h-10 px-4 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="h-11 sm:h-10 px-6 rounded-full text-sm font-semibold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-95 disabled:opacity-40 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
              >
                {editingTask ? 'Save changes' : 'Create task'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Centered Date Picker Overlay (prevents clipping inside scrollable sheet on any device) */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowDatePicker(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
            <MaterialDatePicker
              value={dueDate}
              onChange={setDueDate}
              onClose={() => setShowDatePicker(false)}
              todayISO={todayISO}
            />
          </div>
        </div>
      )}
    </div>
  );
}
