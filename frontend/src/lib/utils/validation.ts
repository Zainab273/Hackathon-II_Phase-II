/**
 * Client-side validation utilities
 * @see specs/003-frontend-integration/data-model.md
 */

import { ValidationResult } from '../api/types';

/**
 * Validate task title according to backend rules
 *
 * Rules:
 * - After trimming, length must be 1-500 characters
 * - Cannot be empty or consist only of whitespace
 *
 * @param title - Raw title input from user
 * @returns Validation result with error message if invalid
 */
export function validateTaskTitle(title: string): ValidationResult {
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Task title cannot be empty',
    };
  }

  if (trimmed.length > 500) {
    return {
      valid: false,
      error: 'Task title must be 500 characters or less',
    };
  }

  return { valid: true };
}

/**
 * Sanitize task title for submission
 * Removes leading and trailing whitespace
 *
 * @param title - Raw title input
 * @returns Trimmed title ready for API submission
 */
export function sanitizeTaskTitle(title: string): string {
  return title.trim();
}
