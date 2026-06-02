'use client';
import React from 'react';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
}

export default function StatsCard({ icon, label, value, trend }: StatsCardProps) {
  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-3.5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-strong)] transition-all duration-200">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[20px] leading-none opacity-80">{icon}</span>
          <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{label}</span>
        </div>
        <span className="text-[24px] font-bold text-[var(--color-text)] leading-none tracking-tight">{value}</span>
        {trend && (
          <span className="text-[11px] text-[var(--color-text-muted)]">{trend}</span>
        )}
      </div>
    </div>
  );
}
