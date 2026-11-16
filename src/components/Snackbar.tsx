import { X } from 'lucide-react';
import { SnackbarState } from '../types/todo';

interface SnackbarProps {
  snackbar: SnackbarState | null;
  onDismiss: () => void;
}

export function Snackbar({ snackbar, onDismiss }: SnackbarProps) {
  if (!snackbar) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 lg:left-[calc(50%+136px)] z-50 flex items-center gap-3 w-[calc(100%-2rem)] sm:w-auto sm:min-w-[300px] max-w-[460px] px-4 py-3 rounded-xl bg-[#1f1f1f] text-[#f0f0f0] dark:bg-[#e8e8e8] dark:text-[#1a1a1a] m3-elevated-3"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <span className="text-sm flex-1 min-w-0 truncate">{snackbar.message}</span>
      {snackbar.onUndo && (
        <button
          type="button"
          onClick={() => {
            snackbar.onUndo?.();
            onDismiss();
          }}
          className="px-2 py-1 text-sm font-semibold text-[#f48fb1] dark:text-[#c2185b] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
        >
          {snackbar.undoLabel || 'Undo'}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="w-8 h-8 -mr-1 rounded-full flex items-center justify-center opacity-75 hover:opacity-100 shrink-0 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
