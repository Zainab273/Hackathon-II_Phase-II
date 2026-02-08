/**
 * API module exports
 * Main export point for API layer
 * @see specs/003-frontend-integration/contracts/api-client.md
 */

// Task API functions
export {
  getTasks,
  createTask,
  toggleTask,
  updateTask,
  deleteTask,
} from './tasks';

// HTTP client and error handling
export {
  authenticatedFetch,
  APIError,
  isAPIError,
  getErrorMessage,
  getStatusMessage,
} from './client';

// Configuration
export { API_BASE_URL } from './config';

// TypeScript types
export type {
  Task,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskToggleRequest,
  TaskListResponse,
  APIErrorResponse,
  ValidationError,
  LoadingState,
  TasksViewState,
  ValidationResult,
} from './types';
