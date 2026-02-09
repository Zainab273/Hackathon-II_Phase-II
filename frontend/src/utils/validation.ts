/**
 * Input validation utilities
 * @see specs/004-chatkit-ui/data-model.md
 */

export function validateMessage(message: string): { valid: boolean; error?: string } {
  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Message cannot be empty',
    };
  }

  if (trimmed.length > 5000) {
    return {
      valid: false,
      error: 'Message is too long (max 5000 characters)',
    };
  }

  return { valid: true };
}

export function sanitizeMessage(message: string): string {
  return message.trim();
}
