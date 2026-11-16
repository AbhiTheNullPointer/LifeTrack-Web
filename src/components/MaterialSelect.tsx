import { Check, ChevronDown } from 'lucide-react';
import { ReactNode, useEffect, useId, useRef, useState } from 'react';

export interface MaterialSelectOption<T extends string> {
  value: T;
  label: string;
  dotColor?: string;
}

interface MaterialSelectProps<T extends string> {
  value: T;
  options: MaterialSelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  sheetTitle?: string;
  prefixIcon?: ReactNode;
  prefixLabel?: string;
  align?: 'left' | 'right';
  shape?: 'xl' | 'full';
}

export function MaterialSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  sheetTitle,
  prefixIcon,
  prefixLabel,
  align = 'left',
  shape = 'xl',
}: MaterialSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const currentIndex = options.findIndex((o) => o.value === value);
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = (currentIndex + delta + options.length) % options.length;
        onChange(options[nextIndex].value);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, options, value, onChange]);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const radiusClass = shape === 'full' ? 'rounded-full' : 'rounded-xl';

  return (
    <div className="relative" ref={containerRef}>
      {/* Material 3 Menu Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={`h-11 sm:h-9 px-3 ${radiusClass} text-xs font-medium inline-flex items-center gap-2 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          open
            ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-[var(--md-sys-color-primary)]'
            : 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
        }`}
      >
        {selectedOption?.dotColor && (
          <span
            className="w-2.5 h-2.5 rounded-xs shrink-0"
            style={{ backgroundColor: selectedOption.dotColor }}
            aria-hidden="true"
          />
        )}
        {prefixIcon && (
          <span className="text-[var(--md-sys-color-on-surface-variant)] shrink-0">
            {prefixIcon}
          </span>
        )}
        <span className="truncate max-w-[140px]">
          {prefixLabel ? `${prefixLabel} ${selectedOption?.label ?? ''}` : selectedOption?.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--md-sys-color-on-surface-variant)] shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <>
          {/* Mobile (< sm) Material 3 Bottom Sheet Selector */}
          <div
            className="fixed inset-0 z-[70] bg-black/45 flex items-end justify-center sm:hidden"
            onClick={() => setOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              role="listbox"
              id={listboxId}
              aria-label={ariaLabel}
              className="w-full rounded-t-[28px] bg-[var(--md-sys-color-surface-container-lowest)] border-t border-[var(--md-sys-color-outline-variant)] p-4 pb-safe m3-elevated-3"
            >
              <div
                className="w-10 h-1 rounded-full bg-[var(--md-sys-color-outline-variant)] mx-auto mb-3"
                aria-hidden="true"
              />
              {sheetTitle && (
                <div className="px-3 pb-2.5 mb-1.5 border-b border-[var(--md-sys-color-outline-variant)] text-sm font-display font-semibold text-[var(--md-sys-color-on-surface)]">
                  {sheetTitle}
                </div>
              )}
              <div className="space-y-1 max-h-[60dvh] overflow-y-auto">
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full min-h-[48px] px-3.5 rounded-2xl flex items-center justify-between gap-3 text-sm transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                          : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-low)] font-medium'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        {option.dotColor && (
                          <span
                            className="w-3 h-3 rounded-xs shrink-0"
                            style={{ backgroundColor: option.dotColor }}
                            aria-hidden="true"
                          />
                        )}
                        <span className="truncate">{option.label}</span>
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 shrink-0 text-[var(--md-sys-color-primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tablet & Laptop (sm+) Anchored Material 3 Menu */}
          <div
            role="listbox"
            id={listboxId}
            aria-label={ariaLabel}
            className={`hidden sm:block absolute top-[calc(100%+6px)] z-50 min-w-[208px] max-w-[260px] rounded-2xl bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] p-1.5 m3-elevated-3 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {sheetTitle && (
              <div className="px-3 py-1.5 text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
                {sheetTitle}
              </div>
            )}
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full min-h-[40px] px-3 rounded-xl flex items-center justify-between gap-2.5 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                        : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-low)] font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      {option.dotColor && (
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: option.dotColor }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">{option.label}</span>
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 shrink-0 text-[var(--md-sys-color-primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
