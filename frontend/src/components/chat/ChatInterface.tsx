/**
 * ChatInterface - Main chat container component
 * @see specs/004-chatkit-ui/tasks.md T017
 */

'use client';

import React from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import styles from './ChatInterface.module.css';

interface ChatInterfaceProps {
  userId: string;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const { messages, isLoading, error, sendMessage, clearError } = useChat(userId);

  return (
    <div className={styles.chatContainer}>
      <MessageList messages={messages} isLoading={isLoading} />
      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={clearError} className={styles.closeButton}>
            ×
          </button>
        </div>
      )}
      <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
    </div>
  );
}
