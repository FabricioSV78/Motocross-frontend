import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Button as FlowbiteButton } from 'flowbite-react/components/Button';
import { Spinner } from 'flowbite-react/components/Spinner';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const loadingSpinnerColor = {
  primary: 'gray',
  secondary: 'gray',
  outline: 'warning',
  ghost: 'gray',
  danger: 'failure',
} as const;

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
    return (
      <FlowbiteButton
        ref={ref}
        type={type}
        color={variant}
        size={size}
        fullSized={fullWidth}
        disabled={disabled || isLoading}
        className={clsx(
          'min-w-0 justify-center gap-2 whitespace-normal text-center leading-tight sm:whitespace-nowrap',
          (variant === 'primary' || variant === 'danger') && 'theme-on-accent',
          variant === 'primary' && 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-950/30',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <Spinner
            aria-label="Loading"
            size="sm"
            color={loadingSpinnerColor[variant]}
            className="-ml-0.5"
          />
        )}
        {children}
      </FlowbiteButton>
    );
  }
);

Button.displayName = 'Button';
