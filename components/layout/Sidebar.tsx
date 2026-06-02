'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Sparkles, LayoutDashboard, BookOpen, Compass, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: '看板', icon: LayoutDashboard },
  { href: '/diary', label: '日记', icon: BookOpen },
  { href: '/trajectory', label: '轨迹', icon: Compass },
  { href: '/settings', label: '设置', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex flex-col w-[200px] h-screen sticky top-0 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-light)] shrink-0">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150">
            <Sparkles size={17} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--color-text)]">
            DataPoetry
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150 no-underline',
                isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)]'
              )}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-[var(--color-border-light)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary-lighter)] flex items-center justify-center text-[var(--color-primary)] text-xs font-bold">
            F
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[var(--color-text)] truncate">Felicia</p>
            <p className="text-[11px] text-[var(--color-text-muted)]">心情记录者</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
