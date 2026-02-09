/**
 * ChatInput - Message input component with send button
 * @see specs/004-chatkit-ui/tasks.md T014
 */

import React, { useState, FormEvent, KeyboardEvent } from 'react';
import { validateMessage, sanitizeMessage } from '../../utils/validation';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const sendMessage = () => {
    const validation = validateMessage(message);

    if (!validation.valid) {
      setError(validation.error || 'Invalid message');
      return;
    }

    const sanitized = sanitizeMessage(message);
    onSendMessage(sanitized);
    setMessage('');
    setError(null);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.chatInputContainer}>
      <input
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          setError(null);
        }}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className={styles.chatInput}
        disabled={disabled}
        aria-label="Chat message input"
      />
      <button
        type="submit"
        className={styles.sendButton}
        disabled={disabled || !message.trim()}
        aria-label="Send message"
      >
        Send
      </button>
      {error && <span className={styles.errorText}>{error}</span>}
    </form>
  );
}
