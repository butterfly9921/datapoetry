'use client';
import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" size="md" onClick={onClose}>{cancelText}</Button>
        <Button
          variant={variant === 'danger' ? 'primary' : 'primary'}
          size="md"
          onClick={onConfirm}
          style={variant === 'danger' ? { background: 'var(--color-error)' } : undefined}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
