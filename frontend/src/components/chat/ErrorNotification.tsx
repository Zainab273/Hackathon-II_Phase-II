/**
 * ErrorNotification - Toast-style error notification
 * @see specs/004-chatkit-ui/tasks.md T041
 */

'use client';

import React, { useEffect } from 'react';
import styles from './ErrorNotification.module.css';

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function ErrorNotification({
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}: ErrorNotificationProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div className={styles.errorNotification}>
      <div className={styles.errorContent}>
        <span className={styles.errorIcon}>⚠</span>
        <span className={styles.errorMessage}>{message}</span>
      </div>
      <button onClick={onClose} className={styles.closeButton} aria-label="Close notification">
        ×
      </button>
    </div>
  );
}
