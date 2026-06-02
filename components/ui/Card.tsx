'use client';
import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'hero';
}

export default function Card({ children, className, onClick, hover = true, padding = 'md', variant = 'default' }: CardProps) {
  const isHero = variant === 'hero';

  return (
    <div
      className={clsx(
        'bg-[var(--color-bg)] border border-[var(--color-border)] transition-all duration-200',
        isHero
          ? 'rounded-[var(--radius-card-lg)] shadow-[var(--shadow-hero)]'
          : 'rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)]',
        hover && !isHero && 'hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-strong)]',
        hover && isHero && 'hover:shadow-[var(--shadow-hero-hover)]',
        onClick && 'cursor-pointer',
        padding === 'none' && '',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-4',
        padding === 'lg' && 'p-5',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
