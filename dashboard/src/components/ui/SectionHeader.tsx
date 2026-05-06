import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

export function SectionHeader({ title, description, meta, action, className }: SectionHeaderProps) {
  return (
    <header className={cx('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p> : null}
        {meta ? <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{meta}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
