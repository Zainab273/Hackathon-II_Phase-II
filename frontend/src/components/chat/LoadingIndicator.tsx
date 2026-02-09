/**
 * LoadingIndicator - Typing animation during API requests
 * @see specs/004-chatkit-ui/tasks.md T015
 */

import React from 'react';
import styles from './LoadingIndicator.module.css';

export function LoadingIndicator() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.dot} />
      <div className={styles.dot} />
      <div className={styles.dot} />
    </div>
  );
}
