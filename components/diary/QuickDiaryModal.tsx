'use client';
import React, { useState } from 'react';

interface QuickDiaryModalProps {
  open: boolean;
  onClose: () => void;
  newsContent: string;
}

export default function QuickDiaryModal({ open, onClose, newsContent }: QuickDiaryModalProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setContent('');
      setSaving(false);
      setDone(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);

    try {
      const res = await fetch('/api/diaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'text',
          content: content.trim(),
          references: [{
            source_type: 'news',
            source_content: newsContent,
            source_date: new Date().toISOString().slice(0, 10),
          }],
        }),
      });

      if (res.ok) {
        setDone(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-hero)] p-5"
        style={{ animation: 'scaleIn 180ms var(--ease-spring)' }}
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-8">
            <span className="text-3xl">✨</span>
            <p className="text-[14px] text-[var(--color-text-secondary)] mt-2">已保存</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-semibold text-[var(--color-text)]">写下你的思考</h3>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">这条新闻触动了你什么？</p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text-muted)]"
              >
                ✕
              </button>
            </div>

            {/* Source reference */}
            <div className="mb-3 p-2.5 bg-[var(--color-bg-secondary)] rounded-xl text-[12px] leading-relaxed text-[var(--color-text-muted)] border-l-[3px] border-[var(--color-primary-light)]">
              <span className="text-[10px] font-semibold text-[var(--color-primary)] uppercase tracking-wider">📰 引用新闻</span>
              <p className="mt-1 text-[var(--color-text-secondary)]">{newsContent}</p>
            </div>

            {/* Input */}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="这条新闻让我想到..."
              rows={3}
              autoFocus
              className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] text-[var(--color-text)] border-2 border-[var(--color-border)] rounded-xl text-[13px] leading-relaxed outline-none resize-none focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-elevated)] focus:shadow-[0_0_0_3px_rgba(var(--color-primary-rgb),0.12)] placeholder:text-[var(--color-text-placeholder)] transition-all duration-150"
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer rounded-lg hover:bg-[var(--color-bg-secondary)]"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!content.trim() || saving}
                className="px-4 py-2 text-[13px] font-medium bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存思考'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
