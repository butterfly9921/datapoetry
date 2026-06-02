'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Sparkles, LayoutDashboard, BookOpen, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: '看板', icon: LayoutDashboard },
  { href: '/diary', label: '日记', icon: BookOpen },
  { href: '/settings', label: '设置', icon: Settings },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sm:hidden sticky top-0 z-40 bg-[var(--color-bg)]/85 backdrop-blur-xl border-b border-[var(--color-border-light)]">
      <div className="max-w-5xl mx-auto px-5 h-[56px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150">
            <Sparkles size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--color-text)]">
            DataPoetry
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-0.5">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 no-underline',
                  isActive
                    ? 'bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]'
                )}
              >
                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
