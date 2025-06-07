import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/classNames';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, icon, fullWidth = true, className, options, ...props }, ref) => {
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
          <select
            ref={ref}
            className={cn(
              "w-full appearance-none rounded-md border border-neutral-300 px-4 py-2 text-neutral-900 placeholder-neutral-500",
              "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200",
              "dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400 dark:focus:border-primary-500",
              "bg-white dark:bg-neutral-800",
              icon && "pl-10",
              error && "border-error-500 focus:border-error-500 focus:ring-error-200",
              className
            )}
            {...props}
          >
            <option value="" disabled>Sélectionnez une option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;