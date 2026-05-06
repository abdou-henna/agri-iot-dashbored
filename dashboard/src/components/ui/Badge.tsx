import type { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'info' | 'warning' | 'danger' | 'critical' | 'muted';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
  info: 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100',
  warning: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100',
  danger: 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-100',
  critical: 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900 dark:border-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-100',
  muted: 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ variant = 'default', size = 'sm', className, children, ...props }: BadgeProps) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full border font-medium', sizeClasses[size], variantClasses[variant], className)} {...props}>
      {children}
    </span>
  );
}
