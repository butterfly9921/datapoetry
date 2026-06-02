'use client';
import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-[120ms] cursor-pointer',
        'disabled:opacity-45 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
        variant === 'primary' && [
          'bg-[var(--color-primary)] text-white rounded-[28px]',
          'shadow-[0_1px_3px_rgba(var(--color-primary-rgb),0.3)]',
          'hover:brightness-110 hover:shadow-[0_4px_12px_rgba(var(--color-primary-rgb),0.35)]',
          'active:brightness-95',
        ],
        variant === 'pill' && [
          'bg-[var(--color-primary)] text-white rounded-[28px]',
          'shadow-[0_1px_3px_rgba(var(--color-primary-rgb),0.3)]',
          'hover:brightness-110 hover:shadow-[0_4px_12px_rgba(var(--color-primary-rgb),0.35)]',
          'active:brightness-95',
        ],
        variant === 'secondary' && [
          'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] rounded-xl',
          'border border-[var(--color-border)]',
          'hover:bg-[var(--color-bg-tertiary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]',
        ],
        variant === 'icon' && [
          'w-9 h-9 rounded-xl bg-transparent text-[var(--color-text-secondary)]',
          'hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)] hover:scale-105',
        ],
        variant === 'ghost' && [
          'bg-transparent text-[var(--color-text-secondary)] rounded-xl',
          'hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]',
        ],
        size === 'sm' && 'px-3 py-1.5 text-[12px]',
        size === 'md' && 'px-4 py-2 text-[13px]',
        size === 'lg' && variant !== 'icon' && 'px-5 py-2.5 text-[14px]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
