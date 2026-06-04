import { useEffect, useId, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { FlowbiteIcon } from './FlowbiteIcon';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

export function SelectField({
  value,
  onChange,
  options,
  className,
  disabled,
  placeholder = 'Select an option',
  ariaLabel,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function handleSelect(option: SelectOption) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
        className={clsx(
          'select-field-trigger flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-900 shadow-sm transition hover:border-orange-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-orange-500/50',
          className
        )}
      >
        <span className={clsx('truncate', !selectedOption && 'text-slate-400 dark:text-slate-500')}>
          {selectedOption?.label ?? placeholder}
        </span>
        <FlowbiteIcon
          name="chevron-right"
          className={clsx(
            'h-4 w-4 text-slate-400 transition-transform',
            open && 'rotate-90 text-orange-500'
          )}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="select-field-menu absolute left-0 right-0 z-40 mt-2 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
                className={clsx(
                  'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition',
                  selected
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-200',
                  option.disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                <span className="truncate">{option.label}</span>
                {selected && <FlowbiteIcon name="check" className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
