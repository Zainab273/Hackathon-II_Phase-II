/**
 * TaskListDisplay - Formatted task list component
 * @see specs/004-chatkit-ui/tasks.md T028, T030
 */

import React from 'react';
import type { TaskSummary } from '../../types/chat';
import styles from './TaskListDisplay.module.css';

interface TaskListDisplayProps {
  tasks: TaskSummary[];
}

export function TaskListDisplay({ tasks }: TaskListDisplayProps) {
  if (tasks.length === 0) {
    return (
      <div className={styles.emptyList}>
        <p>No tasks found</p>
      </div>
    );
  }

  const formatDueDate = (isoDate?: string) => {
    if (!isoDate) return null;

    try {
      const date = new Date(isoDate);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      }
      if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      }

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className={styles.taskListContainer}>
      {tasks.map((task, index) => (
        <div key={task.id} className={styles.taskItem}>
          <div className={styles.taskNumber}>{index + 1}</div>
          <div className={styles.taskContent}>
            <div className={styles.taskHeader}>
              <span className={styles.taskName}>{task.name}</span>
              <span className={`${styles.statusBadge} ${styles[task.status]}`}>
                {task.status === 'completed' ? '✓ Done' : '○ Active'}
              </span>
            </div>
            {task.dueDate && (
              <div className={styles.taskDueDate}>
                Due: {formatDueDate(task.dueDate)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
