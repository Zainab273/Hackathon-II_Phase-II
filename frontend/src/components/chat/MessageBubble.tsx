/**
 * MessageBubble - Individual message display component
 * @see specs/004-chatkit-ui/tasks.md T012, T019
 */

import React from 'react';
import type { Message } from '../../types/chat';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const bubbleClass = message.sender === 'user' ? styles.userMessage : styles.assistantMessage;

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

  return (
    <div className={`${styles.messageBubble} ${bubbleClass}`}>
      <p className={styles.messageText}>{message.text}</p>
      <div className={styles.messageTimestamp}>{formatTime(message.timestamp)}</div>
      {message.status && (
        <div className={styles.messageStatus}>{getStatusText(message.status)}</div>
      )}
    </div>
  );
}
