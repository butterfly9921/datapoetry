'use client';
import React, { useEffect, useCallback, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = '520px' }: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
    } else if (visible) {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, visible]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-200 ${animating ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent backdrop-blur-none'}`}
      onClick={onClose}
    >
      <div
        className={`w-full max-h-[92vh] overflow-y-auto bg-[var(--color-bg)] shadow-[var(--shadow-xl)] p-6 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)] ${animating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-[0.97]'}`}
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[17px] font-semibold text-[var(--color-text)] tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)] transition-all duration-150"
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
