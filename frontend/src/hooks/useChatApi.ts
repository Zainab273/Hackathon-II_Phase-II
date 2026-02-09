/**
 * Custom hook for chat API communication
 * @see specs/004-chatkit-ui/research.md
 */

import { useState, useCallback } from 'react';
import { sendChatMessage, ChatApiError } from '../services/chatApi';
import type { ChatResponse } from '../types/chat';

interface UseChatApiResult {
  sendMessage: (message: string) => Promise<ChatResponse>;
  isLoading: boolean;
  error: ChatApiError | null;
  clearError: () => void;
}

export function useChatApi(userId: string): UseChatApiResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatApiError | null>(null);

  const sendMessage = useCallback(
    async (message: string): Promise<ChatResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendChatMessage(userId, message);
        return response;
      } catch (err) {
        const apiError = err instanceof ChatApiError ? err : new ChatApiError({
          error: err instanceof Error ? err.message : 'Unknown error',
          code: 'UNKNOWN_ERROR',
        });
        setError(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    clearError,
  };
}
