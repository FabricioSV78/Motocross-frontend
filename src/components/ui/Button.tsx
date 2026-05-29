import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

/**
 * Componente Button reutilizable con múltiples variantes y estados
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses = clsx(
      'inline-flex items-center justify-center',
      'font-medium rounded-lg',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'w-full': fullWidth,
      }
    );

    const variantClasses = {
      primary:
        'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 focus:ring-orange-500 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 transform hover:scale-[1.02] active:scale-[0.98]',
      secondary:
        'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500 active:bg-gray-800',
      outline:
        'border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white focus:ring-orange-500',
      ghost:
        'text-gray-300 hover:bg-gray-800 focus:ring-gray-500 active:bg-gray-700',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const buttonClasses = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
