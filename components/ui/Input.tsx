'use client';
import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>}
      <input
        className={clsx(
          'w-full px-4 py-3 bg-white text-[var(--color-text)] border border-[var(--color-border)] rounded-lg text-sm outline-none transition-all duration-150',
          'focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.15)]',
          'placeholder:text-[var(--color-text-muted)]',
          error && 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
