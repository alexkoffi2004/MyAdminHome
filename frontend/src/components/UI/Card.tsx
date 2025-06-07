import { ReactNode } from 'react';
import { cn } from '../../utils/classNames';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
}

export const Card = ({
  children,
  className,
  title,
  subtitle,
  headerAction,
}: CardProps) => {
  return (
    <div className={cn("rounded-lg bg-white shadow-card transition-all dark:bg-neutral-800", className)}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b p-4 dark:border-neutral-700">
          <div>
            {title && <h3 className="font-heading text-lg font-medium text-neutral-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

interface CardStatProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const CardStat = ({ title, value, icon, trend, className }: CardStatProps) => {
  return (
    <div className={cn("rounded-lg bg-white p-4 shadow-card transition-all dark:bg-neutral-800", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</h3>
        <div className="rounded-full bg-primary-100 p-2 text-primary-500 dark:bg-primary-900/30 dark:text-primary-400">
          {icon}
        </div>
      </div>
      <div className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">{value}</div>
      
      {trend && (
        <div className="flex items-center">
          <span 
            className={cn(
              "mr-1 text-xs font-medium",
              trend.isPositive ? "text-success-500" : "text-error-500"
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">vs. mois précédent</span>
        </div>
      )}
    </div>
  );
};

export default Card;