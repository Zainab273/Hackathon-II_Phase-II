/**
 * MessageList - Scrollable message container
 * @see specs/004-chatkit-ui/tasks.md T013, T018
 */

import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className={styles.messageList}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
