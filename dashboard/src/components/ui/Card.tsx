import type { HTMLAttributes } from 'react';

type DivProps = HTMLAttributes<HTMLDivElement>;
type HeadingProps = HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = HTMLAttributes<HTMLParagraphElement>;

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

export function Card({ className, children, ...props }: DivProps) {
  return <section className={cx('rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100', className)} {...props}>{children}</section>;
}

export function CardHeader({ className, children, ...props }: DivProps) {
  return <header className={cx('flex flex-col gap-1.5 p-4', className)} {...props}>{children}</header>;
}

export function CardTitle({ className, children, ...props }: HeadingProps) {
  return <h3 className={cx('text-base font-semibold leading-tight text-slate-900 dark:text-slate-100', className)} {...props}>{children}</h3>;
}

export function CardDescription({ className, children, ...props }: ParagraphProps) {
  return <p className={cx('text-sm text-slate-600 dark:text-slate-300', className)} {...props}>{children}</p>;
}

export function CardContent({ className, children, ...props }: DivProps) {
  return <div className={cx('p-4 pt-0', className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: DivProps) {
  return <footer className={cx('flex items-center gap-2 p-4 pt-0', className)} {...props}>{children}</footer>;
}
