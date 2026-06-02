'use client';
import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  '#10B981', '#0EA5E9', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#14B8A6', '#6366F1',
  '#F97316', '#84CC16', '#06B6D4', '#A855F7',
];

export default function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>}
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={color}
            onChange={e => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border-2 border-[var(--color-border)] cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
          />
        </div>
        <span className="text-sm text-[var(--color-text-secondary)] font-mono">{color}</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: color === c ? 'var(--color-text)' : 'transparent',
            }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}
