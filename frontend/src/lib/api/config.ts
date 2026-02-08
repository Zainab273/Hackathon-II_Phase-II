/**
 * API configuration
 * @see specs/003-frontend-integration/contracts/api-client.md
 */

/**
 * Backend API base URL from environment variable
 * Default: http://localhost:8000 (development)
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
