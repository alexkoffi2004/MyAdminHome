import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/classNames';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = true, className, ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={props.id}
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-md border border-neutral-300 px-4 py-2 text-neutral-900 placeholder-neutral-500",
              "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200",
              "dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400 dark:focus:border-primary-500",
              icon && "pl-10",
              error && "border-error-500 focus:border-error-500 focus:ring-error-200",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;