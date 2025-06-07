import { ClassValue, clsx } from 'clsx';

// Utility function to conditionally join class names
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}