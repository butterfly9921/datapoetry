'use client';
import React, { useState, useCallback, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export default function TagInput({ tags, onChange, suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = useCallback((tag: string) => {
    const clean = tag.startsWith('#') ? tag.slice(1).trim() : tag.trim();
    if (clean && !tags.includes(clean)) {
      onChange([...tags, clean]);
    }
    setInput('');
    setShowSuggestions(false);
  }, [tags, onChange]);

  const removeTag = useCallback((tag: string) => {
    onChange(tags.filter(t => t !== tag));
  }, [tags, onChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    s => s.includes(input) && !tags.includes(s)
  ).slice(0, 5);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-full text-xs">
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[var(--color-border)] transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="输入标签后按回车添加..."
          className="w-full px-3 py-2 bg-white text-[var(--color-text)] border border-[var(--color-border)] rounded-lg text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.15)] placeholder:text-[var(--color-text-muted)]"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-md z-10 max-h-32 overflow-y-auto">
            {filteredSuggestions.map(s => (
              <button
                key={s}
                type="button"
                onMouseDown={() => addTag(s)}
                className="w-full text-left px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                #{s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
