/**
 * ChatInterface - Main chat container component
 * @see specs/004-chatkit-ui/tasks.md T017, T044
 */

'use client';

import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ErrorNotification } from './ErrorNotification';
import styles from './ChatInterface.module.css';

interface ChatInterfaceProps {
  userId: string;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const { messages, isLoading, error, sendMessage, clearError } = useChat(userId);
  const [showErrorToast, setShowErrorToast] = useState(false);

  React.useEffect(() => {
    if (error) {
      setShowErrorToast(true);
    }
  }, [error]);

  const handleCloseError = () => {
    setShowErrorToast(false);
    clearError();
  };

  return (
    <div className={styles.chatContainer}>
      {showErrorToast && error && (
        <ErrorNotification message={error} onClose={handleCloseError} />
      )}
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
    </div>
  );
}
