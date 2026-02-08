/**
 * Authenticated HTTP client for backend API
 * @see specs/003-frontend-integration/contracts/api-client.md
 */

import { API_BASE_URL } from './config';
import { APIErrorResponse } from './types';

/**
 * Custom API error with HTTP status code
 */
export class APIError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = 'APIError';
  }
}

/**
 * Get JWT token from Better Auth session
 * This is a placeholder - actual implementation will use Better Auth SDK
 */
async function getAuthToken(): Promise<string | null> {
  // TODO: Integrate with Better Auth SDK
  // For now, try to get from localStorage (temporary)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Sign out and clear session
 * This is a placeholder - actual implementation will use Better Auth SDK
 */
async function signOut(): Promise<void> {
  // TODO: Integrate with Better Auth SDK
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Authenticated fetch wrapper
 *
 * Automatically:
 * - Retrieves JWT token from Better Auth session
 * - Adds Authorization header
 * - Handles authentication failures (401 → redirect to login)
 * - Handles authorization failures (403 → throw error)
 * - Parses error responses
 *
 * @param endpoint - API endpoint path (e.g., "/api/tasks")
 * @param options - Standard fetch options
 * @returns Response object
 * @throws APIError on HTTP errors
 */
export async function authenticatedFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  // Get JWT token from Better Auth session
  const token = await getAuthToken();

  // Redirect to login if no token
  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new APIError(401, 'Not authenticated');
  }

  // Make request with authentication header
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  // Handle authentication failure (expired/invalid token)
  if (response.status === 401) {
    await signOut(); // Clear invalid session
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new APIError(401, 'Session expired. Please log in again.');
  }

  // Handle other HTTP errors
  if (!response.ok) {
    let errorDetail: string;
    try {
      const errorData: APIErrorResponse = await response.json();
      errorDetail =
        typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new APIError(response.status, errorDetail);
  }

  return response;
}

/**
 * Check if error is an API error
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Extract user-friendly error message
 *
 * @param error - Error from API call
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    return error.detail;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Map HTTP status code to user-friendly message
 *
 * @param status - HTTP status code
 * @returns Generic user-friendly message
 */
export function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid input. Please check your data and try again.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested item could not be found.';
    case 422:
      return 'The data format is invalid. Please try again.';
    case 500:
      return 'A server error occurred. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}
