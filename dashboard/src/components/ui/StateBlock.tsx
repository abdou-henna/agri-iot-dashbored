import type { ReactNode } from 'react';

type StateType = 'loading' | 'empty' | 'error' | 'warning' | 'success' | 'info';

interface StateBlockProps {
  state: StateType;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

const stateClasses: Record<StateType, string> = {
  loading: 'border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
  empty: 'border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
  error: 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-100',
  warning: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
  info: 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100',
};

export function StateBlock({ state, title, description, action, className }: StateBlockProps) {
  return (
    <section className={cx('rounded-lg border p-4', stateClasses[state], className)} aria-live={state === 'error' ? 'assertive' : 'polite'}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm opacity-90">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </section>
  );
}
