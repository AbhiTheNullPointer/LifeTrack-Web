import {
  ArrowUpDown,
  CheckCircle2,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActiveDestination,
  NavigationSidebar,
} from './components/NavigationSidebar';
import { MaterialSelect } from './components/MaterialSelect';
import { QuickAddBar } from './components/QuickAddBar';
import { Snackbar } from './components/Snackbar';
import { TaskDialog } from './components/TaskDialog';
import { TaskRow } from './components/TaskRow';
import {
  CATEGORY_TONE_STYLES,
  createInitialTasks,
  INITIAL_CATEGORIES,
} from './data/initialData';
import {
  Category,
  CategoryTone,
  PriorityLevel,
  SnackbarState,
  SortOption,
  StatusFilter,
  Task,
} from './types/todo';
import {
  addDaysISO,
  formatHeaderDate,
  getDueState,
  getTodayISO,
} from './utils/dateUtils';

const STORAGE_KEYS = {
  TASKS: 'lifetrack_web_tasks_v1',
  CATEGORIES: 'lifetrack_web_categories_v1',
  THEME: 'lifetrack_web_theme_v1',
};

const VALID_TONES = new Set<CategoryTone>([
  'teal',
  'blue',
  'amber',
  'plum',
  'rose',
  'slate',
]);

function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) return INITIAL_CATEGORIES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_CATEGORIES;
    const valid = parsed.filter(
      (c): c is Category =>
        Boolean(c) &&
        typeof c.id === 'string' &&
        typeof c.name === 'string' &&
        c.name.trim().length > 0 &&
        VALID_TONES.has(c.tone)
    );
    return valid.length > 0 ? valid : INITIAL_CATEGORIES;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function loadTasks(validCategories: Category[]): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return createInitialTasks();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createInitialTasks();
    const fallbackCategoryId = validCategories[0]?.id || 'cat-work';
    const categoryIds = new Set(validCategories.map((c) => c.id));
    return parsed
      .filter((t): t is Task => Boolean(t) && typeof t.id === 'string' && typeof t.title === 'string')
      .map((t) => ({
        id: t.id,
        title: t.title,
        notes: typeof t.notes === 'string' ? t.notes : '',
        categoryId: categoryIds.has(t.categoryId) ? t.categoryId : fallbackCategoryId,
        dueDate: typeof t.dueDate === 'string' ? t.dueDate : null,
        completed: Boolean(t.completed),
        completedAt: typeof t.completedAt === 'string' ? t.completedAt : null,
        priority: t.priority === 'high' ? 'high' : 'normal',
        createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
      }));
  } catch {
    return createInitialTasks();
  }
}

function loadTheme(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (!raw) return 'light';
    const parsed = JSON.parse(raw);
    return parsed === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>(loadCategories);
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks(loadCategories()));
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme);
  const [todayISO, setTodayISO] = useState<string>(() => getTodayISO());

  const [destination, setDestination] = useState<ActiveDestination>({
    type: 'smart',
    view: 'all',
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const snackbarTimerRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keep todayISO fresh if the app stays open across midnight or returns from background
  useEffect(() => {
    const refreshDate = () => {
      const current = getTodayISO();
      setTodayISO((prev) => (prev === current ? prev : current));
    };
    const intervalId = window.setInterval(refreshDate, 60_000);
    document.addEventListener('visibilitychange', refreshDate);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshDate);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch {
      // Ignore storage quota errors
    }
  }, [categories]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    } catch {
      // Ignore storage quota errors
    }
  }, [theme]);

  // Global keyboard shortcuts: "/" to search, "n" to create task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (isTyping || dialogOpen) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setEditingTask(null);
        setDialogOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogOpen]);

  const showSnackbar = useCallback(
    (message: string, onUndo?: () => void) => {
      if (snackbarTimerRef.current) {
        window.clearTimeout(snackbarTimerRef.current);
      }
      const id = String(Date.now());
      setSnackbar({ id, message, undoLabel: onUndo ? 'Undo' : undefined, onUndo });
      snackbarTimerRef.current = window.setTimeout(() => {
        setSnackbar(null);
      }, 5000);
    },
    []
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const counts = useMemo(() => {
    const nextSevenDays = addDaysISO(todayISO, 7);
    const byCategory: Record<string, number> = {};
    categories.forEach((c) => {
      byCategory[c.id] = 0;
    });

    let all = 0;
    let today = 0;
    let upcoming = 0;
    let overdue = 0;
    let starred = 0;
    let completed = 0;

    for (const task of tasks) {
      if (task.completed) {
        completed += 1;
        continue;
      }
      all += 1;
      if (byCategory[task.categoryId] !== undefined) {
        byCategory[task.categoryId] += 1;
      }
      if (task.priority === 'high') {
        starred += 1;
      }
      if (task.dueDate) {
        if (task.dueDate < todayISO) {
          overdue += 1;
        } else if (task.dueDate === todayISO) {
          today += 1;
        } else if (task.dueDate > todayISO && task.dueDate <= nextSevenDays) {
          upcoming += 1;
        }
      }
    }

    return { all, today, upcoming, overdue, starred, completed, byCategory };
  }, [tasks, categories, todayISO]);

  // View Title & Subtitle
  const viewMeta = useMemo(() => {
    const headerDate = formatHeaderDate();
    if (destination.type === 'category') {
      const cat = categoryMap.get(destination.categoryId);
      return {
        title: cat ? cat.name : 'Category',
        subtitle: headerDate,
        categoryTone: cat?.tone,
      };
    }

    switch (destination.view) {
      case 'today':
        return { title: 'Today', subtitle: headerDate };
      case 'upcoming':
        return { title: 'Upcoming', subtitle: 'Next 7 days & scheduled' };
      case 'overdue':
        return { title: 'Overdue', subtitle: 'Past due tasks needing attention' };
      case 'starred':
        return { title: 'Priority', subtitle: 'High-priority tasks across categories' };
      case 'completed':
        return { title: 'Completed', subtitle: 'Finished task history' };
      case 'all':
      default:
        return { title: 'All Tasks', subtitle: headerDate };
    }
  }, [destination, categoryMap, todayISO]);

  // Filtered and sorted task list
  const visibleTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      if (destination.type === 'category') {
        if (task.categoryId !== destination.categoryId) return false;
      } else {
        switch (destination.view) {
          case 'today':
            if (task.dueDate !== todayISO) return false;
            break;
          case 'upcoming':
            if (!task.dueDate || task.dueDate <= todayISO) return false;
            break;
          case 'overdue':
            if (task.completed || !task.dueDate || task.dueDate >= todayISO) return false;
            break;
          case 'starred':
            if (task.priority !== 'high') return false;
            break;
          case 'completed':
            if (!task.completed) return false;
            break;
          case 'all':
          default:
            break;
        }
      }

      if (
        destination.type !== 'smart' ||
        (destination.view !== 'completed' && destination.view !== 'overdue')
      ) {
        if (statusFilter === 'active' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;
      }

      if (query) {
        const catName = categoryMap.get(task.categoryId)?.name.toLowerCase() || '';
        const matches =
          task.title.toLowerCase().includes(query) ||
          task.notes.toLowerCase().includes(query) ||
          catName.includes(query);
        if (!matches) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      if (sortBy === 'dueDate') {
        if (a.dueDate && b.dueDate) {
          const cmp = a.dueDate.localeCompare(b.dueDate);
          if (cmp !== 0) return cmp;
        } else if (a.dueDate && !b.dueDate) {
          return -1;
        } else if (!a.dueDate && b.dueDate) {
          return 1;
        }
        return a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1;
      }

      if (sortBy === 'category') {
        const catA = categoryMap.get(a.categoryId)?.name || '';
        const catB = categoryMap.get(b.categoryId)?.name || '';
        const cmp = catA.localeCompare(catB);
        if (cmp !== 0) return cmp;
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      }

      if (sortBy === 'priority') {
        if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      }

      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tasks, destination, statusFilter, sortBy, searchQuery, todayISO, categoryMap]);

  // Group tasks cleanly when sorted by Due Date (unless in Completed or Overdue view)
  const groupedSections = useMemo(() => {
    const isCompletedView =
      destination.type === 'smart' && destination.view === 'completed';
    if (sortBy !== 'dueDate' || isCompletedView) {
      return [{ id: 'flat', label: null, items: visibleTasks }];
    }

    const buckets: Record<string, Task[]> = {
      overdue: [],
      today: [],
      tomorrow: [],
      upcoming: [],
      none: [],
      completed: [],
    };

    for (const task of visibleTasks) {
      if (task.completed) {
        buckets.completed.push(task);
        continue;
      }
      const state = getDueState(task.dueDate, false, todayISO);
      buckets[state].push(task);
    }

    const sections: { id: string; label: string | null; items: Task[] }[] = [];
    if (buckets.overdue.length)
      sections.push({ id: 'overdue', label: 'Overdue', items: buckets.overdue });
    if (buckets.today.length)
      sections.push({ id: 'today', label: 'Today', items: buckets.today });
    if (buckets.tomorrow.length)
      sections.push({ id: 'tomorrow', label: 'Tomorrow', items: buckets.tomorrow });
    if (buckets.upcoming.length)
      sections.push({ id: 'upcoming', label: 'Upcoming', items: buckets.upcoming });
    if (buckets.none.length)
      sections.push({ id: 'none', label: 'No due date', items: buckets.none });
    if (buckets.completed.length)
      sections.push({ id: 'completed', label: 'Completed', items: buckets.completed });

    return sections;
  }, [visibleTasks, sortBy, destination, todayISO]);

  // Task CRUD Handlers
  const handleSaveTask = (payload: {
    id?: string;
    title: string;
    notes: string;
    categoryId: string;
    dueDate: string | null;
    priority: PriorityLevel;
  }) => {
    if (payload.id) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === payload.id
            ? {
                ...t,
                title: payload.title,
                notes: payload.notes,
                categoryId: payload.categoryId,
                dueDate: payload.dueDate,
                priority: payload.priority,
              }
            : t
        )
      );
      showSnackbar('Task updated');
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: payload.title,
        notes: payload.notes,
        categoryId: payload.categoryId,
        dueDate: payload.dueDate,
        completed: false,
        completedAt: null,
        priority: payload.priority,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleToggleComplete = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const nextCompleted = !target.completed;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : null,
            }
          : t
      )
    );
    showSnackbar(
      nextCompleted ? `Completed "${target.title}"` : `Reopened "${target.title}"`,
      () => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, completed: target.completed, completedAt: target.completedAt }
              : t
          )
        );
      }
    );
  };

  const handleTogglePriority = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, priority: t.priority === 'high' ? 'normal' : 'high' }
          : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const deleted = tasks.find((t) => t.id === taskId);
    if (!deleted) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showSnackbar(`Deleted "${deleted.title}"`, () => {
      setTasks((prev) => [deleted, ...prev]);
    });
  };

  const handleClearCompleted = () => {
    const completedSnapshot = tasks.filter((t) => t.completed);
    if (completedSnapshot.length === 0) return;
    setTasks((prev) => prev.filter((t) => !t.completed));
    showSnackbar(
      `Cleared ${completedSnapshot.length} completed ${
        completedSnapshot.length === 1 ? 'task' : 'tasks'
      }`,
      () => {
        setTasks((prev) => [...prev, ...completedSnapshot]);
      }
    );
  };

  const handleCreateCategory = (name: string, tone: CategoryTone) => {
    const existing = categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      setDestination({ type: 'category', categoryId: existing.id });
      showSnackbar(`Switched to existing "${existing.name}" category`);
      return;
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      tone,
    };
    setCategories((prev) => [...prev, newCat]);
    setDestination({ type: 'category', categoryId: newCat.id });
    showSnackbar(`Created category "${name}"`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (categories.length <= 1) return;
    const removed = categories.find((c) => c.id === categoryId);
    if (!removed) return;
    const fallbackCat = categories.find((c) => c.id !== categoryId)!;

    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setTasks((prev) =>
      prev.map((t) =>
        t.categoryId === categoryId ? { ...t, categoryId: fallbackCat.id } : t
      )
    );

    if (destination.type === 'category' && destination.categoryId === categoryId) {
      setDestination({ type: 'smart', view: 'all' });
    }
    showSnackbar(`Removed "${removed.name}" (tasks moved to ${fallbackCat.name})`);
  };

  const defaultCategoryId =
    destination.type === 'category'
      ? destination.categoryId
      : categories[0]?.id || 'cat-work';

  const defaultDueDate =
    destination.type === 'smart' && destination.view === 'today'
      ? todayISO
      : destination.type === 'smart' && destination.view === 'upcoming'
      ? addDaysISO(todayISO, 1)
      : null;

  const isCompletedView =
    destination.type === 'smart' && destination.view === 'completed';
  const isOverdueView =
    destination.type === 'smart' && destination.view === 'overdue';

  return (
    <div className="min-h-screen flex bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-surface)] overflow-x-clip">
      {/* Navigation Drawer / Sidebar */}
      <NavigationSidebar
        destination={destination}
        onSelectDestination={(dest) => {
          setDestination(dest);
          if (dest.type === 'smart' && dest.view === 'completed') {
            setStatusFilter('completed');
          } else if (statusFilter === 'completed') {
            setStatusFilter('active');
          }
        }}
        categories={categories}
        counts={counts}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Material 3 Top App Bar */}
        <header className="sticky top-0 z-30 bg-[var(--md-sys-color-background)]/95 backdrop-blur-sm border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden w-11 h-11 -ml-2 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5 min-w-0">
                {viewMeta.categoryTone && (
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{
                      backgroundColor:
                        CATEGORY_TONE_STYLES[viewMeta.categoryTone].dotColor,
                    }}
                    aria-hidden="true"
                  />
                )}
                <h1 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[var(--md-sys-color-on-surface)] truncate">
                  {viewMeta.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Search Input (Tablet & Laptop) */}
              <div className="relative hidden sm:flex items-center w-52 md:w-64">
                <Search className="w-4 h-4 text-[var(--md-sys-color-outline)] absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  aria-label="Search tasks"
                  className="w-full h-10 pl-9 pr-8 rounded-full text-sm bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-outline)] border border-transparent focus:border-[var(--md-sys-color-primary)] focus:bg-[var(--md-sys-color-surface-container-lowest)] focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-1.5 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                className="w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors shrink-0 cursor-pointer"
              >
                {theme === 'light' ? (
                  <Moon className="w-[18px] h-[18px]" />
                ) : (
                  <Sun className="w-[18px] h-[18px]" />
                )}
              </button>

              {/* Material 3 Primary Action Button */}
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setDialogOpen(true);
                }}
                className="h-11 sm:h-10 px-4 sm:px-5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-sm font-semibold inline-flex items-center gap-1.5 sm:gap-2 hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 cursor-pointer m3-elevated-1"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 max-w-[1040px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-20 pb-safe space-y-5 sm:space-y-6">
          {/* Context Header & Mobile Search */}
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                {viewMeta.subtitle}
              </p>
              <div className="text-xs font-mono-tabular text-[var(--md-sys-color-on-surface-variant)]">
                {counts.all} active · {counts.today} due today
                {counts.overdue > 0 ? ` · ${counts.overdue} overdue` : ''}
              </div>
            </div>

            {/* Mobile Search Input */}
            <div className="relative flex sm:hidden items-center">
              <Search className="w-4 h-4 text-[var(--md-sys-color-outline)] absolute left-3.5 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                className="w-full h-11 pl-10 pr-10 rounded-full text-sm bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-outline)] border border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="w-9 h-9 rounded-full flex items-center justify-center absolute right-1.5 text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Add Bar (hidden in Completed view) */}
          {!isCompletedView && (
            <QuickAddBar
              categories={categories}
              defaultCategoryId={defaultCategoryId}
              defaultDueDate={defaultDueDate}
              todayISO={todayISO}
              onAddTask={handleSaveTask}
            />
          )}

          {/* Filter & Sort Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Material 3 Segmented Control */}
            {!isCompletedView && !isOverdueView ? (
              <div
                className="inline-flex items-center p-1 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]"
                role="group"
                aria-label="Filter by completion status"
              >
                {(['active', 'all', 'completed'] as StatusFilter[]).map((status) => {
                  const active = statusFilter === status;
                  const label =
                    status === 'active'
                      ? 'Active'
                      : status === 'all'
                      ? 'All'
                      : 'Completed';
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      aria-pressed={active}
                      className={`h-9 sm:h-8 px-4 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                          : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
                Showing {visibleTasks.length}{' '}
                {visibleTasks.length === 1 ? 'task' : 'tasks'}
              </div>
            )}

            <div className="flex items-center gap-2.5 ml-auto">
              {(isCompletedView || statusFilter !== 'active') &&
                counts.completed > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCompleted}
                    className="h-10 sm:h-9 px-3 rounded-full text-xs font-medium text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Clear completed
                  </button>
                )}

              <MaterialSelect
                value={sortBy}
                onChange={setSortBy}
                ariaLabel="Sort tasks by"
                sheetTitle="Sort tasks by"
                prefixIcon={<ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />}
                prefixLabel="Sort:"
                align="right"
                shape="full"
                options={[
                  { value: 'dueDate', label: 'Due date' },
                  { value: 'category', label: 'Category' },
                  { value: 'priority', label: 'Priority' },
                  { value: 'createdAt', label: 'Recently added' },
                ]}
              />
            </div>
          </div>

          {/* Task Sheet (Single Elevation Material 3 Surface) */}
          <section
            aria-label="Task list"
            className="rounded-3xl bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] overflow-hidden"
          >
            {visibleTasks.length === 0 ? (
              <div className="px-6 py-14 sm:py-16 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="font-display text-base font-semibold text-[var(--md-sys-color-on-surface)]">
                  {searchQuery
                    ? 'No matching tasks'
                    : isCompletedView
                    ? 'No completed tasks yet'
                    : isOverdueView
                    ? 'No overdue tasks'
                    : 'Nothing scheduled here'}
                </h2>
                <p className="mt-1.5 text-sm text-[var(--md-sys-color-on-surface-variant)] max-w-sm">
                  {searchQuery
                    ? `No tasks matched "${searchQuery}". Try another keyword or clear your search.`
                    : isCompletedView
                    ? 'Tasks you check off will appear here for reference.'
                    : isOverdueView
                    ? 'Everything with a due date is on schedule.'
                    : 'Add a task above or choose a due date and category to organize your day.'}
                </p>
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-5 h-10 px-5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] cursor-pointer"
                  >
                    Clear search
                  </button>
                ) : (
                  !isCompletedView &&
                  !isOverdueView && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(null);
                        setDialogOpen(true);
                      }}
                      className="mt-5 h-10 px-5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer"
                    >
                      Create first task
                    </button>
                  )
                )}
              </div>
            ) : (
              <div>
                {groupedSections.map((section, sectionIdx) => (
                  <div
                    key={section.id}
                    className={
                      sectionIdx > 0
                        ? 'border-t border-[var(--md-sys-color-outline-variant)]'
                        : ''
                    }
                  >
                    {section.label && (
                      <div className="px-4 py-2.5 bg-[var(--md-sys-color-surface-container-low)]/60 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold ${
                            section.id === 'overdue'
                              ? 'text-[var(--md-sys-color-error)]'
                              : section.id === 'today'
                              ? 'text-[var(--md-sys-color-primary)]'
                              : 'text-[var(--md-sys-color-on-surface-variant)]'
                          }`}
                        >
                          {section.label}
                        </span>
                        <span className="text-xs font-mono-tabular text-[var(--md-sys-color-outline)]">
                          {section.items.length}
                        </span>
                      </div>
                    )}
                    <div className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                      {section.items.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          category={categoryMap.get(task.categoryId)}
                          todayISO={todayISO}
                          onToggleComplete={handleToggleComplete}
                          onTogglePriority={handleTogglePriority}
                          onEdit={(t) => {
                            setEditingTask(t);
                            setDialogOpen(true);
                          }}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Create / Edit Material 3 Dialog */}
      <TaskDialog
        open={dialogOpen}
        editingTask={editingTask}
        categories={categories}
        defaultCategoryId={defaultCategoryId}
        defaultDueDate={defaultDueDate}
        todayISO={todayISO}
        onClose={() => {
          setDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* Material 3 Undo Snackbar */}
      <Snackbar snackbar={snackbar} onDismiss={() => setSnackbar(null)} />
    </div>
  );
}
