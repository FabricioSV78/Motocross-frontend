import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Componente Input reutilizable con soporte para validación
 * Compatible con React Hook Form mediante forwardRef
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputClasses = clsx(
      'px-4 py-2.5 border rounded-lg transition-all duration-200',
      'bg-gray-900/50 text-white placeholder-gray-500',
      'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
      'disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50',
      {
        'border-red-500 focus:ring-red-500': error,
        'border-gray-600 hover:border-gray-500': !error,
        'w-full': fullWidth,
      },
      className
    );

    return (
      <div className={clsx('flex flex-col gap-1', { 'w-full': fullWidth })}>
        {label && (
          <label className="text-sm font-semibold text-gray-200">
            {label}
            {props.required && <span className="text-orange-400 ml-1">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          disabled={disabled}
          {...props}
        />
        
        {error && (
          <span className="text-sm text-red-400" role="alert">
            {error}
          </span>
        )}
        
        {helperText && !error && (
          <span className="text-sm text-gray-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
