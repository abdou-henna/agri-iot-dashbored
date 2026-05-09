import type { HTMLAttributes } from 'react';

type DivProps = HTMLAttributes<HTMLDivElement>;
type HeadingProps = HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = HTMLAttributes<HTMLParagraphElement>;

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

export function Card({ className, children, ...props }: DivProps) {
  return <section className={cx('rounded-2xl border border-zinc-200/80 bg-white text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100', className)} {...props}>{children}</section>;
}

export function CardHeader({ className, children, ...props }: DivProps) {
  return <header className={cx('flex flex-col gap-1.5 p-4', className)} {...props}>{children}</header>;
}

export function CardTitle({ className, children, ...props }: HeadingProps) {
  return <h3 className={cx('text-base font-semibold leading-tight text-zinc-900 dark:text-zinc-100', className)} {...props}>{children}</h3>;
}

export function CardDescription({ className, children, ...props }: ParagraphProps) {
  return <p className={cx('text-sm text-zinc-600 dark:text-zinc-300', className)} {...props}>{children}</p>;
}

export function CardContent({ className, children, ...props }: DivProps) {
  return <div className={cx('p-4 pt-0', className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: DivProps) {
  return <footer className={cx('flex items-center gap-2 p-4 pt-0', className)} {...props}>{children}</footer>;
}
