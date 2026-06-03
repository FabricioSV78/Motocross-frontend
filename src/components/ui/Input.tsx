import { forwardRef, type InputHTMLAttributes } from 'react';
import { HelperText } from 'flowbite-react/components/HelperText';
import { Label } from 'flowbite-react/components/Label';
import { TextInput } from 'flowbite-react/components/TextInput';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

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
      id,
      name,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? name;
    const helperId = inputId && (error || helperText) ? `${inputId}-helper` : undefined;

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <Label
            htmlFor={inputId}
            color={error ? 'failure' : 'default'}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            {label}
            {required && <span className="ml-1 text-orange-400">*</span>}
          </Label>
        )}

        <TextInput
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          color={error ? 'failure' : 'gray'}
          sizing="md"
          disabled={disabled}
          required={required}
          className={clsx(fullWidth && 'w-full', className)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={helperId}
          {...props}
        />

        {error && (
          <HelperText id={helperId} color="failure" className="text-sm">
            {error}
          </HelperText>
        )}

        {helperText && !error && (
          <HelperText id={helperId} color="gray" className="text-sm text-slate-500 dark:text-slate-400">
            {helperText}
          </HelperText>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
