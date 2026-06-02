'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LayoutDashboard, BookOpen, PlusCircle, Compass } from 'lucide-react';

const navItems = [
  { href: '/', label: '看板', icon: LayoutDashboard },
  { href: '/diary', label: '日记', icon: BookOpen },
  { href: '/diary/new', label: '记录', icon: PlusCircle, highlight: true },
  { href: '/trajectory', label: '轨迹', icon: Compass },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg)]/90 backdrop-blur-xl border-t border-[var(--color-border-light)]">
      <div className="flex items-center justify-around h-[60px] px-2 pb-safe">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/diary/new' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl min-w-[52px] transition-all duration-150 no-underline',
                item.highlight
                  ? 'bg-[var(--color-primary)] text-white rounded-2xl px-4 mx-0.5 shadow-sm hover:brightness-105 active:scale-95'
                  : isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              {isActive && !item.highlight && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-primary)]" />
              )}
              <item.icon size={20} strokeWidth={isActive || item.highlight ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
