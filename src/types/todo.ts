export type PriorityLevel = 'normal' | 'high';

export type SmartView =
  | 'all'
  | 'today'
  | 'upcoming'
  | 'overdue'
  | 'starred'
  | 'completed';

export type StatusFilter = 'active' | 'all' | 'completed';

export type SortOption = 'dueDate' | 'category' | 'priority' | 'createdAt';

export type CategoryTone =
  | 'teal'
  | 'blue'
  | 'amber'
  | 'plum'
  | 'rose'
  | 'slate';

export interface Category {
  id: string;
  name: string;
  tone: CategoryTone;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  categoryId: string;
  dueDate: string | null; // YYYY-MM-DD in local time
  completed: boolean;
  completedAt: string | null;
  priority: PriorityLevel;
  createdAt: string;
}

export interface SnackbarState {
  id: string;
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
}
