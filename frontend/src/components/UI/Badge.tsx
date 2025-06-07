import { cn } from '../../utils/classNames';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const getBadgeStyles = (variant: BadgeVariant) => {
  switch (variant) {
    case 'primary':
      return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400';
    case 'secondary':
      return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400';
    case 'success':
      return 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400';
    case 'warning':
      return 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400';
    case 'danger':
      return 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400';
    case 'info':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
  }
};

export const Badge = ({ 
  children, 
  variant = 'default',
  className,
  ...props 
}: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        getBadgeStyles(variant),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;