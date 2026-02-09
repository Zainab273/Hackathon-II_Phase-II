/**
 * useChat - Chat state management hook
 * @see specs/004-chatkit-ui/tasks.md T016, T020
 */

import { useState, useCallback } from 'react';
import { useChatApi } from './useChatApi';
import { formatTaskConfirmation } from '../utils/messageFormatter';
import { formatApiError } from '../utils/errorFormatter';
import type { Message } from '../types/chat';

interface UseChatResult {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
}

export function useChat(userId: string): UseChatResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendMessage: apiSendMessage, isLoading, error: apiError, clearError: apiClearError } = useChatApi(userId);

  const sendMessage = useCallback(
    async (text: string) => {
      // Create user message
      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        text,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending',
      };

      // Add user message to list
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Send to API
        const response = await apiSendMessage(text);

        // Update user message status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
          )
        );

        // Format AI response
        const formattedResponse = formatTaskConfirmation(response);

        // Create assistant message
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          text: formattedResponse,
          sender: 'assistant',
          timestamp: new Date(response.timestamp),
          status: 'delivered',
          metadata: response.metadata,
        };

        // Add assistant message
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        // Update user message with error status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? {
                  ...msg,
                  status: 'error' as const,
                  metadata: {
                    errorMessage: formatApiError(error as Error),
                  },
                }
              : msg
          )
        );
      }
    },
    [apiSendMessage]
  );

  const clearError = useCallback(() => {
    apiClearError();
  }, [apiClearError]);

  return {
    messages,
    isLoading,
    error: apiError ? formatApiError(apiError) : null,
    sendMessage,
    clearError,
  };
}
