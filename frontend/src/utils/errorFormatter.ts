/**
 * Error message formatter for user-friendly display
 * @see specs/004-chatkit-ui/research.md
 */

import { ChatApiError } from '../services/chatApi';

export function formatApiError(error: Error | ChatApiError | string): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof ChatApiError) {
    const errorMap: Record<string, string> = {
      'NETWORK_ERROR': 'Unable to connect. Please check your internet connection.',
      'TIMEOUT_ERROR': 'Request timed out. Please try again.',
      'SERVER_ERROR': 'Something went wrong on our end. Please try again later.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'NOT_FOUND': 'The requested resource was not found.',
      'UNAUTHORIZED': 'You are not authorized to perform this action.',
    };

    return errorMap[error.code] || error.message || 'An unexpected error occurred. Please try again.';
  }

  // Generic Error
  const errorMap: Record<string, string> = {
    'NetworkError': 'Unable to connect. Please check your internet connection.',
    'TimeoutError': 'Request timed out. Please try again.',
    'TypeError': 'An unexpected error occurred. Please try again.',
  };

  return errorMap[error.name] || error.message || 'An unexpected error occurred. Please try again.';
}
