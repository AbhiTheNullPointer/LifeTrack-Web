import {
  AlertCircle,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  FolderPlus,
  Github,
  Inbox,
  ExternalLink,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_TONE_STYLES } from '../data/initialData';
import { Category, CategoryTone, SmartView } from '../types/todo';

export type ActiveDestination =
  | { type: 'smart'; view: SmartView }
  | { type: 'category'; categoryId: string };

interface NavigationSidebarProps {
  destination: ActiveDestination;
  onSelectDestination: (dest: ActiveDestination) => void;
  categories: Category[];
  counts: {
    all: number;
    today: number;
    upcoming: number;
    overdue: number;
    starred: number;
    completed: number;
    byCategory: Record<string, number>;
  };
  onCreateCategory: (name: string, tone: CategoryTone) => void;
  onDeleteCategory: (categoryId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const TONE_OPTIONS: CategoryTone[] = ['teal', 'blue', 'amber', 'plum', 'rose', 'slate'];

export function NavigationSidebar({
  destination,
  onSelectDestination,
  categories,
  counts,
  onCreateCategory,
  onDeleteCategory,
  mobileOpen,
  onCloseMobile,
}: NavigationSidebarProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatTone, setNewCatTone] = useState<CategoryTone>('teal');

  const smartItems: {
    view: SmartView;
    label: string;
    count: number;
    icon: typeof Inbox;
    isAlert?: boolean;
  }[] = [
    { view: 'all', label: 'All Tasks', count: counts.all, icon: Inbox },
    { view: 'today', label: 'Today', count: counts.today, icon: CalendarDays },
    { view: 'upcoming', label: 'Upcoming', count: counts.upcoming, icon: CalendarRange },
    {
      view: 'overdue',
      label: 'Overdue',
      count: counts.overdue,
      icon: AlertCircle,
      isAlert: counts.overdue > 0,
    },
    { view: 'starred', label: 'Priority', count: counts.starred, icon: Star },
    { view: 'completed', label: 'Completed', count: counts.completed, icon: CheckCircle2 },
  ];

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    onCreateCategory(trimmed, newCatTone);
    setNewCatName('');
    setNewCatTone('teal');
    setIsAddingCategory(false);
  };

  const handleSelect = (dest: ActiveDestination) => {
    onSelectDestination(dest);
    onCloseMobile();
  };

  const navContent = (
    <aside
      className="flex flex-col h-full w-[280px] sm:w-[272px] bg-[var(--md-sys-color-surface-container-low)] border-r border-[var(--md-sys-color-outline-variant)] px-3 py-5 pb-8 pb-safe select-none"
      aria-label="Task navigation"
    >
      {/* Brand Lockup */}
      <div className="flex items-center justify-between px-3 pb-5 mb-2 border-b border-[var(--md-sys-color-outline-variant)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center font-display font-bold text-sm">
            ✓
          </div>
          <span className="font-display font-semibold text-base tracking-tight text-[var(--md-sys-color-on-surface)] whitespace-nowrap">
            To-Do · Life Tracker
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden w-10 h-10 -mr-1 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Smart Schedule Views */}
      <div className="space-y-0.5 py-2">
        <div className="px-3 pb-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
          Schedule
        </div>
        {smartItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            destination.type === 'smart' && destination.view === item.view;

          return (
            <button
              key={item.view}
              type="button"
              onClick={() => handleSelect({ type: 'smart', view: item.view })}
              className={`w-full h-11 px-3.5 rounded-full flex items-center justify-between text-sm transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]/70 font-medium'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    item.isAlert && !isActive
                      ? 'text-[var(--md-sys-color-error)]'
                      : ''
                  }`}
                />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </span>
              <span
                className={`text-xs font-mono-tabular pl-2 ${
                  item.isAlert
                    ? 'text-[var(--md-sys-color-error)] font-semibold'
                    : isActive
                    ? 'text-[var(--md-sys-color-on-secondary-container)]'
                    : 'text-[var(--md-sys-color-outline)]'
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categories Section */}
      <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)] flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 pb-1.5">
          <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
            Categories
          </span>
          <button
            type="button"
            onClick={() => setIsAddingCategory((prev) => !prev)}
            aria-label="Add category"
            className="w-10 h-10 sm:w-8 sm:h-8 -mr-1.5 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {isAddingCategory && (
          <form
            onSubmit={handleAddCategorySubmit}
            className="mx-1 mb-3 p-3 rounded-2xl bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] space-y-2.5"
          >
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name"
              maxLength={24}
              autoFocus
              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-lg text-sm bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Category color">
                {TONE_OPTIONS.map((tone) => {
                  const style = CATEGORY_TONE_STYLES[tone];
                  return (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setNewCatTone(tone)}
                      aria-label={style.label}
                      aria-checked={newCatTone === tone}
                      role="radio"
                      className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full transition-transform cursor-pointer ${
                        newCatTone === tone
                          ? 'ring-2 ring-offset-2 ring-[var(--md-sys-color-on-surface)] scale-110'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: style.dotColor }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCatName('');
                  }}
                  className="px-2 py-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] disabled:opacity-40 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isActive =
              destination.type === 'category' && destination.categoryId === cat.id;
            const toneStyle = CATEGORY_TONE_STYLES[cat.tone];
            const catCount = counts.byCategory[cat.id] || 0;

            return (
              <div
                key={cat.id}
                className={`group flex items-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelect({ type: 'category', categoryId: cat.id })}
                  className="flex-1 h-11 pl-3.5 pr-2 flex items-center justify-between text-sm min-w-0 cursor-pointer"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: toneStyle.dotColor }}
                      aria-hidden="true"
                    />
                    <span
                      className={`truncate whitespace-nowrap ${
                        isActive ? 'font-semibold' : 'font-medium'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </span>
                  <span className="text-xs font-mono-tabular pl-2 opacity-80">
                    {catCount}
                  </span>
                </button>
                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    aria-label={`Delete ${cat.name} category`}
                    className="opacity-70 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 w-9 h-9 mr-1 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/50 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer profile */}
      <section
        aria-label="Developer profile"
        className="mt-4 pt-4 pb-5 border-t border-[var(--md-sys-color-outline-variant)] shrink-0"
      >
        <div className="flex items-center gap-3 px-2.5">
          <img
            src="https://avatars.githubusercontent.com/u/261731864?v=4"
            alt="AbhiTheNullPointer"
            loading="lazy"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[var(--md-sys-color-outline-variant)] shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--md-sys-color-outline)]">
              Developer
            </p>
            <a
              href="https://github.com/AbhiTheNullPointer"
              target="_blank"
              rel="noreferrer"
              className="block truncate text-sm font-semibold text-[var(--md-sys-color-on-surface)] hover:text-[var(--md-sys-color-primary)] transition-colors"
            >
              AbhiTheNullPointer
            </a>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href="https://github.com/AbhiTheNullPointer"
            target="_blank"
            rel="noreferrer"
            className="h-9 px-2 rounded-xl border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
          >
            <Github className="w-3.5 h-3.5" aria-hidden="true" />
            GitHub
            <ExternalLink className="w-3 h-3 opacity-60" aria-hidden="true" />
          </a>
          <a
            href="https://github.com/AbhiTheNullPointer/LifeTrack-Web"
            target="_blank"
            rel="noreferrer"
            className="h-9 px-2 rounded-xl border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            Source code
          </a>
        </div>
      </section>
    </aside>
  );

  return (
    <>
      {/* Desktop persistent Material 3 Navigation Drawer */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">
        {navContent}
      </div>

      {/* Mobile & Tablet slide-over modal Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/45 transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full shadow-xl">{navContent}</div>
        </div>
      )}
    </>
  );
}
