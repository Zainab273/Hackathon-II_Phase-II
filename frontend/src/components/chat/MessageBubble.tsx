/**
 * MessageBubble - Individual message display component
 * @see specs/004-chatkit-ui/tasks.md T012, T019, T024, T025, T029
 */

import React from 'react';
import type { Message } from '../../types/chat';
import { TaskListDisplay } from './TaskListDisplay';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const bubbleClass = message.sender === 'user' ? styles.userMessage : styles.assistantMessage;
  const hasTaskMetadata = message.metadata?.operation && message.metadata?.taskId;
  const hasTaskList = message.metadata?.operation === 'list' && message.metadata?.tasks;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'error':
        return 'Failed to send';
      default:
        return null;
    }
  };

  const renderTaskConfirmation = () => {
    if (!message.metadata) return null;

    const { operation, taskId, taskName } = message.metadata;

    if (operation === 'add' && taskId && taskName) {
      return (
        <div className={styles.taskConfirmation}>
          <span className={styles.taskIcon}>✓</span>
          <div className={styles.taskDetails}>
            <div className={styles.taskName}>{taskName}</div>
            <div className={styles.taskId}>ID: {taskId}</div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`${styles.messageBubble} ${bubbleClass} ${hasTaskMetadata ? styles.taskMessage : ''}`}>
      <p className={styles.messageText}>{message.text}</p>
      {renderTaskConfirmation()}
      {hasTaskList && message.metadata?.tasks && (
        <TaskListDisplay tasks={message.metadata.tasks} />
      )}
      <div className={styles.messageTimestamp}>{formatTime(message.timestamp)}</div>
      {message.status && (
        <div className={styles.messageStatus}>{getStatusText(message.status)}</div>
      )}
    </div>
  );
}
