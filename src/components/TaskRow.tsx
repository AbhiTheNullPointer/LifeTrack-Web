import {
  AlertCircle,
  Calendar,
  Check,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';
import { CATEGORY_TONE_STYLES } from '../data/initialData';
import { Category, Task } from '../types/todo';
import { formatDueDateLabel, getDueState } from '../utils/dateUtils';

interface TaskRowProps {
  task: Task;
  category: Category | undefined;
  todayISO: string;
  onToggleComplete: (taskId: string) => void;
  onTogglePriority: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskRow({
  task,
  category,
  todayISO,
  onToggleComplete,
  onTogglePriority,
  onEdit,
  onDelete,
}: TaskRowProps) {
  const dueState = getDueState(task.dueDate, task.completed, todayISO);
  const dueLabel = formatDueDateLabel(task.dueDate, todayISO);
  const toneStyle = category ? CATEGORY_TONE_STYLES[category.tone] : null;

  return (
    <div
      className={`group flex items-start gap-2 px-3 sm:px-4 py-3.5 transition-colors hover:bg-[var(--md-sys-color-surface-container-low)]/70 ${
        task.completed ? 'opacity-65' : ''
      }`}
    >
      {/* Material 3 Checkbox with 44px touch target */}
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Complete "${task.title}"`}
        onClick={() => onToggleComplete(task.id)}
        className="w-11 h-11 -ml-2 -mt-1.5 rounded-full flex items-center justify-center shrink-0 hover:bg-[var(--md-sys-color-primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
      >
        <span
          className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center border-2 transition-colors ${
            task.completed
              ? 'bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
              : 'border-[var(--md-sys-color-outline)] group-hover:border-[var(--md-sys-color-primary)]'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </span>
      </button>

      {/* Main Content (tap/click opens TaskDialog) */}
      <div
        className="flex-1 min-w-0 cursor-pointer py-0.5"
        onClick={() => onEdit(task)}
      >
        <div
          className={`text-[15px] leading-snug font-medium break-words ${
            task.completed
              ? 'line-through text-[var(--md-sys-color-on-surface-variant)]'
              : 'text-[var(--md-sys-color-on-surface)]'
          }`}
        >
          {task.title}
        </div>

        {task.notes && (
          <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)] line-clamp-1">
            {task.notes}
          </p>
        )}

        {/* Unboxed Inline Metadata with Typographic Separators (Zero-Pill Discipline) */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
          {category && toneStyle && (
            <span className={`inline-flex items-center gap-1.5 font-medium ${toneStyle.textClass}`}>
              <span
                className="w-2 h-2 rounded-xs shrink-0"
                style={{ backgroundColor: toneStyle.dotColor }}
                aria-hidden="true"
              />
              <span>{category.name}</span>
            </span>
          )}

          {task.dueDate && (
            <>
              {category && (
                <span aria-hidden="true" className="text-[var(--md-sys-color-outline)]">
                  ·
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 font-mono-tabular ${
                  dueState === 'overdue'
                    ? 'text-[var(--md-sys-color-error)] font-medium'
                    : dueState === 'today'
                    ? 'text-[var(--md-sys-color-primary)] font-medium'
                    : dueState === 'tomorrow'
                    ? 'text-[var(--md-sys-color-warning)] font-medium'
                    : 'text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                {dueState === 'overdue' ? (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>
                  {dueState === 'overdue' ? `Overdue · ${dueLabel}` : `Due ${dueLabel}`}
                </span>
              </span>
            </>
          )}

          {task.priority === 'high' && (
            <>
              <span aria-hidden="true" className="text-[var(--md-sys-color-outline)]">
                ·
              </span>
              <span className="font-medium text-[var(--md-sys-color-warning)]">
                High priority
              </span>
            </>
          )}
        </div>
      </div>

      {/* Row Action Affordances — visible on touch devices, hover-revealed on desktop */}
      <div className="flex items-center gap-0.5 shrink-0 -mr-1.5 -mt-1">
        <button
          type="button"
          onClick={() => onTogglePriority(task.id)}
          aria-label={task.priority === 'high' ? 'Remove priority' : 'Mark as priority'}
          className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            task.priority === 'high'
              ? 'text-[var(--md-sys-color-warning)] hover:bg-[var(--md-sys-color-warning)]/10'
              : 'text-[var(--md-sys-color-outline)] opacity-75 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 hover:bg-[var(--md-sys-color-surface-container-high)]'
          }`}
        >
          <Star className={`w-4 h-4 ${task.priority === 'high' ? 'fill-current' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          className="hidden sm:flex w-10 h-10 sm:w-9 sm:h-9 rounded-full items-center justify-center text-[var(--md-sys-color-on-surface-variant)] opacity-75 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.title}"`}
          className="w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] opacity-75 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
