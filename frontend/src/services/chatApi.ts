/**
 * Chat API client service
 * @see specs/004-chatkit-ui/contracts/chat-api.yaml
 */

import type { ChatRequest, ChatResponse, ApiError } from '../types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export class ChatApiError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(error: ApiError) {
    super(error.error);
    this.name = 'ChatApiError';
    this.code = error.code;
    this.details = error.details;
  }
}

export async function sendChatMessage(
  userId: string,
  message: string
): Promise<ChatResponse> {
  const request: ChatRequest = {
    message,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'Request failed',
        code: 'UNKNOWN_ERROR',
      }));
      throw new ChatApiError(errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }

    // Network or other errors
    throw new ChatApiError({
      error: error instanceof Error ? error.message : 'Network error occurred',
      code: 'NETWORK_ERROR',
    });
  }
}
