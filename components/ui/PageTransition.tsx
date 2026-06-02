'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition — wraps page content with a smooth entry animation.
 * Children fade in + slide up on mount with a subtle stagger.
 */
export default function PageTransition({ children, className }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={clsx(
        'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
        className
      )}
    >
      {children}
    </div>
  );
}

/* — Stagger utilities — */

/** CSS animation-delay helper for nth-child stagger */
export function staggerDelay(index: number, base = 50): React.CSSProperties {
  return {
    animationDelay: `${index * base}ms`,
    opacity: 0,
    animation: `slideUp 400ms cubic-bezier(0.16,1,0.3,1) forwards`,
  } as React.CSSProperties;
}

/**
 * StaggerGroup — wraps a list of children and applies staggered entry.
 * Each direct child gets an incremental delay.
 */
export function StaggerGroup({
  children,
  className,
  baseDelay = 60,
}: {
  children: React.ReactNode;
  className?: string;
  baseDelay?: number;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) => (
        <div
          style={{
            animation: `slideUp 420ms cubic-bezier(0.16,1,0.3,1) forwards`,
            animationDelay: `${i * baseDelay}ms`,
            opacity: 0,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
